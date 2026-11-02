// The site's pages and what each must contain once loaded.
export const PAGES = [
  { path: '/index.html',        name: 'home',         ready: '#news-grid .news-card:visible' },
  { path: '/pi.html',           name: 'pi',           ready: '.pi-name-card' },
  { path: '/research.html',     name: 'research',     ready: '.research-card' },
  { path: '/opc.html',          name: 'opc',          ready: '#opc-key-pubs li' },
  { path: '/members.html',      name: 'members',      ready: '#phd-grid .member-card' },
  { path: '/publications.html', name: 'publications', ready: '#pub-root .pub-item' },
  { path: '/calendar.html',     name: 'calendar',     ready: '#calendar-grid button.calendar-day' },
  { path: '/join.html',         name: 'join',         ready: '.visit-note' },
  { path: '/404.html',          name: '404',          ready: '.nf-code' },
];

// Per-page transfer budgets (bytes) — everything the page requests on first load.
// Measured after the Nov 2026 media pass: home 2.7 MB, members 2.6 MB (of
// which ~1.5 MB is Noto Sans TC subsets for the Chinese names), rest < 2 MB.
export const WEIGHT_BUDGET = {
  home: 3_000_000,
  members: 3_000_000,
  default: 2_400_000,
};

export const isMobile = (page) => page.viewportSize().width <= 768;

// The header switches to the hamburger drawer at 1024px (see style.css)
export const hasMobileNav = (page) => page.viewportSize().width <= 1024;
