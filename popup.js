// Popup script
document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();

  // Event listeners
  document.getElementById('download-btn').addEventListener('click', handleDownload);
  document.getElementById('clear-btn').addEventListener('click', handleClear);
  document.getElementById('view-logs-btn').addEventListener('click', handleViewLogs);
});

// Load and display stats
async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['reelsLog']);
    const logs = result.reelsLog || [];

    // Update total logs
    document.getElementById('total-logs').textContent = logs.length;

    // Calculate storage size
    const jsonString = JSON.stringify(logs);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    document.getElementById('storage-used').textContent = `${sizeInMB} MB`;
  } catch (error) {
    console.error('Error loading stats:', error);
    showMessage('Error loading stats', 'error');
  }
}

// Handle download button
async function handleDownload() {
  try {
    const result = await chrome.storage.local.get(['reelsLog']);
    const logs = result.reelsLog || [];

    if (logs.length === 0) {
      showMessage('No logs to export', 'error');
      return;
    }

    // Send message to background script
    chrome.runtime.sendMessage({ action: 'downloadCSV' }, (response) => {
      if (response && response.success) {
        showMessage('CSV downloaded successfully!', 'success');
      } else {
        showMessage('Failed to download CSV', 'error');
      }
    });
  } catch (error) {
    console.error('Error downloading:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

// Handle clear button
async function handleClear() {
  if (!confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
    return;
  }

  try {
    await chrome.storage.local.set({ reelsLog: [] });
    showMessage('All logs cleared', 'success');
    await loadStats();
  } catch (error) {
    console.error('Error clearing logs:', error);
    showMessage('Error clearing logs', 'error');
  }
}

// Handle view logs button
async function handleViewLogs() {
  try {
    const result = await chrome.storage.local.get(['reelsLog']);
    const logs = result.reelsLog || [];

    if (logs.length === 0) {
      showMessage('No logs to view', 'error');
      return;
    }

    // Create a new tab with logs viewer
    const html = generateLogsHTML(logs);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    chrome.tabs.create({ url: url });
  } catch (error) {
    console.error('Error viewing logs:', error);
    showMessage('Error viewing logs', 'error');
  }
}

// Generate HTML for logs viewer
function generateLogsHTML(logs) {
  const items = logs.map((log, index) => `
    <div class="log-item">
      <div class="log-number">#${index + 1}</div>
      <div class="log-title">${log.title || 'Untitled Reel'}</div>
      <img src="${log.image}" alt="Reel Screenshot" class="log-image">
      <div class="log-info">
        <div class="log-url">
          <strong>URL:</strong>
          <a href="${log.url}" target="_blank">${log.url}</a>
        </div>
        <div class="log-time">
          <strong>Time:</strong> ${log.timestamp}
        </div>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Instagram Reels Logs</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          min-height: 100vh;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          color: white;
          text-align: center;
          margin-bottom: 40px;
          font-size: 32px;
        }
        
        .log-item {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }
        
        .log-item:hover {
          transform: translateY(-4px);
        }
        
        .log-number {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: bold;
          margin-bottom: 16px;
        }

        .log-title {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 12px;
          display: block;
        }
        
        .log-image {
          width: 100%;
          border-radius: 12px;
          margin-bottom: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        .log-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .log-url, .log-time {
          font-size: 14px;
          color: #374151;
        }
        
        .log-url a {
          color: #667eea;
          text-decoration: none;
          word-break: break-all;
        }
        
        .log-url a:hover {
          text-decoration: underline;
        }
        
        strong {
          color: #1f2937;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
            <h1 style="margin-bottom: 0;">📸 Instagram Reels Logs (${logs.length} total)</h1>
            <button onclick="window.print()" style="padding: 10px 20px; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Save as PDF / Print
            </button>
        </div>
        ${items}
      </div>
    </body>
    </html>
  `;
}

// Show message
function showMessage(text, type = 'success') {
  const container = document.getElementById('message-container');
  container.innerHTML = `<div class="message ${type}-msg">${text}</div>`;

  setTimeout(() => {
    container.innerHTML = '';
  }, 3000);
}
