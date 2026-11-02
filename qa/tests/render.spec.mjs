// Rendering: every page loads cleanly on every project — no console errors,
// no failed same-origin requests, no horizontal overflow, one h1, a title,
// and a full-page screenshot for visual review.
import { test, expect } from '@playwright/test';
import { PAGES } from '../pages.mjs';

for (const pg of PAGES) {
  test(`renders: ${pg.name}`, async ({ page }, testInfo) => {
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('response', (r) => {
      const u = r.url();
      if (u.startsWith('http://localhost') && r.status() >= 400) failedRequests.push(`${r.status()} ${u}`);
    });

    await page.goto(pg.path, { waitUntil: 'load' });
    await expect(page.locator(pg.ready).first()).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(600); // let reveal animations settle

    // Overflow: the body must never scroll sideways
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect.soft(overflow.scrollW, `horizontal overflow (${overflow.scrollW} > ${overflow.clientW})`)
      .toBeLessThanOrEqual(overflow.clientW + 1);

    // Document basics
    expect.soft(await page.title(), 'document has a title').not.toBe('');
    expect.soft(await page.locator('h1').count(), 'exactly one h1').toBe(1);
    expect.soft(await page.getAttribute('html', 'lang'), 'html lang set').toMatch(/^(en|zh-TW)$/);

    // No broken images: every visible <img> must have decoded pixels
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((i) => i.offsetParent !== null && i.complete && i.naturalWidth === 0)
        .map((i) => i.getAttribute('src')));
    expect.soft(broken, 'broken images').toEqual([]);

    // Images carry alt text (empty alt is allowed for decorative ones)
    const noAlt = await page.evaluate(() => [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.src));
    expect.soft(noAlt, 'images missing alt attribute').toEqual([]);

    expect.soft(failedRequests, 'failed same-origin requests').toEqual([]);
    expect.soft(consoleErrors, 'console errors').toEqual([]);

    // Scroll through once so IntersectionObserver reveals fire, then capture at CSS pixels
    // (device-pixel captures of long pages exceed the renderer's 32,767 px limit).
    await page.evaluate(async () => {
      const sc = document.scrollingElement;
      for (let y = 0; y < sc.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
    const shot = await page.screenshot({ fullPage: true, animations: 'disabled', scale: 'css' }).catch(() => null);
    if (shot) await testInfo.attach(`${pg.name}-${testInfo.project.name}.png`, { body: shot, contentType: 'image/png' });
  });
}
