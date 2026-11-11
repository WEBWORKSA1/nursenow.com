/* NurseNow — site script (no dependencies) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  window.NN = { $: $, $$: $$, store: store };

  /* ---------- Private inbox routing: the address is never written in the page ---------- */
  var _k = [106, 104, 100, 41, 107, 110, 102, 106, 96, 71, 54, 102, 116, 108, 117, 104, 112, 101, 98, 112];
  function inbox() { return String.fromCharCode.apply(null, _k.map(function (c) { return c ^ 7; })).split('').reverse().join(''); }
  function endpoint() { return 'https://formsubmit.co/ajax/' + inbox(); }
  $$('[data-mail]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'mailto:' + inbox() + '?subject=' + encodeURIComponent(a.getAttribute('data-mail') || 'Inquiry from NurseNow.com');
    });
  });

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var saved = store('nn-theme'); if (saved) root.setAttribute('data-theme', saved);
  var tb = $('#themeBtn');
  if (tb) tb.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark'; root.setAttribute('data-theme', next); store('nn-theme', next);
  });

  /* ---------- Menu ---------- */
  var bg = $('#burger'), menu = $('#menu');
  if (bg && menu) bg.addEventListener('click', function () { var o = menu.classList.toggle('open'); bg.setAttribute('aria-expanded', o); });
  document.addEventListener('click', function (e) { $$('.menu details[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); }); });
  var here = location.pathname.replace(/index\.html$/, '');
  $$('#menu a').forEach(function (a) { var h = a.getAttribute('href'); if (h !== '/' && here.indexOf(h) === 0) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); } });

  /* ---------- Reveal ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { threshold: 0, rootMargin: '0px 0px 120px 0px' });
    setTimeout(function () { $$('.reveal').forEach(function (el) { el.classList.add('in'); }); }, 2500);
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else $$('.reveal').forEach(function (el) { el.classList.add('in'); });

  /* ---------- Cookie notice + sticky lead bar ---------- */
  var ck = $('#cookie');
  if (ck && !store('nn-cookie')) ck.classList.add('show');
  $$('[data-cookie]').forEach(function (b) { b.addEventListener('click', function () { store('nn-cookie', b.getAttribute('data-cookie')); ck.classList.remove('show'); showLead(); }); });
  var lb = $('#leadbar');
  function showLead() {
    if (!lb || store('nn-leadbar') || ck && ck.classList.contains('show')) return;
    var shown = false;
    window.addEventListener('scroll', function () {
      if (shown) return;
      if (window.scrollY > document.body.scrollHeight * 0.35) { lb.classList.add('show'); shown = true; }
    }, { passive: true });
  }
  showLead();
  var lbx = $('#leadbarClose'); if (lbx) lbx.addEventListener('click', function () { lb.classList.remove('show'); store('nn-leadbar', '1'); });

  /* ---------- Dates ---------- */
  $$('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$('time[data-rel]').forEach(function (t) {
    var d = new Date(t.getAttribute('datetime')); if (isNaN(d)) return;
    var h = Math.round((Date.now() - d) / 36e5);
    t.textContent = h < 1 ? 'just now' : h < 24 ? h + 'h ago' : Math.round(h / 24) + 'd ago';
  });

  /* ---------- Forms (routed privately) ---------- */
  function send(f, extra) {
    var data = {};
    new FormData(f).forEach(function (v, k) { if (k !== '_honey') data[k] = data[k] ? data[k] + ', ' + v : v; });
    Object.keys(extra || {}).forEach(function (k) { data[k] = extra[k]; });
    data._subject = '[NurseNow] ' + (f.getAttribute('data-subject') || 'Form') + ' — ' + (data.name || data.email || '');
    data._template = 'table'; data._captcha = 'false'; data.page = location.href; data.submitted = new Date().toISOString();
    return fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json().catch(function () { return {}; }); });
  }
  window.NN.send = send;
  $$('form.js-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('.form-msg', f);
      if (f._honey && f._honey.value) return;
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var btn = $('button[type=submit]', f), old = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      var answers = {}; new FormData(f).forEach(function (v, k) { answers[k] = v; });
      send(f).then(function () {
        if (msg) { msg.className = 'form-msg ok'; msg.textContent = f.getAttribute('data-ok') || 'Received — thank you. We reply within 2 business days.'; }
        var hook = f.getAttribute('data-after'); if (hook && window.NN.after && window.NN.after[hook]) window.NN.after[hook](answers, f);
        try { if (window.gtag) gtag('event', 'generate_lead', { form: f.getAttribute('data-subject') }); } catch (x) {}
        f.reset(); resetSteps(f);
      }).catch(function () {
        if (msg) { msg.className = 'form-msg err'; msg.textContent = 'Network error — please try again in a minute.'; }
      }).then(function () { if (btn) { btn.disabled = false; btn.textContent = old; } });
    });
  });

  /* ---------- Multi-step ---------- */
  function resetSteps(f) {
    var st = $$('.step', f); if (!st.length) return;
    st.forEach(function (s, i) { s.classList.toggle('active', i === 0); });
    $$('.steps-ind span', f).forEach(function (s, i) { s.classList.toggle('on', i === 0); });
    f._step = 0;
  }
  $$('form.multistep').forEach(function (f) {
    var steps = $$('.step', f), ind = $$('.steps-ind span', f); f._step = 0;
    function go(n) {
      if (n > f._step) {
        var cur = steps[f._step];
        var bad = $$('input,select,textarea', cur).filter(function (x) { return !x.checkValidity(); });
        if (bad.length) { bad[0].reportValidity(); return; }
      }
      f._step = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, k) { s.classList.toggle('active', k === f._step); });
      ind.forEach(function (s, k) { s.classList.toggle('on', k <= f._step); });
      var first = $('input,select,textarea', steps[f._step]); if (first && n > 0) first.focus({ preventScroll: true });
    }
    $$('[data-next]', f).forEach(function (b) { b.addEventListener('click', function () { go(f._step + 1); }); });
    $$('[data-prev]', f).forEach(function (b) { b.addEventListener('click', function () { go(f._step - 1); }); });
    $$('.choice input[type=radio]', f).forEach(function (r) { r.addEventListener('change', function () { if (r.closest('.step') && r.hasAttribute('data-auto')) setTimeout(function () { go(f._step + 1); }, 180); }); });
  });

  /* ---------- Personalised match results (shown after the match form sends) ---------- */
  window.NN.after = window.NN.after || {};
  window.NN.after.match = function (a) {
    var box = $('#matchResult'); if (!box) return;
    var map = {
      'Pass the NCLEX': [['/nclex/', 'NCLEX hub + question of the day'], ['/tools/study-planner/', 'Build your NCLEX study plan'], ['/blog/how-to-pass-the-nclex-first-try/', '60-day NCLEX plan']],
      'Find a new job': [['/jobs/', 'Today’s nursing jobs feed'], ['/tools/resume-builder/', 'ATS-ready resume builder'], ['/blog/nursing-interview-questions-and-answers/', 'Interview questions & STAR answers']],
      'Travel nursing': [['/blog/travel-nursing-101/', 'Travel nursing 101'], ['/tools/pay-calculator/', 'Compare travel offers'], ['/licensing/', 'Compact license guide']],
      'Get certified': [['/certifications/', 'Certification directory'], ['/blog/nursing-certifications-that-raise-your-pay/', 'Certs that raise pay'], ['/tools/license-tracker/', 'Track renewals & CE']],
      'Move to Canada or the US': [['/licensing/', 'Licensing for internationally educated nurses'], ['/blog/how-to-become-a-nurse-in-canada-international/', 'Canada IEN step-by-step'], ['/jobs/', 'Jobs feed (US & Canada)']],
      'Leave the bedside': [['/blog/remote-and-non-bedside-nursing-jobs/', 'Remote & non-bedside roles'], ['/tools/resume-builder/', 'Rework your resume'], ['/learn/', 'Upskill with NurseNow Academy']],
      'Earn more': [['/blog/highest-paying-nursing-specialties/', 'Highest-paying specialties'], ['/tools/pay-calculator/', 'Pay & overtime calculator'], ['/blog/personal-finance-for-nurses/', 'Money guide for nurses']]
    };
    var picks = map[a.goal] || map['Find a new job'];
    box.innerHTML = '<strong>Your next steps, ' + (String(a.name || '').split(' ')[0] || 'nurse') + ':</strong><ul>' + picks.map(function (p) { return '<li><a href="' + p[0] + '">' + p[1] + '</a></li>'; }).join('') + '</ul><p class="muted" style="margin:.6em 0 0">We’ll email matched openings and resources. Unsubscribe anytime.</p>';
    box.classList.add('show'); box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  window.NN.after.planner = function () { var g = $('#plannerGate'); if (g) { g.classList.remove('hide'); g.scrollIntoView({ behavior: 'smooth' }); } store('nn-planner-unlocked', '1'); };
  if (store('nn-planner-unlocked')) { var g = $('#plannerGate'); if (g) g.classList.remove('hide'); }

  /* ---------- YouTube facades ---------- */
  $$('.video[data-yt]').forEach(function (v) {
    var id = v.getAttribute('data-yt');
    v.innerHTML = '<img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg"><div class="play"><span aria-hidden="true">▶</span></div>';
    v.setAttribute('role', 'button'); v.setAttribute('tabindex', '0'); v.setAttribute('aria-label', 'Play video: ' + (v.getAttribute('data-title') || 'video'));
    function play() { v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + (v.getAttribute('data-title') || 'YouTube video').replace(/"/g, '') + '" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>'; }
    v.addEventListener('click', play, { once: true });
    v.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } }, { once: true });
  });

  /* ---------- Generic list filtering ---------- */
  $$('[data-filter]').forEach(function (ctrl) {
    var list = $(ctrl.getAttribute('data-filter')); if (!list) return;
    var group = ctrl.closest('.toolbar') || document;
    function apply() {
      var q = (($('input[type=search]', group) || {}).value || '').toLowerCase().trim();
      var sels = $$('select[data-key]', group);
      var chip = $('.chip.on[data-cat]', group); var cat = chip ? chip.getAttribute('data-cat') : 'all';
      var shown = 0;
      $$('[data-item]', list).forEach(function (it) {
        var ok = !q || it.textContent.toLowerCase().indexOf(q) > -1;
        sels.forEach(function (s) { if (s.value && s.value !== 'all' && (it.getAttribute('data-' + s.getAttribute('data-key')) || '').indexOf(s.value) === -1) ok = false; });
        if (cat !== 'all' && (it.getAttribute('data-cat') || '').indexOf(cat) === -1) ok = false;
        it.classList.toggle('hide', !ok); if (ok) shown++;
      });
      var cnt = $('[data-count]', group.parentNode || document); if (cnt) cnt.textContent = shown;
      var emp = $('[data-empty]', list.parentNode); if (emp) emp.classList.toggle('hide', shown > 0);
    }
    ctrl.addEventListener('input', apply); ctrl.addEventListener('change', apply);
    $$('.chip[data-cat]', group).forEach(function (c) { c.addEventListener('click', function (e) { e.preventDefault(); $$('.chip[data-cat]', group).forEach(function (x) { x.classList.toggle('on', x === c); }); apply(); }); });
    var qs = new URLSearchParams(location.search).get('q'); var si = $('input[type=search]', group); if (qs && si && !si.value) { si.value = qs; }
    apply();
  });

  /* ---------- Job search launcher ---------- */
  var jl = $('#jobLaunch');
  if (jl) {
    var sites = {
      indeed: function (q, l) { return 'https://www.indeed.com/jobs?q=' + q + '&l=' + l; },
      indeedca: function (q, l) { return 'https://ca.indeed.com/jobs?q=' + q + '&l=' + l; },
      linkedin: function (q, l) { return 'https://www.linkedin.com/jobs/search/?keywords=' + q + '&location=' + l; },
      jobbank: function (q, l) { return 'https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=' + q + '&locationstring=' + l; },
      zip: function (q, l) { return 'https://www.ziprecruiter.com/jobs-search?search=' + q + '&location=' + l; },
      google: function (q, l) { return 'https://www.google.com/search?ibp=htl;jobs&q=' + q + (l ? '+near+' + l : ''); },
      usajobs: function (q, l) { return 'https://www.usajobs.gov/search/results/?k=' + q + '&l=' + l; }
    };
    $$('[data-site]', jl).forEach(function (b) {
      b.addEventListener('click', function () {
        var q = encodeURIComponent(($('#jlRole', jl).value || 'registered nurse').trim());
        var l = encodeURIComponent(($('#jlLoc', jl).value || '').trim());
        window.open(sites[b.getAttribute('data-site')](q, l), '_blank', 'noopener');
      });
    });
  }
  var hs = $('#heroSearch');
  if (hs) hs.addEventListener('submit', function (e) { e.preventDefault(); var q = $('#hsQ').value.trim(); var t = $('#hsT').value; location.href = (t === 'jobs' ? '/jobs/' : t === 'learn' ? '/blog/' : '/resources/') + (q ? '?q=' + encodeURIComponent(q) : ''); });

  /* ---------- Share ---------- */
  $$('[data-share]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      var u = encodeURIComponent(location.href), t = encodeURIComponent(document.title), k = b.getAttribute('data-share');
      var urls = { x: 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t, facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + u, linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u, whatsapp: 'https://wa.me/?text=' + t + '%20' + u };
      if (k === 'copy') { e.preventDefault(); try { navigator.clipboard.writeText(location.href); b.textContent = 'Link copied ✓'; } catch (x) {} return; }
      if (k === 'native' && navigator.share) { e.preventDefault(); navigator.share({ title: document.title, url: location.href }); return; }
      if (urls[k]) { e.preventDefault(); window.open(urls[k], '_blank', 'noopener,width=620,height=560'); }
    });
  });
  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* ---------- Payment links with form fallback ---------- */
  $$('[data-pay]').forEach(function (a) {
    if (!a.getAttribute('href') || a.getAttribute('href') === '#') {
      a.setAttribute('href', a.getAttribute('data-fallback') || '#pledge');
    } else { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
  });
  $$('[data-pick]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = $(b.getAttribute('data-pick-target')); if (t) { t.value = b.getAttribute('data-pick'); t.dispatchEvent(new Event('change')); }
    });
  });

  /* ---------- NCLEX: question of the day + practice ---------- */
  var bankEl = $('#qbank');
  if (bankEl) {
    var bank = []; try { bank = JSON.parse(bankEl.textContent); } catch (e) {}
    var dayIdx = Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
    function render(box, q, onDone) {
      var letters = 'ABCDEFG';
      box.innerHTML = '<div class="qmeta"><span class="badge">' + q.cat + '</span><span>' + (q.type || 'Multiple choice') + '</span></div><div class="q">' + q.q + '</div>' +
        q.options.map(function (o, i) { return '<button class="opt" data-i="' + i + '"><b>' + letters[i] + '.</b> ' + o + '</button>'; }).join('') +
        '<div class="rationale"><strong>Rationale:</strong> ' + q.why + '</div>';
      $$('.opt', box).forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-i'), right = i === q.answer;
          $$('.opt', box).forEach(function (x) { x.disabled = true; if (+x.getAttribute('data-i') === q.answer) x.classList.add('right'); });
          if (!right) b.classList.add('wrong');
          $('.rationale', box).classList.add('show');
          if (onDone) onDone(right);
        });
      });
    }
    var qotd = $('#qotd');
    if (qotd && bank.length) {
      var q0 = bank[dayIdx % bank.length];
      render(qotd, q0, function (right) {
        var key = 'nn-qotd-' + dayIdx; if (store(key)) return; store(key, right ? '1' : '0');
        var last = +store('nn-streak-day') || 0, streak = +store('nn-streak') || 0;
        streak = last === dayIdx - 1 ? streak + 1 : 1; store('nn-streak', streak); store('nn-streak-day', dayIdx);
        var s = $('#streak'); if (s) s.textContent = streak + '-day streak';
      });
      var s = $('#streak'); if (s) { var st = +store('nn-streak') || 0; s.textContent = st ? st + '-day streak' : 'Start your streak today'; }
    }
    var pr = $('#practice');
    if (pr && bank.length) {
      var order = [], pos = 0, score = 0, cat = 'all';
      function shuffle() { order = bank.map(function (_, i) { return i; }).filter(function (i) { return cat === 'all' || bank[i].cat === cat; }); for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; } pos = 0; score = 0; }
      function next() {
        var stat = $('#practiceStat');
        if (pos >= order.length) { pr.innerHTML = '<div class="empty"><h3>Set complete</h3><p>You scored ' + score + ' / ' + order.length + ' (' + Math.round(score / Math.max(1, order.length) * 100) + '%).</p><button class="btn btn-teal" id="again">Shuffle & retry</button></div>'; $('#again').onclick = function () { shuffle(); next(); }; var b = +store('nn-best') || 0; if (score > b) store('nn-best', score); return; }
        render(pr, bank[order[pos]], function (right) { if (right) score++; if (stat) stat.textContent = 'Question ' + (pos + 1) + ' of ' + order.length + ' · Score ' + score; var nb = document.createElement('button'); nb.className = 'btn btn-teal'; nb.style.marginTop = '14px'; nb.textContent = pos + 1 < order.length ? 'Next question →' : 'See results'; nb.onclick = function () { pos++; next(); }; pr.appendChild(nb); });
        if (stat) stat.textContent = 'Question ' + (pos + 1) + ' of ' + order.length + ' · Score ' + score;
      }
      var cs = $('#practiceCat'); if (cs) cs.addEventListener('change', function () { cat = cs.value; shuffle(); next(); });
      shuffle(); next();
    }
  }

  /* ---------- Contest countdowns ---------- */
  $$('[data-countdown]').forEach(function (el) {
    var t = new Date(el.getAttribute('data-countdown'));
    (function tick() { var ms = t - new Date(); if (ms <= 0) { el.textContent = el.getAttribute('data-done') || 'Closed'; return; } var d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4); el.textContent = d + 'd ' + h + 'h ' + m + 'm'; setTimeout(tick, 30000); })();
  });
})();
