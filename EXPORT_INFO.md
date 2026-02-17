# 📥 Export Information

## How the Export Works

Due to browser limitations with large data URLs, the extension now exports your Reels data in a more practical format:

### What Gets Downloaded

When you click the **Download button**, you'll get:

1. **A folder** named `insta_logger_YYYY-MM-DD_HH-MM-SS`
2. **Individual PNG files** for each screenshot:
   - `image_1.png`
   - `image_2.png`
   - `image_3.png`
   - etc.
3. **A CSV file** (`metadata.csv`) with this format:

```csv
Image File,Share Link,Date-Time
image_1.png,https://www.instagram.com/reels/xyz123,2026-02-18 00:34:15
image_2.png,https://www.instagram.com/reels/abc456,2026-02-18 00:35:22
```

### Where Files Are Saved

All files are downloaded to your browser's default download folder inside a timestamped subfolder:

```
Downloads/
  └── insta_logger_2026-02-18_00-34-55/
      ├── image_1.png
      ├── image_2.png
      ├── image_3.png
      ├── image_4.png
      └── metadata.csv
```

### Why This Approach?

**Problem**: Base64-encoded PNG images can be 500KB-2MB each. Embedding them in a CSV data URL exceeds browser size limits (typically 2MB for data URLs).

**Solution**: Download images as separate files and reference them in the CSV. This approach:
- ✅ Works with any number of Reels
- ✅ No size limitations
- ✅ Images are in standard PNG format (easy to view)
- ✅ CSV is small and easy to process
- ✅ You can use the images separately

### How to Use the Export

1. **Click the download button** (pink gradient button)
2. **Wait for downloads** - All files download automatically
3. **Check your Downloads folder** for the new subfolder
4. **Open the CSV** to see metadata
5. **View the images** - They're numbered to match the CSV rows

### Import the Data

You can easily work with the exported data:

#### In Excel/Google Sheets:
1. Open `metadata.csv`
2. See which image corresponds to which Reel
3. Image files are in the same folder

#### In Python:
```python
import pandas as pd

# Read the CSV
df = pd.read_csv('metadata.csv')

# Access image files
for idx, row in df.iterrows():
    image_file = row['Image File']
    url = row['Share Link']
    timestamp = row['Date-Time']
    print(f"{timestamp}: {url} -> {image_file}")
```

### Tips

- **Organize exports**: Each export creates a new timestamped folder
- **Share easily**: Zip the folder to share with others
- **Archive**: Keep folders organized by date
- **Backup**: The folder contains everything you need

---

## Alternative: View Logs Online

If you just want to browse your captures without downloading:

1. Click the extension icon
2. Click **"View Logs"** button
3. See all Reels in a beautiful gallery view
4. Click any URL to revisit the Reel

---

**This new export method is more reliable and works with unlimited Reels!** 🎉
