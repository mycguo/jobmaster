const JOB_REQUEST_EVENT = 'REQUEST_PAGE_CONTENT';

function captureLinkedInJobContent() {
    console.log('[Job Tracker] Capturing LinkedIn job content...');

    // Try to get the full job details content - this contains everything
    const contentSelectors = [
        '.jobs-details__main-content',  // Main content area with job details
        '.jobs-description__content',    // Job description area
        '.jobs-details',                 // Full job details section
        '.job-view-layout',              // Job view container
        'main.jobs-search__job-details'  // Main job search details
    ];

    for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText && element.innerText.length > 200) {
            const content = element.innerText.trim();
            console.log(`[Job Tracker] Captured ${content.length} characters using selector: ${selector}`);
            console.log(`[Job Tracker] Content preview (first 300 chars):`, content.substring(0, 300));
            return content;
        }
    }

    console.log('[Job Tracker] ERROR: Could not find job content');
    return null;
}

function capturePageContent() {
    const title = document.title || null;
    const url = window.location.href;
    const selection = window.getSelection()?.toString().trim();

    // For LinkedIn job pages, try to get specific job content
    let bodyText = '';
    if (url.includes('linkedin.com/jobs')) {
        bodyText = captureLinkedInJobContent() || '';
    }

    // Fallback to full body text if no specific content found
    if (!bodyText && document.body) {
        bodyText = document.body.innerText;
    }

    const primaryText = selection || bodyText;

    // Detect logged-in user handle and Member ID from LinkedIn
    let linkedinHandle = null;
    let linkedinMemberId = null;
    try {
        // 1. Try to get handle from "Me" link
        const profileLink = document.querySelector('a.global-nav__primary-link[href*="/in/"]');
        if (profileLink) {
            const href = profileLink.getAttribute('href');
            const match = href.match(/\/in\/([^\/?#]+)/);
            if (match) {
                linkedinHandle = match[1];
            }
        }

        // 2. Try to get Member ID from script tags (often found in dust or ember data)
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            const content = script.textContent;
            if (content.includes('memberId')) {
                const match = content.match(/"memberId"\s*:\s*"(\d+)"/);
                if (match) {
                    linkedinMemberId = match[1];
                    break;
                }
            }
        }

        // 3. Fallback: try to find any mention of "member:" which is often used in tracking
        if (!linkedinMemberId) {
            const match = document.body.innerHTML.match(/member:(\d+)/);
            if (match) {
                linkedinMemberId = match[1];
            }
        }
    } catch (e) {
        console.warn('Job Tracker: could not detect LinkedIn identity', e);
    }

    return {
        title,
        url,
        text: primaryText?.trim() || null,
        fullText: bodyText?.trim() || null,
        linkedinHandle,
        linkedinMemberId,
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== JOB_REQUEST_EVENT) {
        return false;
    }

    const payload = capturePageContent();
    sendResponse({ success: Boolean(payload.fullText), data: payload });
    return true;
});
