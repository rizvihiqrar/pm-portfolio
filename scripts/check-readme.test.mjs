import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { findProblems, relativeLinks } from './check-readme.mjs';

function tree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'readme-check-'));
  for (const [name, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), text);
  }
  return root;
}

test('web links, anchors and images from the web are not checked', () => {
  assert.deepEqual(relativeLinks('[a](https://x.y) [b](#top) [c](case-studies/a.md#part) ![d](https://i.png)'), ['case-studies/a.md']);
});

test('a README that links every case study is fine', () => {
  const root = tree({ 'README.md': '[One](case-studies/01-one.md)', 'case-studies/01-one.md': '# one' });
  assert.deepEqual(findProblems(root), []);
});

test('a link to a missing file is reported', () => {
  const root = tree({ 'README.md': '[x](nope.md)' });
  assert.deepEqual(findProblems(root), ['README links to nope.md, which does not exist']);
});

test('a case study the README does not mention is reported (the break: add a piece, forget the link)', () => {
  const root = tree({ 'README.md': '# front', 'case-studies/02-two.md': '# two' });
  assert.deepEqual(findProblems(root), ['case-studies/02-two.md exists but the front README does not link to it']);
});

test('a repository with no case-studies folder yet is fine', () => {
  const root = tree({ 'README.md': '# front' });
  assert.deepEqual(findProblems(root), []);
});
