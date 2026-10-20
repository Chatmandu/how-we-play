# Deployment checklist: howweplayfootball.com

Do these in order. Nothing is deployed until step 6.

## Before you approve

1. **Read the consequence.** With no recorded review, the public site will drop the 3-1-3-1 guide, its four lessons and eight position pages (13 URLs). The homepage switches to the Moving Up scoreboard as its feature. The live site currently says the 3-1-3-1 was reviewed by Greg Williams; deploying this branch removes that claim, so it's worth doing soon.
2. **Check the previews**: public build for what visitors see; preview build for the guide, lessons, positions and the About page with David.

## Confirmations (each unlocks something)

3. **David Wilson confirms his biography** (name, role, the four background points). Keep his written confirmation. Then:
   `node scripts/review.mjs confirm --id profile-david-wilson --by "David Wilson" --on YYYY-MM-DD --evidence "where it's filed"`
4. **You confirm the original playbook pages** may be shown on /about/ (cover and rule two, crest masked):
   `node scripts/review.mjs confirm --id about-original-playbook --by "Niall Walsh" --on YYYY-MM-DD --evidence "..."`
5. **David reviews the 3-1-3-1.** Send him the preview link and the content version (`npm run review`). When he approves in writing:
   `node scripts/review.mjs record --id 9v9-3-1-3-1 --by "David Wilson" --on YYYY-MM-DD --decision approved --evidence "..." --limitations "..."`
   If he asks for changes, record `--decision changes-required` with his notes, make the changes, and send the new version back.
   Then `npm run review:register` and commit.

Steps 3 to 5 are independent. You can deploy after step 2 and come back to them; each one goes live on the next deploy.

## Deploy

6. Run `npm ci && npm test && npm run test:leak && npm run build:both`. All must pass.
7. Merge `editorial` into `main` (pull request on GitHub). Cloudflare Workers Builds deploys `main` as the public target.
8. Check the live site: homepage, About, /formations/9v9/, /moving-up/, a 404. View source on About and confirm David isn't named (unless step 3 is done).
9. In Search Console (once verified), resubmit `sitemap.xml`. The 13 removed 3-1-3-1 URLs will return 404 until the guide is reviewed; that's expected.

## Optional, not blocking
- Photos of Niall and David (with their agreement) to replace the placeholders.
- Confirm the three social accounts are live before relying on them in structured data.
- Raise ghost-number contrast in the renderer (accessibility, see QA report).
- Screen-reader and real-device testing.
- Protect preview deployments with Cloudflare Access.
