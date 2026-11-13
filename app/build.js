#!/usr/bin/env node
/* Builds dist/deal-reviews.html from app/page.html:
 *  - inlines app/core.js (the same file the eval harness tests)
 *  - inlines example reviews: real outputs of the chosen pipeline on the fictional test deals
 *  - inlines one fictional example transcript for "Use an example transcript"
 *   node app/build.js [--config SOO]
 */
"use strict";
const fs = require("fs");
const path = require("path");
const D = require("./core.js");
const ROOT = path.join(__dirname, "..");
const i = process.argv.indexOf("--config");
const CONFIG = i > 0 ? process.argv[i + 1] : "SOO";

const safe = (s) => s.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
const rdir = path.join(ROOT, "eval/runs/reports", CONFIG);
const files = fs.existsSync(rdir) ? fs.readdirSync(rdir).filter((f) => f.endsWith(".json")).sort() : [];
const REPS = { "01": "Dana", "02": "Marcus", "03": "Priya", "04": "Tom", "05": "Elena", "06": "Jordan", "07": "Sam", "08": "Renee" };
const now = Date.now();
const examples = files.map((f, n) => {
  const report = JSON.parse(fs.readFileSync(path.join(rdir, f), "utf8"));
  const num = f.slice(0, 2);
  report.rep = REPS[num] || null;
  if (report.header && /^(unnamed|unknown|not named|not stated)/i.test(String(report.header.competitor || ""))) report.header.competitor = null;
  report.createdAt = new Date(now - (files.length - n) * 6 * 864e5).toISOString(); // spread over recent weeks
  delete report.meta.cost; delete report.meta.stage_cost; delete report.meta.judge_cost;
  const card = D.toCard(report, { rep: report.rep, createdAt: report.createdAt, models: report.meta.models });
  return { card, report };
});

const page = fs.readFileSync(path.join(__dirname, "page.html"), "utf8");
const core = fs.readFileSync(path.join(__dirname, "core.js"), "utf8");
const exTranscript = fs.readFileSync(path.join(ROOT, "test-set/transcripts/07-fernbrook-garden-supply.txt"), "utf8");
const out = page
  .replace("/*__CORE__*/", () => safe(core))
  .replace("/*__EXAMPLES__*/[]", () => safe(JSON.stringify(examples)))
  .replace('/*__EXAMPLE_TRANSCRIPT__*/""', () => safe(JSON.stringify(exTranscript)));
fs.mkdirSync(path.join(ROOT, "dist/assets"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "dist/deal-reviews.html"), out);
for (const a of fs.readdirSync(path.join(__dirname, "assets"))) fs.copyFileSync(path.join(__dirname, "assets", a), path.join(ROOT, "dist/assets", a));
console.log(`dist/deal-reviews.html  ${(out.length / 1024).toFixed(0)} KB  examples: ${examples.length} (${CONFIG})`);
