#!/usr/bin/env node
/* Summarizes eval/runs into eval/results.json and prints Markdown tables.
 *   node eval/summarize.js > eval/tables.md
 */
"use strict";
const fs = require("fs");
const path = require("path");
const RUNS = path.join(__dirname, "runs");
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const ls = (d) => (fs.existsSync(d) ? fs.readdirSync(d) : []);
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const f1 = (x, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : "–");
const pct = (x) => (Number.isFinite(x) ? Math.round(x * 100) + "%" : "–");
const NAMES = { H: "Haiku", S: "Sonnet", O: "Opus" };
const label = (c) => (c.startsWith("single") ? `Single prompt, ${NAMES[c.split("-")[1]]}` : c.split("~")[0].split("").map((k) => NAMES[k]).join(" → ") + (c.includes("~") ? ` (repeat ${c.split("~")[1]})` : ""));

const configs = ls(path.join(RUNS, "reports")).filter((c) => !c.includes("~"));
const rows = [];
for (const cfg of configs) {
  const per = [];
  for (const f of ls(path.join(RUNS, "reports", cfg))) {
    const r = read(path.join(RUNS, "reports", cfg, f));
    const jf = path.join(RUNS, "judge", cfg, f);
    const j = fs.existsSync(jf) ? read(jf).data : null;
    if (!j) continue;
    const sec = Object.values(j.sections || {}).reduce((a, b) => a + Number(b || 0), 0);
    const head = Object.values(j.header || {}).reduce((a, b) => a + Number(b || 0), 0);
    const total = head + sec + Number(j.close || 0) + Number(j.messaging || 0);
    const mc = j.must_catch || [];
    per.push({
      deal: f.replace(".json", ""), total, head, sec, close: Number(j.close || 0), messaging: Number(j.messaging || 0),
      mc_pass: mc.filter((m) => m.pass).length, mc_n: mc.length, fails: (j.fails || []).filter((x) => x && String(x).trim()).length,
      outcome: r.header.outcome, tag: r.header.tag, quotes_ok: (r.checks.quotes_total - r.checks.quotes_failed) / Math.max(1, r.checks.quotes_total),
      ms: r.meta.ms, cost: r.meta.cost, stage_ms: r.meta.stage_ms, stage_cost: r.meta.stage_cost,
      reader_items: r.meta.reader_items, reader_verbatim: r.meta.reader_verbatim, sections: j.sections, notes: j.notes, fails_list: j.fails,
    });
  }
  if (!per.length) continue;
  rows.push({
    cfg, label: label(cfg), n: per.length,
    total: avg(per.map((p) => p.total)), head: avg(per.map((p) => p.head)), sec: avg(per.map((p) => p.sec)),
    close: avg(per.map((p) => p.close)), messaging: avg(per.map((p) => p.messaging)),
    mc: per.reduce((a, p) => a + p.mc_pass, 0) / Math.max(1, per.reduce((a, p) => a + p.mc_n, 0)),
    fails: per.reduce((a, p) => a + p.fails, 0), quotes_ok: avg(per.map((p) => p.quotes_ok)),
    ms: avg(per.map((p) => p.ms)), cost: avg(per.map((p) => p.cost)), per,
  });
}
rows.sort((a, b) => b.total - a.total);

let md = "### Overall (8 test deals, judged against the answer keys; max score 24)\n\n";
md += "| Setup (reader → analyst → strategist) | Score /24 | Header /6 | Sections /14 | Close /2 | Messaging /2 | Must-catch | Invented content | Quotes verbatim | Time per review | Cost per review |\n|---|---|---|---|---|---|---|---|---|---|---|\n";
for (const r of rows) md += `| ${r.label} | **${f1(r.total)}** | ${f1(r.head)} | ${f1(r.sec)} | ${f1(r.close)} | ${f1(r.messaging)} | ${pct(r.mc)} | ${r.fails} | ${pct(r.quotes_ok)} | ${Math.round(r.ms / 1000)}s | $${f1(r.cost, 3)} |\n`;

// Per stage, per model
const stage = {};
for (const st of ["reader", "analyst", "strategist", "single"]) {
  for (const key of ls(path.join(RUNS, "stages", st))) {
    if (key.includes("~")) continue;
    const m = st === "reader" || st === "single" ? key : st === "analyst" ? key[1] : key[2];
    const files = ls(path.join(RUNS, "stages", st, key)).map((f) => read(path.join(RUNS, "stages", st, key, f))).filter((x) => x.data);
    const s = (stage[st + ":" + m] = stage[st + ":" + m] || { st, m, ms: [], cost: [], items: [], out: [] });
    for (const x of files) { s.ms.push(x.ms); s.cost.push(x.cost); s.out.push(x.out_tokens || 0); if (st === "reader") s.items.push((x.data.evidence || []).length); }
  }
}
md += "\n### Per step, per model (averages per call)\n\n| Step | Model | Calls | Time | Cost | Output tokens |\n|---|---|---|---|---|---|\n";
for (const s of Object.values(stage)) md += `| ${s.st} | ${NAMES[s.m] || s.m} | ${s.ms.length} | ${Math.round(avg(s.ms) / 1000)}s | $${f1(avg(s.cost), 4)} | ${Math.round(avg(s.out))} |\n`;

// Reader quality: verbatim rate per model (from reports, which record pre/post filter counts)
const D = require("../app/core.js");
const TDIR = path.join(__dirname, "../test-set/transcripts");
const readerQ = {};
for (const m of ls(path.join(RUNS, "stages/reader")).filter((k) => !k.includes("~"))) {
  for (const f of ls(path.join(RUNS, "stages/reader", m))) {
    const x = read(path.join(RUNS, "stages/reader", m, f)); if (!x.data) continue;
    const tf = ls(TDIR).find((t) => t.startsWith(f.replace(".json", "")));
    const v = D.makeVerifier(D.parseTranscript(fs.readFileSync(path.join(TDIR, tf), "utf8"), tf).turns);
    const ev = x.data.evidence || [];
    const q = (readerQ[m] = readerQ[m] || { items: [], ok: [], labels: { quote: 0, fact: 0, opinion: 0 }, contra: [], dodges: [] });
    q.items.push(ev.length); q.ok.push(ev.filter((e) => v(e.excerpt)).length / Math.max(1, ev.length));
    for (const e of ev) if (q.labels[e.label] != null) q.labels[e.label]++;
    q.contra.push((x.data.contradictions || []).length); q.dodges.push((x.data.dodges || []).length);
  }
}
md += "\n### Reader: evidence items and word-for-word accuracy\n\n| Reader | Items per transcript | Excerpts found word for word | Quote / fact / opinion mix | Contradictions found | Dodges found |\n|---|---|---|---|---|---|\n";
for (const [m, q] of Object.entries(readerQ)) {
  const t = q.labels.quote + q.labels.fact + q.labels.opinion;
  md += `| ${NAMES[m]} | ${f1(avg(q.items), 0)} | ${pct(avg(q.ok))} | ${pct(q.labels.quote / t)} / ${pct(q.labels.fact / t)} / ${pct(q.labels.opinion / t)} | ${f1(avg(q.contra))} | ${f1(avg(q.dodges))} |\n`;
}

// Per-deal grid
const deals = [...new Set(rows.flatMap((r) => r.per.map((p) => p.deal)))].sort();
md += "\n### Score by deal (/24)\n\n| Setup | " + deals.map((d) => d.slice(0, 2)).join(" | ") + " |\n|---|" + deals.map(() => "---").join("|") + "|\n";
for (const r of rows) md += `| ${r.label} | ` + deals.map((d) => { const p = r.per.find((x) => x.deal === d); return p ? `${p.total}${p.fails ? "*" : ""}` : "–"; }).join(" | ") + " |\n";
md += "\n`*` = the judge flagged invented content in that report.\n";

// Consistency: repeats
const reps = ls(path.join(RUNS, "reports")).filter((c) => c.includes("~"));
if (reps.length) {
  md += "\n### Consistency (same setup, independent runs)\n\n| Setup | Deal | Outcome per run | Tag per run |\n|---|---|---|---|\n";
  const base = [...new Set(reps.map((c) => c.split("~")[0]))];
  for (const b of base) {
    const runs = [b, ...reps.filter((c) => c.startsWith(b + "~")).sort()];
    const ds = [...new Set(runs.flatMap((c) => ls(path.join(RUNS, "reports", c))))].sort();
    for (const d of ds) {
      const hs = runs.map((c) => { const f = path.join(RUNS, "reports", c, d); return fs.existsSync(f) ? read(f).header : null; }).filter(Boolean);
      if (hs.length < 2) continue;
      md += `| ${label(b)} | ${d.replace(".json", "")} | ${hs.map((x) => x.outcome).join(" / ")} | ${hs.map((x) => x.tag).join(" / ")} |\n`;
    }
  }
}
fs.writeFileSync(path.join(__dirname, "results.json"), JSON.stringify(rows.map(({ per, ...r }) => ({ ...r, per: per.map(({ sections, notes, fails_list, stage_ms, stage_cost, ...p }) => ({ ...p, sections, notes, fails: fails_list })) })), null, 1));
process.stdout.write(md);
