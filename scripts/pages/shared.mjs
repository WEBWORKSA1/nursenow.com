// Shared helpers for NurseNow page modules.
import { esc } from '../lib/md.mjs';
import { icon, ctas, adUnit, pageHero, honey, consent, marketingOptIn } from '../lib/ui.mjs';

export const fmtDate = (iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-US', opts); };
export const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
export const initials = s => String(s || '?').replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'RN';
export const faqBlock = items => `<div class="grid" style="gap:10px">${items.map(([q, a]) => `<details class="card"><summary style="cursor:pointer;font-weight:600">${q}</summary><p style="margin:.7em 0 0">${a}</p></details>`).join('')}</div>`;
export const faqLd = items => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });

export function jobRow(j, featured) {
  const meta = [j.company, j.location, j.type, j.salary, j.source ? `via ${j.source}` : ''].filter(Boolean).map(esc).map(x => `<span>${x}</span>`).join('');
  return `<div class="job${featured ? ' featured' : ''}" data-item data-type="${esc((j.type || '').toLowerCase())}" data-region="${esc((j.country || '').toLowerCase())}${j.remote ? ' remote' : ''}"><div class="co" aria-hidden="true">${initials(j.company)}</div><div><h3>${featured ? '<span class="badge sun">Featured</span> ' : ''}${esc(j.title)}</h3><div class="meta">${meta}${j.date ? `<span><time datetime="${j.date}" data-rel>${fmtDate(j.date)}</time></span>` : ''}</div></div><a class="btn btn-teal btn-sm" href="${esc(j.url)}" target="_blank" rel="noopener nofollow sponsored">Apply ↗</a></div>`;
}
export const newsRow = n => `<div class="news-item" data-item data-cat="${esc(n.topic || 'general')}"><time datetime="${n.date}">${fmtDate(n.date, { month: 'short', day: 'numeric' })}</time><div><a href="${esc(n.url)}" target="_blank" rel="noopener nofollow">${esc(n.title)}</a><div class="src">${esc(n.source || '')}${n.topic ? ` · ${esc(n.topic)}` : ''}</div></div></div>`;
export const cleanTitle = t => String(t || '').replace(/(^|\s)#[\p{L}\p{N}_]+/gu, ' ').replace(/\s{2,}/g, ' ').replace(/[\s|•·–-]+$/, '').trim();
export const videoCard = v => `<div class="vcard" data-item data-cat="${esc(v.channel || '')}"><div class="video" data-yt="${esc(v.id)}" data-title="${esc(cleanTitle(v.title))}"></div><h3>${esc(cleanTitle(v.title))}</h3><span class="muted" style="font-size:.85rem">${esc(v.channel || 'YouTube')}${v.date ? ' · ' + fmtDate(v.date) : ''}</span></div>`;


export function toolsList() {
  return [
    { i: 'dollar', t: 'Pay & offer calculator', d: 'Differentials, overtime and certification premiums — plus side-by-side offer comparison.', h: '/tools/pay-calculator/', c: 'sun' },
    { i: 'file', t: 'Resume builder', d: 'ATS-friendly nursing resume with specialty keywords. Print to PDF.', h: '/tools/resume-builder/' },
    { i: 'calendar', t: 'Shift planner', d: '4-week schedule, pay estimate, rest warnings and calendar export.', h: '/tools/shift-planner/', c: 'coral' },
    { i: 'drop', t: 'IV drip calculator', d: 'gtt/min, mL/hr, weight-based infusions and desired-over-have.', h: '/tools/drip-calculator/' },
    { i: 'id', t: 'License & cert tracker', d: 'Expiry countdowns, CE hours and calendar reminders.', h: '/tools/license-tracker/', c: 'sun' },
    { i: 'target', t: 'NCLEX study planner', d: 'A week-by-week plan from your exam date and weak areas.', h: '/tools/study-planner/', c: 'coral' }
  ];
}
