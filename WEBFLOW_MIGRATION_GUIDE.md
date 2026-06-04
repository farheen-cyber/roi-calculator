# Webflow Migration Guide: EquityList ROI Calculator

**Target:** equitylist.webflow.io (staging, unpublished)  
**Time:** 15-20 minutes  
**Difficulty:** Easy

---

## Step 1: Prepare Your Environment

### 1a. Log in to Webflow
- Go to [webflow.com](https://webflow.com)
- Log in to your EquityList workspace
- Open your equitylist.webflow.io project

### 1b. Locate the Calculator HTML
The calculator code is at:
```
/Users/farheenshaikh/Documents/roi-calculator/index.html
```

You'll copy the entire contents of this file in Step 3.

---

## Step 2: Create a New Page in Webflow

### 2a. Create Blank Page
1. In Webflow Editor, click **Pages** (left sidebar)
2. Click **+ Page** (bottom left)
3. Choose **Blank Page**
4. Name it: `ROI Calculator` (or your preferred name)
5. URL slug: `roi-calculator`
6. Click **Create Page**

### 2b. Configure Page Settings
1. In the new page, go to **Settings** (gear icon, top right)
2. Under **Custom Code**, find the **Head Code** section
3. Paste this single line:
```html
<!-- Cache buster: 2026-06-01T00:00:00Z -->
```
4. Click **Save**

---

## Step 3: Add the Calculator Code

### 3a. Get the HTML Code
1. Open the calculator file:
   ```
   /Users/farheenshaikh/Documents/roi-calculator/index.html
   ```
2. Select **ALL** content (Cmd+A / Ctrl+A)
3. Copy it (Cmd+C / Ctrl+C)

### 3b. Add HTML Embed to Webflow Page
1. In your Webflow page, go to **Add** (left panel, green + button)
2. Search for **"HTML Embed"**
3. Click on **HTML Embed** component
4. Place it anywhere on the page (will be replaced anyway)

### 3c. Replace with Calculator Code
1. Double-click the HTML Embed you just created
2. Clear any existing content
3. Paste the entire calculator HTML you copied (Cmd+V / Ctrl+V)
4. Click **Save & Close**

### 3d. Style the Embed (Optional)
1. Click the HTML Embed box to select it
2. In the **Inspector** (right panel), set:
   - **Width:** 100%
   - **Height:** Auto or `100vh` (full viewport height)
   - **Display:** Block
3. Remove any page padding/margins if you want full-bleed

---

## Step 4: Preview & Test

### 4a. Preview the Page
1. Click **Preview** (top right, play button)
2. The calculator should load with all styling intact
3. Test:
   - Fill form → Calculate ROI ✓
   - Edit assumptions in breakdown ✓
   - Dropdown selections ✓
   - Mobile responsiveness ✓
   - All colors/fonts match original ✓

### 4b. Debug (If Issues)
If something doesn't load:
1. Open **Browser Dev Tools** (F12)
2. Check **Console** for errors
3. Check **Network** tab for failed CDN scripts
4. Share any red error messages with me

---

## Step 5: Set to Staging (Unpublished)

### 5a. Keep as Draft
By default, new pages are **drafts** (unpublished):
- ✅ Not visible to public
- ✅ Accessible via preview link
- ✅ Accessible to workspace members

### 5b. Get Staging Link
1. Click **Share** (top right)
2. Under **Preview Link**, copy the staging URL
3. Share with me: it looks like `https://[id].webflow.io/roi-calculator`

### 5c. Don't Publish Yet
- Do NOT click the **Publish** button
- Keep it as a draft/preview

---

## Step 6: Verify Everything Works

### Checklist:
- [ ] Page loads without errors
- [ ] Form fields accept input
- [ ] Dropdowns open/close smoothly
- [ ] "Calculate ROI" button works
- [ ] Results appear in sidebar
- [ ] Breakdown section toggles open/closed
- [ ] Edit rate/hours in breakdown works
- [ ] Mobile view is responsive
- [ ] All colors match original
- [ ] All text is readable

---

## Troubleshooting

### Issue: White blank page
**Solution:** Check browser console (F12). Most likely CDN scripts didn't load.
- Refresh page (F5)
- Check internet connection
- Try different browser

### Issue: Styling looks off
**Solution:** The styling is embedded in the HTML. If it looks wrong:
- Check that the entire HTML file was pasted (should be 1843 lines)
- No content was lost in copying

### Issue: Form doesn't work
**Solution:** JavaScript might be blocked. Check:
- Browser console for errors
- Webflow HTML Embed settings (should allow scripts)

### Issue: CDN scripts won't load
**Solution:** Webflow may block external CDNs in preview. This is temporary and will work on published site.

---

## What Happens Next

Once you confirm it works:
1. Share the staging link with me
2. I'll verify the UI/UX matches
3. We can make any tweaks needed
4. Deploy to production when ready

---

## Quick Reference: What Gets Migrated

✅ **Everything is preserved:**
- React app with all components
- All calculation logic
- Form validation
- State management
- Styling (colors, fonts, animations)
- Responsive design
- CDN scripts (React, Babel, etc.)

❌ **Nothing is lost:**
- All 1843 lines of code are included
- All styling tokens (colors, spacing, typography)
- All interactions and animations

---

## Need Help?

If you get stuck on any step:
1. Share a screenshot
2. Tell me which step (1-6)
3. Describe what happened
4. I'll help debug

Let me know when you're ready to start! 🚀
