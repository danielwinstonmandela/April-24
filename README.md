# Setup Guide

## File Structure
```
/
├── index.html
├── style.css
├── script.js
├── images.json
└── images/
    ├── img1.jpg
    ├── img2.jpg
    └── ...
```

## Steps

### 1. Add your photos
Drop all your .jpg / .jpeg images into the `/images/` folder.

### 2. Update images.json
List every filename inside the `"us"` array:
```json
{
  "us": [
    "photo1.jpg",
    "photo2.jpeg",
    "photo3.jpg"
  ]
}
```
Supports 100+ images. Order doesn't matter — they get lightly shuffled for a natural mosaic.

### 3. Replace the YouTube video
In `index.html`, find the `<iframe>` in Section 4 and replace the `src`:
```html
src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
```
Get the embed URL from: YouTube → Share → Embed → copy the src value.

### 4. Add your personal paragraphs
In `index.html`, find these two comments and paste your text between them:

**Section 3 (Journey):**
```html
<!-- PASTE YOUR JOURNEY PARAGRAPH(S) HERE -->
<p>Your text here...</p>
<!-- END JOURNEY TEXT -->
```

**Section 5 (Realization):**
```html
<!-- PASTE YOUR REALIZATION PARAGRAPH(S) HERE -->
<p>Your text here...</p>
<!-- END REALIZATION TEXT -->
```

### 5. Deploy to Vercel
1. Push all files to a GitHub repo (keep `images/` folder included)
2. Import the repo on vercel.com
3. Deploy as a Static Site — no config needed
4. Share the link with Gisel as a "thesis demo"

## Customization

**Change the final message** — find `id="finalText"` in index.html:
```html
<p class="final-text" id="finalText">okay good…<br/>it was always you anyway 🤍</p>
```

**Change the question** — find `class="question-text"`:
```html
<p class="question-text">so… can i be your boyfriend?</p>
```

**Button labels** — find `id="btnYes"` and `id="btnOfCourse"`.
# April-24
