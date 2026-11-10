// Keeps the front page honest as case studies are added.
//   node scripts/check-readme.mjs
// Fails (exit 1) when the README links to a file that doesn't exist, or when a case study in
// case-studies/ is not linked from the README.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/** Relative link targets in a Markdown file, without anchors; web links are skipped. */
export function relativeLinks(markdown) {
  const targets = [];
  for (const m of markdown.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const raw = m[1];
    if (/^([a-z]+:|#|mailto:)/i.test(raw)) continue;
    targets.push(decodeURIComponent(raw.split('#')[0]));
  }
  return targets.filter(Boolean);
}

/** Case studies: every Markdown file in case-studies/. */
export function caseStudies(root) {
  const dir = path.join(root, 'case-studies');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => `case-studies/${f}`);
}

/** @returns {string[]} one line per problem; empty when the README is in step with the folders */
export function findProblems(root) {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const links = relativeLinks(readme);
  const problems = [];
  for (const target of links) {
    if (!fs.existsSync(path.join(root, target))) problems.push(`README links to ${target}, which does not exist`);
  }
  for (const study of caseStudies(root)) {
    if (!links.includes(study)) problems.push(`${study} exists but the front README does not link to it`);
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const problems = findProblems(root);
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`README check: ok (${caseStudies(root).length} case studies, all linked)`);
}
