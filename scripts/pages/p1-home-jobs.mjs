// NurseNow pages — Home, jobs.
import { esc } from '../lib/md.mjs';
import { icon, ctas, adUnit, pageHero, honey, consent, marketingOptIn } from '../lib/ui.mjs';
import { fmtDate, host, initials, faqBlock, faqLd, jobRow, newsRow, videoCard, toolsList } from './shared.mjs';

export default function (ctx, h) {
  const { cfg, buildDate, articles, articleCard, P, $, today, jobsAll, qbank, add, toolsJs } = h;

  /* ================= HOME ================= */
  add({
    path: '/index.html', title: 'NurseNow', description: cfg.description,
    body: `<section class="hero"><svg class="ecg" viewBox="0 0 1600 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70 H420 l18-30 16 64 20-104 20 92 14-22 h360 l18-30 16 64 20-104 20 92 14-22 H1600"/></svg>
<div class="wrap hero-grid"><div>
<span class="eyebrow">Updated ${today}</span>
<h1>Find nursing jobs, <em>skills</em> &amp; opportunities — all in one place</h1>
<p class="lead">Daily job feeds, licensing roadmaps for the US and Canada, NCLEX practice with rationales, and free tools that help you earn more and burn out less.</p>
<form class="searchbox" id="heroSearch" role="search"><label class="hide" for="hsQ">Search</label><input id="hsQ" placeholder="ICU nurse, NCLEX, travel contracts…"><span class="sep"></span><label class="hide" for="hsT">Search in</label><select id="hsT"><option value="jobs">Jobs</option><option value="learn">Guides</option><option value="resources">Resources</option></select><button class="btn btn-primary" type="submit">Search</button></form>
<div class="chips"><a class="chip" href="/jobs/?q=travel">Travel nursing</a><a class="chip" href="/jobs/?q=remote">Remote RN</a><a class="chip" href="/nclex/">NCLEX daily</a><a class="chip" href="/licensing/#canada">Nursing in Canada</a><a class="chip" href="/certifications/">Certifications</a></div>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px"><a class="btn btn-primary" href="/jobs/">Find jobs</a><a class="btn btn-ghost" href="/learn/">Start learning</a></div>
</div>
<div class="hero-card"><span class="tag">NCLEX question of the day</span><div id="qotd" class="quiz" style="border:0;padding:6px 0 0"><p class="muted">Loading today’s question…</p></div><p class="muted" style="margin:10px 0 0;font-size:.85rem"><span id="streak"></span> · <a href="/nclex/">More practice →</a></p></div>
</div></section>
<section style="padding:10px 0 40px"><div class="wrap"><div class="facts reveal">
<div><strong>$93,600</strong><span>US median RN pay, May 2024 (BLS)</span></div>
<div><strong>85–150</strong><span>Items on the adaptive NCLEX</span></div>
<div><strong>40+</strong><span>US jurisdictions in the Nurse Licensure Compact</span></div>
<div><strong>Daily</strong><span>Jobs, news &amp; videos refreshed every morning</span></div>
</div></div></section>
<section class="band"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">Start where you are</span><h2>Your next step, mapped</h2></div><p>Pick your stage. Every path links the guides, tools and openings that matter right now.</p></div>
<div class="grid g3">
${[['book', 'Nursing student & NCLEX candidate', 'Daily questions, a study planner built around your exam date, and a 60-day plan.', '/nclex/'],
  ['steth', 'New grad nurse', 'Resume builder, interview answers that work, and how to survive your first 90 days.', '/blog/new-grad-nurse-first-90-days/'],
  ['briefcase', 'Experienced RN, LPN or NP', 'Today’s openings, pay calculator, certifications that raise your rate.', '/jobs/'],
  ['globe', 'Internationally educated nurse', 'NNAS, NCLEX, provincial and state boards — the real sequence, step by step.', '/licensing/'],
  ['plane', 'Travel nurse', 'Compare offers, understand stipends, compact licenses and contract red flags.', '/blog/travel-nursing-101/'],
  ['target', 'Ready to leave the bedside', 'Remote and non-bedside roles, the skills they want, and how to reposition.', '/blog/remote-and-non-bedside-nursing-jobs/']]
  .map(([i, t, d, h]) => `<div class="card link reveal"><div class="ico">${icon(i)}</div><h3><a class="stretch" href="${h}" style="color:inherit;text-decoration:none">${t}</a></h3><p>${d}</p></div>`).join('')}
</div></div></section>
<section><div class="wrap"><div class="sec-head"><div><span class="eyebrow">Refreshed daily</span><h2>Latest nursing jobs</h2></div><a class="btn btn-ghost" href="/jobs/">All jobs & one-click searches →</a></div>
${jobsAll.length ? jobsAll.slice(0, 6).map(j => jobRow(j, j.featured)).join('') : `<div class="empty">Today’s job feed is loading on the next refresh. Meanwhile, <a href="/jobs/">search the major boards in one click</a>.</div>`}
<p class="muted" style="margin-top:14px;font-size:.88rem">Hiring nurses? <a href="/recruiters/">Post a featured job</a> — it appears here and at the top of the jobs page.</p></div></section>
<section class="band"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">Free forever</span><h2>Tools built for nurses</h2></div><a class="btn btn-ghost" href="/tools/">All tools →</a></div>
<div class="grid g3">${toolsList().map(t => `<div class="card link reveal"><div class="ico ${t.c || ''}">${icon(t.i)}</div><h3><a class="stretch" href="${t.h}" style="color:inherit;text-decoration:none">${t.t}</a></h3><p>${t.d}</p></div>`).join('')}</div></div></section>
<section class="dark-band"><div class="wrap grid g2" style="align-items:center;gap:40px"><div><span class="eyebrow" style="color:var(--sun)">Free career match</span><h2>Tell us your goal. We’ll map the fastest route.</h2><p>Pass the NCLEX, move to Canada or the US, get certified, switch specialty or earn more — answer four quick questions and get a personalised plan plus matched openings.</p><ul class="ticks" style="color:inherit"><li>Takes about two minutes</li><li>Personalised links instantly, matched openings by email</li><li>No spam — unsubscribe in one click</li></ul></div>
<div class="form-card" style="color:var(--ink)"><form class="js-form" data-subject="Quick match (home)" data-ok="Got it — your plan is on its way. Complete the full match for instant results.">${honey}
<div class="field"><label for="hm-goal">Your main goal</label><select id="hm-goal" name="goal" required><option value="">Choose one…</option><option>Pass the NCLEX</option><option>Find a new job</option><option>Travel nursing</option><option>Get certified</option><option>Move to Canada or the US</option><option>Leave the bedside</option><option>Earn more</option></select></div>
<div class="row"><div class="field"><label for="hm-name">First name</label><input id="hm-name" name="name" required autocomplete="given-name"></div><div class="field"><label for="hm-email">Email</label><input id="hm-email" type="email" name="email" required autocomplete="email"></div></div>
${consent('Send me my plan and related NurseNow emails. I accept the <a href="/privacy/">Privacy Policy</a>.')}
<button class="btn btn-primary btn-block" type="submit">Send my plan</button><div class="form-msg" role="status"></div></form><p class="muted" style="font-size:.84rem;margin:10px 0 0">Want instant results? <a href="/match/">Use the full match →</a></p></div></div></section>
<section><div class="wrap grid g2" style="gap:36px;align-items:start">
<div><div class="sec-head"><div><span class="eyebrow">Today in nursing</span><h2>News</h2></div><a class="more" href="/news/">All news →</a></div>
${ctx.news.items.length ? ctx.news.items.slice(0, 6).map(newsRow).join('') : '<div class="empty">Headlines refresh every morning.</div>'}</div>
<div><div class="sec-head"><div><span class="eyebrow">Watch & learn</span><h2>Videos</h2></div><a class="more" href="/videos/">Video hub →</a></div>
<div class="grid" style="gap:22px">${ctx.videos.items.slice(0, 2).map(videoCard).join('') || '<div class="empty">New videos land daily.</div>'}</div></div>
</div></section>
${adUnit(cfg, 'footer') ? `<div class="wrap">${adUnit(cfg, 'footer')}</div>` : ''}
<section class="band"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">Guides</span><h2>Practical, sourced, nurse-focused</h2></div><a class="btn btn-ghost" href="/blog/">All guides →</a></div><div class="grid g3">${articles.slice(0, 6).map(articleCard).join('')}</div></div></section>
<section><div class="wrap grid g4">
${[['trophy', 'Contests & prizes', 'Story contests, study challenges and sponsor-funded prizes.', '/contests/', 'sun'], ['heart', 'Support NurseNow', 'Keep every tool free. Donate once or monthly.', '/support/', 'coral'], ['users', 'Work with us', 'Nurse writers, reviewers, creators and campus reps.', '/careers/', ''], ['megaphone', 'Advertise & partner', 'Reach nurses with sponsorships and featured jobs.', '/advertise/', '']]
  .map(([i, t, d, h, c]) => `<div class="card link"><div class="ico ${c}">${icon(i)}</div><h3><a class="stretch" href="${h}" style="color:inherit;text-decoration:none">${t}</a></h3><p>${d}</p></div>`).join('')}
</div></section>
${qbank}`
  });

  /* ================= JOBS ================= */
  const jobFaq = [
    ['Where do these jobs come from?', 'Every morning an automated job pulls fresh nursing openings from public job APIs and feeds, removes duplicates and expired listings, and rebuilds this page. Featured listings are posted directly by employers. Each “Apply” button takes you to the original posting.'],
    ['Does NurseNow charge nurses anything?', 'No. Searching, applying and every tool on NurseNow are free for nurses. Employers pay for featured placement, which is always labelled.'],
    ['How do I see more jobs near me?', 'Use the one-click search launcher above: type a role and a city and open the same search on Indeed, LinkedIn, Job Bank (Canada), USAJOBS, ZipRecruiter or Google Jobs.'],
    ['How do I avoid job scams?', 'Never pay to apply, never share your SIN/SSN or banking details before a verified offer, and confirm recruiters through the employer’s official website. Report suspicious listings to us via the contact page.']];
  add({
    path: '/jobs/index.html', title: 'Nursing Jobs — Updated Daily (RN, LPN, NP, Travel & Remote)',
    description: 'Fresh nursing jobs every day: RN, LPN/RPN, NP, travel and remote roles in the US and Canada, plus one-click searches across Indeed, LinkedIn, Job Bank and USAJOBS.',
    crumbs: [['Jobs', '/jobs/']], ld: faqLd(jobFaq),
    body: pageHero({ eyebrow: 'Jobs', title: 'Nursing jobs, refreshed every morning', lead: 'Real openings from public job feeds plus employer-featured roles. Filter below, or launch the same search on every major board in one click.', crumbs: [['Jobs']], extra: `<p class="updated" style="margin-top:12px">Feed updated ${ctx.jobs.updated ? fmtDate(ctx.jobs.updated, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'daily'}</p>` }) +
      `<section style="padding-top:32px"><div class="wrap article-grid"><div>
<div class="card" id="jobLaunch" style="margin-bottom:22px"><h3>One-click job search</h3><p>Search the largest boards with your role and city — results open in a new tab.</p>
<div class="row"><div class="field"><label for="jlRole">Role</label><input id="jlRole" value="registered nurse"></div><div class="field"><label for="jlLoc">City / province / state</label><input id="jlLoc" placeholder="Toronto, ON"></div></div>
<div style="display:flex;flex-wrap:wrap;gap:8px">${[['indeed', 'Indeed US'], ['indeedca', 'Indeed Canada'], ['linkedin', 'LinkedIn'], ['jobbank', 'Job Bank (Canada)'], ['usajobs', 'USAJOBS'], ['zip', 'ZipRecruiter'], ['google', 'Google Jobs']].map(([k, t]) => `<button class="btn btn-ghost btn-sm" type="button" data-site="${k}">${t} ↗</button>`).join('')}</div></div>
<div class="toolbar"><label class="hide" for="jq">Filter jobs</label><input id="jq" type="search" placeholder="Filter: ICU, night, Toronto, remote…" data-filter="#jobList"><label class="hide" for="jt">Type</label><select id="jt" data-key="type" data-filter="#jobList"><option value="all">All types</option><option value="full">Full-time</option><option value="part">Part-time</option><option value="contract">Contract / travel</option></select><label class="hide" for="jr">Region</label><select id="jr" data-key="region" data-filter="#jobList"><option value="all">All regions</option><option value="us">United States</option><option value="ca">Canada</option><option value="remote">Remote</option></select><span class="muted" style="font-size:.88rem"><b data-count>${jobsAll.length}</b> jobs</span></div>
<div id="jobList">${jobsAll.map(j => jobRow(j, j.featured)).join('')}</div>
<div class="empty ${jobsAll.length ? 'hide' : ''}" data-empty>No matching jobs in today’s feed. Try the one-click search above, or <a href="/match/">get matched</a> and we’ll email openings.</div>
<h2 style="margin-top:44px">How to stand out when you apply</h2>
<p>Most hospital systems screen applications with an applicant tracking system (ATS) before a human sees them. Mirror the posting’s exact wording for your specialty, unit type and certifications, list your license type and jurisdiction near the top, and keep formatting simple. Our <a href="/tools/resume-builder/">free resume builder</a> suggests specialty keywords and prints a clean, ATS-friendly PDF.</p>
<p>Before you accept, compare the whole package — base rate, differentials, overtime rules, orientation length, ratios and float policy — not just the headline number. The <a href="/tools/pay-calculator/">pay calculator</a> compares two offers side by side.</p>
<h2>Jobs FAQ</h2>${faqBlock(jobFaq)}
</div>
<aside class="aside-stick"><div class="card"><span class="badge sun">For employers</span><h3 style="margin-top:10px">Hiring nurses?</h3><p>Featured listings sit at the top of this page and the homepage, with your logo initials and a highlight. From ${$.featuredJob}.</p><a class="btn btn-primary btn-block" href="/recruiters/">Post a job</a></div>
<div class="card"><span class="badge">For nurses</span><h3 style="margin-top:10px">Resume boost</h3><p>A nurse-focused resume review and keyword pass, delivered within 3 business days. ${$.resumeBoost}.</p><a class="btn btn-ghost btn-block" data-pay href="${P.resumeBoost || '#'}" data-fallback="/contact/?topic=Resume%20boost">Get a resume boost</a></div>
${ctas.match()}${adUnit(cfg, 'sidebar')}</aside></div></section>`
  });
}
