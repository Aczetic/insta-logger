// Background service worker
let lastCapturedImage = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getScreenshot') {
        handleGetScreenshot(sender, sendResponse);
        return true;
    } else if (request.action === 'saveLog') {
        handleSaveLog(request, sendResponse);
        return true;
    } else if (request.action === 'downloadCSV') {
        handleDownloadCSV(sendResponse);
        return true;
    }
});

// Step 1: Capture and store locally in the background script
async function handleGetScreenshot(sender, sendResponse) {
    try {
        lastCapturedImage = await chrome.tabs.captureVisibleTab(sender.tab.windowId, {
            format: 'jpeg',
            quality: 70
        });
        sendResponse({ success: true });
    } catch (error) {
        console.error('Error capturing:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Step 2: Combine the stored image with the provided title and save
async function handleSaveLog(request, sendResponse) {
    try {
        if (!lastCapturedImage) {
            throw new Error('No screenshot found in memory');
        }

        const result = await chrome.storage.local.get(['reelsLog']);
        const logs = result.reelsLog || [];

        logs.push({
            image: lastCapturedImage,
            url: request.url,
            timestamp: request.timestamp,
            title: request.title
        });

        await chrome.storage.local.set({ reelsLog: logs });

        lastCapturedImage = null;
        sendResponse({ success: true });
    } catch (error) {
        console.error('Error saving:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Download Premium Interactive Sheet (Single HTML file)
async function handleDownloadCSV(sendResponse) {
    try {
        const result = await chrome.storage.local.get(['reelsLog']);
        const logs = result.reelsLog || [];

        if (logs.length === 0) {
            sendResponse({ success: false, error: 'No logs to export' });
            return;
        }

        const sheetContent = generatePremiumSheetHTML(logs);

        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['BLOBS'],
            justification: 'To generate large export files'
        }).catch(() => { });

        const response = await chrome.runtime.sendMessage({
            target: 'offscreen',
            type: 'create-blob-url',
            data: sheetContent,
            mimeType: 'text/html'
        });

        if (response.error) throw new Error(response.error);

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const filename = `insta_reels_log_${dateStr}.html`;

        await chrome.downloads.download({
            url: response.url,
            filename: filename,
            saveAs: true
        });

        await chrome.offscreen.closeDocument().catch(() => { });
        sendResponse({ success: true });
    } catch (error) {
        console.error('Error downloading:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Generate a beautifully styled HTML file that acts like a spreadsheet
function generatePremiumSheetHTML(logs) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Instagram Reels Log Export</title>
        <style>
            body { font-family: -apple-system, sans-serif; background: #f9fafb; padding: 40px; color: #1f2937; }
            .header { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            h1 { margin: 0; font-size: 24px; color: #111827; }
            .stats { color: #6b7280; font-size: 14px; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            th { background: #f3f4f6; padding: 16px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; border-bottom: 1px solid #e5e7eb; }
            td { padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
            tr:last-child td { border-bottom: none; }
            .img-container { width: 140px; border-radius: 8px; overflow: hidden; background: #eee; }
            img { width: 100%; height: auto; display: block; transition: transform 0.2s; cursor: zoom-in; }
            img:hover { transform: scale(1.05); }
            .title-cell { font-weight: 600; color: #111827; font-size: 15px; max-width: 250px; }
            .link-cell a { color: #4f46e5; text-decoration: none; word-break: break-all; font-size: 13px; }
            .link-cell a:hover { text-decoration: underline; }
            .time-cell { color: #6b7280; font-size: 13px; white-space: nowrap; }
            .badge { padding: 4px 8px; background: #e0e7ff; color: #4338ca; border-radius: 6px; font-size: 12px; font-weight: 500; }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <h1>📸 Instagram Reels Logs</h1>
                <p class="stats">Generated on ${new Date().toLocaleString()}</p>
            </div>
            <div class="badge">${logs.length} Total Entries</div>
        </div>
        <table>
            <thead>
                <tr>
                    <th width="160">Screenshot</th>
                    <th>Ref Title</th>
                    <th>Instagram Link</th>
                    <th>Date-Time Captured</th>
                </tr>
            </thead>
            <tbody>
                ${logs.map(log => `
                <tr>
                    <td><div class="img-container"><img src="${log.image}"></div></td>
                    <td class="title-cell">${log.title || 'Untitled'}</td>
                    <td class="link-cell"><a href="${log.url}" target="_blank">${log.url}</a></td>
                    <td class="time-cell">${log.timestamp}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </body>
    </html>`;
}

// Escape CSV field (handle quotes and commas)
function escapeCSVField(field) {
    if (field == null) return '';
    const fieldStr = String(field);
    if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
        return '"' + fieldStr.replace(/"/g, '""') + '"';
    }
    return fieldStr;
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.storage.local.set({ reelsLog: [] });
    }
});
