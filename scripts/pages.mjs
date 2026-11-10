// Page definitions for NurseNow. Each page is { path, title, description, body, ... }.
// Pages live in scripts/pages/*.mjs; this file wires them together.
import { fmtDate } from './pages/shared.mjs';
import p1 from './pages/p1-home-jobs.mjs';
import p2 from './pages/p2-recruit-match-nclex.mjs';
import p3 from './pages/p3-licensing-learn.mjs';
import p4 from './pages/p4-tools.mjs';
import p5 from './pages/p5-feeds-directory-support.mjs';
import p6 from './pages/p6-community-legal.mjs';

export function buildPages(ctx) {
  const { cfg, buildDate, articles, articleCard } = ctx;
  const P = cfg.payments, $ = cfg.pricing;
  const today = fmtDate(buildDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const jobsAll = [...ctx.featuredJobs.filter(j => !j.expires || new Date(j.expires) > new Date(buildDate)).map(j => ({ ...j, featured: true })), ...ctx.jobs.items];
  const qbank = `<script type="application/json" id="qbank">${JSON.stringify(ctx.nclex).replace(/</g, '\\u003c')}</script>`;
  const pages = [];
  const add = p => pages.push(p);
  const toolsJs = `<script src="/assets/js/tools.js?v=${buildDate.slice(0, 10)}" defer></script>`;
  const h = { cfg, buildDate, articles, articleCard, P, $, today, jobsAll, qbank, add, toolsJs };
  [p1, p2, p3, p4, p5, p6].forEach(part => part(ctx, h));
  return pages;
}
