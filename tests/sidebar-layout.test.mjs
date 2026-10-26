import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/assets/style.css', import.meta.url), 'utf8');
const sidebar = html.slice(html.indexOf('<aside class="sidebar"'), html.indexOf('</aside>') + '</aside>'.length);
test('sidebar preserves all main navigation links, chapter controls and About button', () => {
  assert.equal((sidebar.match(/class="nav-link/g) || []).length, 9);
  for (const view of ['discover', 'reader', 'connections', 'jesus-map', 'city-studies', 'roadmap', 'journeys', 'notebook', 'about']) {
    assert.ok(sidebar.includes(`data-view="${view}"`), `missing navigation ${view}`);
  }
  for (const id of ['side-book', 'side-chapter', 'side-open', 'random-verse']) {
    assert.equal((sidebar.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `${id} should still be present once`);
  }
});
test('quick chapter picker uses a collapsed native keyboard-accessible disclosure', () => {
  assert.match(sidebar, /<details class="sidebar-reader-details" id="sidebar-reader-details">/);
  assert.doesNotMatch(sidebar, /<details[^>]*\bopen(?:\s|=|>)/);
  assert.match(sidebar, /<summary>QUICK CHAPTER JUMP<\/summary>/);
  assert.match(sidebar, /<details[^>]*>[\s\S]*<summary>[\s\S]*?<div class="compact-picker">/);
});
test('fixed viewport sidebar has independent overflow and dynamic viewport support', () => {
  assert.match(css, /\.sidebar\{[^}]*height:100dvh[^}]*overflow-y:auto[^}]*overscroll-behavior-y:contain/);
  assert.match(css, /\.sidebar-reader-details\[open\]>summary/);
  assert.match(css, /@media\(max-width:760px\)\{\.sidebar\{[^}]*height:100dvh[^}]*overflow-y:auto/);
  assert.match(css, /\.nav-link\{[^}]*min-height:40px/);
});
