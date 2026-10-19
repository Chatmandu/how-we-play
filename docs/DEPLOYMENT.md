# Deployment: GitHub → Cloudflare

Repository: `github.com/Chatmandu/how-we-play` (private). Nothing is connected to howweplayfootball.com yet; the steps below get there safely.

## Setup used: Cloudflare Workers Builds (static assets)

The project is a Cloudflare **Worker with static assets** connected to GitHub (Workers Builds). There is no Worker code: `wrangler.jsonc` tells Cloudflare to serve `dist/`, with `404.html` for missing pages and trailing-slash URLs. `_headers` (security headers; `noindex` on previews) is honoured.

### Build settings (Worker → Settings → Build)

| Setting | Value |
|---|---|
| Git repository | `Chatmandu/how-we-play` |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler versions upload` |
| Root directory | `/` |
| Environment variable | `NODE_VERSION=22.22.0` (optional; `.nvmrc` also sets it) |

**No `HWP_TARGET` variable is needed.** Workers Builds sets `WORKERS_CI_BRANCH`: `main` builds the public target and any other branch builds the private preview. Asking for anything other than public on `main` fails the build. A build with no branch information and no `HWP_TARGET` also builds **public**, so a misconfigured build can never publish drafts. (If the production branch is renamed, set `HWP_PRODUCTION_BRANCH`.)

### Keeping previews private

Non-production branches upload a version with a preview URL instead of deploying. Before sharing one with the reviewer, put Cloudflare Access in front of the preview URLs (Worker → Settings → Domains & Routes → preview URLs → enable Cloudflare Access, or a Zero Trust self-hosted application covering `*-how-we-play.<account>.workers.dev`). Preview builds are also `noindex` and disallowed in `robots.txt`, but Access is what keeps them private. Check this in the dashboard; the exact menu wording changes.

The production `how-we-play.<account>.workers.dev` address is public, which is acceptable because the production build contains only gate-approved content. You can switch the workers.dev route off until launch.

### Cloudflare Pages alternative

The site also works unchanged on Cloudflare Pages (build `npm run build`, output `dist`); `CF_PAGES_BRANCH` is handled the same way.

## 3. Working day to day

- Branch, edit `content/` or templates, push. Cloudflare builds a private preview; the build log shows the gate's decisions.
- Merge to `main` only through a pull request. The production build runs the full gate and post-build checks; a failure means nothing is deployed.
- Optional: add a GitHub Action running `npm test` and `npm run build:public` on pull requests, so problems show before merge.

## 4. Switching on howweplayfootball.com (later, not now)

Only after the items in `docs/OUTSTANDING.md` marked "before launch" are done.

1. Domain on Cloudflare (nameservers) if it isn't already.
2. Worker → Settings → Domains & Routes → add custom domains `howweplayfootball.com` and `www.howweplayfootball.com`.
3. Redirect `www` to the apex (Bulk Redirects or a redirect rule) so it matches the canonical URLs.
4. Remove any Access policy from the production host.
5. Verify in Google Search Console and Bing; submit `https://howweplayfootball.com/sitemap.xml`.

## Rollback

Cloudflare keeps every deployment. Worker → Deployments → choose a previous version → Rollback. Content changes are also reversible in Git.

## A CMS later?

Not needed now: content is JSON in Git and the review record is the pull request. If a non-technical editor joins, add a Git-based CMS (Keystatic or Decap) over `content/`, so edits still become commits and still pass the gate. Avoid a hosted CMS that bypasses the build checks.
