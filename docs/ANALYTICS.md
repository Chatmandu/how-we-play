# Analytics: GA4 (G-NRDDNYR138)

## How it loads
- Configured once in `content/site.json` (`analytics.ga4`, `analytics.hosts`). The tag is never pasted into pages.
- `src/components/Consent.astro` (in the shared layout) and `src/scripts/analytics.mjs`.
- Runs only when **all** are true: public build, host is `howweplayfootball.com` or `www.howweplayfootball.com`, and the visitor chose **Accept analytics**. Previews, `*.workers.dev` and local development never load it.
- Before consent: no Google script, no request, no cookie. On accept: Consent Mode set (`analytics_storage` granted; all ad storage denied), then `gtag/js?id=G-NRDDNYR138` loads once and one `page_view` is sent. Google signals and ad personalisation are off.
- Reject, or switching off later via **Cookie settings**: GA is disabled for the page, consent updated to denied, `_ga` cookies deleted.
- The site is static (no client-side routing), so each page load sends exactly one page view.

## Page metadata (sent with every page view)
| Parameter | Values | Example |
|---|---|---|
| `content_type` | `home`, `format`, `formation_issue`, `lesson`, `position`, `about` | `formation_issue` |
| `content_group` | Home, Formats, Formation issues, Lessons, Positions, About | Formation issues |
| `format` | `5v5`, `7v7`, `9v9` | `9v9` |
| `issue_number` | number within the format | `1` |
| `formation` | formation slug | `3-1-3-1` |

Register `content_type`, `format`, `issue_number` and `formation` as **event-scoped custom dimensions** in GA4 (Admin → Custom definitions) to report on them. `content_group` is built in.

## Custom events
| Event | When | Parameters |
|---|---|---|
| `support_click` | Click on any Ko-fi link (interest, not payment) | `link_location` (`footer`, `issue`), `link_url` |
| `newsletter_submit` | A valid email is submitted (an attempt) | `form_location` |
| `newsletter_signup` | Mailchimp accepts the signup (double opt-in: pending confirmation) | `form_location`, `status` = `pending_confirmation` |
| `newsletter_error` | Signup rejected or failed | `reason` (`already_subscribed`, `rejected`, `timeout`, `network`) |
| `playbook_download` | Click on a link marked `data-playbook="<formation>"` | `formation`, `file_name` |

Never sent: email addresses, names, form text, player names or personalised playbook details. Button clicks are never counted as subscriptions.

**`playbook_download`:** the PDF isn't released, so nothing fires yet. When it is, add `data-playbook="3-1-3-1"` to the download link and **switch off "File downloads" in GA4 Enhanced measurement** so downloads aren't counted twice. Enhanced measurement's "Outbound clicks" will also log Ko-fi clicks as `click`; use `support_click` for reporting.

**Future paid playbooks:** use GA4's recommended ecommerce events (`view_item`, `begin_checkout`, `purchase`) under the same consent rules. Not implemented.
