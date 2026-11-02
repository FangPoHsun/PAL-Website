// Interactive functions: language toggle, mobile nav, modals, data-driven
// sections, calendar, BibTeX copy, skip link.
import { test, expect } from '@playwright/test';
import { isMobile, hasMobileNav } from '../pages.mjs';

test.describe('language toggle', () => {
  test('switches to Chinese, persists in URL and across reload', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#news-grid .news-card:visible').first()).toBeVisible();
    const h1 = page.locator('h1');
    const zh = await h1.getAttribute('data-zh');
    if (hasMobileNav(page)) await page.click('#hamburger');
    await page.click('.lang-switch');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
    await expect(h1).toHaveText(zh);
    expect(page.url()).toContain('lang=zh');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
    // dynamically rendered content follows too
    await expect(page.locator('#news-grid .news-card .tag').first()).not.toHaveText(/^(Award|Lab News|Milestone)$/);
  });

  test('?lang=zh deep link opens Chinese on any page', async ({ page }) => {
    await page.goto('/publications.html?lang=zh');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
    await expect(page.locator('h1.page-title')).toHaveText('論文發表');
  });
});

test.describe('navigation', () => {
  test('mobile menu opens and closes via the hamburger button', async ({ page }) => {
    test.skip(!hasMobileNav(page), 'collapsed nav only');
    await page.goto('/index.html');
    const btn = page.locator('#hamburger');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await expect(page.locator('#nav-links')).toHaveClass(/active/);
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#nav-links a', { hasText: 'Publications' })).toBeVisible();
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('skip link is first focusable and targets main content', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit does not Tab to links by default');
    await page.goto('/research.html');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.className);
    expect(focused).toContain('skip-link');
    await expect(page.locator('#main-content')).toHaveCount(1);
  });

  test('OPC+ is in the nav and the footer on every page', async ({ page }) => {
    for (const p of ['/index.html', '/pi.html', '/members.html']) {
      await page.goto(p);
      await expect(page.locator('#nav-links a[href="opc.html"]')).toHaveCount(1);
      await expect(page.locator('footer.site-footer')).toBeVisible();
      await expect(page.locator('footer .footer-links a')).toHaveCount(7);
    }
  });
});

test.describe('homepage', () => {
  test('hero proof strip shows the live paper count', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#hero-pubs')).toHaveText(/^\d{2,}$/);
  });

  test('news modal opens from a card, shows content, closes on Escape', async ({ page }) => {
    await page.goto('/index.html');
    const card = page.locator('#news-grid .news-card:visible').first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    const modal = page.locator('#news-modal');
    await expect(modal).toHaveClass(/active/);
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(page.locator('#news-modal-title')).not.toHaveText('');
    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveClass(/active/);
  });

  test('featured story is not duplicated in the visible grid on desktop', async ({ page }) => {
    test.skip(isMobile(page), 'desktop only');
    await page.goto('/index.html');
    const featured = await page.locator('.news-featured-card h3').first().textContent();
    const gridTitles = await page.locator('#news-grid .news-card:visible h3').allTextContents();
    expect(gridTitles[0]).not.toBe(featured);
  });
});

test.describe('research', () => {
  test('pillar modal opens with key publications and closes on Escape', async ({ page }) => {
    await page.goto('/research.html');
    await page.locator('.research-card').first().click();
    const modal = page.locator('#research-modal');
    await expect(modal).toHaveClass(/active/);
    await expect(page.locator('#research-modal .key-pubs li').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveClass(/active/);
  });
});

test.describe('members', () => {
  test('every member has a working photo or an initials fallback', async ({ page }) => {
    await page.goto('/members.html');
    await expect(page.locator('#phd-grid .member-card').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    const problems = await page.evaluate(() =>
      [...document.querySelectorAll('.member-card')].flatMap((c) => {
        const name = c.querySelector('.member-name')?.textContent?.trim();
        const av = c.querySelector('.member-avatar');
        const img = av?.querySelector('img');
        if (!img) return av?.classList.contains('avatar-fallback') ? [] : [`${name}: no photo and no fallback`];
        if (img.complete && img.naturalWidth === 0) return [`${name}: photo failed to load (${img.getAttribute('src')})`];
        return [];
      }));
    expect(problems).toEqual([]);
    expect(await page.locator('.member-card').count()).toBeGreaterThanOrEqual(10);
  });
});

test.describe('publications', () => {
  test('list, chart, stats and BibTeX copy work', async ({ page, context, browserName }) => {
    await page.goto('/publications.html');
    await expect(page.locator('#pub-root .pub-item').first()).toBeVisible();
    expect(await page.locator('#pub-root .pub-item').count()).toBeGreaterThanOrEqual(30);
    await expect(page.locator('#pub-chart svg')).toBeVisible();
    await expect(page.locator('#stat-count')).toHaveText(/^\d{2,}$/);
    // lab members are bolded in author lists
    expect(await page.locator('.pub-lab-author').count()).toBeGreaterThan(10);
    // BibTeX copy (clipboard permission is Chromium-only)
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const btn = page.locator('.pub-bibtex-btn').first();
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await expect(btn).toHaveText(/Copied|已複製/);
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      expect(clip).toMatch(/^@(article|inproceedings)\{/);
    }
  });
});

test.describe('calendar', () => {
  test('opens on today, navigates months, lists upcoming', async ({ page }) => {
    await page.goto('/calendar.html');
    const days = page.locator('#calendar-grid button.calendar-day');
    const n = await days.count();
    expect(n).toBeGreaterThanOrEqual(28);
    expect(n).toBeLessThanOrEqual(31);
    await expect(page.locator('#calendar-grid .calendar-day.selected')).toHaveCount(1);
    const before = await page.locator('#current-month').textContent();
    await page.click('#next-month');
    await expect(page.locator('#current-month')).not.toHaveText(before);
    expect(await page.locator('#upcoming-list li').count()).toBeGreaterThan(0);
  });
});

test.describe('OPC+', () => {
  test('page content is data-driven and complete', async ({ page }) => {
    await page.goto('/opc.html');
    expect(await page.locator('#opc-key-pubs li').count()).toBeGreaterThanOrEqual(3);
    expect(await page.locator('.sem-block .sem-item img').count()).toBe(6); // 3 SEM before/after pairs
    await expect(page.locator('.demo-card')).toHaveCount(2);
    await expect(page.locator('a[href^="https://opc-cloud.com"]').first()).toBeVisible();
  });
});
