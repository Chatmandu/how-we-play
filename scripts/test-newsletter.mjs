#!/usr/bin/env node
/* Regression guard: Mailchimp may respond "captcha" to a JSONP signup and
 * provide parameters for a hosted human-verification page. Don't drop those
 * parameters, show a raw "captcha" error, or send a visitor to an untrusted URL.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mailchimpCaptchaUrl } from '../src/lib/mailchimp-captcha.mjs';

const action = 'https://howweplayfootball.us15.list-manage.com/subscribe/post?u=testaccount&id=testaudience';
const params = { u: 'testaccount', id: 'testaudience', EMAIL: 'coach+test@example.org', security_token: 'confirm me' };

const redirected = mailchimpCaptchaUrl(action, params);
assert.ok(redirected, 'Mailchimp captcha response should produce a URL');
const url = new URL(redirected);
assert.equal(url.hostname, 'howweplayfootball.us15.list-manage.com');
assert.equal(url.pathname, '/subscribe/post');
assert.equal(url.searchParams.get('EMAIL'), 'coach+test@example.org');
assert.equal(url.searchParams.get('security_token'), 'confirm me');
assert.equal(url.searchParams.get('u'), 'testaccount');
assert.equal(url.searchParams.get('id'), 'testaudience');

// Don't trust the returned params for changing audience, host or path.
const changedAudience = new URL(mailchimpCaptchaUrl(action, { ...params, u: 'different', id: 'different' }));
assert.equal(changedAudience.searchParams.get('u'), 'testaccount');
assert.equal(changedAudience.searchParams.get('id'), 'testaudience');
for (const bad of [
  'https://evil.example/subscribe/post?u=a&id=b',
  'https://list-manage.com.evil.example/subscribe/post?u=a&id=b',
  'http://howweplayfootball.us15.list-manage.com/subscribe/post?u=a&id=b',
  'javascript:alert(1)',
  'https://howweplayfootball.us15.list-manage.com/other?u=a&id=b'
]) assert.equal(mailchimpCaptchaUrl(bad, params), null, 'invalid destination rejected: ' + bad);
for (const bad of [null, [], {}, { EMAIL: { nested: 'bad' } }]) {
  // In the missing-email case the redirect may still carry the account IDs,
  // but a malformed nested provider response must be rejected.
  if (bad && !Array.isArray(bad) && !Object.keys(bad).length) continue;
  assert.equal(mailchimpCaptchaUrl(action, bad), null);
}

const component = readFileSync(new URL('../src/components/CoachingNotes.astro', import.meta.url), 'utf8');
assert.match(component, /r\.msg === 'captcha'/);
assert.match(component, /mailchimpCaptchaUrl\(form\.action, r\.params\)/);
assert.match(component, /data-cn-captcha-link/);
assert.match(component, /Complete security check with Mailchimp/);
assert.match(component, /captchaWrap\.hidden = false/);
const homepage = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8');
assert.ok(component.includes("querySelectorAll<HTMLFormElement>('form[data-cn]')"), 'each signup form must be wired independently');
assert.ok(component.includes('data-cn-location={placement}'), 'forms identify their location for analytics');
assert.ok(component.includes('id={`${prefix}-email`}'), 'email labels must use unique per-placement IDs');
assert.ok(homepage.includes('<CoachingNotes placement="home" />'), 'homepage has its own signup');
assert.ok(layout.includes('/#coaching-notes-signup'), 'navigation links to the homepage signup');
for (const format of ['5v5', '7v7', '9v9']) {
  const guide = readFileSync(new URL(`../src/pages/formations/${format}/[formation]/index.astro`, import.meta.url), 'utf8');
  assert.ok(guide.includes('<CoachingNotes placement="guide" />'), `${format} guide has an inline invitation`);
}
console.log('PASS  newsletter forms on home, formation guides and footer use independent IDs and tracking');
console.log('PASS  Mailchimp captcha completion URL, trusted destination and visible link');
