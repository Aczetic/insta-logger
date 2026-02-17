chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.target !== 'offscreen') return;

    if (message.type === 'resize-image') {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Resize to thumbnail size (roughly 200px wide)
            const scale = 200 / img.width;
            canvas.width = 200;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to low-quality JPEG to stay under Excel's 32k cell limit
            const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
            sendResponse({ dataUrl: resizedDataUrl });
        };
        img.src = message.dataUrl;
        return true; // Keep channel open for onload
    }

    if (message.type === 'create-blob-url') {
        try {
            const blob = new Blob([message.data], { type: message.mimeType || 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            sendResponse({ url: url });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }
});
