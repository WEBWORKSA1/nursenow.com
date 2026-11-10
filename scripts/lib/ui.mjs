// Shared UI fragments: icons, layout shell, CTAs, ads.
import { esc } from './md.mjs';

const P = {
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h2M14 18h2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
  news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v9a2 2 0 0 1-2 2M8 9h5M8 13h5"/>',
  heart: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M10 16h4M12 13v3M8 20h8"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
  megaphone: '<path d="M3 10v4h4l7 4V6L7 10zM18 9a4 4 0 0 1 0 6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  steth: '<path d="M6 3v6a5 5 0 0 0 10 0V3M6 3H4M16 3h2M11 14v2a4 4 0 0 0 8 0v-2"/><circle cx="19" cy="12" r="2"/>',
  dollar: '<path d="M12 2v20M17 6.5C16 5 14.3 4.5 12 4.5c-2.8 0-4.5 1.4-4.5 3.4 0 4.6 9.5 2.4 9.5 7.3 0 2.1-2 3.4-5 3.4-2.4 0-4.1-.7-5-2.3"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 16.5a4 4 0 0 1 7 0M15 10h3M15 13h3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  plane: '<path d="M2 16l20-8-6 12-3-5z M13 15l-4 5"/>',
  bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};
export const icon = (n, cls = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${P[n] || P.arrow}</svg>`;

export const logoMark = `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#0E7C6B"/><path d="M6 22h7l3-8 4 15 4-12 2 5h8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="34" cy="22" r="2.4" fill="#E4572E"/></svg>`;

export const NAV = [
  ['/jobs/', 'Jobs'], ['/nclex/', 'NCLEX'], ['/licensing/', 'Licensing'], ['/learn/', 'Learn'], ['/tools/', 'Tools'], ['/news/', 'News'], ['/blog/', 'Guides']
];
export const MORE = [
  ['/match/', 'Get matched', 'Free career match'], ['/videos/', 'Videos', 'Daily YouTube hub'],
  ['/certifications/', 'Certifications', 'CCRN, CEN, FNP & more'], ['/resources/', 'Resource directory', '90+ vetted sites'],
  ['/gear/', 'Gear guide', 'Shoes, stethoscopes, kit'], ['/recruiters/', 'For recruiters', 'Post a nursing job'],
  ['/contests/', 'Contests', 'Prizes & challenges'], ['/support/', 'Support NurseNow', 'Donate & sponsor'],
  ['/careers/', 'Work with us', 'Writers, creators, reps'], ['/advertise/', 'Advertise', 'Sponsorships & media kit']
];

export function adUnit(cfg, slotKey) {
  const slot = cfg.adsense.slots[slotKey];
  if (!slot) return '';
  return `<div class="ad"><span class="ad-label">Advertisement</span><ins class="adsbygoogle" style="display:block" data-ad-client="${cfg.adsense.client}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
}

export const ctas = {
  match: () => `<aside class="cta-box"><strong class="eyebrow" style="color:var(--sun)">Free career match</strong><h3>Tell us your goal — get a personalised next-step plan</h3><p>Jobs, licensing steps, NCLEX prep or certifications. Two minutes, no cost.</p><a class="btn btn-primary" href="/match/">Get matched →</a></aside>`,
  nclex: () => `<aside class="cta-box"><strong class="eyebrow" style="color:var(--sun)">NCLEX daily</strong><h3>Answer today’s NCLEX question of the day</h3><p>Original practice questions with rationales — keep your streak alive.</p><a class="btn btn-primary" href="/nclex/">Practice now →</a></aside>`,
  jobs: () => `<aside class="cta-box"><strong class="eyebrow" style="color:var(--sun)">Refreshed daily</strong><h3>Browse today’s nursing jobs</h3><p>New openings pulled every morning, plus one-click searches on the biggest boards.</p><a class="btn btn-primary" href="/jobs/">See jobs →</a></aside>`,
  support: () => `<aside class="cta-box"><strong class="eyebrow" style="color:var(--sun)">Keep it free</strong><h3>NurseNow is free for every nurse</h3><p>Reader support pays for hosting, new tools and contest prizes.</p><a class="btn btn-primary" href="/support/">Support NurseNow →</a></aside>`,
  tools: () => `<aside class="cta-box"><strong class="eyebrow" style="color:var(--sun)">Free tools</strong><h3>Pay calculator, resume builder, shift planner</h3><p>Built for nurses. Works on your phone. Nothing to install.</p><a class="btn btn-primary" href="/tools/">Open tools →</a></aside>`
};

export function shell(cfg, page, { buildDate }) {
  const url = cfg.url + page.path.replace(/index\.html$/, '');
  const title = page.path === '/index.html' ? `${cfg.name} — Nursing Jobs, NCLEX Prep, Licensing & Career Tools` : `${page.title} | ${cfg.name}`;
  const desc = esc(page.description || cfg.description);
  const noAds = cfg.adsense.excludePaths.includes(page.path) || page.noAds;
  const ld = [{ '@context': 'https://schema.org', '@type': 'Organization', name: cfg.name, url: cfg.url, logo: cfg.url + '/assets/img/logo-512.png' },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.name, url: cfg.url, potentialAction: { '@type': 'SearchAction', target: cfg.url + '/resources/?q={search_term_string}', 'query-input': 'required name=search_term_string' } }];
  if (page.crumbs) ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ...page.crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: cfg.url + c[1] })) });
  if (page.ld) ld.push(...[].concat(page.ld));
  const more = MORE.map(([h, t, s]) => `<a href="${h}">${t}<span>${s}</span></a>`).join('');
  return `<!doctype html>
<html lang="${cfg.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script>document.documentElement.classList.add('js')</script>
<title>${esc(title)}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
${page.noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta name="theme-color" content="${cfg.themeColor}">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${cfg.name}">
<meta property="og:title" content="${esc(page.title || cfg.name)}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${cfg.url}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/logo-512.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="NurseNow guides" href="/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400..700,0..100;1,9..144,400..700,0..100&family=IBM+Plex+Mono:wght@500;600&family=Instrument+Sans:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/css/site.css?v=${buildDate.slice(0, 10)}">
${noAds ? '' : `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.adsense.client}" crossorigin="anonymous"></script>`}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
${page.head || ''}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="broker"><a href="${cfg.brokerUrl}" target="_blank" rel="noopener">${esc(cfg.brokerText)}</a></div>
<header class="site-head"><div class="wrap nav">
<a class="logo" href="/" aria-label="${cfg.name} home">${logoMark}<span>Nurse<b>Now</b></span></a>
<ul class="menu" id="menu">
${NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}
<li><details><summary>More ▾</summary><div class="dropdown">${more}</div></details></li>
</ul>
<div class="head-actions">
<button class="icon-btn" id="themeBtn" type="button" aria-label="Toggle dark mode">${icon('sun')}</button>
<a class="btn btn-primary btn-sm" href="/match/">Get matched</a>
<button class="icon-btn burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu">${icon('menu')}</button>
</div></div></header>
<main id="main">
${page.body}
</main>
${footer(cfg, buildDate)}
<div class="cookie" id="cookie" role="dialog" aria-label="Cookie notice"><strong>Cookies & ads</strong><p style="margin:.4em 0 0">We use cookies for essential features and, with Google AdSense, to show and measure ads. See our <a href="/cookies/">cookie policy</a> and <a href="/privacy/">privacy policy</a>.</p><div class="row-btn"><button class="btn btn-teal btn-sm" data-cookie="all">Accept</button><button class="btn btn-ghost btn-sm" data-cookie="essential">Essential only</button></div></div>
${page.path.startsWith('/match') ? '' : `<div class="leadbar" id="leadbar" role="complementary"><div><strong>Free NCLEX checklist pack</strong><br>8-week plan, test-day checklist & weak-area tracker. <a href="/match/#planner">Get it free →</a></div><button id="leadbarClose" aria-label="Dismiss">×</button></div>`}
<script src="/assets/js/app.js?v=${buildDate.slice(0, 10)}" defer></script>
${page.scripts || ''}
</body>
</html>`;
}

function footer(cfg, buildDate) {
  const d = new Date(buildDate).toUTCString().replace(/:\d\d GMT/, ' UTC');
  return `<footer class="site-foot"><div class="wrap">
<div class="foot-grid">
<div><a class="logo" href="/">${logoMark}<span>Nurse<b>Now</b></span></a>
<p style="margin-top:14px;max-width:34ch">Jobs, licensing, NCLEX prep and free career tools for nurses — refreshed every day.</p>
<form class="js-form nl" data-subject="Newsletter signup" data-ok="You're in — watch your inbox for the weekly brief."><input class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="hide" for="nl-email">Email</label><input id="nl-email" type="email" name="email" placeholder="Email for the weekly brief" required><input type="hidden" name="consent" value="Newsletter opt-in via footer"><button class="btn btn-primary btn-sm" type="submit">Join</button><div class="form-msg" role="status"></div></form>
<p class="updated" style="margin-top:14px;color:inherit">Last refreshed ${d}</p></div>
<div><h4>Career</h4><ul><li><a href="/jobs/">Nursing jobs</a></li><li><a href="/match/">Get matched</a></li><li><a href="/tools/resume-builder/">Resume builder</a></li><li><a href="/tools/pay-calculator/">Pay calculator</a></li><li><a href="/blog/">Career guides</a></li><li><a href="/gear/">Gear guide</a></li></ul></div>
<div><h4>Licensing & exams</h4><ul><li><a href="/nclex/">NCLEX hub</a></li><li><a href="/licensing/">Licensing guide</a></li><li><a href="/certifications/">Certifications</a></li><li><a href="/tools/license-tracker/">License tracker</a></li><li><a href="/tools/study-planner/">Study planner</a></li><li><a href="/learn/">NurseNow Academy</a></li></ul></div>
<div><h4>Community</h4><ul><li><a href="/news/">Daily news</a></li><li><a href="/videos/">Video hub</a></li><li><a href="/contests/">Contests & prizes</a></li><li><a href="/support/">Support us</a></li><li><a href="/careers/">Work with us</a></li><li><a href="/resources/">Resource directory</a></li></ul></div>
<div><h4>Company</h4><ul><li><a href="/about/">About</a></li><li><a href="/contact/">Contact</a></li><li><a href="/advertise/">Advertise</a></li><li><a href="/recruiters/">For recruiters</a></li><li><a href="/editorial-policy/">Editorial policy</a></li><li><a href="${cfg.brokerUrl}" target="_blank" rel="noopener">Buy / sponsor this site</a></li></ul></div>
</div>
<div class="legal">
<div><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/disclaimer/">Medical disclaimer</a> · <a href="/cookies/">Cookies</a> · <a href="/affiliate-disclosure/">Affiliate disclosure</a> · <a href="/trademark/">Trademark & copyright</a> · <a href="/sitemap.xml">Sitemap</a></div>
<div>© ${cfg.foundedYear}–<span class="year">${new Date(buildDate).getUTCFullYear()}</span> ${cfg.name}™ — a ${cfg.owner} property. All rights reserved. NurseNow™, the NurseNow logo and site content are trademarks and copyrighted works of their owner and may not be reproduced without permission. NCLEX®, NCLEX-RN® and NCLEX-PN® are registered trademarks of the National Council of State Boards of Nursing, Inc. (NCSBN); other names and marks belong to their respective owners and are used for identification only, without endorsement. NurseNow provides general educational information, not medical, legal or financial advice — always follow your regulator, employer policy and clinical judgment.</div>
</div></div></footer>`;
}

export function pageHero({ eyebrow, title, lead, crumbs, extra = '' }) {
  return `<section class="page-hero"><div class="wrap">${crumbs ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a>${crumbs.map(c => ` / ${c[1] ? `<a href="${c[1]}">${esc(c[0])}</a>` : esc(c[0])}`).join('')}</nav>` : ''}${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}<h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}${extra}</div></section>`;
}

export const honey = '<input class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">';
export const consent = (txt = 'I agree to be contacted about this request and accept the <a href="/privacy/">Privacy Policy</a>.') => `<div class="field"><label class="check"><input type="checkbox" name="consent" value="yes" required> <span>${txt}</span></label></div>`;
export const marketingOptIn = `<div class="field"><label class="check"><input type="checkbox" name="marketing_opt_in" value="yes"> <span>Yes, send me the NurseNow weekly brief (jobs, NCLEX tips, contests). Unsubscribe anytime.</span></label></div>`;
