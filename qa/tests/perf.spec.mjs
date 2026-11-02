// Performance: first-load transfer weight per page against a budget, plus
// basic timing. Chromium-laptop only (one measurement, not seven).
import { test, expect } from '@playwright/test';
import { PAGES, WEIGHT_BUDGET } from '../pages.mjs';

for (const pg of PAGES) {
  test(`weight & timing: ${pg.name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-laptop', 'measured once, on chromium-laptop');
    const sizes = new Map();
    page.on('response', async (r) => {
      try {
        // encoded size = what travels over the wire (gzip/brotli applied)
        const s = await r.request().sizes();
        let body = s.responseBodySize;
        if (!(body > 0)) body = (await r.body()).length;
        sizes.set(r.url(), (sizes.get(r.url()) || 0) + body);
      } catch { /* opaque/aborted */ }
    });
    await page.goto(pg.path, { waitUntil: 'load' });
    await expect(page.locator(pg.ready).first()).toBeVisible({ timeout: 15_000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const total = [...sizes.values()].reduce((a, b) => a + b, 0);
    const top = [...sizes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([u, b]) => `${(b / 1024).toFixed(0).padStart(6)} KB  ${decodeURIComponent(u).replace(/^http:\/\/localhost:\d+/, '')}`);
    const nav = await page.evaluate(() => {
      const t = performance.getEntriesByType('navigation')[0];
      return { domContentLoaded: Math.round(t.domContentLoadedEventEnd), load: Math.round(t.loadEventEnd) };
    });
    const budget = WEIGHT_BUDGET[pg.name] ?? WEIGHT_BUDGET.default;
    const summary = `total ${(total / 1024 / 1024).toFixed(2)} MB (budget ${(budget / 1024 / 1024).toFixed(1)} MB) · DCL ${nav.domContentLoaded} ms · load ${nav.load} ms\n\nlargest:\n${top.join('\n')}`;
    await testInfo.attach('weight.txt', { body: summary, contentType: 'text/plain' });
    testInfo.annotations.push({ type: 'weight', description: `${(total / 1024 / 1024).toFixed(2)} MB` });
    expect(total, `page weight over budget\n${summary}`).toBeLessThanOrEqual(budget);
  });
}
