#!/usr/bin/env node
// NurseNow static site generator. Zero dependencies. Output: docs/
// Usage: node scripts/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdown, frontMatter, esc } from './lib/md.mjs';
import { shell, ctas, adUnit } from './lib/ui.mjs';
import { buildPages } from './pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs');
const rd = (p, fb) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')); } catch { return fb; } };
const cfg = rd('site.config.json');
const buildDate = new Date().toISOString();

// ---------- load content + data ----------
const ctx = {
  cfg, buildDate,
  resources: rd('content/resources.json', []),
  nclex: rd('content/nclex.json', []),
  certs: rd('content/certifications.json', []),
  careers: rd('content/careers.json', []),
  contests: rd('content/contests.json', []),
  gear: rd('content/gear.json', []),
  featuredJobs: rd('content/jobs-featured.json', []),
  courses: rd('content/courses.json', []),
  news: rd('data/news.json', { updated: null, items: [] }),
  jobs: rd('data/jobs.json', { updated: null, items: [] }),
  videos: rd('data/videos.json', { updated: null, items: [] }),
  articles: []
};

const shortcodes = { cta: k => (ctas[k] ? ctas[k]() : ''), ad: () => adUnit(cfg, 'inArticle'), toc: () => '' };
const artDir = path.join(ROOT, 'content/articles');
for (const f of fs.readdirSync(artDir).filter(f => f.endsWith('.md')).sort()) {
  const { data, body } = frontMatter(fs.readFileSync(path.join(artDir, f), 'utf8'));
  if (data.draft === true) continue;
  const { html, words } = markdown(body, { shortcodes });
  ctx.articles.push({ ...data, slug: data.slug || f.replace(/\.md$/, ''), html, words, body, readMin: Math.max(3, Math.round(words / 230)) });
}
ctx.articles.sort((a, b) => String(b.updated || b.date).localeCompare(String(a.updated || a.date)));

// ---------- article pages ----------
function faqLd(body) {
  const m = body.split(/\n## Frequently asked questions\n/)[1];
  if (!m) return null;
  const qs = m.split(/\n### /).slice(1).map(blk => { const [q, ...rest] = blk.split('\n'); return { '@type': 'Question', name: q.trim(), acceptedAnswer: { '@type': 'Answer', text: rest.join(' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`#>]/g, '').trim() } }; }).filter(q => q.acceptedAnswer.text);
  return qs.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qs } : null;
}
const catName = { career: 'Career', nclex: 'NCLEX', licensing: 'Licensing', money: 'Money', wellbeing: 'Wellbeing', jobs: 'Jobs', tech: 'AI & tech', gear: 'Gear' };
const articlePages = ctx.articles.map(a => {
  const related = ctx.articles.filter(x => x.slug !== a.slug && (x.category === a.category || (x.tags || []).some(t => (a.tags || []).includes(t)))).slice(0, 3);
  const sources = (a.sources || []).map(s => { const [t, u] = s.split('|').map(x => x.trim()); return `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`; }).join('');
  const updated = a.updated || a.date;
  const ld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description, datePublished: a.date, dateModified: updated, author: { '@type': 'Organization', name: 'NurseNow Editorial Team', url: cfg.url + '/editorial-policy/' }, publisher: { '@type': 'Organization', name: cfg.name, logo: { '@type': 'ImageObject', url: cfg.url + '/assets/img/logo-512.png' } }, mainEntityOfPage: cfg.url + '/blog/' + a.slug + '/', image: cfg.url + '/assets/img/og.png', wordCount: a.words }];
  const fq = faqLd(a.body); if (fq) ld.push(fq);
  const body = `<section class="page-hero"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog/">Guides</a> / ${esc(catName[a.category] || 'Guide')}</nav><span class="eyebrow">${esc(catName[a.category] || 'Guide')}</span><h1 style="max-width:24ch">${esc(a.title)}</h1><p class="lead">${esc(a.description)}</p>
<div class="byline"><span>By <a href="/editorial-policy/">NurseNow Editorial Team</a></span><span>Updated <time datetime="${updated}">${new Date(updated + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time></span><span>${a.readMin} min read</span></div></div></section>
<section style="padding-top:36px"><div class="wrap article-grid"><article class="prose">${a.html}
${sources ? `<h2 id="sources">Sources & further reading</h2><ul>${sources}</ul>` : ''}
<div class="note">This guide is general education, not individual medical, legal, immigration, tax or financial advice. Requirements change — confirm with your regulator, employer or a licensed professional. Spotted an error? <a href="/contact/?topic=Correction">Send a correction</a>. Read our <a href="/editorial-policy/">editorial policy</a>.</div>
<div class="share no-print" style="margin-top:18px"><button class="btn btn-ghost btn-sm" data-share="copy">Copy link</button><a class="btn btn-ghost btn-sm" href="#" data-share="x">Share on X</a><a class="btn btn-ghost btn-sm" href="#" data-share="facebook">Facebook</a><a class="btn btn-ghost btn-sm" href="#" data-share="linkedin">LinkedIn</a><a class="btn btn-ghost btn-sm" href="#" data-share="whatsapp">WhatsApp</a></div>
</article>
<aside class="aside-stick no-print">${ctas.match()}${adUnit(cfg, 'sidebar')}<div class="card"><h3>Free nurse tools</h3><p>Pay calculator, resume builder, shift planner, drip calculator and license tracker.</p><a class="more" href="/tools/">Open the toolkit →</a></div></aside></div></section>
${related.length ? `<section class="band" style="padding:44px 0"><div class="wrap"><h2>Keep reading</h2><div class="grid g3">${related.map(r => articleCard(r)).join('')}</div></div></section>` : ''}`;
  return { path: `/blog/${a.slug}/index.html`, title: a.title, description: a.description, body, ld, ogType: 'article', crumbs: [['Guides', '/blog/'], [a.title, `/blog/${a.slug}/`]], lastmod: updated };
});

export function articleCard(a) {
  return `<article class="card link" data-item data-cat="${esc(a.category)}"><span class="badge">${esc(catName[a.category] || 'Guide')}</span><h3 style="margin-top:12px"><a class="stretch" href="/blog/${a.slug}/" style="color:inherit;text-decoration:none">${esc(a.title)}</a></h3><p>${esc(a.description)}</p><span class="muted mono" style="font-size:.78rem">${a.readMin} min read</span></article>`;
}
ctx.articleCard = articleCard; ctx.catName = catName;

// ---------- static pages ----------
const pages = [...buildPages(ctx), ...articlePages];

// ---------- write ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const write = (p, s) => { const fp = path.join(OUT, p); fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, s); };
for (const p of pages) write(p.path, shell(cfg, p, { buildDate }));

// assets
const copyDir = (src, dst) => { fs.mkdirSync(dst, { recursive: true }); for (const f of fs.readdirSync(src)) { const s = path.join(src, f), d = path.join(dst, f); fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d); } };
copyDir(path.join(ROOT, 'src/css'), path.join(OUT, 'assets/css'));
copyDir(path.join(ROOT, 'src/js'), path.join(OUT, 'assets/js'));
copyDir(path.join(ROOT, 'src/img'), path.join(OUT, 'assets/img'));

// sitemap (only indexable pages)
const urls = pages.filter(p => !p.noindex && p.path !== '/404.html').map(p => ({ loc: cfg.url + p.path.replace(/index\.html$/, ''), lastmod: (p.lastmod || buildDate).slice(0, 10), pr: p.path === '/' ? '1.0' : p.path.startsWith('/blog/') ? '0.7' : '0.8' }));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pr}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /404.html\n\nUser-agent: Mediapartners-Google\nAllow: /\n\nSitemap: ${cfg.url}/sitemap.xml\n`);
write('ads.txt', `google.com, ${cfg.adsense.publisherId}, DIRECT, f08c47fec0942fa0\n`);
write('CNAME', cfg.domain + '\n');
write('.nojekyll', '');
write('manifest.webmanifest', JSON.stringify({ name: cfg.name, short_name: cfg.name, start_url: '/', display: 'standalone', background_color: '#FBF8F2', theme_color: cfg.themeColor, icons: [{ src: '/assets/img/logo-512.png', sizes: '512x512', type: 'image/png' }, { src: '/assets/img/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }, null, 2));
write('rss.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>NurseNow guides</title><link>${cfg.url}/blog/</link><description>${esc(cfg.description)}</description><lastBuildDate>${new Date(buildDate).toUTCString()}</lastBuildDate>\n${ctx.articles.map(a => `<item><title>${esc(a.title)}</title><link>${cfg.url}/blog/${a.slug}/</link><guid>${cfg.url}/blog/${a.slug}/</guid><pubDate>${new Date((a.date) + 'T12:00:00Z').toUTCString()}</pubDate><description>${esc(a.description)}</description></item>`).join('\n')}\n</channel></rss>\n`);
write('feed.json', JSON.stringify({ version: 'https://jsonfeed.org/version/1.1', title: 'NurseNow', home_page_url: cfg.url, feed_url: cfg.url + '/feed.json', items: ctx.articles.map(a => ({ id: cfg.url + '/blog/' + a.slug + '/', url: cfg.url + '/blog/' + a.slug + '/', title: a.title, summary: a.description, date_published: a.date + 'T12:00:00Z', date_modified: (a.updated || a.date) + 'T12:00:00Z' })) }, null, 1));

console.log(`Built ${pages.length} pages (${ctx.articles.length} articles, ${ctx.jobs.items.length} jobs, ${ctx.news.items.length} news, ${ctx.videos.items.length} videos) → docs/`);
