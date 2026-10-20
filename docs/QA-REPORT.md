# QA report: integrations (branch `integrations`, 20 October 2026)

Not deployed. Tests run in headless Chromium with `howweplayfootball.com` mapped to the local build, so analytics behaved as it will live. Requests to Google and Mailchimp were intercepted, not sent.

## Completed here
| Check | Result |
|---|---|
| Builds and build checks | Pass, both targets (public 20 pages, 17 in sitemap) |
| `npm test`, gate tests | 24/24, 13/13, content valid; 5/5 |
| No GA before consent | No Google request and no `_ga` cookie before a choice |
| Accept and Reject equal | Both 168 × 44px, same style |
| Reject remembered | No banner and no Google request on the next page |
| Cookie settings | Reopens the bar and moves focus to it; switching off deletes `_ga` cookies and disables GA |
| Tag loaded once, correct ID | One request to `gtag/js?id=G-NRDDNYR138` |
| Page metadata | Issue page config: `content_type=formation_issue`, `format=9v9`, `issue_number=1`, `formation=3-1-3-1` |
| Non-production hosts | No bar, no Cookie settings link, no Google requests |
| `support_click` | Fires for footer and issue Ko-fi links with `link_location` |
| Newsletter states (simulated Mailchimp responses) | Invalid email: inline message, `aria-invalid`, nothing sent; success: "check your inbox"; already subscribed: friendly message |
| Newsletter events | `newsletter_submit` on attempt, `newsletter_signup` only on Mailchimp success, `newsletter_error` otherwise |
| Personal data in analytics | None: no email in any dataLayer entry |
| Data sent to Mailchimp | Only `EMAIL`, the empty honeypot and the callback name |
| Form appears once per page | 1 |
| Ko-fi links | Correct URL, new tab, `rel="noopener"`, screen-reader text |
| Accessibility (axe-core 4.10) on home, Issue 01, privacy, desktop and phone | No violations |
| Overflow at 1440 and 390px | None |
| Keyboard | Form, banner buttons and Cookie settings all reachable; visible yellow focus ring on dark |

## Needs your accounts (not done)
- **A real Mailchimp signup** and the double opt-in confirmation email: needs the embedded form action.
- **GA4 Realtime or DebugView**: needs access to your GA4 property after deploy. Accept analytics on the live site and check Realtime for the page view and `support_click`.
- Unsubscribe flow: Mailchimp's own link; test with a real subscription.
- Register the custom dimensions in GA4 (see ANALYTICS.md).

## Blocking items before the newsletter goes live
- Mailchimp embedded form action (`newsletter.action`).
- Privacy controller and contact email (`privacy.controller`, `privacy.contactEmail`). The live privacy page currently says a contact address is being added.
