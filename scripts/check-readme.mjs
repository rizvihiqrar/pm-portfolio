// Keeps the front page honest as case studies are added.
//   node scripts/check-readme.mjs
// Fails (exit 1) when:
//   - any Markdown file links to a file or folder that doesn't exist (exact letter case, as on GitHub);
//   - a numbered case study in case-studies/ (01-name.md) is not linked from the front README;
//   - the front README says "N case studies so far" and N is not the number of case studies.
// Web links are not checked: third-party sites block bots and would make the build flaky.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/** Markdown with fenced code blocks and inline code removed, so example links are not read as real ones. */
export function withoutCode(markdown) {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '').replace(/`[^`\n]*`/g, '');
}

/** Relative link targets in a Markdown text: anchors and queries removed, web links skipped. */
export function relativeLinks(markdown) {
  const targets = [];
  const link = /\]\((<[^>]+>|[^()\s]*(?:\([^()\s]*\)[^()\s]*)*)(?:\s+"[^"]*")?\)/g;
  for (const m of withoutCode(markdown).matchAll(link)) {
    let raw = m[1].replace(/^<|>$/g, '');
    if (/^([a-z][a-z0-9+.-]*:|#)/i.test(raw)) continue;
    raw = raw.split('#')[0].split('?')[0];
    try { raw = decodeURIComponent(raw); } catch { /* a bare % is kept as written */ }
    if (raw) targets.push(raw);
  }
  return targets;
}

/** True when every segment of rel exists with exactly this letter case (GitHub is case-sensitive, Windows is not). */
export function existsExact(root, rel) {
  let dir = root;
  for (const segment of rel.split('/').filter(Boolean)) {
    if (!fs.existsSync(dir) || !fs.readdirSync(dir).includes(segment)) return false;
    dir = path.join(dir, segment);
  }
  return true;
}

/** Link target resolved from the file that contains it to a path from the repository root. */
export function fromRoot(fileRel, target) {
  const base = target.startsWith('/') ? '' : path.posix.dirname(fileRel);
  return path.posix.normalize(path.posix.join(base, target.replace(/^\/+/, ''))).replace(/\/$/, '');
}

function markdownFiles(root, dir = '') {
  const out = [];
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...markdownFiles(root, rel));
    else if (e.name.endsWith('.md')) out.push(rel);
  }
  return out;
}

/** Case studies: numbered Markdown files in case-studies/ (01-name.md). A template or notes file is not one. */
export function caseStudies(root) {
  const dir = path.join(root, 'case-studies');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /^\d\d-.+\.md$/.test(f)).map((f) => `case-studies/${f}`);
}

/** @returns {string[]} one line per problem; empty when the README is in step with the folders */
export function findProblems(root) {
  const problems = [];
  for (const file of markdownFiles(root)) {
    for (const target of relativeLinks(fs.readFileSync(path.join(root, file), 'utf8'))) {
      if (!existsExact(root, fromRoot(file, target))) problems.push(`${file} links to ${target}, which does not exist`);
    }
  }
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const linked = relativeLinks(readme).map((t) => fromRoot('README.md', t));
  const studies = caseStudies(root);
  for (const study of studies) {
    if (!linked.includes(study)) problems.push(`${study} exists but the front README does not link to it`);
  }
  const stated = readme.match(/(\d+) case studies so far/);
  if (!stated) problems.push('the front README does not say "N case studies so far"');
  else if (Number(stated[1]) !== studies.length) problems.push(`the front README says ${stated[1]} case studies so far, but there are ${studies.length}`);
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const problems = findProblems(root);
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`README check: ok (${caseStudies(root).length} case studies, every Markdown link resolves)`);
}
