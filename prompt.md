**Role:** Expert Chrome Extension Developer (Manifest V3)
**Objective:** Build a tool to log Instagram Reels data into a CSV.

**Core Requirements:**
1. **Detection:** Only show the UI when the URL matches `instagram.com/reels/*`.
2. **Floating Button:** Add a fixed button on the far right of the screen.
3. **Capture Logic:** - Click -> Capture current viewport as a Data URL image.
   - Get current Reel URL.
   - Generate current Date & Time (YYYY-MM-DD HH:mm:ss).
4. **Persistence:** - Use `chrome.storage.local` to store an array of objects: `{image, url, timestamp}`.
   - Ensure data persists across browser restarts.
   - Add "unlimitedStorage" to manifest.json so the large image strings don't crash it.
5. **CSV Export:** - Create a "Download Log" button (or a secondary action).
   - Generate a CSV with the schema: `Image Data URL, Share Link, Date-Time`.
   - Use `chrome.downloads` to save it as `insta_logger.csv`.

**Tech Stack:**
- Vanilla JavaScript, HTML, CSS.
- Manifest V3.

**Files to Generate:**
- manifest.json (with permissions: storage, unlimitedStorage, downloads, activeTab, scripting).
- content.js (injecting button and UI).
- background.js (handling screenshot and download).
- style.css (modern floating button styles).