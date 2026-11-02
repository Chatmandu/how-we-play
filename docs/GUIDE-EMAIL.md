# A4 guide delivery by email

This is an optional, one-time setup for the five existing A4 coaching PDFs. The site remains free and does **not** add readers to a mailing list unless they separately tick the newsletter box and confirm through Mailchimp.

## Architecture

- Static Astro pages continue to load from Cloudflare Workers static assets.
- Only /api/* runs src/worker.mjs. GET /api/guide-email/status advertises readiness when all credentials are configured. Until then the normal working A4 PDF links remain visible.
- When ready, client JavaScript replaces the direct download button with an email request form and a Cloudflare Turnstile challenge.
- The Worker validates the guide against five approved filenames, checks the Turnstile token server-side, and calls Resend to send a **one-off** email linking to that guide. The PDF is not attached.
- The **unchecked** optional newsletter box is handled independently on the client after successful guide delivery via the existing Mailchimp embedded-form endpoint, with the same double opt-in as the normal newsletter. A Mailchimp failure never blocks the requested guide. No email addresses enter Google Analytics.
- The existing PDF URLs remain public for old shared links and visitors without JavaScript. This is a *soft email request*, not DRM or a paywall. Hard-gating the old PDFs would break existing links and need a separate decision.

## One-time Cloudflare and Resend setup (site owner)

1. Create/sign in to a [Resend](https://resend.com) account. Verify the sending domain howweplayfootball.com in Resend, using the DNS records Resend provides. This does not require moving the site's existing email hosting. Check existing SPF/DKIM settings before adding records; merge SPF values if necessary rather than adding conflicting SPF records.
2. In Resend, create an API key with **sending** permission. **Do not paste the key into GitHub or chat**.
3. In the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile), create a Managed widget for hostname howweplayfootball.com (and www.howweplayfootball.com only if used). Copy its site key and secret key.
4. In Cloudflare, open Workers & Pages → **how-we-play** → Settings → Variables and Secrets (or the equivalent for the production Worker deployment). Add:
   - RESEND_API_KEY: Secret = Resend API key.
   - TURNSTILE_SECRET_KEY: Secret = Turnstile secret key.
   - TURNSTILE_SITE_KEY: Plain text variable = Turnstile public site key.
   These values are read at runtime. Set them for the **production** Worker; preview deployments may have separate secrets.
5. Deploy the branch containing this code (after passing CI). Test sending to an address you control with the newsletter box both unticked and ticked. With it ticked, confirm Mailchimp sends its separate subscription confirmation. Check the inbox and spam folder, and inspect the resulting email links.
6. Check GET https://howweplayfootball.com/api/guide-email/status returns {"ready":true,...}. Confirm that the form appears on all five published A4 formation pages. If it returns ready:false, the site deliberately retains the direct download buttons.

## Safety and maintenance

- Only validated formation IDs can be emailed; the request can't choose an arbitrary URL.
- Turnstile verification is mandatory server-side for every send and checks the response hostname.
- The server never stores emails locally and never enrols anyone in Mailchimp.
- No API keys are committed to GitHub. If sending is disabled by removing credentials, the existing download buttons return.
- Turnstile helps block scripted abuse. Monitor Resend usage and enable Cloudflare rate limiting rules for /api/guide-email if volumes grow; consider a server-side limit if higher usage warrants it.
- Resend's standard free account has sending limits; check the current allowance before promotion.
- The public PDF URLs are deliberately unchanged.
