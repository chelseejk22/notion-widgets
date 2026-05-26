# Notion Widgets

Simple, clean widgets built with plain HTML, CSS, and JavaScript for embedding in Notion.

## Daily Alignment

A compact daily astrology alignment widget for Chelsee's Notion Home page.

Local preview file: `public/daily-alignment/index.html`

Files:

- `public/daily-alignment/index.html` - widget structure
- `public/daily-alignment/styles.css` - widget styling and sizing
- `public/daily-alignment/widget.js` - daily rotating text and voice buttons

### Preview Locally

Open `public/daily-alignment/index.html` directly in a browser.

Optional local server preview:

```powershell
python -m http.server 8888 --directory public
```

Then open:

```text
http://localhost:8888/daily-alignment/
```

### Deploy Later To Netlify

The site already publishes the `public` folder. After deploying to Netlify, the widget URL should be:

```text
https://YOUR-NETLIFY-SITE.netlify.app/daily-alignment/
```

Replace `YOUR-NETLIFY-SITE` with the real Netlify site name.

### Embed In Notion

1. Open Chelsee's Notion Home page.
2. Type `/embed`.
3. Paste the deployed Netlify full-page URL:

```text
https://YOUR-NETLIFY-SITE.netlify.app/daily-alignment/
```

4. Resize the embed box.
5. Recommended height: `420` to `520px` for the compact view.

### Adjust The Size

Edit `public/daily-alignment/styles.css`.

The main size setting is:

```css
--widget-max-width: 520px;
```

Use `420px` for a smaller widget or `620px` for a wider widget. The layout is responsive and stacks the small cards on narrow screens.

### Edit The Daily Text

Edit the `dailyEntries` object in `public/daily-alignment/widget.js`.

Each voice has at least seven entries:

- `soft`
- `direct`
- `luxe`

The widget picks the entry by day of year, so the text rotates daily without an API.

## AA Progress

Local preview file: `public/index.html`

Files:

- `public/index.html` - widget structure
- `public/styles.css` - widget styling
- `public/widget.js` - progress display and fallback logic
- `netlify/functions/progress.mts` - optional live Notion progress endpoint

To use a graduation cover image, add it at `public/assets/aa-progress-cover.png`. If that file is missing, the widget shows the built-in soft placeholder instead.

Future semester or course automation should update the AA Progress Notion data source values, such as Completed Credits, Total Credits, and Degree Progress. The widget stays display-only and will show the updated values returned by the Netlify function.
