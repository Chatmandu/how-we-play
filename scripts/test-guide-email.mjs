#!/usr/bin/env node
/* Transactional A4 guide delivery: server-side regression checks. No external requests. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GUIDES, isEmail, handleGuideApi } from '../src/worker.mjs';

const origin = 'https://howweplayfootball.com';
const env = { RESEND_API_KEY: 'test-secret', TURNSTILE_SITE_KEY: 'test-site', TURNSTILE_SECRET_KEY: 'test-turnstile' };
const payload = { email: 'coach@example.com', guideId: '7v7-2-3-1', turnstileToken: 'valid-token-string' };
const request = (body = payload, originHeader = origin) => new Request(origin + '/api/guide-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Origin': originHeader },
  body: JSON.stringify(body)
});
let sent = [];
const successful = async (url, options) => {
  if (url.includes('turnstile/v0/siteverify')) return Response.json({ success: true, hostname: 'howweplayfootball.com' });
  if (url === 'https://api.resend.com/emails') {
    sent.push(JSON.parse(options.body));
    return Response.json({ id: 'fake-message-id' });
  }
  throw Error('Unexpected fetch: ' + url);
};

assert.equal(Object.keys(GUIDES).length, 5);
assert.ok(isEmail('parent+coach@example.com'));
assert.equal(isEmail('invalid'), false);
assert.equal(isEmail('name\r\nbcc@example.com'), false);

const missing = await handleGuideApi(new Request(origin + '/api/guide-email/status'), {}, successful);
assert.deepEqual(await missing.json(), { ready: false, siteKey: null });
const active = await handleGuideApi(new Request(origin + '/api/guide-email/status'), env, successful);
assert.deepEqual(await active.json(), { ready: true, siteKey: 'test-site' });

for (const [id, guide] of Object.entries(GUIDES)) {
  const res = await handleGuideApi(request({ ...payload, guideId: id }), env, successful);
  assert.equal(res.status, 200, id);
  const message = sent.at(-1);
  assert.ok(message.text.includes(guide.path), id);
  assert.equal(message.to[0], 'coach@example.com');
  assert.ok(!message.text.includes('unsubscribe'), 'one-off guide email must not suggest a marketing opt-in');
}
assert.equal(sent.length, 5);
assert.equal(sent[0].from, 'How We Play Football <guides@howweplayfootball.com>');

let res = await handleGuideApi(request({ ...payload, guideId: '../../admin' }), env, successful);
assert.equal(res.status, 400);
res = await handleGuideApi(request({ ...payload, email: 'invalid' }), env, successful);
assert.equal(res.status, 400);
res = await handleGuideApi(request(payload, 'https://attacker.example'), env, successful);
assert.equal(res.status, 403);
res = await handleGuideApi(request(payload), {}, successful);
assert.equal(res.status, 503);
res = await handleGuideApi(request({ ...payload, turnstileToken: 'bad' }), env, successful);
assert.equal(res.status, 400);
res = await handleGuideApi(request(payload), env, async url => {
  if (url.includes('turnstile')) return Response.json({ success: false });
  throw Error('Resend should never be called for failed Turnstile');
});
assert.equal(res.status, 403);
res = await handleGuideApi(request(payload), env, async url => {
  if (url.includes('turnstile')) return Response.json({ success: true, hostname: 'other.example' });
  throw Error('Resend should never be called for mismatched hostname');
});
assert.equal(res.status, 403);
res = await handleGuideApi(request(payload), env, async url => {
  if (url.includes('turnstile')) return Response.json({ success: true, hostname: 'howweplayfootball.com' });
  return new Response('Rejected', { status: 403 });
});
assert.equal(res.status, 502);

const component = readFileSync(new URL('../src/components/GuideEmail.astro', import.meta.url), 'utf8');
assert.match(component, /name="marketing" type="checkbox"/);
assert.doesNotMatch(component, /name="marketing"[^>]*checked/);
assert.match(component, /if \(optIn\.checked\)/);
assert.match(component, /subscribeMarketing/);
assert.match(component, /data-guide-direct/);
assert.match(component, /!config\.ready/);
const pages = ['7v7', '9v9'].map(format =>
  readFileSync(new URL('../src/pages/formations/' + format + '/[formation]/index.astro', import.meta.url), 'utf8')
);
for (const page of pages) assert.match(page, /<GuideEmail/);
console.log('Guide email endpoint and opt-in separation: all checks passed');
