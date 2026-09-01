# PAL Lab Website — Admin Panel Guide

The site's content (news, members, publications) lives in three JSON files
under [`data/`](data/), and is edited through **Pages CMS** — a free,
form-based admin panel that commits straight to this GitHub repository.
Every save triggers GitHub Pages to redeploy the site (live in ~1 minute).

## One-time setup (repo owner)

1. Go to **https://app.pagescms.org** and click **Sign in with GitHub**.
2. Authorize the Pages CMS app and grant it access to this repository
   (`FangPoHsun/PAL-Website`).
3. The repo already contains the panel's configuration (`.pages.yml`), so
   the collections — **News & Highlights**, **Members**, **Publications** —
   appear immediately.

## Adding editors

Editors sign in to Pages CMS with their own GitHub account. For their login
to work they need **write access to the repo**:

1. GitHub → repo → *Settings* → *Collaborators* → *Add people*.
2. The invited member accepts, then signs in at https://app.pagescms.org.

## Editing content

- **News & Highlights** — the homepage news cards. The *first* story in the
  list is the big featured card. Photos can be uploaded directly in the
  form (they are stored under `image/`). Also contains the one-line
  "Latest Highlights" ticker.
- **Members** — Ph.D. / Master / In-service / Alumni lists, with photo
  upload. Member names also control the bold highlighting of lab authors
  on the Publications page.
- **Publications** — BibTeX-style entries. Fill in the DOI whenever one
  exists: it powers the title link, the "Cited by N" badge, and the
  citation statistics. Keep the list ordered newest-first (the weekly
  auto-update re-sorts it anyway).
- **Lab Calendar** — the weekly routine events (e.g. group meeting) and
  one-off dated events (parties, visits, deadlines). National holidays
  and lunar festivals through 2030 are built into the site and need no
  editing.

**Both languages, please:** every text field has an English and a 中文
variant. Fill in both — the site's EN | 中文 toggle shows whichever the
visitor picks.

## Automatic publication updates

Every Monday a GitHub Action checks [OpenAlex](https://openalex.org/A5040469421)
for new papers by Prof. Yu and opens a **pull request** with ready-made
entries. Review it before merging — the OpenAlex profile occasionally mixes
in papers by other researchers with the same name. To permanently reject a
paper, close the PR and add its DOI to
[`scripts/publications-ignore.json`](scripts/publications-ignore.json).

## How publishing works

Every push to `main` (including saves from Pages CMS) runs the
"Deploy site with prerendered content" GitHub Action: it renders the
JSON-driven pages in a headless browser and deploys the result, so search
engines and link previews see the full content. Publishing takes about
2–3 minutes end to end. GitHub Pages must stay set to
*Settings → Pages → Source: GitHub Actions*.

## Previewing locally

The pages load their data with `fetch()`, which browsers block for
`file://` pages — so open the site through a local web server instead of
double-clicking the HTML files:

```
python -m http.server 8000
# then visit http://localhost:8000
```
