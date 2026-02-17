// Offscreen script to handle large blob creation
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.target !== 'offscreen') return;

    if (message.type === 'create-blob-url') {
        try {
            const blob = new Blob([message.data], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            sendResponse({ url: url });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }
});
