// Background service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureScreenshot') {
        handleCaptureScreenshot(request, sender, sendResponse);
        return true; // Keep message channel open for async response
    } else if (request.action === 'downloadCSV') {
        handleDownloadCSV(sendResponse);
        return true;
    }
});

// Capture screenshot and store data
async function handleCaptureScreenshot(request, sender, sendResponse) {
    try {
        // Capture visible tab as data URL
        const dataUrl = await chrome.tabs.captureVisibleTab(sender.tab.windowId, {
            format: 'png',
            quality: 90
        });

        // Get existing logs
        const result = await chrome.storage.local.get(['reelsLog']);
        const logs = result.reelsLog || [];

        // Add new entry
        const newEntry = {
            image: dataUrl,
            url: request.url,
            timestamp: request.timestamp,
            title: request.title || 'Untitled Reel'
        };

        logs.push(newEntry);

        // Save back to storage
        await chrome.storage.local.set({ reelsLog: logs });

        sendResponse({ success: true });
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Download CSV file (Single File using Blob)
async function handleDownloadCSV(sendResponse) {
    try {
        const result = await chrome.storage.local.get(['reelsLog']);
        const logs = result.reelsLog || [];

        if (logs.length === 0) {
            sendResponse({ success: false, error: 'No logs to export' });
            return;
        }

        // Generate CSV content (full data URLs)
        const csvContent = generateCSV(logs);

        // Create offscreen document if it doesn't exist
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['BLOBS'],
            justification: 'To generate large CSV files for download'
        }).catch(() => { }); // Ignore error if already exists

        // Get Blob URL from offscreen
        const response = await chrome.runtime.sendMessage({
            target: 'offscreen',
            type: 'create-blob-url',
            data: csvContent
        });

        if (response.error) throw new Error(response.error);

        // Generate filename
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const filename = `insta_logger_${dateStr}.csv`;

        // Download the single large file
        await chrome.downloads.download({
            url: response.url,
            filename: filename,
            saveAs: true // Only ONE prompt for the whole file
        });

        // Close offscreen doc
        await chrome.offscreen.closeDocument().catch(() => { });

        sendResponse({ success: true });
    } catch (error) {
        console.error('Error downloading CSV:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Generate CSV from logs
function generateCSV(logs) {
    // CSV header
    let csv = 'Title,Image Data URL,Share Link,Date-Time\n';

    // Add each log entry
    logs.forEach(log => {
        // Escape fields for CSV (handle commas and quotes)
        const title = escapeCSVField(log.title || 'Untitled Reel');
        const imageData = escapeCSVField(log.image);
        const url = escapeCSVField(log.url);
        const timestamp = escapeCSVField(log.timestamp);

        csv += `${title},${imageData},${url},${timestamp}\n`;
    });

    return csv;
}

// Escape CSV field (handle quotes and commas)
function escapeCSVField(field) {
    if (field == null) return '';

    const fieldStr = String(field);

    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
        return '"' + fieldStr.replace(/"/g, '""') + '"';
    }

    return fieldStr;
}

// Clear old data if needed (optional - for maintenance)
async function clearOldLogs() {
    await chrome.storage.local.remove(['reelsLog']);
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Instagram Reels Logger installed');
        // Initialize storage
        chrome.storage.local.set({ reelsLog: [] });
    }
});
