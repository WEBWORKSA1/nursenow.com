// Minimal, dependency-free Markdown -> HTML for NurseNow articles.
// Supports: front matter, headings (with ids), paragraphs, lists, ordered lists,
// blockquotes, tables, hr, bold, italic, inline code, links, and shortcodes:
//   [[cta:match]] [[cta:nclex]] [[cta:jobs]] [[cta:support]] [[ad]] [[toc]]

export function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
}

export function frontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: src };
  const data = {};
  let key = null;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      let v = kv[2].trim();
      if (v === '') { data[key] = []; continue; }
      if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      else v = v.replace(/^["']|["']$/g, '');
      if (v === 'true') v = true; if (v === 'false') v = false;
      data[key] = v;
    } else if (/^\s+-\s+/.test(line) && key) {
      if (!Array.isArray(data[key])) data[key] = [];
      data[key].push(line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, ''));
    }
  }
  return { data, body: src.slice(m[0].length) };
}

function inline(t) {
  let s = esc(t);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, href) => {
    const ext = /^https?:\/\//.test(href) && !href.includes('nursenow.com');
    return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${txt}</a>`;
  });
  return s;
}

export function markdown(md, { shortcodes = {} } = {}) {
  const lines = md.replace(/\r/g, '').split('\n');
  const out = [];
  const toc = [];
  let i = 0;
  const para = [];
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para.length = 0; } };
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) { flush(); i++; continue; }
    const sc = line.trim().match(/^\[\[([a-z]+)(?::([a-z0-9-]+))?\]\]$/);
    if (sc) { flush(); const fn = shortcodes[sc[1]]; out.push(fn ? fn(sc[2]) : ''); if (sc[1] === 'toc') out.push('%%TOC%%'); i++; continue; }
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      flush();
      const lvl = h[1].length; const id = slugify(h[2]);
      if (lvl === 2) toc.push({ id, text: h[2] });
      out.push(`<h${lvl} id="${id}">${inline(h[2])}</h${lvl}>`); i++; continue;
    }
    if (/^---+\s*$/.test(line)) { flush(); out.push('<hr>'); i++; continue; }
    if (/^>\s?/.test(line)) {
      flush(); const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(`<blockquote><p>${inline(q.join(' '))}</p></blockquote>`); continue;
    }
    if (/^\|/.test(line)) {
      flush(); const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push(`<div class="table-wrap"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      flush(); const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      out.push(`<ul>${items.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`); continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      flush(); const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+[.)]\s+/, '')); i++; }
      out.push(`<ol>${items.map(x => `<li>${inline(x)}</li>`).join('')}</ol>`); continue;
    }
    para.push(line.trim()); i++;
  }
  flush();
  let html = out.join('\n');
  const tocHtml = toc.length > 2 ? `<nav class="toc" aria-label="On this page"><strong>On this page</strong><ol>${toc.map(t => `<li><a href="#${t.id}">${inline(t.text)}</a></li>`).join('')}</ol></nav>` : '';
  html = html.replace('%%TOC%%', tocHtml);
  const words = md.replace(/[#>*|`\[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return { html, toc, words };
}
