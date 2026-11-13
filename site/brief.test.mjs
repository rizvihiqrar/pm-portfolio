import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSite } from './build.mjs';

// Release Notes to a Change Brief states one rule (the customer must act: action box; they will notice: one line; they cannot see it: release notes only)
// in five places: the picker data in site.json, the plain table on the page, the table in the full version, the alt text and the picture.
// These tests make the places agree with the rule and with each other.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(new URL('./site.json', import.meta.url), 'utf8'));
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n');
const file = 'case-studies/08-release-notes-to-a-change-brief.md';
const card = config.cards.find((c) => c.path === file);
const page = read(file);
const full = read('case-studies/full/08-release-notes-to-a-change-brief.md');
const scope = card?.components?.scope;
const LABEL = { action: 'Action box', line: 'One line', notes: 'Release notes only' };
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];
const must = (value, what) => { assert.ok(value, `${what} is missing: the test cannot find it`); return value; };
// A Markdown table as rows keyed by column name, so adding or moving a column cannot shift the cells that are compared.
const table = (text) => {
  const rows = text.split('\n').filter((l) => /^\|/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
  return rows.slice(2).map((cells) => Object.fromEntries(cells.map((c, i) => [rows[0][i], c])));
};
const asked = (s) => ({ yes: 'Yes', no: 'No' })[s.check] ?? 'Not asked';

test('the brief card is finished and has picker data', () => {
  assert.ok(card, 'the card exists');
  assert.notEqual(card.status, 'planned');
  assert.ok(scope, 'the scope data is on the card');
});

test('every sample change follows the rule: act = action box, notice = one line, not visible = release notes only and the question is skipped (the break: flip one answer)', () => {
  assert.equal(scope.scenarios.length, 6);
  for (const s of scope.scenarios) {
    if (s.event === 'internal') {
      assert.equal(s.check, undefined, `${s.label}: nobody can see it, so the question is not asked`);
      assert.equal(s.outcome, 'notes', `${s.label}: stays in the release notes`);
    } else {
      assert.ok(s.check === 'yes' || s.check === 'no', `${s.label}: every visible change is asked the question`);
      assert.equal(s.outcome, s.check === 'yes' ? 'action' : 'line', `${s.label}: ${s.check} must lead to ${s.check === 'yes' ? 'action' : 'line'}`);
    }
  }
});

test('all three outcomes are used, and the labels are the three named in the rule (the break: rename one)', () => {
  assert.deepEqual([...new Set(scope.scenarios.map((s) => s.outcome))].sort(), ['action', 'line', 'notes']);
  assert.deepEqual(scope.outcomes.map((o) => o.text).sort(), Object.values(LABEL).sort());
});

test('the plain table on the page lists the same changes, answers and places as the picker (the break: reword a change or change a place)', () => {
  const block = must(page.match(/<!-- site:scope -->([\s\S]*?)<!-- \/site:scope -->/), 'the site:scope block')[1];
  const rows = table(block).map((r) => [r['Sample change'], r['Customer must act?'], r['Where it goes']]);
  assert.deepEqual(rows, scope.scenarios.map((s) => [s.label, asked(s), LABEL[s.outcome]]));
});

test('the full version has the same six changes, answers and places, with the same reasons as the picker (the break: drop a change or edit a reason)', () => {
  const section = must(full.split('## Six Sample Changes')[1], 'the Six Sample Changes section').split('\n## ')[0];
  const rows = table(section);
  assert.deepEqual(rows.map((r) => [r['Sample change'], r['Customer must act?'], r['Where it goes']]), scope.scenarios.map((s) => [s.label, asked(s), LABEL[s.outcome]]));
  assert.deepEqual(rows.map((r) => r.Why), scope.scenarios.map((s) => s.why));
});

test('the kind of each change in the full version is one of the picker events, and the same event as the picker uses (the break: change a kind)', () => {
  const section = must(full.split('## Six Sample Changes')[1], 'the Six Sample Changes section').split('\n## ')[0];
  const eventText = Object.fromEntries(scope.events.map((e) => [e.id, e.text]));
  assert.deepEqual(table(section).map((r) => r.Kind), scope.scenarios.map((s) => eventText[s.event]));
});

test('the counts in the page and the alt text match the data (the break: change a change and forget the words)', () => {
  const n = (o) => scope.scenarios.filter((s) => s.outcome === o).length;
  const [a, l, r] = [WORDS[n('action')], WORDS[n('line')], WORDS[n('notes')]];
  assert.ok(a && l && r, 'a count above six needs a word in WORDS');
  assert.match(page, new RegExp(`${a} need the customer to act, ${l} get one line and ${r} stays in the release notes`, 'i'), 'the page counts');
  assert.ok(scope.alt.includes(`${a} need the customer to act`) && scope.alt.includes(`${l} get one line`) && scope.alt.includes(`${r} stays in the release notes`), 'the alt text counts');
});

test('the picture shows the same three places and the same question as the picker, and shows the unseen change skipping the question (the break: rename a box or drop the skip note)', () => {
  const svg = read(card.visual);
  for (const text of ['Action box', 'One line', 'Release notes only']) assert.ok(svg.includes(`>${text}<`), `the picture has ${text}`);
  assert.ok(svg.includes('Must the customer') && svg.includes('do something?'));
  assert.ok(svg.includes('not asked'), 'the picture says the question is not asked of an unseen change');
  for (const word of ['action box', 'one plain line', 'release notes', 'skips the question']) assert.ok(card.visualAlt.includes(word), `the picture's alt text says ${word}`);
});

test('the card prompt is the page prompt, step by step, without the numbers (the break: drop a step from the card or edit one)', () => {
  const prompt = (t) => must(t.match(/```prompt\n([\s\S]*?)```/), 'the prompt')[1].trim();
  assert.equal(prompt(page), prompt(full));
  const steps = prompt(page).split('\n').filter((l) => /^\d\. /.test(l)).map((l) => l.replace(/^\d\. /, ''));
  assert.equal(steps.length, 3, 'the prompt has three steps');
  assert.deepEqual(card.code.split(/(?<=\.) /), steps, 'the card shows the same three steps');
  assert.match(steps[2], /list what you left out/, 'the last step asks for the list of what was left out');
});

test('the rule in the full version names the same three places the picker uses (the break: rename a place in the rule)', () => {
  const rule = must(full.split('## The Rule')[1], 'the Rule section').split('\n## ')[0].toLowerCase();
  for (const word of ['action box', 'one plain line', 'release notes']) assert.ok(rule.includes(word), `the rule names ${word}`);
  assert.ok(rule.includes('the question is not asked'), 'the rule says unseen changes are not asked');
  assert.match(scope.check.skipped, /Not asked/);
});

test('the case study states no figure as a finding: the problem text hedges and says nothing was measured (the break: a made-up count comes back)', () => {
  const problem = must(page.split('## The Problem')[1], 'the Problem section').split('\n## ')[0];
  assert.doesNotMatch(problem, /\b(thirty|twenty|forty|fifty|\d+)\b/i, 'no count in the problem text');
  assert.match(full, /Neither effect was measured/);
});

test('the case study says plainly that the changes are made up and that nothing was measured (the break: remove the note)', () => {
  assert.match(page, /the changes below are made up/);
  assert.match(page, /not a measured result/);
  assert.match(scope.asOf, /made-up/);
  assert.match(full, /made up/);
  assert.match(full, /I have not measured it/);
});

test('the case study links the matching training piece, and the root README and overview list the study', () => {
  assert.match(full, /\]\(https:\/\/rizvihiqrar\.github\.io\/training-portfolio\/04-technical-enablement\/jira-workflow-guide\/\)/);
  assert.match(read('README.md'), /\]\(https:\/\/rizvihiqrar\.github\.io\/product-portfolio\/case-studies\/08-release-notes-to-a-change-brief\.html\)/);
  assert.match(read('docs/overview.md'), /\]\(\.\.\/case-studies\/08-release-notes-to-a-change-brief\.md\)/);
});

test('the older triage study names the Git guide by its current title (the break: the old title comes back)', () => {
  assert.match(read('case-studies/full/03-rejected-ticket-triage.md'), /\[Git for New Testers\]\(/);
  assert.doesNotMatch(read('case-studies/full/03-rejected-ticket-triage.md'), /Git for People New to Version Control/);
});

test('the card title, the page heading and the picture title are the same words (the break: rename the card only)', () => {
  assert.equal(card.title, must(page.match(/^# (.*)$/m), 'the page heading')[1]);
  assert.match(read(card.visual), new RegExp(`<title id="t">${card.title}</title>`));
  assert.equal(card.imageAlt, `Title card: ${card.title}`);
});

test('the built page has the picker with all six changes and the folded full version', (t) => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-'));
  t.after(() => fs.rmSync(out, { recursive: true, force: true }));
  buildSite({ root, out, config });
  const html = fs.readFileSync(path.join(out, 'case-studies', '08-release-notes-to-a-change-brief.html'), 'utf8');
  assert.match(html, /data-site="scope"/);
  for (const s of scope.scenarios) assert.ok(html.includes(s.label), `${s.label} is a button`);
  assert.match(html, /Read the Full Version/);
});
