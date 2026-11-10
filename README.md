# NurseNow.com

Self-updating nursing career platform: daily jobs, news and videos, US + Canada licensing guides, NCLEX practice with rationales, free career tools, lead generation, donations, contests and hiring — monetised with Google AdSense, featured jobs, sponsorships and affiliates.

**Stack:** zero-dependency Node static generator → `docs/`. No framework, no database, no server. A GitHub Action refreshes data and rebuilds every day.

> The previous Google AI Studio (Next.js + Firebase) app is preserved on the `legacy-ai-studio` branch.

## How the daily automation works

`.github/workflows/daily.yml` runs every day (~10:17 UTC), on every push to `main`, and on demand (Actions → *Daily refresh & build* → *Run workflow*):

1. `scripts/update.mjs` pulls fresh **news** (Google News RSS), **jobs** (Jobicy + The Muse public APIs, plus Adzuna and USAJOBS if keys are set) and **videos** (YouTube channel RSS). Each source fails independently; yesterday’s data is kept if a source is down.
2. `scripts/ai-draft.mjs` *(optional)* writes one AI draft per week to `content/drafts/` — **never auto-published**.
3. `scripts/build.mjs` regenerates every page, `sitemap.xml` (fresh `lastmod`), `rss.xml`, `feed.json`, `ads.txt`, `robots.txt`.
4. The bot commits the result, then the `deploy` job publishes `docs/` to **GitHub Pages**.

## One-time setup checklist

1. **GitHub Pages (free — the repo is public):**
   1. Settings → Pages → *Build and deployment* → **Source: GitHub Actions**.
   2. Same page → **Custom domain:** `nursenow.com` → Save. (Set it before the first deploy: the site uses root paths, so it is meant to be served from the domain, not from the `github.io/nursenow.com/` sub-path.)
   3. Actions → *Daily refresh & build* → **Run workflow** (or re-run the latest run).
   4. At the domain registrar (GoDaddy DNS for nursenow.com): delete the Vercel `A 76.76.21.21` record and add
      - `A @ 185.199.108.153`, `A @ 185.199.109.153`, `A @ 185.199.110.153`, `A @ 185.199.111.153`
      - optional IPv6: `AAAA @ 2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
      - `CNAME www webworksa1.github.io`
   5. When the certificate is issued, tick **Enforce HTTPS**. Recommended: verify the domain under your GitHub profile → Settings → Pages to block domain takeovers.
   6. Remove `nursenow.com` from the old Vercel project and disconnect that project, so only one copy of the site exists. (`vercel.json` / `netlify.toml` remain only as fallbacks.)
2. **Actions permissions:** Settings → Actions → General → *Workflow permissions* → **Read and write**, so the daily bot can commit.
3. **Google AdSense:** add `nursenow.com` in AdSense. `ads.txt` and the AdSense script (ca-pub-6620975821265271) are on every content page. Turn on **Auto ads**, and enable the **Privacy & messaging → European regulations** message (a Google-certified consent message is required for EEA/UK/Swiss visitors). Optional: paste manual ad-unit slot IDs into `site.config.json → adsense.slots` to add in-article/sidebar units.
4. **Forms:** every form posts privately through FormSubmit; the inbox address is never written in the site. The **first submission from the live domain triggers a one-time FormSubmit activation email** — click it once.
5. **Payments** (optional): paste Stripe Payment Links / PayPal / Ko-fi URLs into `site.config.json → payments`. Empty values automatically fall back to the pledge/invoice forms, so every button already works.
6. **Affiliates** (optional): set `affiliate.amazonTag` in `site.config.json`.
7. **Optional repository secrets** (Settings → Secrets → Actions):
   - `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` — free at developer.adzuna.com; adds US/Canada/UK nursing jobs.
   - `USAJOBS_API_KEY`, `USAJOBS_EMAIL` — free at developer.usajobs.gov; adds federal nursing jobs.
   - `ANTHROPIC_API_KEY` — enables the weekly AI draft agent (drafts only).

## Editing content

| What | Where |
|---|---|
| Articles | `content/articles/*.md` (front matter + Markdown; shortcodes `[[toc]] [[cta:match]] [[cta:nclex]] [[cta:jobs]] [[cta:tools]] [[cta:support]] [[ad]]`) |
| NCLEX questions | `content/nclex.json` |
| Featured (paid) jobs | `content/jobs-featured.json` — `{title, company, location, type, salary, url, date, expires}` |
| Contests | `content/contests.json` — set `status` to `open`, add `prize`, `closes` |
| Hiring roles | `content/careers.json` |
| Courses / waitlist | `content/courses.json` |
| Resource directory | `content/resources.json` |
| Certifications | `content/certifications.json` |
| Gear guide | `content/gear.json` |
| Prices, payments, feeds, AdSense | `site.config.json` |
| Page templates | `scripts/pages/*.mjs` (one module per section; wired in `scripts/pages.mjs`) |

Local preview: `node scripts/build.mjs && npm run serve` → http://localhost:8080

## Compliance notes

- No fabricated stats, testimonials, ratings or job listings — all numbers are sourced (BLS May 2024 etc.).
- Medical disclaimer, privacy (AdSense cookies, opt-outs, PIPEDA/Law 25/GDPR rights), terms, cookies, affiliate disclosure, editorial policy and trademark/copyright pages are included.
- **Contests:** rules include no-purchase-necessary and a skill-testing question for Canadian winners. Contests open to Québec residents with prizes above a small threshold must be declared to the *Régie des alcools, des courses et des jeux* (RACJ) — check current rules before opening a contest.
- E-E-A-T boost: add a named, credentialed nurse reviewer to `/editorial-policy/` and article bylines when available.

## Research

See [`RESEARCH.md`](RESEARCH.md) — 41 nursing websites compared and the features adopted.

© NurseNow™ — a Webworks property. All rights reserved.
