/*
 * Cloudflare Worker for optional A4 guide delivery.
 * Static site stays asset-first; this code runs only for /api/*.
 * Do not enable the form until Resend and Turnstile are configured.
 */
export const GUIDES = Object.freeze({
  '7v7-2-3-1': {
    title: '7v7 2-3-1',
    path: '/downloads/How-We-Play-Football-7v7-2-3-1-A4-Coach-Guide.pdf'
  },
  '7v7-3-2-1': {
    title: '7v7 3-2-1',
    path: '/downloads/How-We-Play-Football-7v7-3-2-1-A4-Coach-Guide.pdf'
  },
  '9v9-3-1-3-1': {
    title: '9v9 3-1-3-1',
    path: '/downloads/How-We-Play-Football-3-1-3-1-A4.pdf'
  },
  '9v9-3-3-2': {
    title: '9v9 3-3-2',
    path: '/downloads/How-We-Play-Football-9v9-3-3-2-A4-Coach-Guide.pdf'
  },
  '9v9-2-2-3-1': {
    title: '9v9 2-2-3-1',
    path: '/downloads/How-We-Play-Football-9v9-2-2-3-1-A4-Coach-Guide.pdf'
  }
});

export const isEmail = value =>
  typeof value === 'string' && value.length <= 254 &&
  /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(value);

const ready = env => !!(env.RESEND_API_KEY && env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SITE_KEY);

const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});

const htmlEmail = (guide, url) => [
  '<!doctype html><html lang="en"><head><meta charset="utf-8"></head>',
  '<body style="margin:0;background:#f3f1ec;color:#10283f;font-family:Arial,sans-serif">',
  '<div style="max-width:560px;margin:30px auto;padding:32px;background:#fff;border-top:8px solid #f16a53">',
  '<p style="font-size:12px;letter-spacing:.12em;font-weight:700">HOW WE PLAY FOOTBALL</p>',
  '<h1 style="font-size:28px;line-height:1.2">Your ', guide.title, ' A4 guide</h1>',
  '<p>Thanks for requesting the free formation guide. You can save it or print it for the next session.</p>',
  '<p style="margin:30px 0"><a href="', url, '" style="display:inline-block;background:#10283f;color:white;text-decoration:none;padding:15px 22px;font-weight:bold">Open your A4 guide (PDF)</a></p>',
  '<p style="font-size:13px">If the button does not work, copy this link into your browser:<br><a href="', url, '">', url, '</a></p>',
  '<hr style="border:0;border-top:1px solid #ddd;margin:28px 0">',
  '<p style="font-size:13px">This one-off email contains the guide you asked for. You will not receive The Coaching Notes newsletter unless you separately opted in and confirmed your subscription.</p>',
  '<p style="font-size:13px">How We Play Football · <a href="https://howweplayfootball.com">howweplayfootball.com</a></p>',
  '</div></body></html>'
].join('');

export async function handleGuideApi(request, env, fetcher = fetch) {
  const url = new URL(request.url);
  if (url.pathname === '/api/guide-email/status' && request.method === 'GET') {
    return json({ ready: ready(env), siteKey: ready(env) ? env.TURNSTILE_SITE_KEY : null });
  }
  if (url.pathname !== '/api/guide-email' || request.method !== 'POST') {
    return json({ error: 'Not found' }, 404);
  }
  if (!ready(env)) return json({ error: 'Email delivery is not available yet.' }, 503);

  // The form is same-origin only, and does not accept requests to another origin.
  const origin = request.headers.get('Origin');
  if (!origin || origin !== url.origin) return json({ error: 'Invalid origin.' }, 403);
  if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) {
    return json({ error: 'Please send JSON.' }, 415);
  }
  const bodyText = await request.text();
  if (bodyText.length > 2048) return json({ error: 'Request too large.' }, 413);
  let body;
  try { body = JSON.parse(bodyText); } catch { return json({ error: 'Invalid request.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid request.' }, 400);
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const guide = Object.hasOwn(GUIDES, body.guideId) ? GUIDES[body.guideId] : null;
  if (!isEmail(email) || !guide) return json({ error: 'Please enter a valid email and guide.' }, 400);
  if (typeof body.turnstileToken !== 'string' || body.turnstileToken.length < 10 ||
      body.turnstileToken.length > 2048) {
    return json({ error: 'Please complete the security check.' }, 400);
  }

  let challenge;
  try {
    const form = new FormData();
    form.set('secret', env.TURNSTILE_SECRET_KEY);
    form.set('response', body.turnstileToken);
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) form.set('remoteip', ip);
    const verification = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: form
    });
    challenge = verification.ok ? await verification.json() : null;
  } catch {
    return json({ error: 'Security check is temporarily unavailable. Please try again.' }, 502);
  }
  if (!challenge?.success || challenge.hostname !== url.hostname) {
    return json({ error: 'Security check was not completed. Please try again.' }, 403);
  }

  const pdfUrl = 'https://howweplayfootball.com' + guide.path;
  let sent;
  try {
    sent = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'How We Play Football <guides@howweplayfootball.com>',
        to: [email],
        reply_to: 'hello@howweplayfootball.com',
        subject: 'Your free ' + guide.title + ' A4 coaching guide',
        html: htmlEmail(guide, pdfUrl),
        text: [
          'Your free ' + guide.title + ' A4 formation guide',
          '',
          'Download or print it here: ' + pdfUrl,
          '',
          'This is the one-off guide you requested. You will not receive our newsletter unless you separately chose to sign up and confirm your subscription.',
          '',
          'How We Play Football · https://howweplayfootball.com'
        ].join('\n')
      })
    });
  } catch {
    return json({ error: 'We could not send the guide just now. Please try again.' }, 502);
  }
  if (!sent.ok) {
    // Do not expose Resend errors, email addresses, or secret details in the response.
    return json({ error: 'We could not send the guide just now. Please try again.' }, 502);
  }
  return json({ ok: true });
}


const CONTACT_TOPICS = Object.freeze({
  question: 'A question about a guide',
  suggestion: 'An idea or suggestion',
  problem: 'Something is not working',
  partnership: 'Working together',
  other: 'Something else'
});

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

/** Independent, one-off contact message. Never enrols the sender in Mailchimp. */
export async function handleContactApi(request, env, fetcher = fetch) {
  const url = new URL(request.url);
  if (url.pathname === '/api/contact/status' && request.method === 'GET') {
    return json({ ready: ready(env), siteKey: ready(env) ? env.TURNSTILE_SITE_KEY : null });
  }
  if (url.pathname !== '/api/contact' || request.method !== 'POST') return json({ error: 'Not found' }, 404);
  if (!ready(env)) return json({ error: 'The contact form is temporarily unavailable.' }, 503);
  const origin = request.headers.get('Origin');
  if (!origin || origin !== url.origin) return json({ error: 'Invalid origin.' }, 403);
  if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) {
    return json({ error: 'Please send JSON.' }, 415);
  }
  const raw = await request.text();
  if (raw.length > 8192) return json({ error: 'Message too long.' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: 'Invalid request.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid request.' }, 400);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const topic = Object.hasOwn(CONTACT_TOPICS, body.topic) ? CONTACT_TOPICS[body.topic] : null;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (name.length < 2 || name.length > 100 || /[\r\n\x00-\x1f]/.test(name) ||
      !isEmail(email) || !topic || message.length < 10 || message.length > 3000) {
    return json({ error: 'Please check your name, email, topic and message.' }, 400);
  }
  // Hidden honeypot: appear to succeed but never send.
  if (typeof body.website === 'string' && body.website.trim()) return json({ ok: true });
  if (typeof body.turnstileToken !== 'string' || body.turnstileToken.length < 10 ||
      body.turnstileToken.length > 2048) {
    return json({ error: 'Please complete the security check.' }, 400);
  }

  let challenge;
  try {
    const form = new FormData();
    form.set('secret', env.TURNSTILE_SECRET_KEY);
    form.set('response', body.turnstileToken);
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) form.set('remoteip', ip);
    const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: form
    });
    challenge = response.ok ? await response.json() : null;
  } catch {
    return json({ error: 'The security check is unavailable. Please try again.' }, 502);
  }
  if (!challenge?.success || challenge.hostname !== url.hostname) {
    return json({ error: 'Please complete the security check and try again.' }, 403);
  }

  try {
    const sent = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'How We Play Football <guides@howweplayfootball.com>',
        to: [env.CONTACT_TO_EMAIL || 'hello@howweplayfootball.com'],
        reply_to: email,
        subject: 'Website contact: ' + topic,
        text: [
          'New message from How We Play Football',
          '',
          'From: ' + name,
          'Reply to: ' + email,
          'Topic: ' + topic,
          '',
          message,
          '',
          'Sent via the site contact form. Do not add the sender to a marketing list.'
        ].join('\n'),
        html: [
          '<div style="font:16px/1.5 Arial,sans-serif;max-width:640px">',
          '<h1>New website message</h1>',
          '<p><b>From:</b> ', escapeHtml(name), '</p>',
          '<p><b>Reply to:</b> ', escapeHtml(email), '</p>',
          '<p><b>Topic:</b> ', escapeHtml(topic), '</p>',
          '<div style="white-space:pre-wrap;border-top:1px solid #ddd;padding-top:20px">',
          escapeHtml(message), '</div>',
          '<p style="font-size:12px;color:#555">Reply directly to this email to respond. This is not a newsletter signup.</p>',
          '</div>'
        ].join('')
      })
    });
    if (!sent.ok) return json({ error: "We couldn't send the message. Please try again later." }, 502);
  } catch {
    return json({ error: "We couldn't send the message. Please try again later." }, 502);
  }
  return json({ ok: true });
}

export default {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/contact' || path === '/api/contact/status') return handleContactApi(request, env);
    if (path.startsWith('/api/')) return handleGuideApi(request, env);
    return env.ASSETS.fetch(request);
  }
};
