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

        // Try to get the full job details content
        const contentSelectors = [
            '.jobs-description__content',    // Specific description (cleanest)
            '.jobs-details__main-content',   // Main wrapper
            '.jobs-details',                 // Full details
            '.job-view-layout',              // Job view container
            'main.jobs-search__job-details'  // Main job search details
        ];

        console.log('[Job Tracker Sidebar] Testing selectors...');
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            
            if (element) {
                // Clone the element to manipulate it without affecting the page
                const clone = element.cloneNode(true);
                
                // Remove our own sidebar if it's inside this element
                const sidebarHost = clone.querySelector('#jt-card-host');
                if (sidebarHost) {
                    sidebarHost.remove();
                }

                // Get clean text
                const content = clone.innerText ? clone.innerText.trim() : '';

                console.log(`[Job Tracker Sidebar] Selector "${selector}":`, {
                    found: true,
                    length: content.length
                });

                if (content.length > 200) {
                    console.log(`[Job Tracker Sidebar] ✓ SUCCESS - Captured ${content.length} chars (cleaned)`);
                    return content;
                }
            }
        }

        console.error('[Job Tracker Sidebar] ✗ ERROR: Could not find job content with any selector');
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

        // For LinkedIn, if we didn't get content, try fallback
        if (!bodyText && document.body) {
            bodyText = document.body.innerText;
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
                    <button id="jt-save-btn" disabled>Send to https://jobmaster.vercel.app</button>
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

        // --- Background Fetch Helper ---
        function extractJobId(url) {
            const match = url.match(/currentJobId=(\d+)/) || 
                          url.match(/\/jobs\/view\/(\d+)/) ||
                          url.match(/\/jobs\/.*-(\d+)\?/);
            return match ? match[1] : null;
        }

        function fetchJobDetailsContent(jobId) {
            return new Promise((resolve) => {
                const url = `https://www.linkedin.com/jobs/view/${jobId}/`;
                chrome.runtime.sendMessage({ type: 'FETCH_JOB_DETAILS', url }, (response) => {
                    if (chrome.runtime.lastError || !response || !response.success) {
                        console.warn('Job Tracker: background fetch failed', chrome.runtime.lastError || response?.error);
                        resolve(null);
                        return;
                    }
                    resolve(response.data);
                });
            });
        }

        saveBtn.addEventListener('click', async () => {
            const userId = userIdInput.value.trim();
            if (!userId) return;

            if (userId !== currentSettings.apiUserId) {
                chrome.storage.sync.set({ apiUserId: userId });
                currentSettings.apiUserId = userId;
            }

            saveBtn.disabled = true;
            setStatus('Capturing job content...');

            let currentPageData = null;
            let usedBackgroundFetch = false;

            // 1. Try Background Fetch First
            const jobId = extractJobId(window.location.href);
            if (jobId) {
                setStatus('Fetching canonical job page...');
                console.log(`[Job Tracker Sidebar] Detected Job ID: ${jobId}, attempting background fetch...`);
                const rawHtml = await fetchJobDetailsContent(jobId);
                
                if (rawHtml) {
                    // Parse the HTML off-screen to get clean text
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(rawHtml, 'text/html');
                    
                    // Cleanup the parsed doc similarly to how we would a live page
                    const scripts = doc.querySelectorAll('script, style, nav, header, footer');
                    scripts.forEach(el => el.remove());
                    
                    const fullText = doc.body.innerText.trim();
                    if (fullText.length > 500) {
                        console.log('[Job Tracker Sidebar] ✓ Background fetch successful');
                        currentPageData = {
                            title: doc.title || document.title, // Fallback to current title
                            url: `https://www.linkedin.com/jobs/view/${jobId}/`, // Canonical URL
                            fullText: fullText,
                            // Inherit identity from current session since background fetch is raw
                            linkedinHandle: null, 
                            linkedinMemberId: null
                        };
                        usedBackgroundFetch = true;
                    }
                }
            }

            // 2. Fallback to DOM Scraping (Existing Logic)
            if (!currentPageData) {
                console.log('[Job Tracker Sidebar] Background fetch failed or skipped, falling back to DOM scraping');
                
                let attempts = 0;
                const maxAttempts = 10;

                while (attempts < maxAttempts) {
                    currentPageData = capturePageContent();

                    if (currentPageData &&
                        currentPageData.fullText &&
                        currentPageData.fullText.length > 1000 &&
                        !/Loading\s+job\s+details/i.test(currentPageData.fullText)) {
                        console.log(`[Job Tracker Sidebar] ✓ DOM Content captured on attempt ${attempts + 1}`);
                        break;
                    }

                    if (attempts < maxAttempts - 1) {
                        setStatus(`Waiting for job to load... (${attempts + 1}/${maxAttempts})`);
                        await new Promise(resolve => setTimeout(resolve, 800));
                    }
                    attempts++;
                }
            }

            // Identity injection for background fetched data
            if (usedBackgroundFetch) {
                 // Try to get identity from current DOM since background page won't have it
                 const identity = capturePageContent(); 
                 currentPageData.linkedinHandle = identity.linkedinHandle;
                 currentPageData.linkedinMemberId = identity.linkedinMemberId;
            }

            // Final validation
            const isLoading = /Loading\s+job\s+details/i.test(currentPageData?.fullText || '');
            const isContentValid = currentPageData && 
                                 currentPageData.fullText && 
                                 currentPageData.fullText.length >= 500 && // Lower threshold for background fetch
                                 !isLoading;

            if (!isContentValid) {
                saveBtn.disabled = false;
                if (isLoading) {
                    setStatus('Job still loading. Please wait a moment and try again.', 'warning');
                } else {
                    setStatus('Failed to capture job details. Please try again.', 'error');
                }
                return;
            }

            console.log('[Job Tracker Sidebar] Final Payload Preview:', {
                source: usedBackgroundFetch ? 'background_fetch' : 'dom_scrape',
                length: currentPageData.fullText.length,
                url: currentPageData.url
            });

            setStatus('Sending job to JobMaster...');

            const payload = {
                ...currentPageData,
                jobUrl: currentPageData.url,
                pageTitle: currentPageData.title,
                pageContent: currentPageData.fullText,
                userId: userId,
                notes: '',
                authProvider: 'linkedin',
                captureSource: usedBackgroundFetch ? 'background' : 'dom'
            };

            chrome.runtime.sendMessage({ type: SAVE_EVENT, payload }, (response) => {
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
