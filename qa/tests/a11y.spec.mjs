// Accessibility: axe-core WCAG 2.1 A/AA scan of every page. Critical and
// serious violations fail; moderate/minor are attached for review.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from '../pages.mjs';

test.describe.configure({ mode: 'parallel' });

for (const pg of PAGES) {
  test(`axe: ${pg.name}`, async ({ page, browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'axe runs on Chromium projects only');
    await page.goto(pg.path);
    await expect(page.locator(pg.ready).first()).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    const fmt = (v) => `[${v.impact}] ${v.id}: ${v.help} — ${v.nodes.length} node(s); e.g. ${v.nodes[0]?.target?.join(' ')}`;
    await testInfo.attach('axe-violations.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
    const blocking = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact)).map(fmt);
    const advisory = results.violations.filter((v) => !['critical', 'serious'].includes(v.impact)).map(fmt);
    if (advisory.length) testInfo.annotations.push({ type: 'axe-advisory', description: advisory.join('\n') });
    expect(blocking, 'critical/serious accessibility violations').toEqual([]);
  });
}
