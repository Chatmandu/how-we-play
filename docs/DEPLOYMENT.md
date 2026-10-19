# Deployment: GitHub → Cloudflare Pages

Repository: `github.com/Chatmandu/how-we-play` (private). Nothing is connected to howweplayfootball.com yet; the steps below get there safely.

## Why Cloudflare Pages

Static output, Git integration, a preview deployment per branch, Cloudflare Access to keep previews private, `_headers` support, and no cost at this scale. It is the same setup as manualmode.xyz. (Cloudflare Workers with static assets would also work; Pages is simpler for branch previews.)

## 1. Create the Pages project

Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → `Chatmandu/how-we-play`.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | Environment variable `NODE_VERSION=22.22.0` (or rely on `.nvmrc`) |

**No `HWP_TARGET` variable is needed.** `src/lib/model.mjs` reads Cloudflare's `CF_PAGES_BRANCH`: `main` builds the public target, every other branch builds the private preview. If someone sets `HWP_TARGET=preview` on production by mistake, the build fails rather than publishing drafts. (If the production branch is ever renamed, set `HWP_PRODUCTION_BRANCH`.)

## 2. Keep previews private

Pages → Settings → General → **Access policy: enable for preview deployments.** This puts every `*.how-we-play.pages.dev` preview behind Cloudflare Access (email one-time PIN). Add the people who may see drafts (you, the reviewer). Preview builds are also `noindex` and disallowed in `robots.txt`, but Access is what keeps them private.

The production `*.pages.dev` address is public. That's acceptable because the production build contains only gate-approved content, but you can also put Access on the production `pages.dev` host until launch (Zero Trust → Access → Applications → self-hosted, domain `how-we-play.pages.dev`).

## 3. Working day to day

- Branch, edit `content/` or templates, push. Cloudflare builds a private preview; the build log shows the gate's decisions.
- Merge to `main` only through a pull request. The production build runs the full gate and post-build checks; a failure means nothing is deployed.
- Optional: add a GitHub Action running `npm test` and `npm run build:public` on pull requests, so problems show before merge.

## 4. Switching on howweplayfootball.com (later, not now)

Only after the items in `docs/OUTSTANDING.md` marked "before launch" are done.

1. Domain on Cloudflare (nameservers) if it isn't already.
2. Pages → Custom domains → add `howweplayfootball.com` and `www.howweplayfootball.com`.
3. Redirect `www` to the apex (Bulk Redirects or a redirect rule) so it matches the canonical URLs.
4. Remove any Access policy from the production host.
5. Verify in Google Search Console and Bing; submit `https://howweplayfootball.com/sitemap.xml`.

## Rollback

Pages keeps every deployment. Deployments → choose a previous production deployment → Rollback. Content changes are also reversible in Git.

## A CMS later?

Not needed now: content is JSON in Git and the review record is the pull request. If a non-technical editor joins, add a Git-based CMS (Keystatic or Decap) over `content/`, so edits still become commits and still pass the gate. Avoid a hosted CMS that bypasses the build checks.
