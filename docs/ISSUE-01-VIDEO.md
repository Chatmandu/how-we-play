# Issue 01 · Full-length YouTube explainer

Source: the publisher-supplied YouTube URL `https://www.youtube.com/watch?v=4HWQntulHgw`. The publisher confirmed that this is the **four-plus-minute widescreen** video, not the 60-second Reel.

## Location and composition

- Public destination: `/formations/9v9/3-1-3-1/#watch`
- Placement: immediately after the issue cover and contents list, before Chapter 1.
- Format: prominent, horizontally centred **16:9** embedded player; do **not** crop to portrait.
- Poster: static, first-party pitch SVG derived from `content/formations/9v9/3-1-3-1.json`, with the design system's fonts and colours.
- Click Play to load `https://www.youtube-nocookie.com/embed/4HWQntulHgw?autoplay=1&rel=0`.
- If the embedded player cannot be loaded, a persistent link to the original YouTube watch page remains visible.
- Respect keyboard navigation, visible focus ring, readable mobile sizing and the site's existing noindex rules on private previews.
- The additional `Watch` link in the issue table of contents goes to the full video section.
- Text beneath the video links to the existing four playing-principles section, without creating duplicate thin pages.

## Privacy / performance

- The initial server-rendered page uses only the source site's assets: no YouTube iframe, YouTube poster image or other third-party player resources are fetched before click.
- After a visitor clicks Play, their browser connects to YouTube's privacy-enhanced domain. That does **not** promise zero tracking or cookies after interaction.
- The site's privacy notice explains the on-demand YouTube player and links to Google's policy; `content/site.json` carries the date when that notice was updated.
- Browser `referrerPolicy` is `strict-origin-when-cross-origin`. Playback isn't forced on page load.
- The original tactical diagrams, coaching JSON, review hashes and publication gate remain unchanged.

## SEO / video metadata

The published issue remains the canonical editorial page. The video supports the already indexable guide and its principles, rather than generating an additional competing video-only page.

**Do not invent `VideoObject` metadata.** The exact upload date, full published video title, thumbnail URL and duration were not independently retrievable from YouTube when this integration was made. Once verified, consider adding grounded `VideoObject` metadata (with the actual upload date, thumbnail, embed URL and duration) to the existing issue page, and submit the page for reinspection in Search Console.

## Updating / extending

The reusable `src/components/IssueVideo.astro` takes a video ID, formation name and reviewed starting-shape diagram. The first video ID is currently configured in `src/pages/formations/9v9/[formation]/index.astro` for `f.slug === '3-1-3-1'` only.

When more full-length explainers are released, create an explicit, editorially approved video entry per formation. Do not automatically embed any social Reel, and do not use unverified video links or mutate tactical content to display a video.

## QA

- Run `npm test`, `npm run build:public`, `npm run build:preview`; the build-time checker validates presence, privacy explanation, absence of eager iframes and correct scope to Issue 01.
- Check 16:9 layout on desktop and mobile.
- Check that pressing Play connects to the correct YouTube video and that the player actually works; automated build checks **cannot** guarantee live playback.
- Confirm the direct YouTube link works, captions can be enabled, and normal page navigation still functions after the player is loaded.
- Check keyboard activation and focus, reduced motion, and printing.
- Confirm no video iframe/network request is made before the user activates Play.

**No new coaching claims were added; the embed simply points to the publisher's video. The published video itself should receive the publication's editorial/coaching check.**
