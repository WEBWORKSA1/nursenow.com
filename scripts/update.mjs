#!/usr/bin/env node
// Daily refresh: news (Google News RSS), jobs (public job APIs), videos (YouTube channel RSS).
// Each source fails independently; if a source returns nothing, yesterday's data is kept.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, tag, attr, blocks, decode, norm, dedupe, daysAgo } from './lib/feeds.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const F = cfg.feeds;
const rd = (p, fb) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')); } catch { return fb; } };
const wr = (p, o) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(o, null, 1) + '\n');
const now = new Date().toISOString();
const log = (...a) => console.log('[update]', ...a);

/* ---------------- NEWS ---------------- */
async function news() {
  const out = [];
  for (const entry of F.newsQueries) {
    const [q, topic = 'General'] = entry.split('|');
    const ca = /canada/i.test(q);
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:7d')}&hl=${ca ? 'en-CA' : 'en-US'}&gl=${ca ? 'CA' : 'US'}&ceid=${ca ? 'CA:en' : 'US:en'}`;
    try {
      const xml = await get(url);
      for (const it of blocks(xml, 'item').slice(0, 25)) {
        const source = tag(it, 'source');
        let title = tag(it, 'title');
        if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3));
        const date = new Date(tag(it, 'pubDate')).toISOString();
        if (daysAgo(date) > 7) continue;
        out.push({ title, url: tag(it, 'link'), source, date, topic });
      }
      log(`news "${q}" ok`);
    } catch (e) { log(`news "${q}" failed: ${e.message}`); }
  }
  const items = dedupe(out.sort((a, b) => b.date.localeCompare(a.date)), i => norm(i.title).slice(0, 80))
    .filter(i => /nurs|nclex|rn\b|midwi|practitioner|hospital|health/i.test(i.title))
    .slice(0, F.maxNews);
  return items;
}

/* ---------------- JOBS ---------------- */
const isNursing = t => { const s = ' ' + String(t).toLowerCase() + ' '; return F.jobKeywords.some(k => s.includes(k)) && !/nursery|nurse shark|veterinary/i.test(s); };
const typeOf = s => { s = String(s || '').toLowerCase(); return /part/.test(s) ? 'Part-time' : /contract|temp|travel|per diem|prn/.test(s) ? 'Contract' : /full|permanent/.test(s) ? 'Full-time' : ''; };
const money = (a, b, cur = 'USD', per = 'yr') => (a || b) ? `${cur === 'USD' ? '$' : cur === 'CAD' ? 'CA$' : cur === 'GBP' ? '£' : ''}${Math.round(a || b).toLocaleString('en-US')}${b && a && b !== a ? '–' + Math.round(b).toLocaleString('en-US') : ''}/${per}` : '';
const countryOf = s => { s = String(s || ''); return (/canada|ontario|british columbia|alberta|qu[eé]bec|manitoba|saskatchewan|nova scotia|new brunswick/i.test(s) || /,\s*(ON|BC|AB|QC|MB|SK|NS|NB|NL|PE)\b/.test(s)) ? 'ca' : /united kingdom|england|scotland|\bUK\b/i.test(s) ? 'gb' : (/usa|united states/i.test(s) || /,\s*[A-Z]{2}\b/.test(s)) ? 'us' : ''; };

async function jobicy() {
  const res = [];
  for (const u of ['https://jobicy.com/api/v2/remote-jobs?count=100&industry=healthcare', 'https://jobicy.com/api/v2/remote-jobs?count=50&tag=nurse']) {
    try {
      const j = await get(u, { json: true });
      for (const x of j.jobs || []) {
        if (!isNursing(x.jobTitle)) continue;
        res.push({ id: 'jobicy-' + x.id, title: decode(x.jobTitle), company: decode(x.companyName), location: decode(x.jobGeo || 'Remote'), type: typeOf([].concat(x.jobType || []).join(' ')) || 'Full-time', remote: true, country: countryOf(x.jobGeo || '') || 'remote', url: x.url, source: 'Jobicy', date: new Date(x.pubDate).toISOString(), salary: money(x.annualSalaryMin, x.annualSalaryMax, x.salaryCurrency) });
      }
      log(`jobicy ok (${u.split('?')[1]})`);
    } catch (e) { log('jobicy failed:', e.message); }
  }
  return res;
}

async function muse() {
  const res = [];
  for (let page = 1; page <= 8; page++) {
    try {
      const j = await get(`https://www.themuse.com/api/public/jobs?category=Healthcare&page=${page}`, { json: true });
      for (const x of j.results || []) {
        if (!isNursing(x.name)) continue;
        const loc = (x.locations || []).map(l => l.name).join(' / ') || 'See posting';
        res.push({ id: 'muse-' + x.id, title: decode(x.name), company: decode(x.company?.name), location: loc, type: 'Full-time', remote: /remote|flexible/i.test(loc), country: countryOf(loc) || 'us', url: x.refs?.landing_page, source: 'The Muse', date: new Date(x.publication_date).toISOString(), salary: '' });
      }
      if (page >= (j.page_count || 1)) break;
    } catch (e) { log(`muse page ${page} failed:`, e.message); break; }
  }
  log(`muse ok (${res.length})`);
  return res;
}

async function adzuna() {
  const id = process.env.ADZUNA_APP_ID, key = process.env.ADZUNA_APP_KEY;
  if (!id || !key) { log('adzuna skipped (no ADZUNA_APP_ID/ADZUNA_APP_KEY secrets)'); return []; }
  const res = [];
  for (const [cc, cur] of [['us', 'USD'], ['ca', 'CAD'], ['gb', 'GBP']]) {
    for (const what of ['registered nurse', 'nurse practitioner', 'licensed practical nurse']) {
      try {
        const j = await get(`https://api.adzuna.com/v1/api/jobs/${cc}/search/1?app_id=${id}&app_key=${key}&results_per_page=30&max_days_old=14&sort_by=date&what=${encodeURIComponent(what)}&content-type=application/json`, { json: true });
        for (const x of j.results || []) {
          res.push({ id: 'adzuna-' + x.id, title: decode(x.title), company: decode(x.company?.display_name), location: decode(x.location?.display_name), type: typeOf(`${x.contract_time} ${x.contract_type}`) || 'Full-time', remote: /remote/i.test(x.title), country: cc, url: x.redirect_url, source: 'Adzuna', date: new Date(x.created).toISOString(), salary: x.salary_is_predicted === '1' ? '' : money(x.salary_min, x.salary_max, cur) });
        }
      } catch (e) { log(`adzuna ${cc} "${what}" failed:`, e.message); }
    }
  }
  log(`adzuna ok (${res.length})`);
  return res;
}

async function usajobs() {
  const key = process.env.USAJOBS_API_KEY, email = process.env.USAJOBS_EMAIL;
  if (!key || !email) { log('usajobs skipped (no USAJOBS_API_KEY/USAJOBS_EMAIL secrets)'); return []; }
  try {
    const j = await get('https://data.usajobs.gov/api/search?Keyword=nurse&ResultsPerPage=60&DatePosted=14', { json: true, headers: { Host: 'data.usajobs.gov', 'User-Agent': email, 'Authorization-Key': key } });
    const res = (j.SearchResult?.SearchResultItems || []).map(i => i.MatchedObjectDescriptor).filter(d => isNursing(d.PositionTitle)).map(d => {
      const pay = (d.PositionRemuneration || [])[0] || {};
      return { id: 'usaj-' + d.PositionID, title: d.PositionTitle, company: d.OrganizationName, location: d.PositionLocationDisplay, type: typeOf((d.PositionSchedule || []).map(s => s.Name).join(' ')) || 'Full-time', remote: /remote|anywhere/i.test(d.PositionLocationDisplay), country: 'us', url: d.PositionURI, source: 'USAJOBS', date: new Date(d.PublicationStartDate).toISOString(), salary: money(+pay.MinimumRange, +pay.MaximumRange, 'USD', pay.RateIntervalCode === 'PH' ? 'hr' : 'yr') };
    });
    log(`usajobs ok (${res.length})`);
    return res;
  } catch (e) { log('usajobs failed:', e.message); return []; }
}

async function jobs() {
  const all = (await Promise.all([jobicy(), muse(), adzuna(), usajobs()])).flat().filter(j => j.url && j.title && daysAgo(j.date) <= 30);
  return dedupe(all.sort((a, b) => b.date.localeCompare(a.date)), j => norm(j.title + ' ' + j.company + ' ' + j.location)).slice(0, F.maxJobs);
}

/* ---------------- VIDEOS ---------------- */
async function videos() {
  const cache = rd('data/channels.json', {});
  const out = [];
  for (const h of F.youtubeHandles) {
    try {
      let id = cache[h];
      if (!id) {
        const html = await get(`https://www.youtube.com/@${h}`, { headers: { Cookie: 'CONSENT=YES+1' } });
        id = (html.match(/"externalId":"(UC[\w-]{22})"/) || html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/) || html.match(/"channelId":"(UC[\w-]{22})"/) || [])[1];
        if (!id) throw new Error('channel id not found');
        cache[h] = id;
      }
      const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
      const channel = tag(xml, 'title');
      for (const e of blocks(xml, 'entry').slice(0, 8)) {
        const title = tag(e, 'title');
        if (/#shorts?\b/i.test(title)) continue;
        out.push({ id: tag(e, 'yt:videoId'), title, channel, date: tag(e, 'published') });
      }
      log(`youtube @${h} ok`);
    } catch (e) { log(`youtube @${h} failed: ${e.message}`); }
  }
  wr('data/channels.json', cache);
  const pinned = (rd('data/videos.json', { items: [] }).items || []).filter(v => /Bureau of Labor Statistics/.test(v.channel || ''));
  const recent = dedupe(out.sort((a, b) => String(b.date).localeCompare(String(a.date))), v => v.id).slice(0, F.maxVideos);
  return recent.length ? [...recent, ...pinned] : [];
}

/* ---------------- RUN ---------------- */
const tasks = [['data/news.json', news], ['data/jobs.json', jobs], ['data/videos.json', videos]];
for (const [file, fn] of tasks) {
  try {
    const items = await fn();
    if (items.length) { wr(file, { updated: now, items }); log(`${file}: ${items.length} items`); }
    else log(`${file}: no fresh items — keeping previous data`);
  } catch (e) { log(`${file} task error: ${e.message}`); }
}
