// Links & assets: every same-origin href/src across the site resolves;
// external links are listed (and probed, warning only) for review.
import { test, expect } from '@playwright/test';
import { PAGES } from '../pages.mjs';

test('all internal links and assets resolve', async ({ page, request, baseURL }, testInfo) => {
  test.setTimeout(180_000);
  const internal = new Map(); // url -> set(pages)
  const external = new Map();
  for (const pg of PAGES) {
    await page.goto(pg.path);
    await page.waitForLoadState('networkidle').catch(() => {});
    const urls = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('a[href], img[src], source[src], video[src], link[rel="stylesheet"], script[src]').forEach((el) => {
        const v = el.getAttribute('href') || el.getAttribute('src');
        if (!v || v.startsWith('#') || v.startsWith('mailto:') || v.startsWith('tel:') || v.startsWith('javascript:')) return;
        out.push(new URL(v, location.href).href);
      });
      return out;
    });
    for (const u of urls) {
      const bucket = u.startsWith(baseURL) ? internal : external;
      if (!bucket.has(u)) bucket.set(u, new Set());
      bucket.get(u).add(pg.name);
    }
  }

  const broken = [];
  for (const [u, pages] of internal) {
    const r = await request.head(u).catch(() => null);
    const status = r ? r.status() : 0;
    if (status !== 200) broken.push(`${status} ${decodeURIComponent(u)} (on: ${[...pages].join(', ')})`);
  }
  await testInfo.attach('internal-urls.txt', { body: [...internal.keys()].map(decodeURIComponent).join('\n'), contentType: 'text/plain' });
  expect(broken, 'broken internal links/assets').toEqual([]);

  // External: probe with a short timeout, report only
  const extReport = [];
  for (const [u, pages] of external) {
    let status = 'skip';
    try {
      const r = await request.get(u, { timeout: 8000, maxRedirects: 5 });
      status = String(r.status());
    } catch (e) { status = 'ERR ' + (e.message || '').split('\n')[0].slice(0, 60); }
    extReport.push(`${status.padEnd(8)} ${u}  (${[...pages].join(', ')})`);
  }
  await testInfo.attach('external-links.txt', { body: extReport.join('\n'), contentType: 'text/plain' });
  // doi.org and youtu.be refuse automated clients (403 / header overflow); they are not broken.
  const BOT_BLOCKED = /https?:\/\/(dx\.)?doi\.org\/|https?:\/\/youtu\.be\//;
  const extBad = extReport.filter((l) => /^(4\d\d|5\d\d|ERR)/.test(l) && !BOT_BLOCKED.test(l));
  test.info().annotations.push({ type: 'external-links-with-issues', description: `${extBad.length} of ${extReport.length}` });
});
