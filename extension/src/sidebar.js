(function () {
    if (window.hasOwnProperty('__jt_sidebar_injected')) return;
    window.__jt_sidebar_injected = true;

    const SAVE_EVENT = 'SAVE_JOB_DETAILS';
    let currentSettings = null;
    let currentPageData = null;

    // --- Helper Functions ---
    function getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['apiUserId', 'apiEndpoint'], (stored) => {
                resolve(stored || {});
            });
        });
    }

    function captureLinkedInJobContent() {
        console.log('[Job Tracker Sidebar] === Starting LinkedIn job content capture ===');

        // Try to get the full job details content - this contains everything
        const contentSelectors = [
            '.jobs-details__main-content',  // Main content area with job details
            '.jobs-description__content',    // Job description area
            '.jobs-details',                 // Full job details section
            '.job-view-layout',              // Job view container
            'main.jobs-search__job-details'  // Main job search details
        ];

        console.log('[Job Tracker Sidebar] Testing selectors...');
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            console.log(`[Job Tracker Sidebar] Selector "${selector}":`, {
                found: !!element,
                hasInnerText: element ? !!element.innerText : false,
                length: element?.innerText?.length || 0
            });

            if (element && element.innerText && element.innerText.length > 200) {
                const content = element.innerText.trim();
                console.log(`[Job Tracker Sidebar] ✓ SUCCESS - Captured ${content.length} characters using selector: ${selector}`);
                console.log(`[Job Tracker Sidebar] Content preview (first 500 chars):`, content.substring(0, 500));
                return content;
            }
        }

        console.error('[Job Tracker Sidebar] ✗ ERROR: Could not find job content with any selector');
        console.log('[Job Tracker Sidebar] Current URL:', window.location.href);
        console.log('[Job Tracker Sidebar] Document ready state:', document.readyState);
        return null;
    }

    function capturePageContent() {
        const title = document.title || null;
        const url = window.location.href;

        // Use the same LinkedIn-specific extraction as the popup
        let bodyText = '';
        if (url.includes('linkedin.com/jobs')) {
            bodyText = captureLinkedInJobContent() || '';
        } else {
            // Only use fallback for non-LinkedIn pages
            if (document.body) {
                bodyText = document.body.innerText;
            }
        }

        // For LinkedIn, if we didn't get content, return null to indicate failure
        // Don't fall back to full body which includes navigation
        if (url.includes('linkedin.com/jobs') && !bodyText) {
            console.warn('[Job Tracker Sidebar] No job content found on LinkedIn job page');
        }

        // Identity detection (same as contentScript.js)
        let linkedinHandle = null;
        let linkedinMemberId = null;
        try {
            const profileLink = document.querySelector('a.global-nav__primary-link[href*="/in/"]');
            if (profileLink) {
                const match = profileLink.getAttribute('href').match(/\/in\/([^\/?#]+)/);
                if (match) linkedinHandle = match[1];
            }
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const match = script.textContent.match(/"memberId"\s*:\s*"(\d+)"/);
                if (match) {
                    linkedinMemberId = match[1];
                    break;
                }
            }
            if (!linkedinMemberId) {
                const match = document.body.innerHTML.match(/member:(\d+)/);
                if (match) linkedinMemberId = match[1];
            }
        } catch (e) { }

        return {
            title,
            url,
            fullText: bodyText.trim(),
            linkedinHandle,
            linkedinMemberId
        };
    }

    // --- UI Creation ---
    async function injectCard() {
        // Target containers for embedding directly in the job details
        const selectors = [
            '.jobs-description',
            '.jobs-details-top-card',
            '.jobs-unified-top-card',
            '.jobs-details__main-content'
        ];

        let target = null;
        for (const selector of selectors) {
            target = document.querySelector(selector);
            if (target) break;
        }

        if (!target) {
            console.warn('Job Tracker: job details container not found');
            return;
        }

        // Avoid double injection
        if (target.querySelector('#jt-card-host')) return;

        const host = document.createElement('div');
        host.id = 'jt-card-host';
        // Prepend to show up at the top of the description/card
        target.prepend(host);

        const shadow = host.attachShadow({ mode: 'open' });

        // Inject Styles
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = chrome.runtime.getURL('src/sidebar.css');
        shadow.appendChild(styleLink);

        // Build HTML
        const container = document.createElement('div');
        container.id = 'jt-card-container';
        container.innerHTML = `
            <section class="jt-card">
                <header class="jt-header">
                    <div class="jt-brand">
                        <img src="${chrome.runtime.getURL('assets/icons/icon48.png')}" alt="Job Tracker" />
                        <div>
                            <h2>Job Tracker</h2>
                            <p>Log this LinkedIn opportunity</p>
                        </div>
                    </div>
                    <button id="jt-settings-btn" class="jt-icon-btn" title="Settings">⚙️</button>
                </header>

                <div class="jt-body">
                    <label for="jt-api-user-id">LinkedIn Email</label>
                    <input type="email" id="jt-api-user-id" placeholder="you@example.com" />
                </div>

                <div class="jt-actions">
                    <button id="jt-save-btn" disabled>Add to https://jobmaster.streamlit.app/</button>
                    <p id="jt-status-message" class="status"></p>
                </div>
            </section>
        `;
        shadow.appendChild(container);

        // UI Elements
        const userIdInput = shadow.getElementById('jt-api-user-id');
        const saveBtn = shadow.getElementById('jt-save-btn');
        const statusMsg = shadow.getElementById('jt-status-message');
        const settingsBtn = shadow.getElementById('jt-settings-btn');

        function setStatus(text, type = 'info') {
            statusMsg.textContent = text;
            statusMsg.setAttribute('data-variant', type);
        }

        settingsBtn.addEventListener('click', () => {
            chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
        });

        currentSettings = await getSettings();
        userIdInput.value = currentSettings.apiUserId || '';

        // Check if we can capture content (but don't store it yet - capture fresh on save)
        const testCapture = capturePageContent();
        if (testCapture && testCapture.fullText && testCapture.fullText.length > 200) {
            if (userIdInput.value.trim()) {
                saveBtn.disabled = false;
                setStatus('Ready to add this job.');
            } else {
                setStatus('Account email required.', 'warning');
            }
        } else {
            saveBtn.disabled = true;
            setStatus('No job content found. Please scroll the page.', 'warning');
        }

        // --- Events ---
        userIdInput.addEventListener('input', () => {
            if (userIdInput.value.trim()) {
                saveBtn.disabled = false;
                setStatus('Ready to add this job.');
            } else {
                saveBtn.disabled = true;
                setStatus('Account email required.', 'warning');
            }
        });

        userIdInput.addEventListener('blur', () => {
            const trimmed = userIdInput.value.trim();
            chrome.storage.sync.set({ apiUserId: trimmed });
        });

        saveBtn.addEventListener('click', async () => {
            const userId = userIdInput.value.trim();
            if (!userId) return;

            if (userId !== currentSettings.apiUserId) {
                chrome.storage.sync.set({ apiUserId: userId });
                currentSettings.apiUserId = userId;
            }

            saveBtn.disabled = true;
            setStatus('Capturing job content...');

            // Retry logic - wait for content to load
            let currentPageData = null;
            let attempts = 0;
            const maxAttempts = 5;

            while (attempts < maxAttempts) {
                currentPageData = capturePageContent();

                // Check if we got good content (not just navigation/header)
                if (currentPageData &&
                    currentPageData.fullText &&
                    currentPageData.fullText.length > 1000 && // Need substantial content
                    !currentPageData.fullText.includes('Loading job details')) { // Job must be loaded
                    console.log(`[Job Tracker Sidebar] ✓ Content captured on attempt ${attempts + 1}`);
                    break;
                }

                console.log(`[Job Tracker Sidebar] Attempt ${attempts + 1}/${maxAttempts}: Content not ready (length: ${currentPageData?.fullText?.length || 0})`);

                if (attempts < maxAttempts - 1) {
                    setStatus(`Waiting for job to load... (${attempts + 1}/${maxAttempts})`);
                    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
                }
                attempts++;
            }

            if (!currentPageData || !currentPageData.fullText || currentPageData.fullText.length < 1000) {
                saveBtn.disabled = false;
                setStatus('Job content not loaded yet. Please wait for the job to fully load and try again.', 'error');
                console.error('[Job Tracker Sidebar] Failed to capture content after', maxAttempts, 'attempts');
                return;
            }

            console.log('[Job Tracker Sidebar] Captured fresh content:', {
                length: currentPageData.fullText.length,
                preview: currentPageData.fullText.substring(0, 300)
            });

            setStatus('Sending job to JobMaster...');

            const payload = {
                ...currentPageData,
                jobUrl: currentPageData.url,
                pageTitle: currentPageData.title,
                pageContent: currentPageData.fullText,
                userId: userId,
                notes: ''
            };

            console.log('[Job Tracker Sidebar] Sending payload to API:', {
                jobUrl: payload.jobUrl,
                pageTitle: payload.pageTitle,
                contentLength: payload.pageContent?.length,
                contentPreview: payload.pageContent?.substring(0, 200),
                userId: payload.userId
            });

            chrome.runtime.sendMessage({ type: SAVE_EVENT, payload }, (response) => {
                console.log('[Job Tracker Sidebar] API response:', response);

                saveBtn.disabled = false;
                if (response && response.success) {
                    setStatus('Job added successfully! 🎉', 'success');
                } else {
                    setStatus(response?.error || 'Failed to save job.', 'error');
                }
            });
        });
    }

    // Since LinkedIn is a Single Page App, we need to watch for URL/DOM shifts
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(injectCard, 1000); // Wait for page load
        } else if (!document.querySelector('#jt-card-host')) {
            // Also try to inject if content is missing
            injectCard();
        }
    });

    observer.observe(document.body, { subtree: true, childList: true });

    // Initial injection
    setTimeout(injectCard, 1500);
})();
