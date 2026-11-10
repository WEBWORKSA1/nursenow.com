// NurseNow pages — News, videos, blog, resources, gear, support.
import { esc } from '../lib/md.mjs';
import { icon, ctas, adUnit, pageHero, honey, consent, marketingOptIn } from '../lib/ui.mjs';
import { fmtDate, host, initials, faqBlock, faqLd, jobRow, newsRow, videoCard, toolsList } from './shared.mjs';

export default function (ctx, h) {
  const { cfg, buildDate, articles, articleCard, P, $, today, jobsAll, qbank, add, toolsJs } = h;

  /* ================= NEWS ================= */
  const topics = [...new Set(ctx.news.items.map(n => n.topic).filter(Boolean))];
  add({
    path: '/news/index.html', title: 'Nursing News Today — Updated Daily',
    description: 'Today’s nursing headlines from across the US, Canada and beyond — staffing, NCLEX, nurse practitioners, travel nursing and policy — refreshed every morning.', crumbs: [['News', '/news/']],
    body: pageHero({ eyebrow: 'News', title: 'Nursing news, refreshed every morning', lead: 'A daily scan of public news sources for the stories that affect nurses: staffing, pay, exams, policy and practice. Headlines link to the original publisher.', crumbs: [['News']], extra: `<p class="updated" style="margin-top:12px">Updated ${ctx.news.updated ? fmtDate(ctx.news.updated, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'daily'}</p>` }) +
      `<section><div class="wrap article-grid"><div><div class="toolbar"><label class="hide" for="nq">Filter headlines</label><input id="nq" type="search" placeholder="Filter headlines…" data-filter="#newsList"><div class="pill-tabs" style="margin:0"><a href="#" class="chip on" data-cat="all">All</a>${topics.map(t => `<a href="#" class="chip" data-cat="${esc(t)}">${esc(t)}</a>`).join('')}</div></div>
<div id="newsList">${ctx.news.items.map(newsRow).join('')}</div><div class="empty ${ctx.news.items.length ? 'hide' : ''}" data-empty>Headlines refresh every morning — check back shortly.</div>
<div class="note">Headlines and links belong to their publishers; NurseNow does not republish articles. Topic filters are automatic. Want a story covered in depth? <a href="/contact/?topic=Story%20tip">Send a tip</a>.</div></div>
<aside class="aside-stick">${ctas.jobs()}${adUnit(cfg, 'sidebar')}<div class="card"><h3>Get the weekly brief</h3><p>The week’s biggest nursing stories, new jobs and one NCLEX question — every Monday.</p><form class="js-form" data-subject="Newsletter signup (news)" data-ok="Subscribed!">${honey}<input type="email" name="email" required placeholder="Email" aria-label="Email"><input type="hidden" name="consent" value="Newsletter opt-in via news page"><button class="btn btn-primary btn-block" style="margin-top:8px" type="submit">Subscribe</button><div class="form-msg" role="status"></div></form></div></aside></div></section>`
  });

  /* ================= VIDEOS ================= */
  const chans = [...new Set(ctx.videos.items.map(v => v.channel).filter(Boolean))];
  add({
    path: '/videos/index.html', title: 'Nursing Video Hub — NCLEX Reviews, Skills & Career Videos',
    description: 'The latest NCLEX reviews, clinical skills and nursing career videos from leading nurse educators on YouTube, refreshed daily.', crumbs: [['Videos', '/videos/']],
    body: pageHero({ eyebrow: 'Video hub', title: 'Watch, review, repeat', lead: 'The newest uploads from respected nursing educators, refreshed daily. Videos load only when you press play, to keep pages fast.', crumbs: [['Videos']], extra: `<p class="updated" style="margin-top:12px">Updated ${ctx.videos.updated ? fmtDate(ctx.videos.updated, { month: 'short', day: 'numeric' }) : 'daily'}</p>` }) +
      `<section><div class="wrap"><div class="toolbar"><label class="hide" for="vq">Filter videos</label><input id="vq" type="search" placeholder="Search videos: pharmacology, ECG, delegation…" data-filter="#videoList"><div class="pill-tabs" style="margin:0"><a href="#" class="chip on" data-cat="all">All</a>${chans.map(c => `<a href="#" class="chip" data-cat="${esc(c)}">${esc(c)}</a>`).join('')}</div></div>
<div class="grid g3" id="videoList">${ctx.videos.items.map(videoCard).join('')}</div><div class="empty ${ctx.videos.items.length ? 'hide' : ''}" data-empty>New videos arrive with the next daily refresh.</div>
<div class="grid g2" style="margin-top:40px"><div class="card"><h3>Create nursing videos?</h3><p>Submit your channel for the hub, or apply to make videos with NurseNow.</p><a class="more" href="/careers/">Creator opportunities →</a></div><div class="card"><h3>About these videos</h3><p>Videos are embedded from YouTube using privacy-enhanced mode. All rights belong to their creators; inclusion is not an endorsement.</p></div></div></div></section>`
  });

  /* ================= BLOG INDEX ================= */
  const bcats = [...new Set(articles.map(a => a.category))];
  add({
    path: '/blog/index.html', title: 'Nursing Career Guides — NCLEX, Licensing, Pay, Travel & Wellbeing',
    description: 'Practical, sourced guides for nurses: passing the NCLEX, licensing in the US and Canada, pay and certifications, travel nursing, interviews, resumes, money and wellbeing.', crumbs: [['Guides', '/blog/']],
    body: pageHero({ eyebrow: 'Guides', title: 'Guides written for working nurses', lead: 'Clear, sourced and updated. No fluff — just what you need to make the next decision.', crumbs: [['Guides']] }) +
      `<section><div class="wrap"><div class="toolbar"><label class="hide" for="bq">Search guides</label><input id="bq" type="search" placeholder="Search guides…" data-filter="#blogList"><div class="pill-tabs" style="margin:0"><a href="#" class="chip on" data-cat="all">All</a>${bcats.map(c => `<a href="#" class="chip" data-cat="${esc(c)}">${esc(ctx.catName[c] || c)}</a>`).join('')}</div></div>
<div class="grid g3" id="blogList">${articles.map(articleCard).join('')}</div><div class="empty hide" data-empty>No guides match — try another word.</div></div></section>`
  });

  /* ================= RESOURCES ================= */
  const rcats = [...new Set(ctx.resources.map(r => r.cat))];
  add({
    path: '/resources/index.html', title: 'Nursing Resource Directory — 90+ Vetted Websites',
    description: 'A curated directory of the best websites for nurses: licensing bodies, NCLEX prep, continuing education, job boards, travel nursing, gear, AI tools, finance and wellbeing.', crumbs: [['Resources', '/resources/']],
    body: pageHero({ eyebrow: 'Directory', title: 'The nursing internet, curated', lead: `${ctx.resources.length} websites we reviewed while building NurseNow — official regulators, exam prep, CE providers, job boards and more. Listing is not endorsement.`, crumbs: [['Resources']] }) +
      `<section><div class="wrap"><div class="toolbar"><label class="hide" for="rq">Search resources</label><input id="rq" type="search" placeholder="Search: CE, NNAS, travel, scrubs…" data-filter="#resList"><div class="pill-tabs" style="margin:0"><a href="#" class="chip on" data-cat="all">All</a>${rcats.map(c => `<a href="#" class="chip" data-cat="${esc(c)}">${esc(c)}</a>`).join('')}</div><span class="muted" style="font-size:.88rem"><b data-count>${ctx.resources.length}</b> shown</span></div>
<div class="grid g3" id="resList">${ctx.resources.map(r => `<div class="card link dir-item" data-item data-cat="${esc(r.cat)}"><span class="badge gray">${esc(r.cat)}</span><h3 style="margin:6px 0 0;font-size:1.08rem"><a class="stretch" href="${esc(r.url)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">${esc(r.name)}</a></h3><span class="host">${host(r.url)}</span><p style="margin:0;font-size:.92rem">${esc(r.desc)}</p></div>`).join('')}</div><div class="empty hide" data-empty>Nothing matches — try a broader term.</div>
<p class="muted" style="margin-top:20px;font-size:.88rem">Know a resource nurses should see? <a href="/contact/?topic=Suggest%20a%20resource">Suggest it</a>. Organisations can <a href="/advertise/">sponsor a featured listing</a>.</p></div></section>`
  });

  /* ================= GEAR ================= */
  const amz = q => `https://www.amazon.com/s?k=${encodeURIComponent(q)}${cfg.affiliate.amazonTag ? '&tag=' + cfg.affiliate.amazonTag : ''}`;
  add({
    path: '/gear/index.html', title: 'Nursing Gear Guide — Shoes, Stethoscopes, Scrubs & Shift Essentials',
    description: 'What nurses actually need on shift: stethoscopes, supportive shoes, compression socks, scrubs, penlights, shears and organisation — with what to look for in each.', crumbs: [['Gear guide', '/gear/']],
    body: pageHero({ eyebrow: 'Gear guide', title: 'Gear that earns its place in your pocket', lead: 'What to look for, what to skip, and why — organised by what you’ll use every shift.', crumbs: [['Gear guide']] }) +
      `<section><div class="wrap"><p class="note" style="margin-top:0;border:0;padding:0"><strong>Disclosure:</strong> some links are affiliate links — NurseNow may earn a commission at no extra cost to you. It never changes what we recommend. <a href="/affiliate-disclosure/">Learn more</a>.</p>
<div class="grid g2" style="margin-top:20px">${ctx.gear.map(g => `<div class="card"><div class="ico ${g.c || ''}">${icon(g.icon || 'bag')}</div><h3>${esc(g.name)}</h3><p>${esc(g.why)}</p><ul class="ticks">${g.look.map(x => `<li>${esc(x)}</li>`).join('')}</ul><a class="btn btn-ghost btn-sm" href="${amz(g.search)}" target="_blank" rel="noopener sponsored nofollow">Shop ${esc(g.short || g.name)} ↗</a></div>`).join('')}</div>
<div class="cta-box"><h3>Brands: get featured</h3><p>Scrubs, footwear, study tools and nurse-focused products can sponsor this guide. Placements are always labelled.</p><a class="btn btn-primary" href="/advertise/">Advertise with NurseNow</a></div></div></section>`
  });

  /* ================= SUPPORT / DONATE ================= */
  add({
    path: '/support/index.html', title: 'Support NurseNow — Donate, Sponsor or Pledge',
    description: 'Help keep NurseNow free for every nurse. Donations fund operations, new free tools, promotion, contest prizes and paying nurse writers.', crumbs: [['Support', '/support/']],
    body: pageHero({ eyebrow: 'Support NurseNow', title: 'Keep the tools free for every nurse', lead: 'No paywalls on the job feed, NCLEX practice or tools. Reader support pays for the parts ads don’t cover.', crumbs: [['Support']] }) +
      `<section><div class="wrap"><div class="grid g4">
${[['Coffee', '$5', 'Keeps the daily data refresh running for a week.'], ['Study buddy', '$25', 'Funds new original NCLEX questions with rationales.'], ['Champion', '$100', 'Goes straight into contest prizes for nurses.'], ['Monthly', '$10/mo', 'Steady support for hosting, tools and nurse writers.']]
  .map(([n, a, d], i) => `<div class="card plan ${i === 1 ? 'best' : ''}">${i === 1 ? '<span class="badge coral">Most chosen</span>' : ''}<h3 style="margin-top:8px">${n}</h3><div class="price">${a}</div><p>${d}</p><a class="btn ${i === 1 ? 'btn-primary' : 'btn-ghost'} btn-block" data-pay href="${(i === 3 ? P.donateMonthly : P.donateOnce) || '#'}" data-fallback="#pledge" data-pick="${n} (${a})" data-pick-target="#pg-tier">Give ${a}</a></div>`).join('')}
</div></div></section>
<section class="band"><div class="wrap grid g2" style="gap:40px;align-items:start"><div><h2>Where support goes</h2><p>Our planned allocation for reader support:</p><div class="table-wrap"><table><tbody><tr><td>Operations — hosting, domains, data feeds</td><td><b>30%</b></td></tr><tr><td>New free tools & original content</td><td><b>25%</b></td></tr><tr><td>Promotion & outreach to nursing students</td><td><b>15%</b></td></tr><tr><td>Contest prizes & scholarships</td><td><b>15%</b></td></tr><tr><td>Paying nurse writers & reviewers</td><td><b>15%</b></td></tr></tbody></table></div>
<h3 style="margin-top:28px">Other ways to help</h3><ul class="ticks"><li>Share a guide or tool with your unit group chat</li><li><a href="/careers/">Write, review or create</a> with us</li><li><a href="/contests/">Sponsor a contest prize</a></li><li><a href="/advertise/">Sponsor a tool or section</a> for your organisation</li></ul></div>
<div class="form-card" id="pledge"><h3>Pledge or request a payment link</h3><p class="muted">Prefer e-Transfer, invoice or a custom amount? Tell us and we’ll send secure payment details by email.</p><form class="js-form" data-subject="Donation pledge" data-ok="Thank you! We’ll email secure payment details shortly.">${honey}<div class="field"><label for="pg-tier">Support level</label><input id="pg-tier" name="tier" value="Study buddy ($25)" required></div><div class="row"><div class="field"><label for="pg-name">Name</label><input id="pg-name" name="name" required></div><div class="field"><label for="pg-email">Email</label><input id="pg-email" name="email" type="email" required></div></div><div class="row"><div class="field"><label for="pg-freq">Frequency</label><select id="pg-freq" name="frequency"><option>One-time</option><option>Monthly</option><option>Annual</option></select></div><div class="field"><label for="pg-method">Preferred method</label><select id="pg-method" name="method"><option>Card (payment link)</option><option>PayPal</option><option>Interac e-Transfer</option><option>Invoice (organisations)</option></select></div></div><div class="field"><label class="check"><input type="checkbox" name="public_thanks" value="yes"> <span>You may thank me by first name on the supporters list.</span></label></div>${consent()}<button class="btn btn-primary btn-block" type="submit">Send pledge</button><div class="form-msg" role="status"></div></form><p class="muted" style="font-size:.82rem;margin-top:12px">NurseNow is not a registered charity; contributions are not tax-deductible.</p></div></div></section>`
  });
}
