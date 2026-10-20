/* How We Play contact form handler.
 *
 * The recipient is restricted in wrangler.jsonc and never comes from a visitor's input.
 * Email is sent by Cloudflare Email Service. No API key or inbox password is exposed.
 *
 * No attachments, cookies, analytics, mailing-list subscription or message storage.
 * Errors never echo addresses, server exception messages or submitted content.
 */
const DESTINATION = 'nbwalsh@gmail.com';   // Change alongside the send_email destination_address in wrangler.jsonc.
const FROM = 'notifications@howweplayfootball.com'; // A sending identity; does not require a mailbox.
const TYPES = new Map([
  ['coaching', 'A question about coaching'],
  ['feedback', 'Feedback or an idea'],
  ['website', 'A problem with the website'],
  ['privacy', 'Privacy enquiry'],
  ['other', 'Something else']
]);
const HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Vary': 'Accept'
};
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

function wantsJson(request) {
  return (request.headers.get('accept') || '').includes('application/json');
}
function reply(request, status, code, message) {
  if (wantsJson(request)) {
    return new Response(JSON.stringify({ ok: status >= 200 && status < 300, code, message }), {
      status,
      headers: { ...HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
  // Native forms still work without JavaScript: an accessible, honest result page.
  const escape = str => String(str).replace(/[&<>"']/g, x => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[x]);
  const title = status === 200 ? 'Message received' : 'Message not sent';
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow"><title>${title} | How We Play</title>
  <style>body{margin:0;background:#F2EDE2;color:#0E1A24;font:18px/1.55 system-ui,sans-serif}
  main{max-width:42rem;margin:8vh auto;padding:2rem}h1{font-size:clamp(2.4rem,6vw,4rem);line-height:1}
  a{color:#2747E8;font-weight:bold}:focus-visible{outline:3px solid #2747E8;outline-offset:4px}</style></head>
  <body><main><p>HOW WE PLAY · CONTACT</p><h1>${title}</h1>
  <p>${escape(message)}</p><p><a href="/contact/">Back to Contact →</a></p></main></body></html>`;
  return new Response(html, { status, headers: { ...HEADERS, 'Content-Type': 'text/html; charset=utf-8' } });
}
function values(text) {
  const data = new URLSearchParams(text);
  const single = k => data.getAll(k).length === 1 ? data.get(k).trim() : '';
  return {
    name: single('name'),
    email: single('email'),
    topic: single('topic'),
    message: single('message'),
    website: single('website')
  };
}
function sameOrigin(request) {
  // Origin is set for browser POST requests. Missing is allowed for plain clients,
  // but cross-site browser submissions are rejected. Not an anti-spam substitute.
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site') return false;
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

export async function handleContact(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405, headers: { ...HEADERS, Allow: 'POST' }
    });
  }
  if (!sameOrigin(request)) return reply(request, 403, 'origin', 'Please use the contact form on How We Play.');
  const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (type !== 'application/x-www-form-urlencoded') {
    return reply(request, 415, 'format', 'Please submit the website contact form.');
  }
  const declaredLength = Number(request.headers.get('content-length') || '0');
  if (declaredLength > 10000) return reply(request, 413, 'too_large', 'Your message is too long. Please shorten it and try again.');

  let fields;
  try {
    const payload = await request.text();
    if (payload.length > 10000) return reply(request, 413, 'too_large', 'Your message is too long. Please shorten it and try again.');
    fields = values(payload);
  } catch {
    return reply(request, 400, 'invalid', 'The form could not be read. Please try again.');
  }
  // Hidden field should be empty. Return a neutral success to limit bot feedback.
  if (fields.website) return reply(request, 200, 'received', "Thanks. Your message has been submitted.");

  if (!fields.name || fields.name.length > 90 || /[\r\n<>]/.test(fields.name)) {
    return reply(request, 422, 'name', 'Please enter your name (up to 90 characters).');
  }
  if (fields.email.length > 254 || !EMAIL_RE.test(fields.email)) {
    return reply(request, 422, 'email', 'Please enter a valid email address.');
  }
  if (!TYPES.has(fields.topic)) {
    return reply(request, 422, 'topic', 'Please choose what your message is about.');
  }
  if (fields.message.length < 10 || fields.message.length > 4000) {
    return reply(request, 422, 'message', 'Please write a message between 10 and 4,000 characters.');
  }

  // Fail closed: never say a message has been delivered if Email Service is not configured.
  if (!env.CONTACT_EMAIL || typeof env.CONTACT_EMAIL.send !== 'function') {
    return reply(request, 503, 'unavailable', 'The contact form is temporarily unavailable. Please try again later.');
  }

  try {
    await env.CONTACT_EMAIL.send({
      to: DESTINATION,
      from: { email: FROM, name: 'How We Play website' },
      replyTo: { email: fields.email, name: fields.name },
      subject: `How We Play contact: ${TYPES.get(fields.topic)}`,
      text: [
        'New How We Play contact form enquiry',
        '',
        'From: ' + fields.name,
        'Reply-to: ' + fields.email,
        'Topic: ' + TYPES.get(fields.topic),
        '',
        'Message:',
        fields.message,
        '',
        'Sent through howweplayfootball.com/contact/'
      ].join('\n')
    });
    return reply(request, 200, 'sent', "Thanks for getting in touch. Your message has been sent. I'll reply when I can.");
  } catch (error) {
    // Avoid logging personal data or upstream error payloads.
    console.error('How We Play contact sending failed', String(error?.code || 'email_error'));
    return reply(request, 503, 'delivery', "Your message couldn't be sent just now. Please try again shortly.");
  }
}
