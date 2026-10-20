# Deploying the integrations

1. Approve this branch (`integrations`).
2. Optional now, required before the newsletter: add `newsletter.action`, `privacy.controller` and `privacy.contactEmail` to `content/site.json`.
3. `npm ci && npm test && npm run test:leak && npm run build`.
4. Merge `integrations` into `main` and push; Cloudflare Workers Builds deploys it.
5. On the live site: check the cookie bar appears; Reject, reload and confirm no `_ga` cookie (browser dev tools → Application → Cookies); then Cookie settings → Accept and open GA4 → Reports → Realtime to see your visit.
6. Click "Support How We Play" and check `support_click` in Realtime (custom events can take a minute).
7. Once the Mailchimp action is in: sign up with your own address, confirm the email, then unsubscribe from the first issue you receive.
8. In GA4: register the custom dimensions in ANALYTICS.md and switch off Enhanced measurement → File downloads before the PDF is released.
