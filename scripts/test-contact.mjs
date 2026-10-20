#!/usr/bin/env node
/* Contact API tests: mock Cloudflare's Email Service binding. No emails are sent. */
import assert from 'node:assert/strict';
import { handleContact } from '../src/worker/contact-handler.mjs';

let count = 0;
async function test(label, fn) { await fn(); count++; console.log('PASS  ' + label); }

const origin = 'https://howweplayfootball.com';
const defaults = {
  name: 'Jamie Coach', email: 'jamie@example.org', topic: 'coaching',
  message: 'Hello, I have a question about teaching the midfield roles.', website: ''
};
const req = (fields = defaults, options = {}) => new Request(origin + '/api/contact', {
  method: 'POST',
  headers: {
    'Origin': options.origin ?? origin,
    'Content-Type': options.contentType || 'application/x-www-form-urlencoded',
    'Accept': options.accept || 'application/json',
    ...(options.headers || {})
  },
  body: options.body || new URLSearchParams(fields).toString()
});
const unpack = async response => [response.status, await response.json()];

await test('Valid contact sends one email to the configured inbox and sets Reply-To', async () => {
  const sent = [];
  const response = await handleContact(req(), { CONTACT_EMAIL: { send: async p => { sent.push(p); return { messageId: 'test-123' }; } } });
  const [status, body] = await unpack(response);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'nbwalsh@gmail.com');
  assert.equal(sent[0].from.email, 'notifications@howweplayfootball.com');
  assert.deepEqual(sent[0].replyTo, { name: 'Jamie Coach', email: 'jamie@example.org' });
  assert.ok(sent[0].text.includes(defaults.message));
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

await test('Refuses to claim success if Cloudflare email binding is absent', async () => {
  const [status, body] = await unpack(await handleContact(req(), {}));
  assert.equal(status, 503);
  assert.equal(body.ok, false);
});
await test('Upstream mail failure stays a failure', async () => {
  const [status, body] = await unpack(await handleContact(req(), { CONTACT_EMAIL: {
    send: async () => { throw Object.assign(new Error('Sensitive upstream failure'), { code: 'E_DELIVERY_FAILED' }); }
  } }));
  assert.equal(status, 503);
  assert.equal(body.ok, false);
  assert.ok(!body.message.includes('Sensitive'));
});
await test('Rejects browser cross-origin attempts', async () => {
  const [status] = await unpack(await handleContact(req(defaults, { origin: 'https://example.org' }), {}));
  assert.equal(status, 403);
});
await test('Rejects missing or invalid name, email, topic and body', async () => {
  const changes = [
    { name: '' }, { email: 'not-an-email' }, { topic: 'not-an-option' },
    { message: 'short' }, { name: 'A' + String.fromCharCode(13, 10) + 'B' }
  ];
  for (const c of changes) {
    const [status] = await unpack(await handleContact(req({ ...defaults, ...c }), {}));
    assert.equal(status, 422, JSON.stringify(c));
  }
});
await test('Rejects oversized and unsupported payload types', async () => {
  const [large] = await unpack(await handleContact(req(defaults, { body: 'x'.repeat(10001) }), {}));
  const [format] = await unpack(await handleContact(req(defaults, { contentType: 'application/json' }), {}));
  assert.equal(large, 413);
  assert.equal(format, 415);
});
await test('Honeypot discards unwanted messages without sending', async () => {
  let sent = false;
  const [status] = await unpack(await handleContact(req({ ...defaults, website: 'https://spam.example' }), {
    CONTACT_EMAIL: { send: async () => { sent = true; } }
  }));
  assert.equal(status, 200);
  assert.equal(sent, false);
});
await test('Plain browser forms get an accessible HTML receipt without JavaScript', async () => {
  const r = await handleContact(req(defaults, { accept: 'text/html' }), {
    CONTACT_EMAIL: { send: async () => ({ messageId: 'test-123' }) }
  });
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/html/);
  assert.match(await r.text(), /Message received/);
});
await test('API does not allow a GET to send an email', async () => {
  const r = await handleContact(new Request(origin + '/api/contact'), {});
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('allow'), 'POST');
});
console.log(count + '/' + count + ' contact tests passed');
