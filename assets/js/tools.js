/* NurseNow — free tools (runs only on tool pages) */
(function () {
  'use strict';
  var $ = NN.$, $$ = NN.$$, store = NN.store;
  function num(id) { var el = document.getElementById(id); return el ? parseFloat(el.value) || 0 : 0; }
  function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }
  function cur() { var c = val('cur') || '$'; return c; }
  function money(n, d) { return cur() + (Math.round(n * (d ? 100 : 1)) / (d ? 100 : 1)).toLocaleString(undefined, { minimumFractionDigits: d ? 2 : 0, maximumFractionDigits: d ? 2 : 0 }); }
  function bind(ids, fn) { ids.forEach(function (id) { var el = document.getElementById(id); if (el) { el.addEventListener('input', fn); el.addEventListener('change', fn); } }); fn(); }
  function set(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function persist(ids, key) {
    var saved = {}; try { saved = JSON.parse(store(key) || '{}'); } catch (e) {}
    ids.forEach(function (id) { var el = document.getElementById(id); if (!el) return; if (saved[id] !== undefined) el.value = saved[id]; el.addEventListener('input', function () { saved[id] = el.value; store(key, JSON.stringify(saved)); }); });
  }
  function ics(events, name) {
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var fmt = function (d) { return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'; };
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NurseNow//Tools//EN', 'CALSCALE:GREGORIAN'];
    events.forEach(function (e, i) { lines.push('BEGIN:VEVENT', 'UID:' + Date.now() + '-' + i + '@nursenow.com', 'DTSTAMP:' + fmt(new Date()), 'DTSTART:' + fmt(e.start), 'DTEND:' + fmt(e.end), 'SUMMARY:' + e.title.replace(/[,;]/g, ' '), 'END:VEVENT'); });
    lines.push('END:VCALENDAR');
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- 1. Pay calculator ---------- */
  if ($('#t-pay')) {
    var payIds = ['cur', 'p-base', 'p-hours', 'p-night', 'p-ndiff', 'p-wkend', 'p-wdiff', 'p-ot', 'p-otx', 'p-cert', 'p-weeks'];
    persist(payIds, 'nn-pay');
    bind(payIds, function () {
      var base = num('p-base'), hrs = num('p-hours'), ot = num('p-ot'), otx = num('p-otx') || 1.5, cert = num('p-cert');
      var nightH = hrs * num('p-night') / 100, wkH = num('p-wkend');
      var reg = hrs * (base + cert);
      var diffs = nightH * num('p-ndiff') + wkH * num('p-wdiff');
      var otPay = ot * (base + cert) * otx;
      var week = reg + diffs + otPay, weeks = num('p-weeks') || 52;
      set('pay-week', money(week)); set('pay-year', money(week * weeks)); set('pay-month', money(week * weeks / 12));
      set('pay-eff', money(week / Math.max(1, hrs + ot), true) + '/hr');
      set('pay-diffs', money(diffs * weeks)); set('pay-ot', money(otPay * weeks));
      var m = $('#pay-meter'); if (m) m.style.width = Math.min(100, (diffs + otPay) / Math.max(1, week) * 300) + '%';
    });
    var offIds = ['a-rate', 'a-hrs', 'a-stip', 'a-bonus', 'a-wks', 'b-rate', 'b-hrs', 'b-stip', 'b-bonus', 'b-wks'];
    persist(offIds, 'nn-offers');
    bind(offIds, function () {
      function calc(p) { var w = num(p + '-rate') * num(p + '-hrs') + num(p + '-stip'); var wks = num(p + '-wks') || 13; return { week: w + num(p + '-bonus') / wks, total: w * wks + num(p + '-bonus') }; }
      var A = calc('a'), B = calc('b');
      set('off-a', money(A.week) + '/wk · ' + money(A.total) + ' total'); set('off-b', money(B.week) + '/wk · ' + money(B.total) + ' total');
      var d = A.week - B.week;
      set('off-win', d === 0 ? 'Offers are equal per week' : (d > 0 ? 'Offer A' : 'Offer B') + ' pays ' + money(Math.abs(d)) + ' more per week');
    });
  }

  /* ---------- 2. Resume builder ---------- */
  if ($('#t-resume')) {
    var rIds = ['r-name', 'r-cred', 'r-city', 'r-phone', 'r-email', 'r-link', 'r-summary', 'r-lic', 'r-certs', 'r-exp', 'r-edu', 'r-skills', 'r-spec'];
    persist(rIds, 'nn-resume');
    var kw = {
      'Med-Surg': ['Telemetry monitoring', 'Post-operative care', 'Wound care', 'Medication administration', 'Patient education', 'Fall prevention', 'Epic charting'],
      'ICU / Critical Care': ['Ventilator management', 'Titratable vasoactive drips', 'Arterial lines', 'CRRT', 'Sepsis bundles', 'ACLS', 'Hemodynamic monitoring'],
      'Emergency': ['Triage (ESI)', 'Trauma response', 'Rapid assessment', 'Stroke and STEMI protocols', 'TNCC', 'PALS', 'Conscious sedation'],
      'Long-Term Care': ['Charge nurse leadership', 'Dementia care', 'Care planning (MDS/RAI)', 'Medication pass', 'Palliative care', 'Infection prevention', 'Family communication'],
      'Pediatrics / NICU': ['Weight-based dosing', 'Family-centred care', 'Developmental assessment', 'NRP', 'PALS', 'Neonatal thermoregulation'],
      'Labor & Delivery': ['Fetal heart monitoring', 'Postpartum assessment', 'Neonatal resuscitation (NRP)', 'Epidural care', 'Obstetric hemorrhage protocols'],
      'Mental Health': ['De-escalation', 'Suicide risk assessment', 'Therapeutic communication', 'Crisis intervention', 'Psychotropic medication monitoring'],
      'Operating Room': ['Circulating', 'Scrubbing', 'Sterile technique', 'Surgical counts', 'Patient positioning', 'Time-out procedures']
    };
    function lines(s) { return String(s || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean); }
    function renderResume() {
      var exp = String(val('r-exp') || '').split(/\n\s*\n/).map(function (block) {
        var ls = lines(block); if (!ls.length) return '';
        var head = ls[0].split('|').map(function (x) { return x.trim(); });
        return '<p><strong>' + esc(head[0] || '') + '</strong>' + (head[1] ? ' — ' + esc(head[1]) : '') + (head[2] ? '<span style="float:right">' + esc(head[2]) + '</span>' : '') + '</p><ul>' + ls.slice(1).map(function (b) { return '<li>' + esc(b.replace(/^[-•*]\s*/, '')) + '</li>'; }).join('') + '</ul>';
      }).join('');
      var contact = [val('r-city'), val('r-phone'), val('r-email'), val('r-link')].filter(Boolean).map(esc).join(' · ');
      var sec = function (t, html) { return html ? '<h4>' + t + '</h4>' + html : ''; };
      var list = function (id) { var l = lines(val(id)); return l.length ? '<ul>' + l.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; };
      $('#resumeOut').innerHTML = '<h2>' + esc(val('r-name') || 'Your Name') + (val('r-cred') ? ', ' + esc(val('r-cred')) : '') + '</h2><p style="color:#444">' + (contact || 'City · Phone · Email') + '</p>' +
        sec('Professional summary', val('r-summary') ? '<p>' + esc(val('r-summary')) + '</p>' : '') +
        sec('Licenses', list('r-lic')) + sec('Certifications', list('r-certs')) + sec('Clinical experience', exp) + sec('Education', list('r-edu')) +
        sec('Skills', val('r-skills') ? '<p>' + esc(val('r-skills')) + '</p>' : '');
      var words = ($('#resumeOut').textContent || '').split(/\s+/).filter(Boolean).length;
      set('r-count', words + ' words');
    }
    bind(rIds, renderResume);
    function showKw() {
      var box = $('#r-kw'); var list = kw[val('r-spec')] || [];
      box.innerHTML = list.map(function (k) { return '<button type="button" class="chip">+ ' + esc(k) + '</button>'; }).join('');
      $$('button', box).forEach(function (b) { b.onclick = function () { var s = $('#r-skills'); var t = b.textContent.slice(2); if (s.value.indexOf(t) === -1) { s.value = (s.value ? s.value.replace(/[,\s]+$/, '') + ', ' : '') + t; s.dispatchEvent(new Event('input')); } b.classList.add('on'); }; });
    }
    $('#r-spec').addEventListener('change', showKw); showKw();
    $('#r-print').onclick = function () { window.print(); };
    $('#r-copy').onclick = function () { try { navigator.clipboard.writeText($('#resumeOut').innerText); this.textContent = 'Copied ✓'; } catch (e) {} };
    $('#r-clear').onclick = function () { if (confirm('Clear every field?')) { rIds.forEach(function (id) { var el = document.getElementById(id); if (el && el.tagName !== 'SELECT') el.value = ''; }); store('nn-resume', '{}'); renderResume(); } };
  }

  /* ---------- 3. Shift planner ---------- */
  if ($('#t-shift')) {
    var cycle = ['O', 'D', 'E', 'N'], names = { O: 'Off', D: 'Day', E: 'Eve', N: 'Night' };
    var plan = {}; try { plan = JSON.parse(store('nn-shifts') || '{}'); } catch (e) {}
    var sd = $('#s-start');
    if (!sd.value) { var t = new Date(); t.setDate(t.getDate() - t.getDay()); sd.value = t.toISOString().slice(0, 10); }
    persist(['s-len', 's-rate', 's-nd', 's-dstart', 's-estart', 's-nstart'], 'nn-shift-set');
    function key(d) { return d.toISOString().slice(0, 10); }
    function draw() {
      var g = $('#planGrid'), start = new Date(sd.value + 'T00:00:00'); if (isNaN(start)) return;
      var html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(function (d, i) { var dd = new Date(start); dd.setDate(start.getDate() + i); return '<div class="dname">' + dd.toLocaleDateString(undefined, { weekday: 'short' }) + '</div>'; }).join('');
      var hours = 0, shifts = 0, nights = 0, run = 0, maxRun = 0, warn = [];
      for (var i = 0; i < 28; i++) {
        var d = new Date(start); d.setDate(start.getDate() + i); var k = key(d), s = plan[k] || 'O';
        if (s !== 'O') { shifts++; hours += num('s-len'); run++; maxRun = Math.max(maxRun, run); if (s === 'N') nights++; } else run = 0;
        var prev = new Date(d); prev.setDate(d.getDate() - 1);
        if (s === 'D' && plan[key(prev)] === 'N') warn.push(d.toLocaleDateString() + ': day shift right after a night — under 12h rest');
        html += '<div class="pday" data-k="' + k + '" title="Click to change"><span class="d">' + d.getDate() + '</span><span class="s s-' + s + '">' + names[s] + '</span></div>';
      }
      g.innerHTML = html;
      $$('.pday', g).forEach(function (c) { c.onclick = function () { var k = c.getAttribute('data-k'); var cu = plan[k] || 'O'; plan[k] = cycle[(cycle.indexOf(cu) + 1) % cycle.length]; if (plan[k] === 'O') delete plan[k]; store('nn-shifts', JSON.stringify(plan)); draw(); }; });
      var pay = hours * num('s-rate') + nights * num('s-len') * num('s-nd');
      set('sh-hours', hours + ' h'); set('sh-shifts', shifts); set('sh-nights', nights); set('sh-avg', (hours / 4).toFixed(1) + ' h/wk'); set('sh-pay', money(pay));
      if (maxRun >= 4) warn.push(maxRun + ' shifts in a row — fatigue risk rises sharply after 3 consecutive 12-hour shifts');
      $('#sh-warn').innerHTML = warn.length ? warn.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') : '<li>No rest-time conflicts detected.</li>';
    }
    ['s-start', 's-len', 's-rate', 's-nd'].forEach(function (id) { $('#' + id).addEventListener('input', draw); });
    $('#s-clear').onclick = function () { if (confirm('Clear all shifts?')) { plan = {}; store('nn-shifts', '{}'); draw(); } };
    $('#s-fill').onclick = function () { var start = new Date(sd.value + 'T00:00:00'); var pat = val('s-pattern').split(''); for (var i = 0; i < 28; i++) { var d = new Date(start); d.setDate(start.getDate() + i); var s = pat[i % pat.length]; if (s && s !== 'O') plan[key(d)] = s; else delete plan[key(d)]; } store('nn-shifts', JSON.stringify(plan)); draw(); };
    $('#s-ics').onclick = function () {
      var ev = []; var len = num('s-len') || 12; var st = { D: val('s-dstart') || '07:00', E: val('s-estart') || '15:00', N: val('s-nstart') || '19:00' };
      Object.keys(plan).forEach(function (k) { var s = plan[k]; var hm = st[s].split(':'); var a = new Date(k + 'T00:00:00'); a.setHours(+hm[0], +hm[1] || 0); var b = new Date(a.getTime() + len * 36e5); ev.push({ start: a, end: b, title: names[s] + ' shift (NurseNow planner)' }); });
      if (!ev.length) { alert('Add some shifts first.'); return; } ics(ev, 'nursenow-shifts.ics');
    };
    draw();
  }

  /* ---------- 4. IV drip & dosage ---------- */
  if ($('#t-drip')) {
    bind(['g-vol', 'g-time', 'g-unit', 'g-df'], function () {
      var mins = num('g-time') * (val('g-unit') === 'h' ? 60 : 1);
      var gtt = mins ? num('g-vol') * num('g-df') / mins : 0, mlh = mins ? num('g-vol') / mins * 60 : 0;
      set('g-out', mins ? Math.round(gtt) + ' gtt/min' : '—'); set('g-mlh', mins ? mlh.toFixed(1) + ' mL/hr' : '—'); set('g-exact', mins ? gtt.toFixed(2) + ' gtt/min (unrounded)' : '');
    });
    bind(['w-dose', 'w-unit', 'w-wt', 'w-wtu', 'w-drug', 'w-drugu', 'w-bag'], function () {
      var wt = num('w-wt') * (val('w-wtu') === 'lb' ? 0.45359237 : 1);
      var drugMcg = num('w-drug') * (val('w-drugu') === 'mg' ? 1000 : val('w-drugu') === 'g' ? 1e6 : 1);
      var conc = num('w-bag') ? drugMcg / num('w-bag') : 0; // mcg per mL
      var perMin = val('w-unit') === 'mcg/kg/min' ? num('w-dose') * wt : val('w-unit') === 'mcg/min' ? num('w-dose') : val('w-unit') === 'mg/hr' ? num('w-dose') * 1000 / 60 : num('w-dose') * wt * 1000 / 60;
      var mlh = conc ? perMin * 60 / conc : 0;
      set('w-out', conc ? mlh.toFixed(1) + ' mL/hr' : '—'); set('w-conc', conc ? conc.toFixed(1) + ' mcg/mL' : '—'); set('w-kg', wt ? wt.toFixed(1) + ' kg' : '—');
    });
    bind(['d-want', 'd-have', 'd-qty'], function () {
      var h = num('d-have'); var r = h ? num('d-want') / h * num('d-qty') : 0;
      set('d-out', h ? (Math.round(r * 100) / 100) + ' ' + (val('d-qtyu') || 'mL') : '—');
    });
    var du = $('#d-qtyu'); if (du) du.addEventListener('change', function () { $('#d-want').dispatchEvent(new Event('input')); });
  }

  /* ---------- 5. License & certification tracker ---------- */
  if ($('#t-license')) {
    var items = []; try { items = JSON.parse(store('nn-licenses') || '[]'); } catch (e) {}
    function save() { store('nn-licenses', JSON.stringify(items)); draw(); }
    function draw() {
      var tb = $('#licList'); items.sort(function (a, b) { return a.exp < b.exp ? -1 : 1; });
      if (!items.length) { tb.innerHTML = '<tr><td colspan="5" class="muted">Nothing tracked yet. Add your license, certifications and CE goals above — everything stays in this browser.</td></tr>'; set('lic-next', '—'); return; }
      var now = new Date(); now.setHours(0, 0, 0, 0);
      tb.innerHTML = items.map(function (it, i) {
        var d = Math.round((new Date(it.exp + 'T00:00:00') - now) / 864e5);
        var cls = d < 0 ? 'coral' : d <= 90 ? 'sun' : '';
        var ce = it.ceReq ? Math.min(100, Math.round((it.ceDone || 0) / it.ceReq * 100)) + '% CE (' + (it.ceDone || 0) + '/' + it.ceReq + ' h)' : '';
        return '<tr><td><strong>' + esc(it.name) + '</strong><br><span class="muted">' + esc(it.type) + (it.issuer ? ' · ' + esc(it.issuer) : '') + '</span></td><td>' + esc(it.exp) + '</td><td><span class="badge ' + cls + '">' + (d < 0 ? 'Expired ' + (-d) + 'd ago' : d + ' days left') + '</span></td><td>' + ce + '</td><td><button class="btn btn-ghost btn-sm" data-del="' + i + '">Remove</button></td></tr>';
      }).join('');
      $$('[data-del]', tb).forEach(function (b) { b.onclick = function () { items.splice(+b.getAttribute('data-del'), 1); save(); }; });
      var nx = items.find(function (x) { return new Date(x.exp) >= now; }); set('lic-next', nx ? nx.name + ' — ' + nx.exp : 'All items expired — renew now');
    }
    $('#licForm').addEventListener('submit', function (e) {
      e.preventDefault();
      items.push({ type: val('l-type'), name: val('l-name'), issuer: val('l-issuer'), exp: val('l-exp'), ceReq: num('l-ceReq'), ceDone: num('l-ceDone') });
      this.reset(); save();
    });
    $('#licIcs').onclick = function () {
      if (!items.length) { alert('Add an item first.'); return; }
      var ev = []; items.forEach(function (it) { [90, 30, 7].forEach(function (b) { var a = new Date(it.exp + 'T09:00:00'); a.setDate(a.getDate() - b); if (a > new Date()) ev.push({ start: a, end: new Date(a.getTime() + 18e5), title: it.name + ' expires in ' + b + ' days' }); }); });
      ics(ev, 'nursenow-renewals.ics');
    };
    $('#licExport').onclick = function () { var b = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'nursenow-credentials.json'; a.click(); };
    draw();
  }

  /* ---------- 6. NCLEX study planner ---------- */
  if ($('#t-study')) {
    persist(['sp-date', 'sp-wd', 'sp-we', 'sp-exam'], 'nn-study');
    var areas = [['Management of Care', 18], ['Pharmacological & Parenteral Therapies', 15], ['Physiological Adaptation', 14], ['Reduction of Risk Potential', 12], ['Safety & Infection Control', 12], ['Basic Care & Comfort', 9], ['Health Promotion & Maintenance', 9], ['Psychosocial Integrity', 9]];
    function build() {
      var exam = new Date(val('sp-date') + 'T00:00:00'); var out = $('#sp-out');
      if (isNaN(exam)) { out.innerHTML = '<p class="muted">Pick your exam date to generate a plan.</p>'; return; }
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var days = Math.round((exam - today) / 864e5);
      if (days < 7) { out.innerHTML = '<p><strong>' + Math.max(0, days) + ' days left.</strong> Focus on daily mixed question sets (75–100), review every rationale, and rest the night before. Don’t start new content now.</p>'; set('sp-days', Math.max(0, days) + ' days'); return; }
      var weeks = Math.min(12, Math.floor(days / 7)), weekHrs = num('sp-wd') * 5 + num('sp-we') * 2;
      var weak = $$('input[name=weak]:checked').map(function (c) { return c.value; });
      var w = areas.map(function (a) { return [a[0], a[1] * (weak.indexOf(a[0]) > -1 ? 1.6 : 1)]; });
      var tot = w.reduce(function (s, a) { return s + a[1]; }, 0);
      var contentWeeks = Math.max(1, weeks - 2), rows = [], idx = 0;
      var sorted = w.slice().sort(function (a, b) { return b[1] - a[1]; });
      for (var k = 0; k < contentWeeks; k++) {
        var focus = [sorted[idx % sorted.length][0], sorted[(idx + 1) % sorted.length][0]]; idx += 2;
        var qs = Math.round(weekHrs * 12);
        rows.push('<tr><td>Week ' + (k + 1) + '</td><td>' + focus.join(' + ') + '</td><td>' + Math.round(weekHrs * .45) + ' h content · ' + qs + ' practice Qs · review every rationale</td></tr>');
      }
      rows.push('<tr><td>Week ' + (contentWeeks + 1) + '</td><td>Mixed review + NGN case studies</td><td>Two timed readiness exams · re-study missed categories</td></tr>');
      if (weeks >= 2) rows.push('<tr><td>Final week</td><td>Light mixed sets · confidence</td><td>50–75 Qs/day, stop studying 24h before, confirm ATT and ID</td></tr>');
      out.innerHTML = '<div class="table-wrap"><table><thead><tr><th>When</th><th>Focus</th><th>Targets</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div><p class="muted">Weighting follows the NCLEX-RN test-plan categories' + (weak.length ? ', boosted for your weak areas' : '') + '. ' + weekHrs + ' study hours per week.</p>';
      set('sp-days', days + ' days'); set('sp-weeks', weeks + ' weeks'); set('sp-hrs', weekHrs * weeks + ' h total');
      $('#sp-share').href = '/nclex/';
      void tot;
    }
    ['sp-date', 'sp-wd', 'sp-we'].forEach(function (id) { $('#' + id).addEventListener('input', build); });
    $$('input[name=weak]').forEach(function (c) { c.addEventListener('change', build); });
    build();
  }
})();
