import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSite } from './build.mjs';

// Rejected-Ticket Triage states one rule (criteria say it: implementation gap; criteria do not: spec gap) in four places:
// the picker data in site.json, the plain table on the page, the diagram in the full version and the alt text.
// These tests make the places agree with the rule and with each other.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(new URL('./site.json', import.meta.url), 'utf8'));
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n');
const card = config.cards.find((c) => c.path === 'case-studies/03-rejected-ticket-triage.md');
const page = read('case-studies/03-rejected-ticket-triage.md');
const full = read('case-studies/full/03-rejected-ticket-triage.md');
const scope = card?.components?.scope;
const LABEL = { impl: 'Implementation gap', spec: 'Spec gap' };
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];
const must = (value, what) => { assert.ok(value, `${what} is missing: the test cannot find it`); return value; };
// A Markdown table as rows keyed by column name, so adding or moving a column cannot shift the cells that are compared.
const table = (text) => {
  const rows = text.split('\n').filter((l) => /^\|/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
  return rows.slice(2).map((cells) => Object.fromEntries(cells.map((c, i) => [rows[0][i], c])));
};
const yesNo = (s) => (s.check === 'yes' ? 'Yes' : 'No');

test('the triage card is finished and has picker data', () => {
  assert.ok(card, 'the card exists');
  assert.notEqual(card.status, 'planned');
  assert.ok(scope, 'the scope data is on the card');
});

test('every sample ticket follows the rule: the criteria say it, so it is an implementation gap; they do not, so it is a spec gap (the break: flip one answer)', () => {
  assert.equal(scope.scenarios.length, 6);
  for (const s of scope.scenarios) {
    assert.ok(s.check === 'yes' || s.check === 'no', `${s.label}: every ticket is asked the question`);
    assert.equal(s.outcome, s.check === 'yes' ? 'impl' : 'spec', `${s.label}: ${s.check} must lead to ${s.check === 'yes' ? 'impl' : 'spec'}`);
  }
});

test('both outcomes are used, and the labels are the two named in the rule', () => {
  const used = new Set(scope.scenarios.map((s) => s.outcome));
  assert.deepEqual([...used].sort(), ['impl', 'spec']);
  assert.deepEqual(scope.outcomes.map((o) => o.text).sort(), Object.values(LABEL).sort());
});

test('the plain table on the page lists the same tickets, answers and labels as the picker (the break: reword a ticket or change a label)', () => {
  const block = must(page.match(/<!-- site:scope -->([\s\S]*?)<!-- \/site:scope -->/), 'the site:scope block')[1];
  const rows = table(block).map((r) => [r['Sample ticket'], r['Criteria say it?'], r['Where it goes']]);
  assert.deepEqual(rows, scope.scenarios.map((s) => [s.label, yesNo(s), LABEL[s.outcome]]));
});

test('the full version has the same six tickets and labels, and the diagram names both outcomes (the break: drop a ticket from the table)', () => {
  const section = must(full.split('## Six Sample Tickets')[1], 'the Six Sample Tickets section').split('\n## ')[0];
  const rows = table(section).map((r) => [r['Sample ticket'], r['Criteria say it?'], r.Label]);
  assert.deepEqual(rows, scope.scenarios.map((s) => [s.label, yesNo(s), LABEL[s.outcome]]));
  const diagram = must(full.match(/```mermaid\n([\s\S]*?)```/), 'the diagram')[1];
  for (const text of Object.values(LABEL)) assert.ok(diagram.includes(text), `the diagram names ${text}`);
});

test('the counts in the page and the alt text match the data (the break: change a ticket and forget the words)', () => {
  const n = (o) => scope.scenarios.filter((s) => s.outcome === o).length;
  const [impl, spec] = [WORDS[n('impl')], WORDS[n('spec')]];
  assert.ok(impl && spec, 'a count above six needs a word in WORDS');
  assert.match(page, new RegExp(`${impl} go back to the developer and ${spec} go to the owner`, 'i'), `the page should say ${impl} and ${spec}`);
  assert.ok(scope.alt.includes(`${impl} go back to the developer`) && scope.alt.includes(`${spec} go to the requirement owner`), 'the alt text counts');
  assert.ok(card.visualAlt.includes('spec gap') && card.visualAlt.includes('implementation gap'));
});

test('the case study says plainly that the tickets are made up and that nothing was measured (the break: remove the note)', () => {
  assert.match(page, /the tickets below are made up/);
  assert.match(page, /not a measured result/);
  assert.match(scope.asOf, /made-up/);
  assert.match(full, /made up/);
});

test('the case study links the matching training piece', () => {
  assert.match(full, /\]\(https:\/\/rizvihiqrar\.github\.io\/training-portfolio\/04-technical-enablement\/git-workflow-guide\/\)/);
});

test('the built page has the picker with all six tickets and the folded full version', (t) => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'triage-'));
  t.after(() => fs.rmSync(out, { recursive: true, force: true }));
  buildSite({ root, out, config });
  const html = fs.readFileSync(path.join(out, 'case-studies', '03-rejected-ticket-triage.html'), 'utf8');
  assert.match(html, /data-site="scope"/);
  for (const s of scope.scenarios) assert.ok(html.includes(s.label), `${s.label} is a button`);
  assert.match(html, /Read the Full Version/);
});
