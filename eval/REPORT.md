# Which model should run which step?

**Decision: Sonnet reads → Opus analyzes → Opus plans the messaging changes → code checks every quote. The steps run in a fixed order under code, not under an AI orchestrator.**

Tested on the fictional deal reviews in `test-set/` (8 deals, plus a 9th variant that states the deal size). Every report was graded by Opus (high effort) against that deal's answer key: 476 model calls, about $53 in API-equivalent usage. Full tables: `tables.md`. Raw outputs: `runs/`.

## What each step does

| Step | Job | Model | Why |
|---|---|---|---|
| **Read** | Pull every piece of evidence from the whole interview, word for word, labelled quote, fact or opinion. Also list contradictions, dodges, skipped questions, and the customer's words against ours. | **Sonnet** | As accurate as Opus (100% of excerpts word for word), finds about as many contradictions (5.1 vs 5.4 per interview), and is the fastest reader at 38s. |
| **Check the ledger** | Drop any excerpt that isn't word for word in the transcript before analysis starts. | **Code** | A model can't be trusted to grade its own quotes. String matching can. |
| **Analyze** | Header and reason tag, the seven sections (evidence, insight, messaging), and the close. | **Opus** | This is the planning and judgment step. Pipelines with an Opus analyst scored highest. |
| **Plan messaging** | Concrete changes against our current messaging lines, each tied to evidence and marked "Test this". | **Opus** | It's the point of the report, and it's a short, cheap step (about 18s and $0.08 on Opus). |
| **Check the report** | Re-verify every excerpt, remove quotation marks from any paraphrase dressed up as a quote, and confirm each change targets a real messaging line. | **Code** | Same reason as above. |

### Testing your starting assumptions

| Assumption | What the test showed |
|---|---|
| **Haiku is good at reading** | **Partly.** Haiku's excerpts were 100% word for word and it costs about 1/7 of Sonnet. But it was the *slowest* reader (80s against Sonnet's 38s, because it writes about 3× as much reasoning) and found fewer contradictions (3.3 vs 5.1). Reports built on a Haiku reader scored slightly lower and had the most invented content (10 flags across 8 reports). As the analyst, Haiku was clearly weakest: all-Haiku scored 19.0/24. |
| **Sonnet is good at orchestrating** | **Orchestration works better as code here.** A fixed sequence makes every review identical in shape, which is what standardization needs. No model decides which steps to run. Sonnet's best job turned out to be the reader. |
| **Opus is good at planning** | **Yes.** Opus as analyst and strategist gave the best results. It also writes the boldest insights, so at first it overreached the most. Tighter instructions and the code check fixed that (below). |

## Results (round 1: all model combinations, same instructions)

| Setup (read → analyze → plan) | Score /24 | Sections /14 | Invented content (reports flagged) | Time | API-equivalent cost |
|---|---|---|---|---|---|
| **Sonnet → Opus → Opus** | **22.0** | **13.3** | 7 | 108s | $0.34 |
| Haiku → Opus → Opus | 21.8 | 13.0 | 10 | 155s | $0.29 |
| Opus → Opus → Opus | 21.8 | 12.9 | 2 | 137s | $0.46 |
| Single prompt, Opus | 21.4 | 12.8 | 9 | 56s | $0.15 |
| Single prompt, Sonnet | 21.0 | 12.6 | 0 | 54s | $0.09 |
| Sonnet → Sonnet → Sonnet | 20.9 | 12.8 | 4 | 76s | $0.19 |
| Haiku → Sonnet → Opus | 20.6 | 12.3 | 5 | 128s | $0.17 |
| Haiku → Sonnet → Sonnet | 20.4 | 12.1 | 4 | 120s | $0.12 |
| Haiku → Haiku → Haiku | 19.0 | 11.0 | 11 | 132s | $0.02 |

Every setup quoted 100% of its evidence word for word, because the code check guarantees it. The "invented content" flags came from the *insight prose*, not the evidence. Examples: stating "we never reached the CFO" when the transcript doesn't say so, putting a paraphrase in quotation marks, or calling a customer "mid-market" with no basis.

## Improving the winner (rounds 2–4: Sonnet → Opus → Opus)

| Round | What changed | Result |
|---|---|---|
| 2 | Insight rules: no claim the transcript doesn't support; quotation marks only around exact words; don't describe the customer beyond the transcript; evidence never comes from the interviewer's questions. Plus a code check that removes quotation marks from paraphrases. | Invented content fell from 7 flagged reports to 1–4 per run. Outcome and tag were identical across 3 runs on 8 of 8 deals, but two tags were wrong every time (Kestrel, Pikeview). |
| 3 | Tag rules: "No decision" is always the tag when nobody switched; "Value proof" narrowed. | Kestrel and Pikeview fixed. Fernbrook overcorrected to "Approval rates". |
| 4 | One rule for close calls: ask what the decider was comparing at the moment of decision (money → Value proof; approval performance → Approval rates). | **All 8 deals get the answer key's tag. Both runs agree on every deal run twice. Header scores 5.5 and 6.0 out of 6. 1 minor flag per run.** |

| 5 | No deal-name input: the review reads the customer's name from the transcript, or writes a short description when the name is never said. Never invents a name. | Names found where said ("Fernbrook"), with short descriptions elsewhere. Tags unchanged. |
| 6 | Deal size (ACV): recorded only if stated, with the exact words checked against the transcript; otherwise listed as a follow-up. New test deal 09 (07 plus a stated ACV) with a $4,000 product price as a trap. | ACV $95,000 on deal 09, blank and listed as a follow-up on the other 8. Must-catch 97%. One tag drifted (Marlowe & Finch), caused by two tag definitions that both mentioned "rollout". |
| 7 | Separated those two tags: store rollout belongs to "In-store and online together"; "Support and service" is post-sale help. | **All 9 deals tagged as the key expects; repeat runs agree on the boundary deals; 21.9/24; ACV correct on every deal.** |

Rounds 4–7 score 21.1–22.5 out of 24 at about 105–120s and $0.32–0.37 per review.

## Round 10: the short report

The report was cut to account, ACV, outcome, reason and 3-5 key findings, and the separate messaging-changes step was removed (Sonnet reads, Opus writes the report, code checks). Graded with a matching rubric (max 11):

| Item | Average |
|---|---|
| Account | 1.00 / 1 |
| ACV | 1.00 / 1 |
| Outcome | 1.00 / 1 |
| Reason tag | 2.00 / 2 |
| Reason (the real one, not the AE's framing) | 2.00 / 2 |
| Key findings (capture the deal's key insights) | 3.38 / 4 |
| **Total** | **10.4 / 11** |

One finding was flagged as overstated across the 8 reports. About 50-70 seconds per review.

## Round 11-12: findings follow the team's six insights

Key findings became one per insight (what started it, who decided, the competitor, our message, missing proof, their words), with rules against repeating a point, over-generalizing from one deal, weak quotes, and claimed reactions to things people never saw. Graded per insight (max 13):

| | Round 11 | Round 12 |
|---|---|---|
| Header (account, ACV, outcome, tag, reason) | — | 7.0 / 7 on every deal |
| Six insights | 5.2 / 6 | 5.3 / 6 |
| Total | 12.3 / 13 | 12.3 / 13 |
| Reviews with repeated findings | 1 | 0 |
| Invented-content flags | 4 | 1 |

Round 12 also stopped the reviewer from claiming we never reached a decider unless the transcript says so.

## Rounds 13-14: insights as actions, not summaries

Each of the six areas now asks for one action for the product marketing team (a verb-first change to messaging, positioning, proof or what reps say), with the quote as evidence. Round 13: 12.4/13, header perfect on all 8 deals, "Missing proof" actions perfect on all 8, 1 invented-content flag; 3 reviews had two overlapping actions. Round 14 added a rule against overlapping actions; it scored lower (12.3/13, 4 overlaps, 3 flags), so it was reverted and round 13 ships.

## Rounds 15-16: plain language, then messaging focus

- **Round 15 (plain language):** each insight became a short action (12 words max), a one-sentence why, and a short quote, with no sales jargon. Actions went from 23 to 11 words on average, the reason line from 62 to 32 words, and readability scored 2.0/2.
- **Round 16 (messaging focus):** the messaging library became the real baseline in `messaging-baseline.md` (Stripe's public lines), and every insight became a messaging change (what to lead with, say, stop saying, or which proof point to add), tied to the current line it changes where one exists (27 of 48). Scores: 11.9/13, messaging focus 1.6/2, readability 1.9/2. The answer keys were written before the baseline existed and include some sales-process directions, which costs a little on the insight score.

## Why several steps instead of one prompt

The single-prompt Sonnet baseline is strong: 21.0, no invented content, half the time, a quarter of the cost. On score alone the multi-step design wins by about 1 point, which is close to the judge's own noise: the same setup scored anywhere from 18 to 24 on one deal across runs. The steps are kept for reasons the score doesn't capture:

- **Evidence is checked before analysis.** The analyst only sees excerpts that passed the word-for-word check.
- **A failure costs one step, not the whole review.** The page keeps finished steps and offers "Retry from this step".
- **Each step can be tuned and measured on its own**, as rounds 2–4 did.

Revisit this after calibration on real deals. If real reviews show no gap, the single-prompt Sonnet version is the faster, cheaper fallback, and it's already written (`singlePrompt` in `app/core.js`).

## Reliability fixes found during testing

- About 1 reply in 20 came back as JSON that wouldn't parse. The causes were an unescaped quotation mark inside a string and a stray quote after a number (`"turn":20",`). The page now parses replies itself and repairs both. All 337 good replies still parse identically, and every captured failure now parses.
- The shipped reader setting (low effort) didn't match what was tested (medium). Fixed.

## Limits

- **The judge is also a model.** Expect ±1–2 points per deal between runs. Read differences under about 1 point as ties.
- **The test transcripts are fictional, and shorter than real ones** (550–820 words against 4,000+).
- **The messaging library is provisional**, reconstructed from how reps describe the pitch. Messaging changes can't be fully judged until the real messaging is in.
- **Next step:** calibrate on 5–10 real reviews, with you grading each one against the rubric in `test-set/README.md`.

## Re-running

```bash
node eval/run.js --configs "SOO~v5a" --concurrency 10   # one setup, fresh cache
node eval/summarize.js > eval/tables.md
```
