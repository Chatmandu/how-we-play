# Integrations: Mailchimp, Ko-fi, consent

## Mailchimp: what I need from you
The code you sent (`<script id="mcjs" …chimpstatic.com/mcjs-connected/…>`) is Mailchimp's **site connection script**. It loads Mailchimp tracking and pop-up tools on every page. It isn't a signup form and doesn't include your audience ID. I haven't added it: it would load a third-party tracker before consent and enables pop-ups, which the brief rules out.

To switch the form on:
1. Mailchimp → **Audience → Signup forms → Embedded forms**.
2. Copy the `action` from the form code. It looks like `https://….list-manage.com/subscribe/post?u=…&amp;id=…` (there may be an `&amp;f_id=…` too).
3. Paste it into `content/site.json` → `newsletter.action`. Nothing else is needed: the honeypot field name is worked out from that URL.
4. In Mailchimp, check **Audience → Settings → Audience name and defaults → Enable double opt-in** is on, and review the confirmation email wording. Turn off any Mailchimp pop-up forms.
5. Rebuild. The footer form then appears on every public page. Until then, public pages show no form.

Also needed before the newsletter goes live (privacy notice):
- **Data controller** name (for example, you as an individual): `privacy.controller`.
- **Contact email** for privacy requests: `privacy.contactEmail`.

## The form
- One component, `src/components/CoachingNotes.astro`, rendered once in the footer by `Base.astro`. Reusable elsewhere by importing it, though no other placements are built.
- Collects email only. Submits through Mailchimp's JSON endpoint so the reader stays on the page and sees the real result: check your inbox, already subscribed, or an error. Without JavaScript it posts to Mailchimp in a new tab.
- No Mailchimp script loads until someone submits. No API key is used anywhere.
- Ko-fi supporters and PDF downloaders are never added to the list.

## Ko-fi
- Footer: "Support How We Play".
- End of each published formation issue: "Found this useful?" (`src/components/Support.astro`). Not in lessons or positions, no widgets or pop-ups. Opens in a new tab, announced to screen readers.

## Cookie choice
- Non-modal bar at the bottom of the page on first visit (production only). Accept and Reject are identical in size and style.
- "Cookie settings" in every footer, and on the privacy page, reopens it.
- Choice stored in `localStorage` (`hwp-consent`), which is strictly necessary to remember it.
