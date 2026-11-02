# QA harness

Automated checks for nycu-pal.com. Runs locally and in GitHub Actions
(`.github/workflows/qa.yml`) on every push and weekly.

## What it checks

| Spec | Checks | Where |
|---|---|---|
| `render.spec.mjs` | Every page: no console errors, no failed same-origin requests, no horizontal overflow, one `h1`, title, `lang`, no broken images, alt attributes; full-page screenshot | all 7 browser/viewport projects |
| `functions.spec.mjs` | Language toggle + `?lang=zh`, mobile menu, skip link, nav/footer, hero live count, news & research modals, member photos, publications list/chart/BibTeX, calendar, OPC+ page | all projects (some mobile/desktop-only) |
| `links.spec.mjs` | Every internal link/asset resolves; external links probed and listed | all projects |
| `a11y.spec.mjs` | axe-core WCAG 2.1 A/AA + best-practice; critical/serious fail | Chromium projects |
| `perf.spec.mjs` | First-load transfer weight vs. budget, DOMContentLoaded/load timing | chromium-laptop |

Projects: `chromium-mobile` (Pixel 7), `chromium-tablet` (820×1180), `chromium-laptop` (1366×768),
`chromium-desktop` (1920×1080), `firefox-laptop`, `webkit-mobile` (iPhone 14), `webkit-laptop`.

## Run it

```
npm install
npx playwright install            # browsers (first time)
npm run qa                        # full matrix (~5 min)
npm run qa:chromium               # quick: laptop + mobile Chromium
npm run qa:report                 # open the HTML report (screenshots inside)
npm run qa:summary                # write qa/SUMMARY.md from the last run
```

Budgets and the page list live in `qa/pages.mjs`. Scratch scripts and screenshots
can go in `qa/.local/` (ignored by git; Playwright wipes `qa/test-results/` on every run).

## Known noise

- doi.org and youtu.be refuse automated clients (403 / header overflow); they are listed
  but not counted as broken external links.
- The static server (`python -m http.server`) occasionally refuses a connection under
  four parallel workers, so each test gets one retry.
- Members page weight is dominated by Noto Sans TC subsets (~1.5 MB on first visit) pulled
  in by the Chinese names; the budget reflects that until the font strategy changes.
