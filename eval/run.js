#!/usr/bin/env node
/* Model comparison harness for the deal-review pipeline.
 * Runs the SAME prompts the page uses (app/core.js) through the Claude CLI,
 * on each test transcript, for several model assignments per stage; then a
 * judge (Opus, high effort) scores every report against its answer key.
 *
 *   node eval/run.js [--deals 01,02] [--configs SSS,HSO] [--concurrency 6] [--no-judge]
 *
 * Stage outputs are cached under eval/runs/, so re-runs only fill gaps.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const D = require("../app/core.js");

const ROOT = path.join(__dirname, "..");
const RUNS = path.join(__dirname, "runs");
const MODELS = { H: "claude-haiku-5-5", S: "claude-sonnet-5-5", O: "claude-opus-5-5" };
const EFFORT = "medium";

// A pipeline config is three letters: reader, analyst, strategist.
const PIPELINES = ["HHH", "SSS", "OOO", "HSO", "HSS", "HOO", "SOO"];
const SINGLES = ["single-S", "single-O"];

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : args[i + 1]; };
const flag = (k) => args.includes("--" + k);
const DEALS = fs.readdirSync(path.join(ROOT, "test-set/transcripts")).map((f) => f.replace(/\.(vtt|txt)$/, "")).sort()
  .filter((d) => !opt("deals") || opt("deals").split(",").some((x) => d.startsWith(x)));
const CONFIGS = (opt("configs") ? opt("configs").split(",") : [...PIPELINES, ...SINGLES]);
const CONCURRENCY = Number(opt("concurrency", 6));

// ── CLI call ───────────────────────────────────────────────────────
function extractJSON(text) {
  const t = String(text || "").trim();
  try { return JSON.parse(t); } catch {}
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const a = t.search(/[[{]/), b = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch {} }
  return null;
}

function claude(prompt, model, effort) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const p = spawn("claude", ["-p", "--model", model, "--effort", effort, "--tools", "", "--output-format", "json",
      "--no-session-persistence", "--system-prompt", "Follow the instructions in the user message exactly. When asked for JSON, reply with only the JSON."],
      { stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", () => {
      let r = {};
      try { r = JSON.parse(out); } catch { r = { is_error: true, result: out || err }; }
      const u = r.usage || {};
      resolve({
        ok: !r.is_error, text: r.result || "", data: D.parseModelJSON(r.result),
        ms: Date.now() - t0, cost: r.total_cost_usd || 0,
        in_tokens: (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0),
        out_tokens: u.output_tokens || 0, model: Object.keys(r.modelUsage || {})[0] || model,
      });
    });
    p.stdin.end(prompt);
  });
}

// Cached stage call: one file per (stage key, deal).
async function cached(file, fn) {
  if (fs.existsSync(file)) { const j = JSON.parse(fs.readFileSync(file, "utf8")); if (j.data) return j; }
  for (let attempt = 1; attempt <= 2; attempt++) {
    const r = await fn();
    if (r.data) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(r, null, 1)); return r; }
    console.warn(`  ! no JSON (${path.relative(RUNS, file)}, attempt ${attempt}): ${String(r.text).slice(0, 160)}`);
  }
  return { data: null };
}

// Simple promise pool + memo so shared stages (e.g. the Haiku reader) run once.
const memo = new Map();
const once = (key, fn) => { if (!memo.has(key)) memo.set(key, fn()); return memo.get(key); };
let active = 0; const queue = [];
const slot = () => new Promise((r) => (active < CONCURRENCY ? (active++, r()) : queue.push(r)));
const release = () => { const n = queue.shift(); n ? n() : active--; };
async function limited(fn) { await slot(); try { return await fn(); } finally { release(); } }

// ── Inputs ─────────────────────────────────────────────────────────
function loadDeal(deal) {
  const tdir = path.join(ROOT, "test-set/transcripts");
  const f = fs.readdirSync(tdir).find((x) => x.startsWith(deal));
  const src = fs.readFileSync(path.join(tdir, f), "utf8");
  const parsed = D.parseTranscript(src, f);
  const roles = D.guessRoles(parsed);
  const name = deal.replace(/^\d+-/, "").split("-").map((w) => (w === "and" ? "&" : w[0].toUpperCase() + w.slice(1))).join(" ");
  return { deal, name, parsed, roles, transcript: D.renderTranscript(parsed.turns, roles),
    key: fs.readFileSync(path.join(ROOT, "test-set/answer-keys", deal + ".md"), "utf8") };
}

// ── Pipeline runs ──────────────────────────────────────────────────
const stageFile = (stage, key, deal) => path.join(RUNS, "stages", stage, key, deal + ".json");

async function runPipelineConfig(cfgFull, d) {
  // "SOO~2" = an independent repeat of SOO with its own cache, for consistency checks.
  const [cfg, rep] = cfgFull.split("~");
  const sfx = rep ? "~" + rep : "";
  const [r, a, s] = cfg.split("");
  const kR = r + sfx, kA = r + a + sfx, kS = cfg + sfx;
  const reader = await once(`reader:${kR}:${d.deal}`, () => limited(() => cached(stageFile("reader", kR, d.deal),
    () => claude(D.readerPrompt({ deal: d.name, transcript: d.transcript }), MODELS[r], EFFORT))));
  if (!reader.data) return null;
  const verbatim = D.makeVerifier(d.parsed.turns);
  const ledger = JSON.parse(JSON.stringify(reader.data));
  ledger.evidence = (ledger.evidence || []).filter((e) => verbatim(e.excerpt));

  const analyst = await once(`analyst:${kA}:${d.deal}`, () => limited(() => cached(stageFile("analyst", kA, d.deal),
    () => claude(D.analystPrompt({ deal: d.name, transcript: d.transcript, ledger }), MODELS[a], EFFORT))));
  if (!analyst.data) return null;

  const strat = await once(`strat:${kS}:${d.deal}`, () => limited(() => cached(stageFile("strategist", kS, d.deal),
    () => claude(D.strategistPrompt({ deal: d.name, analysis: analyst.data, ledger }), MODELS[s], EFFORT))));

  const report = D.assemble({ deal: undefined, ledger, analysis: analyst.data, strategy: strat.data || { changes: [] }, turns: d.parsed.turns,
    meta: { models: { reader: MODELS[r], analyst: MODELS[a], strategist: MODELS[s] } } });
  const stages = { reader, analyst, strategist: strat };
  report.meta.ms = reader.ms + analyst.ms + (strat.ms || 0);       // sequential wall time
  report.meta.cost = reader.cost + analyst.cost + (strat.cost || 0);
  report.meta.stage_ms = Object.fromEntries(Object.entries(stages).map(([k, v]) => [k, v.ms]));
  report.meta.stage_cost = Object.fromEntries(Object.entries(stages).map(([k, v]) => [k, v.cost]));
  report.meta.reader_items = (reader.data.evidence || []).length;
  report.meta.reader_verbatim = ledger.evidence.length;
  return report;
}

async function runSingle(cfg, d) {
  const m = cfg.split("-")[1];
  const r = await limited(() => cached(stageFile("single", m, d.deal),
    () => claude(D.singlePrompt({ deal: d.name, transcript: d.transcript }), MODELS[m], EFFORT)));
  if (!r.data) return null;
  const x = r.data;
  // Normalize to the pipeline's shape: evidence by excerpt instead of ledger id.
  const ledger = { evidence: [] }; let n = 0;
  const analysis = { header: x.header, sections: {}, close: x.close };
  for (const k of D.SECTION_KEYS) {
    const s = (x.sections || {})[k] || { covered: false };
    analysis.sections[k] = { ...s, evidence: (s.evidence || []).map((e) => { const id = "S" + ++n; ledger.evidence.push({ id, ...e }); return { id, excerpt: e.excerpt, label: e.label }; }) };
  }
  const strategy = { changes: (x.messaging_changes || []).map((c) => ({ ...c, evidence: [] })) };
  const report = D.assemble({ deal: undefined, ledger, analysis, strategy, turns: d.parsed.turns, meta: { models: { single: MODELS[m] } } });
  report.messaging_changes.forEach((c, i) => (c.evidence_excerpts = (x.messaging_changes[i] || {}).evidence_excerpts || []));
  Object.assign(report.meta, { ms: r.ms, cost: r.cost, stage_ms: { single: r.ms }, stage_cost: { single: r.cost } });
  return report;
}

// ── Short report (current page format): reader (cached from round 9) -> analyst -> checks
async function runShort(cfgFull, d) {
  const sfx = cfgFull.split("~")[1] || "a";
  const readerKey = "S~v9a"; // same transcripts and reader instructions as round 9
  const reader = await once(`reader:${readerKey}:${d.deal}`, () => limited(() => cached(stageFile("reader", readerKey, d.deal),
    () => claude(D.readerPrompt({ transcript: d.transcript }), MODELS.S, EFFORT))));
  if (!reader.data) return null;
  const verbatim = D.makeVerifier(d.parsed.turns);
  const ledger = JSON.parse(JSON.stringify(reader.data));
  ledger.evidence = (ledger.evidence || []).filter((e) => verbatim(e.excerpt));
  const analyst = await limited(() => cached(stageFile("short", "O~" + sfx, d.deal),
    () => claude(D.reviewPrompt({ transcript: d.transcript, ledger }), MODELS.O, EFFORT)));
  if (!analyst.data) return null;
  const report = D.assembleReview({ review: analyst.data, turns: d.parsed.turns, meta: { models: { reader: MODELS.S, analyst: MODELS.O } } });
  report.meta.ms = (reader.ms || 0) + analyst.ms;
  report.meta.cost = (reader.cost || 0) + analyst.cost;
  report.meta.stage_ms = { reader: reader.ms, analyst: analyst.ms };
  report.meta.stage_cost = { reader: reader.cost, analyst: analyst.cost };
  return report;
}

function judgeShortPrompt(d, report) {
  const clean = { header: report.header, findings: report.findings };
  return `You are grading a short AI-written deal review against an answer key written by a product-marketing lead. The review has only: account, ACV, outcome, competitor, a reason tag, a one-to-two sentence reason, and six labelled insights (trigger, who decided, competitor, our message, missing proof, the customer's words), each a messaging change (sometimes tied to one of our current messaging lines), a one-line why, and a supporting quote. Ignore the answer key's section-by-section detail; use it to judge whether this short review got the essentials right. Be strict and consistent.

Scoring:
- account: 1 = the account name (or, if the transcript never names it, a fair short description); 0 otherwise.
- acv: 1 = matches the key's ACV; 0 otherwise.
- outcome: 1 = matches the key's outcome; 0 otherwise.
- tag: 2 = the key's tag; 1 = the key's acceptable alternative; 0 otherwise.
- reason: 2 = names the real reason the key gives (not the rep's framing where the key says they differ); 1 = partly; 0 = wrong or the rep's framing.
- insights: each of trigger, decider, competitor, message, proof, words is meant to be an ACTION for the product marketing team (a change to messaging, positioning, proof assets or what reps say), backed by a quote. Score each 0-1: 1 = a specific, actionable step that follows from the evidence and points the same way as the key's insight / expected messaging direction for that topic; 0.5 = actionable but generic, or right direction but mostly a description of what happened; 0 = a summary with no action, wrong, or "not covered" when the transcript had it.
- repetitive: true if two findings make the same point.
- messaging: 0-2. The readers are product marketers sharpening messaging. 2 = every action is a messaging change (what to lead with, say, stop saying, or which proof point to add), tied to the right current line where one applies; 1 = some actions are sales process or tactics rather than messaging; 0 = mostly not about messaging.
- readable: 0-2. Read it as a busy marketer skimming a feed who was not in the call. 2 = every action and its why is understood in one quick read: short, plain words, no jargon. 1 = mostly clear but some items are dense, long or use sales jargon. 0 = hard to follow.
- fails: list every instance of invented content (a claim, figure, name or quote not supported by the transcript) and every "Fails if" condition the review triggers. Empty list if none.

ANSWER KEY
${d.key}
END ANSWER KEY

TRANSCRIPT
${d.transcript}
END TRANSCRIPT

REVIEW (JSON)
${JSON.stringify(clean)}

Reply with ONLY this JSON:
{"account":0,"acv":0,"outcome":0,"tag":0,"reason":0,"insights":{"trigger":0,"decider":0,"competitor":0,"message":0,"proof":0,"words":0},"repetitive":false,"readable":0,"messaging":0,"fails":[""],"notes":"2 sentences: what it got right, what it missed"}`;
}

// ── Judge ──────────────────────────────────────────────────────────
function judgePrompt(d, report) {
  const clean = JSON.parse(JSON.stringify(report));
  delete clean.meta; delete clean.checks; delete clean.version;
  for (const k in clean.sections) clean.sections[k].evidence.forEach((e) => { delete e.verified; delete e.id; });
  return `You are grading an AI-written deal review against an answer key written by a product-marketing lead. Be strict and consistent. The report was produced from the transcript below; the answer key says what a great report must contain.

Scoring:
- header.outcome: 2 = outcome right AND scope note handled as the key says; 1 = outcome right but scope missing/wrong; 0 = wrong outcome.
- header.competitor_incumbent: 2 both right, 1 one right, 0 neither.
- header.tag: 2 = the key's tag; 1 = the key's acceptable alternative (or the key's tag given only as runner_up); 0 otherwise.
- sections (trigger, decider, competitor, message, decided, gaps, language), each: 2 = cites the key evidence with the right label (quote/fact/opinion) AND reaches the key insight; 1 = right evidence but shallow insight, or a wrong label on key evidence; 0 = wrong conclusion, or "not covered" when the transcript had the answer. A section the key marks "Not covered" scores 2 only if the report says it was not covered (citing incidental evidence is fine if labelled as such).
- close: 2 = lists the skipped/dodged questions the key names with sensible follow-ups AND the rep takeaway matches the key's theme; 1 = partly; 0 = misses.
- messaging: 2 = the changes point the same direction as the key's "Messaging changes: expected direction" and each rests on real evidence; 1 = partly; 0 = off-target or unsupported.
- must_catch: for EACH checkbox item in the key's "Must catch" list, pass true/false.
- repetitive: true if two findings make the same point.
- messaging: 0-2. The readers are product marketers sharpening messaging. 2 = every action is a messaging change (what to lead with, say, stop saying, or which proof point to add), tied to the right current line where one applies; 1 = some actions are sales process or tactics rather than messaging; 0 = mostly not about messaging.
- readable: 0-2. Read it as a busy marketer skimming a feed who was not in the call. 2 = every action and its why is understood in one quick read: short, plain words, no jargon. 1 = mostly clear but some items are dense, long or use sales jargon. 0 = hard to follow.
- fails: list every instance of invented content (a quote or excerpt not in the transcript, a figure, name or result not in the transcript, a definite answer where the key says unknown) and every "Fails if" condition the report triggers. Empty list if none.

ANSWER KEY
${d.key}
END ANSWER KEY

TRANSCRIPT
${d.transcript}
END TRANSCRIPT

REPORT (JSON)
${JSON.stringify(clean)}

Reply with ONLY this JSON:
{"header":{"outcome":0,"competitor_incumbent":0,"tag":0},
 "sections":{"trigger":0,"decider":0,"competitor":0,"message":0,"decided":0,"gaps":0,"language":0},
 "close":0,"messaging":0,
 "must_catch":[{"item":"","pass":true}],
 "fails":[""],
 "notes":"2-3 sentences: the most important thing this report got right and the most important thing it missed"}`;
}

async function judge(cfg, d, report) {
  return limited(() => cached(path.join(RUNS, "judge", cfg, d.deal + ".json"),
    () => claude(judgePrompt(d, report), MODELS.O, "high")));
}

// ── Main ───────────────────────────────────────────────────────────
(async () => {
  const deals = DEALS.map(loadDeal);
  console.log(`deals: ${deals.map((d) => d.deal.slice(0, 2)).join(",")}  configs: ${CONFIGS.join(",")}  concurrency: ${CONCURRENCY}`);
  const t0 = Date.now();
  const jobs = [];
  for (const cfg of CONFIGS) for (const d of deals) jobs.push((async () => {
    const report = cfg.startsWith("short") ? await runShort(cfg, d) : cfg.startsWith("single") ? await runSingle(cfg, d) : await runPipelineConfig(cfg, d);
    if (!report) { console.log(`✗ ${cfg} ${d.deal}`); return; }
    const out = path.join(RUNS, "reports", cfg, d.deal + ".json");
    fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(report, null, 1));
    let j = null;
    if (!flag("no-judge")) {
      j = cfg.startsWith("short")
        ? await limited(() => cached(path.join(RUNS, "judge", cfg, d.deal + ".json"), () => claude(judgeShortPrompt(d, report), MODELS.O, "high")))
        : await judge(cfg, d, report);
      if (j.data) report.meta.judge_cost = j.cost;
    }
    const q = report.findings ? `covered ${report.findings.filter((f) => f.covered !== false).length}/${report.findings.length} (dropped ${report.checks.findings_dropped.length})` : `quotes ${report.checks.quotes_total - report.checks.quotes_failed}/${report.checks.quotes_total}`;
    console.log(`✓ ${cfg.padEnd(8)} ${d.deal.padEnd(28)} ${(report.meta.ms / 1000).toFixed(0).padStart(4)}s $${report.meta.cost.toFixed(3)}  ${report.header.outcome}/${report.header.tag}  ${q}${j && j.data ? "  judged" : ""}`);
  })());
  await Promise.all(jobs);
  console.log(`done in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
})();
