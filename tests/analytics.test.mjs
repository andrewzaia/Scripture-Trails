import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyticsConfig} from '../functions/api/analytics-config.js';
import {isProductionHost,normaliseSection,sectionPageview,sanitiseReferrer,initialiseAnalytics} from '../public/assets/analytics.js';

test('production GA4 destination remains pinned in the deployable Wrangler file', () => {
  const file = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
  assert.ok(file.includes('[env.production.vars]\nGA4_MEASUREMENT_ID = "G-GDZ1R1Q61N"'));
  assert.equal(file.includes('[env.preview.vars]'), false);
  assert.equal(file.includes('\n[vars]\n'), false);
});

test('configuration only publishes a valid ID on the canonical hostname', async () => {
  const env = {GA4_MEASUREMENT_ID: 'G-ABC1234DEF'};
  const request = url => ({url});
  assert.equal(analyticsConfig(request('https://scripture-trails.pages.dev/api/analytics-config'), env).status, 204);
  assert.equal(analyticsConfig(request('https://www.scripturetrails.com/api/analytics-config'), {}).status, 204);
  assert.equal(analyticsConfig(request('https://www.scripturetrails.com/api/analytics-config'), {GA4_MEASUREMENT_ID: 'invalid'}).status, 204);
  const response = analyticsConfig(request('https://www.scripturetrails.com/api/analytics-config'), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {measurementId: env.GA4_MEASUREMENT_ID});
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('referrers cannot forward paths, verse queries or fragment content', () => {
  assert.equal(sanitiseReferrer('https://www.scripturetrails.com/?ref=John%203:16'), 'https://www.scripturetrails.com/');
  assert.equal(sanitiseReferrer('https://www.google.com/search?q=John+3:16'), 'https://www.google.com/');
  assert.equal(sanitiseReferrer('javascript:alert(1)'), '');
  assert.equal(sanitiseReferrer(), '');
});

test('event URLs expose only broad site sections, not reader or notebook details', () => {
  assert.equal(isProductionHost('www.scripturetrails.com'), true);
  assert.equal(isProductionHost('preview.scripture-trails.pages.dev'), false);
  assert.equal(normaliseSection('bad-ref=John 1:1'), 'discover');
  assert.deepEqual(sectionPageview('reader'), {
    page_title: 'Scripture Trails | Bible reader',
    page_location: 'https://www.scripturetrails.com/?view=reader'
  });
  assert.equal(sectionPageview('notebook').page_location.includes('ref='), false);
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(html, /id="analytics-consent"/);
  assert.match(html, /id="analytics-manage"/);
  assert.match(html, /\/assets\/analytics\.js\?v=0\.27\.1/);
});

function browser(hostname, choice = null) {
  const listeners = new Map();
  const appended = [];
  const handlers = new Map();
  const consent = new Map(choice ? [['scripture-trails:analytics-consent', choice]] : []);
  const elements = Object.fromEntries(['analytics-consent','analytics-allow','analytics-decline','analytics-manage'].map(id => [id, {
    hidden: true, focus() {},
    addEventListener(type, fn) { handlers.set(id + '/' + type, fn); }
  }]));
  const doc = {
    getElementById: id => elements[id],
    createElement: () => ({}),
    head: {appendChild: node => appended.push(node)},
    querySelector: () => ({id: 'view-reader'}),
    addEventListener: (event, fn) => listeners.set(event, fn)
  };
  let requests = 0;
  let reloads = 0;
  const win = {
    location: {hostname, href: 'https://' + hostname + '/?view=reader&ref=John%203:16', reload: () => reloads++},
    fetch: async () => {requests++; return {ok:true,json:async () => ({measurementId:'G-ABC1234DEF'})};},
    localStorage: {getItem: k => consent.get(k), setItem: (k,v) => consent.set(k,v)}
  };
  return {doc,win,handlers,elements,listeners,appended,consent,get requests() {return requests;},get reloads() {return reloads;}};
}

test('previews cannot fetch config, set cookies or load Google', async () => {
  for (const host of ['localhost','127.0.0.1','scripture-trails.pages.dev','scripturetrails.com']) {
    const env = browser(host, 'allow');
    assert.equal(await initialiseAnalytics(env.win,env.doc), false);
    assert.equal(env.requests, 0);
    assert.equal(env.appended.length, 0);
    assert.equal(env.win.dataLayer, undefined);
  }
});

test('production only loads Google after opt-in and records clean section changes', async () => {
  const env = browser('www.scripturetrails.com');
  assert.equal(await initialiseAnalytics(env.win,env.doc), true);
  assert.equal(env.requests, 1);
  assert.equal(env.appended.length, 0);
  assert.equal(env.elements['analytics-consent'].hidden, false);
  env.handlers.get('analytics-allow/click')();
  assert.equal(env.consent.get('scripture-trails:analytics-consent'), 'allow');
  assert.equal(env.appended.length, 1);
  assert.equal(env.appended[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-ABC1234DEF');
  env.listeners.get('scripturetrails:view-change')({detail:{view:'connections'}});
  const pageViews = env.win.dataLayer.filter(args => args[0] === 'event' && args[1] === 'page_view');
  assert.equal(pageViews.length, 2);
  assert.equal(pageViews[0][2].page_location, 'https://www.scripturetrails.com/?view=reader');
  assert.equal(pageViews[1][2].page_location, 'https://www.scripturetrails.com/?view=connections');
  assert.equal(JSON.stringify(pageViews).includes('John'), false);
  env.handlers.get('analytics-decline/click')();
  assert.equal(env.reloads, 1);
  assert.equal(env.consent.get('scripture-trails:analytics-consent'), 'deny');
});

test('persisted opt-out does not request the Google library', async () => {
  const env = browser('www.scripturetrails.com','deny');
  await initialiseAnalytics(env.win,env.doc);
  assert.equal(env.appended.length,0);
  assert.equal(env.elements['analytics-consent'].hidden,true);
  assert.equal(env.elements['analytics-manage'].hidden,false);
});
