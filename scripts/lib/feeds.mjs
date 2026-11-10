// Tiny fetch + XML helpers for the daily refresh (Node 18+, no dependencies).
export const UA = 'NurseNowBot/1.0 (+https://nursenow.com/about/)';

export async function get(url, { headers = {}, timeout = 20000, json = false } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en', ...headers }, signal: ctl.signal, redirect: 'follow' });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
    return json ? await r.json() : await r.text();
  } finally { clearTimeout(t); }
}

export const decode = s => String(s || '')
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&amp;/g, '&').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

export const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i')); return m ? decode(m[1]) : ''; };
export const attr = (xml, name, a) => { const m = xml.match(new RegExp(`<${name}[^>]*\\s${a}="([^"]*)"`, 'i')); return m ? m[1] : ''; };
export const blocks = (xml, name) => xml.match(new RegExp(`<${name}[\\s>][\\s\\S]*?</${name}>`, 'gi')) || [];

export const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function dedupe(items, keyFn) { const seen = new Set(); return items.filter(i => { const k = keyFn(i); if (!k || seen.has(k)) return false; seen.add(k); return true; }); }
export const daysAgo = d => (Date.now() - new Date(d).getTime()) / 864e5;
