# Notion Widgets

Simple, clean widgets built with plain HTML, CSS, and JavaScript for embedding in Notion.

## AA Progress

Local preview file: `public/index.html`

Files:

- `public/index.html` - widget structure
- `public/styles.css` - widget styling
- `public/widget.js` - progress display and fallback logic
- `netlify/functions/progress.mts` - optional live Notion progress endpoint

To use a graduation cover image, add it at `public/assets/aa-progress-cover.png`. If that file is missing, the widget shows the built-in soft placeholder instead.

Future semester or course automation should update the AA Progress Notion data source values, such as Completed Credits, Total Credits, and Degree Progress. The widget stays display-only and will show the updated values returned by the Netlify function.
