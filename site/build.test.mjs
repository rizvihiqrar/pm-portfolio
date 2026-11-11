import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { rewriteHref, renderMarkdown, buildSite, checkSite, repoRoot, PUBLISHED_FILES, contactHtml } from './build.mjs';

const config = JSON.parse(fs.readFileSync(new URL('./site.json', import.meta.url), 'utf8'));

function scratch(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
const read = (out, rel) => fs.readFileSync(path.join(out, rel), 'utf8');
const small = (cards) => ({ ...config, nav: [{ label: 'Home', href: 'index.html' }], aboutHref: 'index.html', filterTags: undefined, cards, courseNav: [] });
const card = (extra = {}) => ({ label: 'Case Study', title: 'C', path: 'case-studies/01-a.md', tags: ['Product Owner'], summary: 's', button: 'Open', ...extra });

test('Markdown links become site links; web links and anchors are left alone', () => {
  assert.equal(rewriteHref('quiz.md'), 'quiz.html');
  assert.equal(rewriteHref('quiz.md#part'), 'quiz.html#part');
  assert.equal(rewriteHref('../01-a/b/README.md'), '../01-a/b/');
  assert.equal(rewriteHref('https://example.com/a.md'), 'https://example.com/a.md');
  assert.equal(rewriteHref('mailto:a@b.c'), 'mailto:a@b.c');
  assert.equal(rewriteHref('#coming-next'), '#coming-next');
});

test('a tip becomes a callout, a diagram becomes a diagram block, a table gets a scroll wrapper', () => {
  const { html, hasMermaid, title } = renderMarkdown('# Page Title\n\n> [!TIP]\n> Read this first.\n\n```mermaid\nflowchart LR\n  A --> B\n```\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n[next](next.md#x)\n');
  assert.equal(title, 'Page Title');
  assert.match(html, /<aside class="callout callout-tip"><p class="callout-title">Tip<\/p><p>Read this first\./);
  assert.ok(hasMermaid);
  assert.match(html, /<div class="table-wrap"[^>]*><table>/);
  assert.match(html, /href="next\.html#x"/);
});

test('the real repository builds into a site where every link, image and anchor resolves', (t) => {
  const out = scratch(t);
  const pages = buildSite({ root: repoRoot, out, config });
  assert.ok(pages.includes('index.html'));
  assert.ok(pages.includes('case-studies/01-prioritizing-the-ideas-plan.html'));
  assert.ok(pages.includes('docs/about.html'));
  assert.deepEqual(checkSite(out), []);
});

test('the home page has a filter chip for each role, All pressed first, and a status line for screen readers', (t) => {
  const out = scratch(t);
  buildSite({ root: repoRoot, out, config });
  const html = read(out, 'index.html');
  assert.match(html, /<button type="button" class="filter" data-filter="all" aria-pressed="true">All<\/button>/);
  for (const role of config.filterTags) assert.match(html, new RegExp(`class="filter" data-filter="[a-z-]+" aria-pressed="false">${role}<`));
  assert.match(html, /id="filter-status" class="sr-only" role="status" aria-live="polite"/);
  assert.equal((html.match(/<article class="card/g) ?? []).length, config.cards.length);
});

test('every card carries the tags its filter chip looks for', () => {
  const chips = new Set(config.filterTags);
  for (const c of config.cards) {
    assert.ok(c.tags.length > 0, `${c.title} has tags`);
    for (const tag of c.tags) assert.ok(chips.has(tag), `${c.title}: "${tag}" has a filter chip`);
  }
});

test('a planned card has no link, and says so; a ready card links to its case study', (t) => {
  const out = scratch(t);
  buildSite({ root: repoRoot, out, config });
  const html = read(out, 'index.html');
  const planned = config.cards.filter((c) => c.status === 'planned');
  assert.ok(planned.length > 0);
  assert.equal((html.match(/Coming Soon/g) ?? []).length, planned.length);
  assert.match(html, /<a class="btn" href="case-studies\/01-prioritizing-the-ideas-plan\.html">View Case Study<\/a>/);
});

test('every ready card has a preview image that exists, with alt text', () => {
  for (const c of config.cards.filter((x) => x.status !== 'planned')) {
    assert.ok(c.image && c.imageAlt, `${c.title} has an image and alt text`);
    assert.ok(fs.existsSync(path.join(repoRoot, c.image)), `${c.image} exists (run: npm run previews)`);
  }
});

test('the contact block has the email and LinkedIn buttons, on the home page and in the footer of every page', (t) => {
  const out = scratch(t);
  buildSite({ root: repoRoot, out, config });
  assert.match(contactHtml(config), /href="mailto:[^"]+">Send an Email<\/a><a class="btn btn-secondary" href="https:\/\/www\.linkedin\.com\/in\/[^"]+">View LinkedIn<\/a>/);
  for (const rel of ['index.html', 'docs/about.html', 'case-studies/01-prioritizing-the-ideas-plan.html']) {
    const html = read(out, rel);
    assert.match(html, /href="mailto:/);
    assert.match(html, /linkedin\.com\/in\//);
  }
  assert.match(read(out, 'index.html'), /<section id="contact" class="section">/);
});

test('a link to a page that is not in the site is reported (the break: a page is renamed, its link is not)', (t) => {
  const root = scratch(t);
  const out = scratch(t);
  fs.mkdirSync(path.join(root, 'case-studies'));
  fs.writeFileSync(path.join(root, 'case-studies', '01-a.md'), '# Study\n\n[gone](missing.md) and [here](#study)\n');
  buildSite({ root, out, config: small([card()]) });
  assert.deepEqual(checkSite(out), ['case-studies/01-a.html links to missing.html, which is not in the site']);
});

test('a missing preview image is reported', (t) => {
  const root = scratch(t);
  const out = scratch(t);
  fs.mkdirSync(path.join(root, 'case-studies'));
  fs.writeFileSync(path.join(root, 'case-studies', '01-a.md'), '# Study\n');
  buildSite({ root, out, config: small([card({ image: 'docs/assets/previews/nope.png', imageAlt: 'x' })]) });
  assert.deepEqual(checkSite(out), ['index.html links to docs/assets/previews/nope.png, which is not in the site']);
});

test('every page has one h1, a main landmark, a skip link and a theme button', (t) => {
  const out = scratch(t);
  buildSite({ root: repoRoot, out, config });
  for (const rel of ['index.html', 'case-studies/02-deciding-what-to-test-when-time-is-short.html', 'docs/about.html', 'docs/overview.html']) {
    const html = read(out, rel);
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, `${rel} has one h1`);
    assert.match(html, /<main id="main"/);
    assert.match(html, /class="skip"/);
    assert.match(html, /id="theme-toggle"/);
  }
});

test('only handouts and images are published, never editor or lock files', () => {
  for (const ok of ['docs/assets/previews/a.png', 'a/b.PNG', 'docs/assets/banner.svg']) assert.ok(PUBLISHED_FILES.test(ok), ok);
  for (const no of ['.DS_Store', 'notes.bak', 'draft.html']) assert.ok(!PUBLISHED_FILES.test(no), no);
});

test('two files that would become the same page stop the build', (t) => {
  const root = scratch(t);
  const out = scratch(t);
  fs.mkdirSync(path.join(root, 'docs'));
  fs.writeFileSync(path.join(root, 'docs', 'README.md'), '# One\n');
  fs.writeFileSync(path.join(root, 'docs', 'index.md'), '# Two\n');
  assert.throws(() => buildSite({ root, out, config: small([card()]) }), /two files would both become docs\/index\.html/);
});
