// Turn qa/results.json (Playwright JSON reporter) into qa/SUMMARY.md —
// a findings report grouped by failure, with the projects it affects.
import { readFileSync, writeFileSync } from 'node:fs';

const res = JSON.parse(readFileSync('qa/results.json', 'utf8'));
const rows = [];
const walk = (suite, path = []) => {
  for (const s of suite.suites || []) walk(s, [...path, s.title]);
  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      const last = t.results[t.results.length - 1] || {};
      rows.push({
        file: path[0] || spec.file, title: [...path.slice(1), spec.title].join(' › '),
        project: t.projectName, status: last.status || t.status,
        errors: (last.errors || []).map((e) => (e.message || '').replace(/\u001b\[[0-9;]*m/g, '').split('\n').slice(0, 6).join('\n')),
        annotations: t.annotations || [],
      });
    }
  }
};
walk(res);

const by = (k) => rows.reduce((m, r) => ((m[r[k]] ||= []).push(r), m), {});
const failed = rows.filter((r) => r.status === 'failed' || r.status === 'timedOut');
const passed = rows.filter((r) => r.status === 'passed' || r.status === 'expected');
const skipped = rows.filter((r) => r.status === 'skipped');

let md = `# QA summary\n\n`;
md += `Generated ${new Date().toISOString()} · **${passed.length} passed**, **${failed.length} failed**, ${skipped.length} skipped across ${Object.keys(by('project')).length} projects.\n\n`;

if (failed.length) {
  md += `## Failures\n\n`;
  const grouped = {};
  for (const r of failed) (grouped[`${r.file} — ${r.title}`] ||= []).push(r);
  for (const [k, rs] of Object.entries(grouped)) {
    md += `### ${k}\n\nProjects: ${rs.map((r) => `\`${r.project}\``).join(', ')}\n\n`;
    const msgs = [...new Set(rs.flatMap((r) => r.errors))];
    for (const m of msgs.slice(0, 4)) md += '```\n' + m + '\n```\n';
    md += '\n';
  }
}

const weights = rows.filter((r) => r.annotations.some((a) => a.type === 'weight'));
if (weights.length) {
  md += `## Page weight (chromium-laptop)\n\n| page | weight | status |\n|---|---|---|\n`;
  for (const r of weights) md += `| ${r.title.replace('weight & timing: ', '')} | ${r.annotations.find((a) => a.type === 'weight').description} | ${r.status} |\n`;
  md += '\n';
}

const adv = rows.filter((r) => r.annotations.some((a) => a.type === 'axe-advisory'));
if (adv.length) {
  md += `## Accessibility advisories (moderate/minor)\n\n`;
  for (const r of adv) {
    md += `**${r.title.replace('axe: ', '')}** (${r.project})\n\n`;
    md += '```\n' + r.annotations.find((a) => a.type === 'axe-advisory').description + '\n```\n\n';
  }
}

const ext = rows.find((r) => r.annotations.some((a) => a.type === 'external-links-with-issues'));
if (ext) md += `## External links\n\nWith issues: ${ext.annotations.find((a) => a.type === 'external-links-with-issues').description} (see the external-links.txt attachment in the HTML report).\n\n`;

md += `## Matrix\n\n| project | passed | failed | skipped |\n|---|---|---|---|\n`;
for (const [p, rs] of Object.entries(by('project'))) {
  md += `| ${p} | ${rs.filter((r) => r.status === 'passed').length} | ${rs.filter((r) => r.status === 'failed' || r.status === 'timedOut').length} | ${rs.filter((r) => r.status === 'skipped').length} |\n`;
}
writeFileSync('qa/SUMMARY.md', md);
console.log(md);
