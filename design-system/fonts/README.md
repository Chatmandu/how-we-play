# Fonts

Two families, both under the **SIL Open Font License 1.1**:

| Family | Weights used | Source | Licence |
|---|---|---|---|
| Big Shoulders Display | 700, 800, 900 | https://fonts.google.com/specimen/Big+Shoulders+Display | OFL 1.1 |
| Schibsted Grotesk | 400, 400 italic, 500, 600, 700, 800 | https://fonts.google.com/specimen/Schibsted+Grotesk | OFL 1.1 |

**No font files are included in this package.** The OFL does allow bundling and self-hosting, provided the licence text is included and the fonts aren't sold on their own. We left them out to keep the package light. Load them in one of two ways:

1. **Google Fonts (simplest):**
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Schibsted+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap">
   ```
2. **Self-host (recommended for production privacy and performance):** download WOFF2 from the Google Fonts specimen pages or the google/fonts repository, subset to Latin, and add `OFL.txt` next to the files. Declare `@font-face` with `font-display: swap`.

Fallback stacks are defined in `tokens/tokens.json` → `font.family`.

**Logo files don't depend on fonts.** The wordmark in `assets/logo/*.svg` is outlined to paths.

Newsreader and Kalam were evaluated and **not adopted** (Identity v1.1, §02).
