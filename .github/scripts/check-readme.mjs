// Keeps the front page honest as case studies are added.
//   node .github/scripts/check-readme.mjs
// Fails (exit 1) when:
//   - any Markdown file links to a file or folder that doesn't exist (exact letter case, as on GitHub),
//     or to a #heading that is not in the file it points at;
//   - a numbered case study in case-studies/ (01-name.md) is not linked from the front README;
//   - the front README says "N case studies so far" and N is not the number of case studies.
// Written style: headings are in title case, and the phrase "plain English" is not used anywhere.
// Web links are not checked: third-party sites block bots and would make the build flaky.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/** Markdown with fenced code blocks and inline code removed, so example links are not read as real ones. */
export function withoutCode(markdown) {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '').replace(/`[^`\n]*`/g, '');
}

/** Links in a Markdown text as { target, anchor }: web links skipped, queries removed; target is '' for a link within the same file. */
export function links(markdown) {
  const found = [];
  const link = /\]\((<[^>]+>|[^()\s]*(?:\([^()\s]*\)[^()\s]*)*)(?:\s+"[^"]*")?\)/g;
  for (const m of withoutCode(markdown).matchAll(link)) {
    const raw = m[1].replace(/^<|>$/g, '');
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;
    const [pathPart, ...rest] = raw.split('#');
    const decode = (s) => { try { return decodeURIComponent(s); } catch { return s; } }; // a bare % is kept as written
    found.push({ target: decode(pathPart.split('?')[0]), anchor: decode(rest.join('#')) });
  }
  return found;
}

/** Relative link targets in a Markdown text: anchors and queries removed, web links and same-file links skipped. */
export function relativeLinks(markdown) {
  return links(markdown).map((l) => l.target).filter(Boolean);
}

/** GitHub's anchor for a heading: lower case, punctuation removed, spaces to hyphens. */
export function slug(heading) {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

/** The anchors a Markdown file offers (a repeated heading gets -1, -2, as on GitHub). */
export function headingSlugs(markdown) {
  const seen = new Map();
  const out = [];
  for (const m of withoutCode(markdown).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const base = slug(m[1]);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.push(n ? `${base}-${n}` : base);
  }
  return out;
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
    if (e.name === '.git' || e.name === '.github' || e.name === 'node_modules') continue;
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

const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'vs', 'via', 'with', 'from', 'into', 'than', 'nor', 'per']);

/** Headings that are not in title case: a word starts in lower case, unless it is a small word in the middle (a, of, to, with...). The first word, the last word and the word after a colon are always capitalized. */
export function headingProblems(markdown) {
  const out = [];
  for (const m of withoutCode(markdown).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const words = m[1].split(' ');
    words.some((w, i) => {
      if (/^(`|\[|http)/.test(w)) return false;
      const core = (w.match(/^[^A-Za-z0-9]*([A-Za-z0-9'’-]+)/) ?? [])[1];
      if (!core) return false;
      const forced = i === 0 || i === words.length - 1 || words[i - 1].endsWith(':');
      const parts = core.split('-');
      const bad = parts.find((p) => /^[a-z]/.test(p) && (forced || parts.length > 1 || !SMALL_WORDS.has(p)));
      if (bad) out.push(`the heading "${m[1]}" is not in title case ("${bad}")`);
      return Boolean(bad); // one report per heading
    });
  }
  return out;
}

/** Phrases that must not appear in the written text. */
export const BANNED_PHRASES = [/plain[- ]english/i];

/** @returns {string[]} one line per problem; empty when the README is in step with the folders */
export function findProblems(root) {
  const problems = [];
  for (const file of markdownFiles(root)) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    for (const problem of headingProblems(text)) problems.push(`${file}: ${problem}`);
    for (const phrase of BANNED_PHRASES) {
      if (phrase.test(withoutCode(text))) problems.push(`${file} uses a banned phrase (${phrase.source}); say Overview or describe it differently`);
    }
    for (const { target, anchor } of links(text)) {
      const resolved = target ? fromRoot(file, target) : file;
      if (target && !existsExact(root, resolved)) {
        problems.push(`${file} links to ${target}, which does not exist`);
      } else if (anchor && resolved.endsWith('.md')) {
        const slugs = headingSlugs(fs.readFileSync(path.join(root, resolved), 'utf8'));
        if (!slugs.includes(anchor.toLowerCase())) problems.push(`${file} links to ${target}#${anchor}, but ${resolved} has no such heading`);
      }
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
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const problems = findProblems(root);
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`README check: ok (${caseStudies(root).length} case studies, every Markdown link resolves)`);
}
