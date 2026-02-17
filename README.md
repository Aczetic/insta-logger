# 📸 Instagram Reels Logger

A powerful Chrome extension that lets you capture, log, and export Instagram Reels with screenshots, URLs, and timestamps.

## ✨ Features

- **Smart Detection**: Automatically activates only on Instagram Reels pages (`instagram.com/reels/*`)
- **One-Click Capture**: Beautiful floating button to instantly capture the current Reel
- **Screenshot Capture**: Saves full viewport screenshots as data URLs
- **Metadata Logging**: Records URL and timestamp (YYYY-MM-DD HH:mm:ss format)
- **Persistent Storage**: Data survives browser restarts using Chrome's local storage
- **CSV Export**: Download all your logs as a CSV file with one click
- **Modern UI**: Sleek, animated interface with gradient buttons and smooth transitions
- **Log Viewer**: View all captured Reels in a beautiful gallery view
- **Storage Stats**: Track how many Reels you've logged and storage usage

## 🚀 Installation

### Load Unpacked (Developer Mode)

1. **Clone or download this repository** to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable "Developer mode"** using the toggle in the top-right corner
4. **Click "Load unpacked"** and select the `insta-logger` folder
5. **Done!** The extension is now installed and ready to use

### Verify Installation

- You should see the extension icon in your Chrome toolbar
- Visit any Instagram Reels page to see the floating buttons appear

## 📖 How to Use

### Capturing Reels

1. **Navigate to Instagram Reels**: Go to `https://www.instagram.com/reels/*`
2. **See the Floating Buttons**: Two buttons will appear on the right side:
   - **Purple Camera Button**: Capture current Reel
   - **Pink Download Button**: Export logs to CSV
3. **Click the Camera Button**: Captures the current viewport, URL, and timestamp
4. **Counter Badge**: Shows total number of logged Reels

### Exporting Data

1. **Click the Download Button** (pink gradient button on the right)
2. **Choose save location** when prompted
3. **CSV file** will be saved as `insta_logger_YYYY-MM-DD.csv`

### Managing Logs

1. **Click the extension icon** in the Chrome toolbar
2. **View Stats**: See total logs and storage usage
3. **Download CSV**: Export all logs
4. **View Logs**: Open a beautiful gallery view of all captures
5. **Clear All Logs**: Delete all stored data (with confirmation)

## 📊 CSV Format

The exported CSV contains three columns:

```csv
Image Data URL,Share Link,Date-Time
data:image/png;base64...,https://www.instagram.com/reels/xyz123,2026-02-18 00:15:30
```

- **Image Data URL**: Base64-encoded PNG screenshot
- **Share Link**: Direct link to the Instagram Reel
- **Date-Time**: Timestamp in YYYY-MM-DD HH:mm:ss format

## 🎨 User Interface

### Floating Buttons
- **Camera Button**: Purple gradient, captures current Reel
- **Download Button**: Pink gradient, exports CSV
- **Counter Badge**: Shows total logged Reels
- **Hover Effects**: Smooth animations and scale effects

### Popup Window
- **Statistics Dashboard**: View total logs and storage usage
- **Action Buttons**: Download, view, or clear logs
- **Modern Design**: Gradient background with glassmorphism effects

### Notifications
- **Success Messages**: Green notifications for successful captures
- **Error Messages**: Red notifications for any issues
- **Auto-dismiss**: Notifications fade out after 3 seconds

## 🛠️ Technical Details

### Technologies
- **Manifest V3**: Latest Chrome extension format
- **Vanilla JavaScript**: No external dependencies
- **Chrome Storage API**: Persistent local storage
- **Chrome Tabs API**: Screenshot capture
- **Chrome Downloads API**: CSV file export

### Files Structure
```
insta-logger/
├── manifest.json       # Extension configuration
├── content.js          # Injected UI and capture logic
├── background.js       # Service worker for screenshots and downloads
├── style.css           # Modern UI styles
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

### Permissions
- **storage**: Store captured data
- **unlimitedStorage**: Handle large screenshot data
- **downloads**: Export CSV files
- **activeTab**: Capture visible tab screenshots
- **scripting**: Inject content scripts
- **host_permissions**: Access Instagram pages

## 🔒 Privacy

- **All data stored locally** in your browser
- **No external servers** or data transmission
- **No analytics or tracking**
- **Full control** over your data (view, export, delete)

## 🐛 Troubleshooting

### Buttons not appearing
- Ensure you're on an Instagram Reels page (`instagram.com/reels/*`)
- Try refreshing the page
- Check that the extension is enabled in `chrome://extensions/`

### Screenshots are blank
- Ensure you've granted the extension permissions
- Try clicking the camera button again
- Check browser console for errors (F12)

### CSV export not working
- Ensure you have logs to export (counter > 0)
- Check download permissions in Chrome settings
- Verify popup blockers aren't interfering

### Storage issues
- The extension uses unlimited storage for large images
- Check available disk space
- Consider clearing old logs if storage is full

## 🚀 Future Enhancements

Potential features for future versions:
- Filter logs by date range
- Search logs by URL or keywords
- Bulk delete specific entries
- Export to different formats (JSON, Excel)
- Cloud sync option
- Custom screenshot quality settings
- Video capture support

## 📝 License

This project is provided as-is for personal use.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests!

## 📞 Support

For issues or questions, please open an issue on the repository.

---

**Made with 💜 for Instagram Reels enthusiasts**
# insta-logger
# insta-logger
# insta-logger
