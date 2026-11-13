/* Deal Review Synthesizer — shared core.
 * Used verbatim by the published page (inlined) and by the model-comparison
 * harness (Node, via require). Parsing, prompts, verification, orchestration.
 * No DOM, no network: the caller supplies `call(stage, prompt, opts)`.
 */
(function (root) {
  "use strict";

  const PIPELINE_VERSION = "2026-11-14.4";

  // ── Which model runs each stage (set from the model comparison; see eval/REPORT.md)
  const STAGE_MODELS = {
    reader: { model: "claude-sonnet-5-5", effort: "medium" },
    analyst: { model: "claude-opus-5-5", effort: "medium" },
  };

  // ── Reason tags (docs/report-spec.md)
  const TAGS = [
    ["Value proof", "The decider compared MONEY: price against value, payback, ROI, the cost of doing nothing, and whether we showed it in the customer's own numbers. Use it even when the underlying problem is declines or failed payments, if the deciding question was what it is worth."],
    ["Product fit", "A capability we did or didn't have."],
    ["Developer experience", "Docs, sandbox, APIs, how fast their engineers could build."],
    ["Approval rates", "The decider compared APPROVAL PERFORMANCE itself: approval/decline rates by market, card type or issuer, a competitor's test results, the customer's own approval data."],
    ["In-store and online together", "One platform across tills and web: in-store returns of online orders, one customer record, and the store rollout itself (installs, rollout plan, store-operations credibility)."],
    ["Migration effort", "Cost, risk or timing of switching (re-collecting cards, staged moves, freeze periods)."],
    ["Existing relationship or bundle", "The incumbent's bank relationship, bundled services or contract lock-in."],
    ["Support and service", "Who helps after the sale: named people, escalation paths, on-call coverage for critical moments. Not store rollouts (that is In-store and online together)."],
    ["Champion or access", "A champion leaving, or never reaching the person who decided."],
    ["No decision", "Nobody switched: freeze, stall, status quo. Whenever the outcome is No decision, this is the tag, and the underlying cause goes in runner_up."],
    ["Not established", "The review never got to the reason."],
  ];
  const TAG_NAMES = TAGS.map((t) => t[0]);

  const SECTIONS = [
    ["trigger", "Trigger", "What happened at the customer that started this evaluation?"],
    ["decider", "Who decided", "Who made the final call, and how do you know?"],
    ["competitor", "What the customer told us about the competitor", "What did the customer bring up about the competitor? What changed in their questions after they'd met with them?"],
    ["message", "Our message", "Which part of our pitch got a reaction, and which got silence?"],
    ["decided", "What decided it", "When did you first feel this was won or lost? What happened right before?"],
    ["gaps", "Product or proof gaps", "What did they ask for that we couldn't show?"],
    ["language", "Customer language", "What exact words did they use for their problem?"],
  ];
  const SECTION_KEYS = SECTIONS.map((s) => s[0]);

  // ── PROVISIONAL messaging library, reconstructed from how reps describe our pitch
  // in the test transcripts. Replace with the real messaging when it arrives.
  const MESSAGING = [
    { id: "M1", pillar: "Positioning opener", line: "Financial infrastructure to grow globally, in every currency." },
    { id: "M2", pillar: "Developers", line: "Built for developers: launch payments fast with our APIs, docs and sandbox." },
    { id: "M3", pillar: "Unified commerce", line: "Online and in-store on one platform; the line between them has pretty much disappeared." },
    { id: "M4", pillar: "Acceptance", line: "Customers see an average uplift in authorization rates with Authorization Boost and Adaptive Acceptance." },
    { id: "M5", pillar: "Support", line: "Support plans with tiered response times, up to 24/7 coverage." },
    { id: "M6", pillar: "ROI", line: "Proven ROI, backed by an independent economic impact study." },
    { id: "M7", pillar: "Billing", line: "Billing that helps you grow revenue." },
    { id: "M8", pillar: "Proof", line: "Trusted by leading businesses; see our customer stories." },
    { id: "M9", pillar: "Reconciliation", line: "Every payout reconciles automatically to its transactions and your ERP." },
    { id: "M10", pillar: "Recovery", line: "Recover failed payments automatically with smart retries." },
    { id: "M11", pillar: "Marketplaces", line: "Onboard, verify and pay out to sellers worldwide, in their local currency." },
  ];

  // ════════════════════════════════════════════════════════════════
  // Parsing: Zoom/Teams .vtt, Otter/Zoom .txt, plain "Name: text",
  // Markdown "**Name:** text", "HH:MM:SS Speaker 1: text". (.docx text is
  // extracted by the page first, then parsed as plain text.)
  // ════════════════════════════════════════════════════════════════
  const TS = /\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?/;
  const NAME = "[A-Z][\\w'’.\\-]*(?: [A-Z0-9][\\w'’.\\-]*){0,3}|Speaker \\d+|PMM|AE";
  const looksLikeName = (s) => new RegExp("^(?:" + NAME + ")$").test(s.trim()) && s.trim().length <= 40;

  function cleanText(t) {
    return t.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  }

  function mergeTurns(turns) {
    const out = [];
    for (const t of turns) {
      if (!t.text) continue;
      const last = out[out.length - 1];
      if (last && last.speaker === t.speaker) last.text += " " + t.text;
      else out.push({ speaker: t.speaker, text: t.text });
    }
    return out;
  }

  function parseVTT(src) {
    const turns = [];
    const blocks = src.replace(/\r/g, "").split(/\n\s*\n/);
    for (const b of blocks) {
      const lines = b.split("\n").filter((l) => l.trim() && !/^WEBVTT/.test(l) && !/-->/.test(l) && !/^NOTE\b/.test(l));
      // drop numeric / uuid cue ids
      const body = lines.filter((l, i) => !(i === 0 && (/^\d+$/.test(l.trim()) || /^[0-9a-f-]{20,}\/\d+-\d+$/i.test(l.trim()))));
      if (!body.length) continue;
      const joined = body.join(" ");
      let m = joined.match(/^<v\s+([^>]+)>([\s\S]*?)(?:<\/v>)?$/);
      if (m) { turns.push({ speaker: m[1].trim(), text: cleanText(m[2]) }); continue; }
      m = joined.match(new RegExp("^(" + NAME + "):\\s+([\\s\\S]*)$"));
      if (m && looksLikeName(m[1])) { turns.push({ speaker: m[1].trim(), text: cleanText(m[2]) }); continue; }
      turns.push({ speaker: "Unknown", text: cleanText(joined) });
    }
    return mergeTurns(turns);
  }

  function parseText(src) {
    const lines = src.replace(/\r/g, "").split("\n");
    // Pass 1: which format is this, and which "Name:" prefixes are real speakers?
    // A prefix counts as a speaker only if it starts a line at least twice
    // ("Reaction: the docs..." inside an answer is not a speaker).
    const headerRe = [
      new RegExp("^\\[([^\\]]{1,40})\\]\\s+" + TS.source + "$"),
      new RegExp("^(" + NAME + ")\\s{1,}" + TS.source + "$"),
    ];
    // Teams .docx style: the speaker's name alone on its own line, text below.
    const aloneCount = {};
    for (const l of lines) { const s = l.trim(); if (looksLikeName(s) && s.split(" ").length <= 4) aloneCount[s] = (aloneCount[s] || 0) + 1; }
    const aloneNames = Object.keys(aloneCount).filter((n) => aloneCount[n] >= 3);
    headerRe.push(new RegExp("^(" + (aloneNames.length ? aloneNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") : "(?!x)x") + ")$"));
    const headerMode = lines.some((l) => headerRe.some((r) => r.test(l.trim())));
    const prefixCount = {};
    for (const l of lines) {
      const m = l.trim().match(new RegExp("^(?:\\*\\*)?\\[?(?:" + TS.source + "\\]?\\s+)?(" + NAME + "):(?:\\*\\*)?\\s"));
      if (m) prefixCount[m[1]] = (prefixCount[m[1]] || 0) + 1;
    }
    const isSpeaker = (n) => looksLikeName(n) && (prefixCount[n] || 0) >= 2;
    const turns = [];
    let cur = null;
    const push = (speaker, text) => { cur = { speaker: speaker.trim(), text: text.trim() }; turns.push(cur); };
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();
      if (!line) continue;
      if (/^#|^---+$|^\*Mock transcript/.test(line)) continue;
      if (/^- \*\*[^*]+:\*\*/.test(line)) continue; // markdown header bullets
      let m;
      // [Name] 14:02:11   (Zoom closed captions) — text on following lines
      if ((m = line.match(headerRe[0]))) { push(m[1], ""); continue; }
      // Name  0:12   (Otter) — text on following lines
      if ((m = line.match(headerRe[1])) && looksLikeName(m[1])) { push(m[1], ""); continue; }
      if ((m = line.match(headerRe[2]))) { push(m[1], ""); continue; }
      if (/-->/.test(line)) continue; // timestamp ranges in docx/vtt-ish exports
      if (!headerMode) {
        // **Name:** text
        if ((m = line.match(/^\*\*([^*]{1,40}?):\*\*\s*(.*)$/)) && isSpeaker(m[1])) { push(m[1], m[2]); continue; }
        // 00:00:03 Speaker 1: text   |  [00:00:03] Name: text
        if ((m = line.match(new RegExp("^\\[?" + TS.source + "\\]?\\s+(" + NAME + "):\\s*(.*)$"))) && isSpeaker(m[1])) { push(m[1], m[2]); continue; }
        // Name: text
        if ((m = line.match(new RegExp("^(" + NAME + "):\\s+(.*)$"))) && isSpeaker(m[1])) { push(m[1], m[2]); continue; }
      }
      // bare timestamp line
      if (new RegExp("^\\[?" + TS.source + "\\]?$").test(line)) continue;
      if (cur) cur.text += (cur.text ? " " : "") + line;
      else push("Unknown", line);
    }
    return mergeTurns(turns.map((t) => ({ speaker: t.speaker, text: cleanText(t.text) })));
  }

  function parseTranscript(src, filename) {
    const isVTT = /^﻿?WEBVTT/.test(src.trim()) || /\.vtt$/i.test(filename || "");
    const turns = isVTT ? parseVTT(src) : parseText(src);
    const counts = {};
    for (const t of turns) counts[t.speaker] = (counts[t.speaker] || 0) + t.text.split(/\s+/).length;
    const speakers = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return { turns, speakers, words: Object.values(counts).reduce((a, b) => a + b, 0) };
  }

  // Guess roles: the interviewer asks the standard questions; the AE talks most.
  function guessRoles(parsed) {
    const qHits = {};
    const cues = ["started this evaluation", "made the final call", "about the competitor", "got a reaction", "won or lost", "first feel", "couldn't show", "exact words"];
    for (const t of parsed.turns) {
      const l = t.text.toLowerCase();
      for (const c of cues) if (l.includes(c)) qHits[t.speaker] = (qHits[t.speaker] || 0) + 1;
    }
    const interviewer = Object.keys(qHits).sort((a, b) => qHits[b] - qHits[a])[0] || null;
    const ae = parsed.speakers.find((s) => s !== interviewer) || parsed.speakers[0] || null;
    // Sure enough to skip asking: someone clearly asks the standard questions, and either
    // only two people speak or the AE talks far more than anyone else besides the interviewer.
    const words = {};
    for (const t of parsed.turns) words[t.speaker] = (words[t.speaker] || 0) + t.text.split(/\s+/).length;
    const others = parsed.speakers.filter((s) => s !== interviewer && s !== ae);
    const runnerUp = Math.max(0, ...others.map((s) => words[s] || 0));
    const confident = !!interviewer && (qHits[interviewer] || 0) >= 2 && (others.length === 0 || (words[ae] || 0) >= 3 * runnerUp);
    return { ae, interviewer, confident };
  }

  function renderTranscript(turns, roles) {
    return turns
      .map((t, i) => {
        const role = t.speaker === roles.ae ? "rep" : t.speaker === roles.interviewer ? "interviewer" : "other";
        return `[T${i + 1}] ${t.speaker} (${role}): ${t.text}`;
      })
      .join("\n");
  }

  // ════════════════════════════════════════════════════════════════
  // Verification (code, not AI): every excerpt must appear word-for-word.
  // ════════════════════════════════════════════════════════════════
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[‘’‛`´]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[^a-z0-9'%$ ]+/g, " ")
      .replace(/'/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  function makeVerifier(turns) {
    const hay = " " + norm(turns.map((t) => t.text).join(" ")) + " ";
    return function verbatim(excerpt) {
      const parts = String(excerpt || "").split(/\.\.\.|…/).map(norm).filter((p) => p.length);
      if (!parts.length) return false;
      let from = 0;
      for (const p of parts) {
        const at = hay.indexOf(" " + p + " ", from);
        if (at < 0) return false;
        from = at + p.length;
      }
      return true;
    };
  }

  // ════════════════════════════════════════════════════════════════
  // Prompts. `sample` has no system prompt, so each prompt is self-contained.
  // ════════════════════════════════════════════════════════════════
  const LABELS = `Evidence labels:
- quote: the customer's own words, relayed by the rep (inside quotation marks, or clearly verbatim: "she said, '...'"). The excerpt is ONLY the quoted words. If the rep says they are paraphrasing ("something like", "I'm paraphrasing", "don't quote me"), it is NOT a quote.
- fact: something that verifiably happened or was observed: a signature, an email, a meeting, a freeze, a number from the customer's own dashboard, a change in what the customer asked about.
- opinion: the rep's own read, guess, theory, estimate or assumption ("I think", "my guess", "I assume", "probably"). Anything the rep says about a competitor is opinion unless the rep quotes the customer or reports what the customer told them. Statements by someone who was not on the deal are opinion.`;

  const CONTEXT = `Context: after a deal closes, a product marketer (the interviewer) interviews the account executive (the rep) to learn what really happened, in order to sharpen our messaging and positioning. Everything about the customer reaches us secondhand through the rep. When the rep says "we/us/our" or names their own company, that means us. Each transcript line is "[T<n>] <Speaker> (<role>): text", where role is rep, interviewer or other.`;

  function readerPrompt({ transcript }) {
    return `You are the READER in a deal-review pipeline. Read the WHOLE interview transcript and build an evidence ledger. Extract; do not analyze or recommend.

${CONTEXT}

${LABELS}

Capture generously, typically 20-45 items. Include things said in passing, asides, self-corrections, hedges, numbers, names, and anything that conflicts with something said elsewhere. Do not skip the rep's opinions: label them opinion.

Hard rules:
- "excerpt" must be copied EXACTLY from the transcript: same words, same order, no paraphrase, no fixed grammar. Keep it short (a clause to two sentences). Use "..." only to join two exact fragments from the same line.
- Never invent anything. If the transcript does not say it, it is not in the ledger.

Also record:
- contradictions: where the rep's account conflicts with itself or with other evidence (for example, names one decider and later reveals another; says "nothing" then describes a gap).
- dodges: questions the rep deflected, answered vaguely, or answered "nothing"/"no moment" and then contradicted.
- skipped: which of the seven standard questions were never asked or never answered. Use these keys: trigger, decider, competitor, message, decided, gaps, language.
- language_pairs: where the customer's words differ from the words we use (in the pitch or the rep's own words).
- outcome_signals: what the transcript says about won / lost / no decision, and whether only part of the business moved.

TRANSCRIPT
${transcript}
END TRANSCRIPT

JSON safety: inside any string value, write double quotation marks as single quotation marks (') so the JSON stays valid. Excerpts still count as word for word.

Reply with ONLY this JSON (no prose):
{"people":[{"name":"","role":"","side":"customer|us|competitor|other"}],
 "competitors":[""],
 "incumbent":"what the customer used before, or null",
 "evidence":[{"id":"E1","turn":12,"excerpt":"exact words","label":"quote|fact|opinion","speaker":"whose words: a customer person/role, or the rep","paraphrase":false,"topics":["trigger|decider|competitor|message|decided|gaps|language|outcome"],"note":"why it matters, max 20 words"}],
 "contradictions":[{"evidence":["E3","E9"],"what":""}],
 "dodges":[{"question":"","turn":0,"what":""}],
 "skipped":[""],
 "language_pairs":[{"theirs":"","ours":"","evidence":["E1"]}],
 "outcome_signals":[{"evidence":["E1"],"what":""}]}`;
  }

  function tagsBlock() {
    return TAGS.map(([n, d]) => `- ${n}: ${d}`).join("\n");
  }
  function libraryBlock() {
    return MESSAGING.map((m) => `- ${m.id} [${m.pillar}] "${m.line}"`).join("\n");
  }

  function analystPrompt({ transcript, ledger }) {
    return `You are the ANALYST in a deal-review pipeline. We are not summarizing the call. Dig into the conversation, pull out the insights, and work out what they mean for our messaging and positioning.

${CONTEXT}

${LABELS}

You get the transcript and an evidence ledger built by a reader. Use ledger ids for evidence. You may add an item the reader missed: give it an id starting with "X" and copy its excerpt exactly from the transcript.

Write:
1. HEADER
   - deal: the customer's company name exactly as said in the transcript. If the company is never named, a short plain description of the customer from the transcript, at most 6 words, with no notes or brackets (for example "Regional restaurant-supply distributor"). Never invent a name.
   - acv: the deal's annual contract value, ONLY if the rep or customer states it: {"amount": number in US dollars per year, "quote": the exact words from the transcript that state it}. Not product prices, fees, savings, the value we estimated for them, or a competitor's price. Never estimate or convert a range into a number. If it is not stated, null, and list "What was the deal size (ACV)?" in the close as skipped.
   - ae: the account executive's first name if the transcript gives it, else null.
   - outcome: exactly one of "Won", "Lost", "No decision". Decide from the evidence, not from the rep's framing. If nobody actually chose a competitor and the deal stalled or was frozen, it is "No decision".
   - scope: one short sentence when the outcome is only partly true (for example "Won: online only; in-store still with the incumbent"), else null.
   - competitor (who we were up against; "None (status quo)" if no one) and incumbent (what they used before). Use null if unknown.
   - tag: exactly one reason tag from the list. The tags are neutral topics; the outcome gives the direction (on a win, the tag is why they picked us). There is no price tag on purpose: when the rep blames price, find what was really behind it. If the interview never got to the reason, use "Not established".
   - To choose between close tags, ask what the decider was comparing at the moment it was decided (money, approval performance, people and support, rollout, switching effort...).
   - runner_up: the second-closest tag, or null. When the outcome is "No decision", tag is "No decision" and runner_up is the underlying cause. tag_why: one sentence.

Reason tags:
${tagsBlock()}

2. SECTIONS, one per question:
${SECTIONS.map(([k, n, q]) => `   - ${k} (${n}): "${q}"`).join("\n")}
   Each section has three layers:
   - evidence: 1-4 items {id, excerpt, label}. Copy the excerpt exactly from the ledger/transcript.
   - insight: what it means, 1-3 sentences. Draw on the WHOLE conversation: contradictions, things said in passing, the customer's words against ours, questions the rep dodged, what the rep's framing hides. Don't restate the evidence. Be specific and blunt.
   - messaging: what it changes in our messaging, 1 sentence, concrete.
   If the question was never asked or never answered, set covered:false, give no insight or messaging, and list it in the close. "I don't know" from the rep is an answer: keep it as an unknown, never fill the gap. If a section's question was skipped but the topic surfaced elsewhere, you may cite that evidence and say so.

3. CLOSE
   - gaps: questions that were skipped, dodged, or left unknown, each with a follow-up question to ask (and of whom).
   - rep_takeaway: one takeaway for the rep, written as coaching (everyone on the team reads these).

Hard rules:
- Never invent names, numbers, quotes or outcomes. Never state a competitor's claim as fact unless the customer said it. A line the rep says they are paraphrasing is not a quote.
- An insight may interpret, but every factual claim inside it must be backed by the transcript. If the transcript does not establish something (whether anyone met a person, a figure, a duration, a motive), call it unclear or leave it out. Never assert something your close lists as unknown.
- Use quotation marks ONLY around words copied exactly from the transcript. Paraphrase without quotation marks.
- Do not describe the customer (size, segment, region) or our product beyond what the transcript says.
- Evidence comes from what the rep (or another participant) said, never from the interviewer's questions.
- In the close, kind "skipped" = the question was never asked; "dodged" = it was asked and the rep deflected, or answered and then contradicted themselves; "unknown" = asked, and the rep did not know.

Our current messaging (provisional), for reference:
${libraryBlock()}

TRANSCRIPT
${transcript}
END TRANSCRIPT

EVIDENCE LEDGER (JSON)
${JSON.stringify(ledger)}

JSON safety: inside any string value, write double quotation marks as single quotation marks (') so the JSON stays valid. Excerpts still count as word for word.

Reply with ONLY this JSON:
{"header":{"deal":"","ae":null,"acv":null,"outcome":"Won|Lost|No decision","scope":null,"competitor":null,"incumbent":null,"tag":"","runner_up":null,"tag_why":""},
 "sections":{${SECTION_KEYS.map((k) => `"${k}":{"covered":true,"evidence":[{"id":"E1","excerpt":"","label":"quote|fact|opinion"}],"insight":"","messaging":""}`).join(",")}},
 "close":{"gaps":[{"question":"","kind":"skipped|dodged|unknown","follow_up":""}],"rep_takeaway":""},
 "confidence":"high|medium|low"}`;
  }

  // The six insights every review must answer (the seventh, the real reason, is the "reason" field).
  const INSIGHTS = [
    ["trigger", "What started it", "From what started the evaluation: the moment or event our messaging should aim at."],
    ["decider", "Who decided", "From who made the final call: who our message has to convince, and what that person needs to see. Say we never met or reached someone only if the transcript says so."],
    ["competitor", "The competitor", "From what the customer said about the competitor and how their questions changed after meeting them: what we have to counter or pre-empt. This is secondhand: if it rests only on the AE's guess, say so."],
    ["message", "Our message", "From which parts of our pitch landed and which got silence or pushback: what to keep, cut or change. Name the claim."],
    ["proof", "Missing proof", "From what they asked for that we couldn't show: the proof asset, demo or reference to build."],
    ["words", "Their words", "From the customer's own words for their problem: the words to use in our messaging instead of ours. The quote must be the customer's words."],
  ];
  const INSIGHT_KEYS = INSIGHTS.map((i) => i[0]);

  // The report people read: account, ACV, outcome, reason, and the six insights.
  function reviewPrompt({ transcript, ledger }) {
    return `You are the ANALYST in a deal-review pipeline. Turn the interview into a short deal review a product marketer reads in one minute. Don't summarize the call: find what really decided the deal and what it teaches us about how we sell and message.

${CONTEXT}

You get the transcript and an evidence ledger built by a reader (excerpts already checked word for word). Use it, and read the transcript yourself.

Write:
- account: the customer's company name exactly as said in the transcript. If it is never named, a short plain description of the customer from the transcript, at most 6 words, with no notes or brackets. Never invent a name.
- ae: the account executive's first name if the transcript gives it, else null.
- acv: the deal's annual contract value, ONLY if the rep or customer states it: {"amount": number in US dollars per year, "quote": the exact words that state it}. Not product prices, fees, savings, value estimates or a competitor's price. Never estimate. Else null.
- outcome: exactly "Won", "Lost" or "No decision". Decide from the evidence, not the rep's framing. If nobody actually chose a competitor and the deal stalled or was frozen, it is "No decision". If only part of the business moved, pick the outcome for the part that was decided and say so in the reason.
- competitor: who we were up against, "None (status quo)" if no one, or null if unknown.
- tag: exactly one reason tag from the list. The outcome gives the direction: on a win, the tag is why they picked us. There is no price tag on purpose: when the rep blames price, find what was really behind it. To choose between close tags, ask what the decider was comparing when it was decided. If the interview never got to the reason, use "Not established".
- reason: one or two plain sentences on why the deal was really won or lost. If the rep's own explanation differs from what the evidence shows, say so briefly.
- insights: one ACTION for each of these, in this order:
${INSIGHTS.map(([k, n, d]) => `  - ${k} (${n}): ${d}`).join("\n")}
  An insight is not a summary of what happened. It is something the product marketing team can act on: a change to our messaging, positioning, proof assets, or what reps say. The quote carries what happened.
  - One sentence, starting with a verb ("Lead with...", "Build...", "Stop opening with...", "Arm the champion with...", "Use..."). Ideally under 25 words.
  - Specific: name the message, claim, proof asset, audience or words. "Improve our messaging" is not an insight.
  - It must follow from this deal's evidence. Frame it as something to change or test; one deal is one data point, so no "always" or "every deal".
  - Each insight is different from the others and from the reason.
  - Plus one short supporting quote copied EXACTLY from the transcript that shows why, and who said it as "Name, role" (for example "Lucy, ecommerce director" or "Sam, AE"). Pick the quote that best proves it, never the AE's guess unless the insight is about that guess. Never claim someone reacted to something they never saw or heard.
  - If the interview never got to the topic, set covered to false. If the AE didn't know, the action can be to find out (for example "Ask the customer what the competitor showed them").

Reason tags:
${tagsBlock()}

Hard rules:
- Never invent names, numbers, quotes or outcomes. Never state a competitor's claim as fact unless the customer said it.
- Use quotation marks only around words copied exactly from the transcript.
- Do not describe the customer or our product beyond what the transcript says.
- Quotes come from what the rep (or another participant) said, never from the interviewer's questions.
- Plain language. No jargon, no labels, no headings inside the text.

TRANSCRIPT
${transcript}
END TRANSCRIPT

EVIDENCE LEDGER (JSON)
${JSON.stringify(ledger)}

JSON safety: inside any string value, write double quotation marks as single quotation marks (') so the JSON stays valid. Quotes still count as word for word.

Reply with ONLY this JSON:
{"account":"","ae":null,"acv":null,"outcome":"Won|Lost|No decision","competitor":null,"tag":"","reason":"",
 "insights":{${INSIGHT_KEYS.map((k) => `"${k}":{"covered":true,"action":"","quote":"","who":""}`).join(",")}}}`;
  }

  function strategistPrompt({ analysis, ledger }) {
    const pairs = (ledger && ledger.language_pairs) || [];
    return `You are the MESSAGING STRATEGIST in a deal-review pipeline. An analyst has turned a post-deal interview into findings. Your job is the part of the report that matters most: concrete changes to our messaging.

Each change:
- target: the id of the line in our current messaging it changes (copy current_line EXACTLY from the library), or null with type "add" when we have no line for it.
- type: "replace" (say this instead), "add" (a new line or proof point), or "drop" (stop leading with it for this kind of buyer).
- change: the new wording or instruction a marketer can use as-is. Use the customer's own words where they are sharper than ours. Say who it is for when it is buyer- or segment-specific.
- evidence: the evidence ids from the analysis it rests on (at least one), and why: one sentence connecting the evidence to the change.
- strength: always "Test this" (one deal is one data point; a person promotes a change after it repeats across deals).

Give 1-4 changes, most important first. Only propose what the evidence supports. If nothing in the interview supports a change, return an empty list and say why in no_change_reason. Never invent evidence.
- Use "drop" only when the interview shows the line was used and fell flat or backfired.
- Use quotation marks only around words copied exactly from the transcript or from our messaging library.
- Do not describe the customer (size, segment, region) or our product beyond what the analysis and transcript say.

Our current messaging (PROVISIONAL library):
${libraryBlock()}

ANALYSIS (JSON)
${JSON.stringify(analysis)}

CUSTOMER WORDS VS OURS (from the reader)
${JSON.stringify(pairs)}

JSON safety: inside any string value, write double quotation marks as single quotation marks (') so the JSON stays valid. Excerpts still count as word for word.

Reply with ONLY this JSON:
{"changes":[{"target":"M1","current_line":"exact line or null","type":"replace|add|drop","change":"","evidence":["E1"],"why":"","strength":"Test this"}],"no_change_reason":null}`;
  }

  // Single-call baseline (for comparison only): one prompt does everything.
  function singlePrompt({ transcript }) {
    return `You turn a post-deal interview into a deal review. We are not summarizing the call: dig into the conversation, pull out the insights, and work out what they change in our messaging and positioning.

${CONTEXT}

${LABELS}

Header: deal (the customer's company name as said in the transcript, else a short description of the customer, at most 6 words; never invent a name), acv ({"amount": US dollars per year, "quote": exact words} only if the deal size is stated, else null), ae (the AE's first name if given, else null), outcome (exactly "Won", "Lost" or "No decision"; decide from evidence, not the rep's framing), scope (when only partly true, else null), competitor, incumbent, one reason tag from the list (neutral topics; no price tag on purpose; "Not established" if the review never got to the reason), runner_up, tag_why.

Reason tags:
${tagsBlock()}

Sections (each: evidence 1-4 items {excerpt, label} copied EXACTLY from the transcript; insight drawing on the whole conversation including contradictions, asides, their words vs ours and dodged questions; messaging = what it changes). If a question was never answered set covered:false and list it in the close. "I don't know" stays unknown.
${SECTIONS.map(([k, n, q]) => `- ${k} (${n}): "${q}"`).join("\n")}

Messaging changes (1-4, most important first): target line id from our current messaging (copy current_line exactly) or null for "add"; type replace|add|drop; change; why; strength "Test this". Empty list with no_change_reason if nothing is supported.

Close: gaps (skipped/dodged/unknown questions with follow-ups) and one coaching takeaway for the rep.

Never invent names, numbers, quotes or outcomes.

Our current messaging (provisional):
${libraryBlock()}

TRANSCRIPT
${transcript}
END TRANSCRIPT

JSON safety: inside any string value, write double quotation marks as single quotation marks (') so the JSON stays valid. Excerpts still count as word for word.

Reply with ONLY this JSON:
{"header":{"deal":"","ae":null,"acv":null,"outcome":"","scope":null,"competitor":null,"incumbent":null,"tag":"","runner_up":null,"tag_why":""},
 "messaging_changes":[{"target":"M1","current_line":"","type":"replace|add|drop","change":"","evidence_excerpts":[""],"why":"","strength":"Test this"}],
 "sections":{${SECTION_KEYS.map((k) => `"${k}":{"covered":true,"evidence":[{"excerpt":"","label":"quote|fact|opinion"}],"insight":"","messaging":""}`).join(",")}},
 "close":{"gaps":[{"question":"","kind":"skipped|dodged|unknown","follow_up":""}],"rep_takeaway":""}}`;
  }

  // ════════════════════════════════════════════════════════════════
  // Assembly + checks
  // ════════════════════════════════════════════════════════════════
  // Quotation marks in prose that makes claims (insights, tag_why, the rep takeaway) must
  // hold words that are really in the transcript or our library. Anything else is a
  // paraphrase dressed as a quote: keep the words, drop the marks, and record it.
  // Messaging lines and follow-up questions are left alone: quotes there mark proposed wording.
  function unquoteProse(text, verbatim, where, log) {
    if (!text || typeof text !== "string") return text;
    const libOk = (s) => MESSAGING.some((m) => norm(m.line).includes(norm(s))) || TAG_NAMES.some((t) => norm(t) === norm(s));
    const fix = (whole, pre, q) => {
      if (norm(q).split(" ").length < 2 || verbatim(q) || libOk(q)) return whole;
      log.push({ where, text: q });
      return pre + q;
    };
    return text
      .replace(/(^|[^\w])[“"]([^”"]{3,}?)[”"]/g, fix)
      .replace(/(^|[\s(—–-])[‘']([^’'\n]{3,}?)[’'](?=[\s.,;:!?)—–-]|$)/g, fix);
  }

  function assembleReview({ review, turns, meta }) {
    const verbatim = makeVerifier(turns);
    const proseLog = [];
    const uq = (t, where) => unquoteProse(t, verbatim, where, proseLog);
    const r = review || {};
    let acv = null, acvRejected = null;
    if (r.acv && typeof r.acv === "object") {
      const amount = Number(String(r.acv.amount).replace(/[^0-9.]/g, ""));
      if (amount > 0 && r.acv.quote && verbatim(r.acv.quote)) acv = { amount: Math.round(amount), quote: String(r.acv.quote) };
      else acvRejected = r.acv;
    }
    // One finding per insight. A finding stands only if its quote is really in the transcript;
    // otherwise that insight shows as not covered.
    const findings = [], dropped = [];
    const ins = r.insights || {};
    for (const [k, label] of INSIGHTS) {
      const f = ins[k] || {};
      const text = f.action || f.finding;
      const ok = f.covered !== false && text && f.quote && verbatim(f.quote);
      if (f.covered !== false && text && !ok) dropped.push(Object.assign({ key: k }, f));
      findings.push(ok ? { key: k, label, covered: true, finding: uq(String(text), k), quote: String(f.quote), who: f.who || null } : { key: k, label, covered: false });
    }
    const header = {
      deal: (r.account && String(r.account).replace(/\s*\((?:company|customer)[^)]*\)\s*$/i, "").trim()) || "Unnamed deal",
      ae: r.ae || null,
      acv,
      outcome: ["Won", "Lost", "No decision"].includes(r.outcome) ? r.outcome : "No decision",
      competitor: r.competitor && !/^(unnamed|unknown|not named|not stated|n\/a)\b/i.test(String(r.competitor).trim()) ? r.competitor : null,
      tag: TAG_NAMES.includes(r.tag) ? r.tag : "Not established",
      reason: uq(String(r.reason || ""), "reason"),
    };
    return {
      version: PIPELINE_VERSION, header, findings,
      checks: { findings_dropped: dropped, acv_rejected: acvRejected, prose_unquoted: proseLog },
      meta: meta || {},
    };
  }

  function assemble({ deal, ledger, analysis, strategy, turns, meta }) {
    const verbatim = makeVerifier(turns);
    const proseLog = [];
    const uq = (t, where) => unquoteProse(t, verbatim, where, proseLog);
    const byId = {};
    for (const e of (ledger && ledger.evidence) || []) byId[e.id] = e;
    const checks = { quotes_total: 0, quotes_failed: 0, failed: [] };

    const sections = {};
    for (const k of SECTION_KEYS) {
      const s = (analysis.sections && analysis.sections[k]) || { covered: false };
      const ev = (s.evidence || []).map((e) => {
        const src = byId[e.id] || {};
        const excerpt = e.excerpt || src.excerpt || "";
        const ok = verbatim(excerpt);
        checks.quotes_total++;
        if (!ok) { checks.quotes_failed++; checks.failed.push({ where: k, excerpt }); }
        return { id: e.id || null, excerpt, label: e.label || src.label || "fact", speaker: src.speaker || null, verified: ok };
      });
      sections[k] = { covered: s.covered !== false, evidence: ev, insight: uq(s.insight || "", k), messaging: s.messaging || "" };
    }

    const lib = {};
    for (const m of MESSAGING) lib[m.id] = m;
    const changes = ((strategy && strategy.changes) || []).map((c) => {
      const t = c.target && lib[c.target] ? c.target : null;
      const evIds = (c.evidence || []).filter(Boolean);
      return {
        target: t,
        current_line: t ? lib[t].line : null,
        line_matches: t ? norm(c.current_line) === norm(lib[t].line) : c.current_line == null,
        type: ["replace", "add", "drop"].includes(c.type) ? c.type : t ? "replace" : "add",
        change: c.change || "",
        evidence: evIds,
        evidence_found: evIds.every((id) => byId[id] || /^X/.test(id)),
        why: c.why || "",
        strength: "Test this",
      };
    });

    const h = analysis.header || {};
    // ACV counts only when its stating words are really in the transcript.
    let acv = null;
    if (h.acv && typeof h.acv === "object") {
      const amount = Number(String(h.acv.amount).replace(/[^0-9.]/g, ""));
      if (amount > 0 && h.acv.quote && verbatim(h.acv.quote)) acv = { amount: Math.round(amount), quote: String(h.acv.quote) };
      else checks.acv_rejected = h.acv;
    }
    const header = {
      deal: deal || (h.deal && String(h.deal).replace(/\s*\((?:company|customer)[^)]*\)\s*$/i, "").trim()) || "Unnamed deal",
      ae: h.ae || null,
      acv,
      outcome: ["Won", "Lost", "No decision"].includes(h.outcome) ? h.outcome : "No decision",
      scope: h.scope || null,
      competitor: h.competitor || null,
      incumbent: h.incumbent || null,
      tag: TAG_NAMES.includes(h.tag) ? h.tag : "Not established",
      runner_up: TAG_NAMES.includes(h.runner_up) ? h.runner_up : null,
      tag_why: uq(h.tag_why || "", "header"),
    };
    const ac = analysis.close || {};
    const close = {
      gaps: (ac.gaps || []).map((g) => ({ question: g.question || "", kind: g.kind || "unknown", follow_up: g.follow_up || "" }))
        .concat(!acv && !(ac.gaps || []).some((g) => /deal size|acv|contract value/i.test((g.question || "") + " " + (g.follow_up || "")))
          ? [{ question: "What was the deal size (ACV)?", kind: "skipped", follow_up: "Ask the AE for the annual contract value, or check the CRM, and add it to this review." }] : []),
      rep_takeaway: uq(ac.rep_takeaway || "", "close"),
    };
    checks.prose_unquoted = proseLog;
    return {
      version: PIPELINE_VERSION,
      header,
      messaging_changes: changes,
      no_change_reason: (strategy && strategy.no_change_reason) || null,
      sections,
      close,
      confidence: analysis.confidence || null,
      checks,
      meta: meta || {},
    };
  }

  // Orchestrator: deterministic code, not a model. Reader -> Analyst -> Strategist -> checks.
  // Reader -> Analyst -> code checks. `state` (optional) keeps finished steps, so a
  // failed run can resume from the step that failed.
  async function runPipeline({ parsed, roles, call, models, onStage, state }) {
    const M = Object.assign({}, STAGE_MODELS, models || {});
    const S = state || {};
    const transcript = renderTranscript(parsed.turns, roles);
    const t0 = Date.now();
    const stage = (n) => { S.stage = n; if (onStage) onStage(n); };
    const fail = (st, msg) => Object.assign(new Error(msg), { code: "bad_stage", stage: st });

    if (!S.ledger) {
      stage("reader");
      const ledger = await call("reader", readerPrompt({ transcript }), M.reader);
      if (!ledger || !Array.isArray(ledger.evidence)) throw fail("reader", "Reader returned no evidence");
      const verbatim = makeVerifier(parsed.turns);
      ledger.evidence = ledger.evidence.filter((e) => verbatim(e.excerpt));
      S.ledger = ledger;
    }
    if (!S.review) {
      stage("analyst");
      const review = await call("analyst", reviewPrompt({ transcript, ledger: S.ledger }), M.analyst);
      if (!review || !review.insights || typeof review.insights !== "object") throw fail("analyst", "Analyst returned no insights");
      S.review = review;
    }
    stage("checks");
    return assembleReview({ review: S.review, turns: parsed.turns,
      meta: { models: { reader: M.reader.model, analyst: M.analyst.model }, ms: Date.now() - t0 } });
  }

  // Tolerant JSON for model replies: whole text, a fenced block, or first {/[ to last }/].
  // If that fails, repair the two usual faults: an unescaped " inside a string, and
  // trailing commas. Returns undefined when nothing parses.
  function repairJSON(t) {
    t = t.replace(/(":\s*-?\d+(?:\.\d+)?)"(\s*[,}\]])/g, "$1$2"); // stray quote after a number: "turn":20",
    let out = "", inStr = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (!inStr) { if (c === '"') inStr = true; out += c; continue; }
      if (c === "\\") { out += c + (t[i + 1] || ""); i++; continue; }
      if (c === "\n") { out += "\\n"; continue; }
      if (c === '"') {
        let j = i + 1; while (j < t.length && /\s/.test(t[j])) j++;
        const next = t[j];
        let closes = next === undefined || next === "}" || next === "]" || next === ":";
        if (next === ",") {
          // A real closing quote + comma is followed by another value or key, never a plain word.
          let k = j + 1; while (k < t.length && /\s/.test(t[k])) k++;
          closes = k >= t.length || /["{[\-0-9]/.test(t[k]) || /^(true|false|null)\b/.test(t.slice(k, k + 5));
        }
        if (closes) { inStr = false; out += c; }
        else out += '\\"';
        continue;
      }
      out += c;
    }
    return out.replace(/,\s*([}\]])/g, "$1");
  }
  function parseModelJSON(text) {
    const t = String(text || "").trim();
    const tries = [t];
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) tries.push(fence[1].trim());
    const a = t.search(/[[{]/), b = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
    if (a >= 0 && b > a) tries.push(t.slice(a, b + 1));
    for (const s of tries) { try { return JSON.parse(s); } catch (e) { /* next */ } }
    for (const s of tries.slice(1).concat(tries[0])) { try { return JSON.parse(repairJSON(s)); } catch (e) { /* next */ } }
    return undefined;
  }

  // The small summary that rides in the feed index (reviews/<uid>.cards[rid]).
  function toCard(report, extra) {
    const h = report.header || {};
    return Object.assign({
      deal: h.deal || "", acv: h.acv ? h.acv.amount : null, outcome: h.outcome || null, tag: h.tag || null,
      competitor: h.competitor || null, reason: String(h.reason || "").slice(0, 900),
      version: report.version || PIPELINE_VERSION,
    }, extra || {});
  }

  const api = {
    PIPELINE_VERSION, STAGE_MODELS, INSIGHTS, TAGS, TAG_NAMES, SECTIONS, SECTION_KEYS, MESSAGING,
    parseTranscript, guessRoles, renderTranscript, makeVerifier, norm,
    readerPrompt, reviewPrompt, assembleReview, runPipeline, toCard, parseModelJSON,
    analystPrompt, strategistPrompt, singlePrompt, assemble, // earlier long-form report (kept for the eval history)
  };
  root.DealReview = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
