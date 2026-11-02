#!/usr/bin/env node
/* Contact form: server validation, one-off email, anti-spam, privacy and page wiring. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handleContactApi } from '../src/worker.mjs';

const origin = 'https://howweplayfootball.com';
const env = { RESEND_API_KEY: 'test', TURNSTILE_SITE_KEY: 'site', TURNSTILE_SECRET_KEY: 'secret' };
const valid = {
  name: 'Alex Coach', email: 'alex@example.org', topic: 'suggestion',
  message: 'Could you cover corner routines for 9v9?', website: '',
  turnstileToken: 'valid-turnstile-token'
};
const request = (body = valid, originHeader = origin) => new Request(origin + '/api/contact', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: originHeader },
  body: JSON.stringify(body)
});
const sent = [];
const fetcher = async (url, options) => {
  if (url.includes('turnstile/v0/siteverify')) return Response.json({ success: true, hostname: 'howweplayfootball.com' });
  if (url === 'https://api.resend.com/emails') {
    sent.push(JSON.parse(options.body));
    return Response.json({ id: 'test-email' });
  }
  throw Error('Unexpected service: ' + url);
};

let response = await handleContactApi(new Request(origin + '/api/contact/status'), {}, fetcher);
assert.deepEqual(await response.json(), { ready: false, siteKey: null });
response = await handleContactApi(new Request(origin + '/api/contact/status'), env, fetcher);
assert.deepEqual(await response.json(), { ready: true, siteKey: 'site' });

response = await handleContactApi(request(), env, fetcher);
assert.equal(response.status, 200);
assert.equal(sent.length, 1);
const first = sent[0];
assert.deepEqual(first.to, ['nbwalsh@gmail.com']);
// The production destination may also be overridden without a code release.
response = await handleContactApi(request(), { ...env, CONTACT_TO_EMAIL: 'another-inbox@example.org' }, fetcher);
assert.equal(response.status, 200);
assert.deepEqual(sent.at(-1).to, ['another-inbox@example.org']);
assert.equal(first.reply_to, 'alex@example.org');
assert.equal(first.from, 'How We Play Football <guides@howweplayfootball.com>');
assert.match(first.text, /corner routines/);
assert.doesNotMatch(first.text, /subscribe.*Mailchimp/i);

response = await handleContactApi(request({ ...valid, name: 'Coach <script>', message: 'Hi <img src=x onerror=alert(1)>' }), env, fetcher);
assert.equal(response.status, 200);
assert.ok(!sent.at(-1).html.includes('<script>'));
assert.ok(!sent.at(-1).html.includes('<img src=x'));
assert.match(sent.at(-1).html, /&lt;img/);

for (const bad of [
  { ...valid, name: 'A' },
  { ...valid, email: 'not-an-email' },
  { ...valid, topic: 'admin' },
  { ...valid, message: 'hello' },
  { ...valid, message: 'x'.repeat(3001) }
]) {
  response = await handleContactApi(request(bad), env, fetcher);
  assert.equal(response.status, 400);
}
response = await handleContactApi(request(valid, 'https://attacker.example'), env, fetcher);
assert.equal(response.status, 403);
response = await handleContactApi(request(), {}, fetcher);
assert.equal(response.status, 503);

const beforeHoneypot = sent.length;
response = await handleContactApi(request({ ...valid, website: 'https://spam.example' }), env, fetcher);
assert.equal(response.status, 200);
assert.equal(sent.length, beforeHoneypot, 'honeypot should not send mail');

response = await handleContactApi(request(), env, async url => {
  if (url.includes('turnstile')) return Response.json({ success: false });
  throw Error('Resend should not run on failed challenge');
});
assert.equal(response.status, 403);
response = await handleContactApi(request(), env, async url => {
  if (url.includes('turnstile')) return Response.json({ success: true, hostname: 'wrong.example' });
  throw Error('Resend should not run on foreign hostname');
});
assert.equal(response.status, 403);
response = await handleContactApi(request(), env, async url => {
  if (url.includes('turnstile')) return Response.json({ success: true, hostname: 'howweplayfootball.com' });
  return new Response('Rejected', { status: 403 });
});
assert.equal(response.status, 502);

const page = readFileSync(new URL('../src/pages/contact/index.astro', import.meta.url), 'utf8');
const form = readFileSync(new URL('../src/components/ContactForm.astro', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8');
const privacy = readFileSync(new URL('../src/pages/privacy/index.astro', import.meta.url), 'utf8');
const teaser = readFileSync(new URL('../src/components/PlaybookTeaser.astro', import.meta.url), 'utf8');
assert.match(page, /<ContactForm/);
assert.match(form, /\/api\/contact/);
assert.match(form, /data-contact-fallback/);
assert.match(form, /name="website"/);
assert.match(form, /Please don't include children's personal details/);
assert.match(layout, /href: '\/contact\/'/);
assert.match(privacy, /id="contact"/);
assert.match(teaser, /shapeImage/);

console.log('Contact form checks passed: one-off email, consent separation, validation and anti-spam');
