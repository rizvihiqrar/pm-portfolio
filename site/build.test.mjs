import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { rewriteHref, renderMarkdown, buildSite, checkSite, repoRoot, pageHtml, escapeHtml, PUBLISHED_FILES, contactHtml, previewKey } from './build.mjs';

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

test('every numbered case study has a card on the home page (the break: add a study, forget its card)', () => {
  const onCards = new Set(config.cards.map((c) => c.path).filter(Boolean));
  const studies = fs.readdirSync(path.join(repoRoot, 'case-studies')).filter((f) => /^\d\d-.+\.md$/.test(f)).map((f) => `case-studies/${f}`);
  assert.ok(studies.length > 0);
  for (const s of studies) assert.ok(onCards.has(s), `${s} has a card in site.json`);
});

test('each preview image matches its card (the break: edit a title, forget to run npm run previews)', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/assets/previews/manifest.json'), 'utf8'));
  for (const c of config.cards.filter((x) => x.image)) {
    assert.equal(manifest[c.image], previewKey(c, config.name), `${c.image} is out of date: run npm run previews in site/`);
  }
});

test('a changed card title makes its preview key change', () => {
  const c = config.cards[0];
  assert.notEqual(previewKey(c, config.name), previewKey({ ...c, title: `${c.title}!` }, config.name));
});

test('a Markdown link with a query string still points at the built page', () => {
  assert.equal(rewriteHref('other.md?plain=1'), 'other.html');
  assert.equal(rewriteHref('other.md?plain=1#part'), 'other.html#part');
});

test('each table is named after the heading above it, and each page has its own description', () => {
  const { html, description } = renderMarkdown('# Title\n\nIntro sentence here.\n\n## Roles\n\n| A | B |\n|---|---|\n| 1 | 2 |\n');
  assert.match(html, /aria-label="Roles table"/);
  assert.equal(description, 'Intro sentence here.');
});

test('a collision stops the build before anything is written', (t) => {
  const root = scratch(t);
  const out = scratch(t);
  fs.mkdirSync(path.join(root, 'docs'));
  fs.writeFileSync(path.join(root, 'docs', 'README.md'), '# One\n');
  fs.writeFileSync(path.join(root, 'docs', 'index.md'), '# Two\n');
  assert.throws(() => buildSite({ root, out, config: small([card()]) }), /two files would both become docs\/index\.html/);
  assert.ok(!fs.existsSync(path.join(out, 'docs', 'index.html')), 'nothing was written');
});

test('csv and txt files are not published', () => {
  for (const no of ['data.csv', 'notes.txt']) assert.ok(!PUBLISHED_FILES.test(no), no);
});

test('every link in the front README that points into the live site is a real page, and its heading exists', (t) => {
  const out = scratch(t);
  buildSite({ root: repoRoot, out, config });
  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const own = [...readme.matchAll(/\]\((https:\/\/rizvihiqrar\.github\.io\/[^)\s]+)\)/g)].map((m) => m[1]).filter((u) => u.startsWith(config.siteUrl));
  assert.ok(own.length > 0, 'the README links into its own site');
  for (const url of own) {
    const [rel, anchor] = url.slice(config.siteUrl.length).split('#');
    const target = rel === '' || rel.endsWith('/') ? path.join(out, rel, 'index.html') : path.join(out, rel);
    assert.ok(fs.existsSync(target), `${url} is a page in the built site`);
    if (anchor) assert.match(fs.readFileSync(target, 'utf8'), new RegExp(`\\sid="${anchor}"`), `${url} has the heading #${anchor}`);
  }
});

test('a page description with an ampersand or quotes is escaped once, not twice', () => {
  const { description } = renderMarkdown('# T\n\nTom & "Jerry" <b>and</b> friends.\n');
  assert.equal(description, 'Tom & "Jerry" and friends.');
  const html = pageHtml({ config, title: 'T', body: '', depth: 0, description });
  assert.match(html, /<meta name="description" content="Tom &amp; &quot;Jerry&quot; and friends\.">/);
  assert.doesNotMatch(html, /&amp;amp;/);
});

test('table names are decoded once, a second table under one heading is numbered, and a table with no heading is still named', () => {
  const md = '| A |\n|---|\n| 1 |\n\n## Q&A\n\n| B |\n|---|\n| 2 |\n\n| C |\n|---|\n| 3 |\n';
  const { html } = renderMarkdown(md);
  assert.match(html, /aria-label="Opening table"/);
  assert.match(html, /aria-label="Q&amp;A table"/);
  assert.match(html, /aria-label="Q&amp;A table 2"/);
  assert.doesNotMatch(html, /&amp;amp;/);
});

test('the filter chips stay hidden until the page script reveals them, so nothing useless shows without JavaScript', (t) => {
  const out = scratch(t);
  buildSite({ root: repoRoot, out, config });
  const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  assert.match(html, /<div class="filters" role="group" aria-label="Filter by [A-Za-z ]+" hidden>/);
  assert.match(html, /g\.hidden=false/);
  assert.match(html, /\(c\.getAttribute\('data-tags'\)\|\|''\)/);
});

test('the filter group is named after what the cards are filtered by', (t) => {
  const out = scratch(t);
  buildSite({ root: repoRoot, out, config });
  assert.ok(fs.readFileSync(path.join(out, 'index.html'), 'utf8').includes(`aria-label="Filter by ${escapeHtml(config.filterLabel)}"`));
  const noLabel = scratch(t);
  buildSite({ root: repoRoot, out: noLabel, config: { ...config, filterLabel: undefined } });
  assert.match(fs.readFileSync(path.join(noLabel, 'index.html'), 'utf8'), /aria-label="Filter by Topic"/);
});

test('the About page uses the same email and LinkedIn address as the footer and contact buttons', () => {
  const about = fs.readFileSync(path.join(repoRoot, 'docs/about.md'), 'utf8');
  assert.ok(about.includes(`mailto:${config.contact.email}`), 'the email matches site.json');
  assert.ok(about.includes(config.contact.linkedin), 'the LinkedIn address matches site.json');
});

test('the stylesheet really hides the filter chips while they have the hidden attribute (the markup alone is not enough)', () => {
  const css = fs.readFileSync(new URL('./site.css', import.meta.url), 'utf8');
  assert.match(css, /\.filters\[hidden\][^{]*\{[^}]*display:\s*none/);
});

test('two sections that happen to share a heading each get their own table name, not a number', () => {
  const { html } = renderMarkdown('## A\n\n## Results\n\n| X |\n|---|\n| 1 |\n\n## B\n\n## Results\n\n| Y |\n|---|\n| 2 |\n');
  assert.equal((html.match(/aria-label="Results table"/g) ?? []).length, 2);
  assert.doesNotMatch(html, /Results table 2/);
});
