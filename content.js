// Content script for Instagram Reels pages
(function () {
    'use strict';

    // Create the floating button UI
    function createFloatingButton() {
        // Check if button already exists
        if (document.getElementById('insta-logger-btn')) {
            return;
        }

        const container = document.createElement('div');
        container.id = 'insta-logger-container';

        // Main capture button
        const captureBtn = document.createElement('button');
        captureBtn.id = 'insta-logger-btn';
        captureBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>
    `;
        captureBtn.title = 'Log this Reel';

        // Download log button
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'insta-logger-download-btn';
        downloadBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    `;
        downloadBtn.title = 'Download Log CSV';

        // Counter badge
        const counter = document.createElement('div');
        counter.id = 'insta-logger-counter';
        counter.textContent = '0';

        container.appendChild(captureBtn);
        container.appendChild(downloadBtn);
        container.appendChild(counter);
        document.body.appendChild(container);

        // Update counter on load
        updateCounter();

        // Add event listeners
        captureBtn.addEventListener('click', handleCapture);
        downloadBtn.addEventListener('click', handleDownload);
    }

    // Update the counter badge
    async function updateCounter() {
        const result = await chrome.storage.local.get(['reelsLog']);
        const logs = result.reelsLog || [];
        const counter = document.getElementById('insta-logger-counter');
        if (counter) {
            counter.textContent = logs.length;
        }
    }

    // Handle capture button click
    async function handleCapture() {
        const button = document.getElementById('insta-logger-btn');
        button.classList.add('loading');

        // STEP 1: Capture screenshot IMMEDIATELY (Stored in Background memory)
        chrome.runtime.sendMessage({ action: 'getScreenshot' }, (response) => {
            button.classList.remove('loading');

            if (!response || !response.success) {
                showNotification('Failed to capture: ' + (response.error || 'Unknown error'), 'error');
                return;
            }

            // STEP 2: Show the modal (background is holding the image)
            showTitleModal();
        });
    }

    // Modal logic (no longer needs to handle the giant image string)
    function showTitleModal() {
        if (document.getElementById('insta-logger-msg-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'insta-logger-msg-modal';
        modal.innerHTML = `
            <div class="insta-logger-modal-content">
                <h3>Enter Title for this Reel</h3>
                <input type="text" id="insta-logger-title-input" placeholder="Enter title..." autofocus>
                <div class="insta-logger-modal-btns">
                    <button id="insta-logger-modal-cancel">Cancel</button>
                    <button id="insta-logger-modal-save">Capture & Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const input = modal.querySelector('#insta-logger-title-input');
        const saveBtn = modal.querySelector('#insta-logger-modal-save');
        const cancelBtn = modal.querySelector('#insta-logger-modal-cancel');

        input.focus();
        const closeModal = () => modal.remove();
        cancelBtn.onclick = closeModal;

        saveBtn.onclick = async () => {
            const title = input.value.trim() || 'Untitled Reel';
            closeModal();

            // STEP 3: Tell background to save with this title
            const currentUrl = window.location.href;
            const now = new Date();
            const timestamp = formatDateTime(now);

            chrome.runtime.sendMessage({
                action: 'saveLog',
                url: currentUrl,
                timestamp: timestamp,
                title: title
            }, (saveResponse) => {
                if (saveResponse && saveResponse.success) {
                    showNotification('Reel logged: ' + title, 'success');
                    updateCounter();
                } else {
                    showNotification('Error saving log entry', 'error');
                }
            });
        };

        input.onkeyup = (e) => {
            if (e.key === 'Enter') saveBtn.onclick();
            if (e.key === 'Escape') closeModal();
        };
    }

    // Handle download button click
    function handleDownload() {
        showNotification('Generating log file... please wait.', 'info');
        chrome.runtime.sendMessage({ action: 'downloadCSV' }, (response) => {
            if (response && response.success) {
                showNotification('Download started!', 'success');
            } else {
                showNotification('Failed: ' + (response.error || 'Empty log'), 'error');
            }
        });
    }

    // Format date-time as YYYY-MM-DD HH:mm:ss
    function formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.insta-logger-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `insta-logger-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createFloatingButton);
    } else {
        createFloatingButton();
    }

    // Listen for URL changes (for single-page app navigation)
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            // Check if still on reels page
            if (currentUrl.includes('/reels/')) {
                createFloatingButton();
                updateCounter();
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
