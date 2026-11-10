#!/usr/bin/env node
// OPTIONAL weekly AI drafting agent. Never publishes automatically.
// Runs only when the ANTHROPIC_API_KEY repository secret is set. On Mondays (or when
// FORCE_DRAFT=1) it takes the next topic from content/topic-queue.txt, writes a draft to
// content/drafts/<slug>.md with `draft: true`, and removes the topic from the queue.
// To publish: review/fact-check the draft, set `draft: false`, move it to content/articles/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const key = process.env.ANTHROPIC_API_KEY;
if (!key) { console.log('[ai-draft] no ANTHROPIC_API_KEY — skipped'); process.exit(0); }
if (new Date().getUTCDay() !== 1 && process.env.FORCE_DRAFT !== '1') { console.log('[ai-draft] not Monday — skipped'); process.exit(0); }

const qPath = path.join(ROOT, 'content/topic-queue.txt');
const queue = fs.existsSync(qPath) ? fs.readFileSync(qPath, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#')) : [];
if (!queue.length) { console.log('[ai-draft] topic queue empty'); process.exit(0); }
const topic = queue[0];
const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

const system = `You write for NurseNow, a career site for nurses in the US and Canada. Write an original, practical, accurate guide in Markdown.
Rules: plain language; cite only official or primary sources (regulators, NCSBN, BLS, government sites, certifying bodies) as a list at the end titled "Sources to verify"; never invent statistics, fees or dates — write [VERIFY] where a fact must be checked; no patient-identifying examples; include H2 sections, one table if useful, and a final "## Frequently asked questions" with 3 "### " questions. 900–1300 words. Do not include a title line.`;

const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
  body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-sonnet-5-5', max_tokens: 4000, system, messages: [{ role: 'user', content: `Topic: ${topic}` }] })
});
if (!res.ok) { console.log('[ai-draft] API error', res.status, await res.text()); process.exit(0); }
const data = await res.json();
const body = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
const today = new Date().toISOString().slice(0, 10);
fs.mkdirSync(path.join(ROOT, 'content/drafts'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'content/drafts', `${slug}.md`), `---\ntitle: ${topic}\nslug: ${slug}\ndescription: TODO — one-sentence summary (150 characters)\ncategory: career\ndate: ${today}\nupdated: ${today}\ndraft: true\n---\n${body}\n`);
fs.writeFileSync(qPath, queue.slice(1).join('\n') + '\n');
console.log(`[ai-draft] wrote content/drafts/${slug}.md — review before publishing`);
