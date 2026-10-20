# How We Play · Contact form setup

**Status:** Code complete, email service not yet connected or test-delivered. Do not merge this change to production until the account steps and live delivery test below have been completed.

## What is built

- `/contact/` in the established editorial design, linked from header and footer.
- A server-backed form: **name, email, topic, message**. No accounts, attachments or child details.
- POST endpoint `/api/contact`, implemented by `src/worker/contact-handler.mjs`.
- Cloudflare Workers static assets still serve the rest of the site. Only the contact API runs through Worker code.
- A destination-restricted Cloudflare Email Service binding, `CONTACT_EMAIL`.
- Plain-text email with a verified How We Play sending identity and the visitor's address as Reply-To.
- Validation, a hidden spam trap, request-length limit, same-origin checks, no-cache responses and error handling.
- Graceful feedback with JavaScript and an accessible receipt/error page when JavaScript is disabled.
- Privacy information that explains the contact enquiry, Cloudflare processing and inbox handling. The contact form **does not** subscribe visitors to Mailchimp.
- No secret or Gmail password in source code and no successful-delivery message when the email binding is absent or fails.

## Email addresses in the temporary arrangement

- **Recipient (temporary):** `nbwalsh@gmail.com`
- **Sending identity (not an inbox):** `notifications@howweplayfootball.com`

The sending identity is not a configured mailbox. Cloudflare's email-sending domain onboarding allows a domain you control to authenticate outgoing mail; messages can arrive at Gmail even before you create a domain email inbox.

**Important:** The worker code and Wrangler binding both restrict the recipient; do not attempt to change the destination through the browser form.

## One-time account setup before going live

1. In the [Cloudflare dashboard](https://dash.cloudflare.com/) open **Compute → Email Service → Email Sending**. Select **Onboard Domain**, choose `howweplayfootball.com`, and allow Cloudflare to install the applicable SPF/DKIM and other sending DNS records. Wait for verification. Email Sending is a separate setup from merely hosting the website or enabling inbound email routing. See [Cloudflare domain onboarding](https://developers.cloudflare.com/email-service/get-started/send-emails/).
2. Make sure the destination `nbwalsh@gmail.com` is verified/allowed for the Cloudflare account's send-email binding. Follow the confirmation message Cloudflare sends if prompted. The `send_email` binding is restricted to this one destination. See [send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/).
3. Verify that the Email Service feature is available on the account. Availability and product limits can change; do not assume it is switched on just because the Worker is deployed.
4. Cloudflare Workers Builds may attempt an automatic **preview deployment** from the feature branch. If it fails before email onboarding, inspect the Workers build log. This is not necessarily an Astro code failure.
5. Merge this branch through its reviewed pull request only after the sending domain and destination are configured and `npm test`, `npm run build:public` and `npm run build:preview` pass.
6. After deployment, open `https://howweplayfootball.com/contact/` and submit a **real test** using your own address. Confirm the message arrives at Gmail, that Reply-To points to the test sender, and that the site reports success only on a successful send.
7. Test the form's missing-field error, invalid email and a second request. Check Cloudflare Email Service logs if the message does not arrive. Test `/contact/` on mobile and keyboard. Check junk/spam folders.

**Important limitation:** Automated tests use a fake Cloudflare email binding, so passing tests does not prove actual Gmail delivery. If Email Service is not configured, the handler returns HTTP 503 and clearly states that the message was **not** sent.

### Avoiding spam

The code includes basic field validation, a honeypot and same-origin browser checks. Those are not sufficient protection against determined spammers. Before promotion, consider a Cloudflare WAF rate-limiting rule on **POST /api/contact** or add Cloudflare Turnstile with server-side token verification. Do not depend on a client-only CAPTCHA.

## Switching to a domain inbox later

1. Configure and verify your new receiving mailbox or routing destination in Cloudflare.
2. Change `destination_address` in `wrangler.jsonc` and `DESTINATION` in `src/worker/contact-handler.mjs`.
3. If changing the sender identity, make sure the sending domain is still verified and update `FROM` in the handler.
4. Run the tests, deploy and send a real test message before retiring Gmail.

The public form does not need changing, so the visitor experience remains the same.

## Email and privacy expectations

The handler sends name, email, subject and message to the fixed destination via Cloudflare Email Service; the message is delivered to a Gmail account. This is separate from the Mailchimp list and Google Analytics. It is not stored in a website database. The email provider and destination inbox will have their own operational storage/logging. Avoid saying messages are never stored anywhere.

## Testing

```bash
npm ci
npm test                  # includes scripts/test-contact.mjs
npm run build:public
npm run build:preview
```

Server code changes should be tested with `npx wrangler dev` after the email sending binding is configured. Astro's dev server only serves static pages; it will not execute the Cloudflare Worker email handler. A real send is the final required test.
