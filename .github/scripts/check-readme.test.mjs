import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { findProblems, relativeLinks } from './check-readme.mjs';

function tree(t, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'readme-check-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [name, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), text);
  }
  return root;
}
const front = (studies, links = '') => `${studies} case studies so far ${links}`;

test('web links, anchors and web images are not checked', () => {
  assert.deepEqual(relativeLinks('[a](https://x.y) [b](#top) [c](case-studies/a.md#part) ![d](https://i.png) [e](mailto:a@b.c)'), ['case-studies/a.md']);
});

test('links inside code are examples, not real links', () => {
  assert.deepEqual(relativeLinks('Use `[a](x.md)` like this:\n```md\n[b](y.md)\n```\n[real](z.md)'), ['z.md']);
});

test('a target with parentheses, a title, angle brackets and a malformed percent are all read without crashing', () => {
  assert.deepEqual(relativeLinks('[a](docs/Guide_(v2).md) [b](x.md "Title") [c](<my file.md>) [d](100%.md)'), ['docs/Guide_(v2).md', 'x.md', 'my file.md', '100%.md']);
});

test('a README that links every case study, with the right count, is fine (also with a ./ prefix)', (t) => {
  const root = tree(t, { 'README.md': front(1, '[One](./case-studies/01-one.md)'), 'case-studies/01-one.md': '# one' });
  assert.deepEqual(findProblems(root), []);
});

test('a link to a missing file is reported', (t) => {
  const root = tree(t, { 'README.md': front(0, '[x](nope.md)') });
  assert.deepEqual(findProblems(root), ['README.md links to nope.md, which does not exist']);
});

test('a broken link inside a case study is reported, resolved from that file', (t) => {
  const root = tree(t, { 'README.md': front(1, '[a](case-studies/01-a.md)'), 'case-studies/01-a.md': '[gone](../docs/missing.md) [ok](02-b.md)', 'case-studies/02-b.md': '#' });
  assert.deepEqual(findProblems(root), ['case-studies/01-a.md links to ../docs/missing.md, which does not exist', 'case-studies/02-b.md exists but the front README does not link to it', 'the front README says 1 case studies so far, but there are 2']);
});

test('a link with the wrong letter case is reported, because GitHub is case-sensitive', (t) => {
  const root = tree(t, { 'README.md': front(0, '[x](Notes.md)'), 'notes.md': '# n' });
  assert.deepEqual(findProblems(root), ['README.md links to Notes.md, which does not exist']);
});

test('a case study the README does not mention is reported (the break: add a piece, forget the link)', (t) => {
  const root = tree(t, { 'README.md': front(1), 'case-studies/02-two.md': '# two' });
  assert.deepEqual(findProblems(root), ['case-studies/02-two.md exists but the front README does not link to it']);
});

test('a stale case study count is reported (the break: add a piece, forget the number)', (t) => {
  const root = tree(t, { 'README.md': front(1, '[a](case-studies/01-a.md) [b](case-studies/02-b.md)'), 'case-studies/01-a.md': '#', 'case-studies/02-b.md': '#' });
  assert.deepEqual(findProblems(root), ['the front README says 1 case studies so far, but there are 2']);
});

test('a template or notes file in case-studies is not a case study', (t) => {
  const root = tree(t, { 'README.md': front(0), 'case-studies/TEMPLATE.md': '# t', 'case-studies/README.md': '# r' });
  assert.deepEqual(findProblems(root), []);
});

test('a repository with no case-studies folder yet is fine', (t) => {
  const root = tree(t, { 'README.md': front(0) });
  assert.deepEqual(findProblems(root), []);
});
