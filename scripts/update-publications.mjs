// =========================================================================
// AUTO-UPDATE PUBLICATIONS FROM OPENALEX
// -------------------------------------------------------------------------
// Run weekly by .github/workflows/update-publications.yml (or manually:
//   node scripts/update-publications.mjs
// from the repo root). It fetches Prof. Yu's works from OpenAlex, skips
// every DOI already in data/publications.json or in
// scripts/publications-ignore.json, and prepends ready-made entries to the
// publications list. The workflow then opens a pull request so a lab
// member reviews before anything goes live.
//
// The OpenAlex author profile can occasionally contain works by other
// researchers named Peichen Yu — REVIEW EVERY PR. To reject a paper
// permanently, merge nothing and add its DOI (lowercase, no https prefix)
// to scripts/publications-ignore.json instead.
// =========================================================================
import { readFileSync, writeFileSync } from 'node:fs';

const AUTHOR_ID = 'A5040469421'; // Prof. Peichen Yu (NYCU)
const MAILTO = 'peichen.yu@nycu.edu.tw';
const DATA_FILE = 'data/publications.json';
const IGNORE_FILE = 'scripts/publications-ignore.json';
const PR_BODY_FILE = 'scripts/.pr-body.md';
const SKIP_TYPES = new Set(['preprint', 'erratum', 'paratext', 'dataset', 'peer-review', 'retraction']);

const normDoi = d => (d || '').replace(/^https?:\/\/doi\.org\//i, '').toLowerCase().trim();

async function fetchAllWorks() {
    const works = [];
    let cursor = '*';
    while (cursor) {
        const url = `https://api.openalex.org/works?filter=author.id:${AUTHOR_ID},from_publication_date:2021-01-01` +
            `&per-page=100&cursor=${encodeURIComponent(cursor)}&mailto=${MAILTO}` +
            `&select=title,doi,publication_year,type,biblio,authorships,primary_location`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`OpenAlex HTTP ${res.status} for ${url}`);
        const json = await res.json();
        works.push(...(json.results || []));
        cursor = json.results?.length ? json.meta?.next_cursor : null;
    }
    return works;
}

function toEntry(w) {
    const isArticle = w.type === 'article';
    const venue = w.primary_location?.source?.display_name || '';

    const authors = (w.authorships || []).map(a => {
        const dn = (a.author?.display_name || '').trim();
        const i = dn.lastIndexOf(' ');
        return i === -1 ? dn : `${dn.slice(i + 1)}, ${dn.slice(0, i)}`;
    }).filter(Boolean);

    const famRaw = authors[0] ? authors[0].split(',')[0] : 'pal';
    const fam = famRaw.toLowerCase().replace(/[^a-z]/g, '') || 'pal';
    const word = (String(w.title).match(/[A-Za-z]{3,}/) || ['paper'])[0].toLowerCase();

    const b = w.biblio || {};
    const pages = b.first_page
        ? (b.last_page && b.last_page !== b.first_page ? `${b.first_page}--${b.last_page}` : String(b.first_page))
        : '';

    const entry = {
        type: isArticle ? 'article' : 'inproceedings',
        key: `${fam}${w.publication_year}${word}`,
        title: w.title,
        author: authors,
    };
    if (venue) entry[isArticle ? 'journal' : 'booktitle'] = venue;
    if (b.volume) entry.volume = String(b.volume);
    if (b.issue) entry.number = String(b.issue);
    if (pages) entry.pages = pages;
    entry.doi = normDoi(w.doi);
    entry.year = w.publication_year;
    entry.scholar = '';
    return entry;
}

async function main() {
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    if (!Array.isArray(data.publications)) throw new Error(`${DATA_FILE} has no "publications" array`);

    const existing = new Set(data.publications.map(p => normDoi(p.doi)).filter(Boolean));
    const ignored = new Set(JSON.parse(readFileSync(IGNORE_FILE, 'utf8')).map(normDoi));

    const works = await fetchAllWorks();
    const seen = new Set();
    const fresh = works.filter(w => {
        const d = normDoi(w.doi);
        if (!d || !w.title || w.publication_year < 2021) return false;
        if (SKIP_TYPES.has(w.type)) return false;
        if (existing.has(d) || ignored.has(d) || seen.has(d)) return false;
        seen.add(d);
        return true;
    });

    if (!fresh.length) {
        writeFileSync(PR_BODY_FILE, 'No new publications found on OpenAlex.\n');
        console.log('No new publications found. Nothing to do.');
        return;
    }

    data.publications = [...fresh.map(toEntry), ...data.publications];
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');

    const body = [
        `This automated weekly check found **${fresh.length}** publication(s) on ` +
        `[OpenAlex](https://openalex.org/${AUTHOR_ID}) not yet listed on the website:`,
        '',
        ...fresh.map(w =>
            `- **${w.title}** — ${w.primary_location?.source?.display_name || 'unknown venue'}, ` +
            `${w.publication_year} ([${normDoi(w.doi)}](https://doi.org/${normDoi(w.doi)}))`),
        '',
        '**Before merging, please verify:**',
        '- [ ] Every paper really is PAL Lab work (the OpenAlex author profile can mix in',
        '      other researchers named Peichen Yu — if a paper is not ours, do NOT merge it;',
        '      remove its entry and add its DOI to `scripts/publications-ignore.json`)',
        '- [ ] Author name formats match how the members are listed on the site',
        '- [ ] Venue names and page numbers look right',
        '',
        '_Generated by `.github/workflows/update-publications.yml`._',
    ].join('\n');
    writeFileSync(PR_BODY_FILE, body + '\n');

    console.log(`Prepended ${fresh.length} new publication(s) to ${DATA_FILE}:`);
    fresh.forEach(w => console.log(`  - ${w.title} (${normDoi(w.doi)})`));
}

main().catch(err => { console.error(err); process.exit(1); });
