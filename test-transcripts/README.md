# Deal Review Synthesizer — Test Transcripts

Six fictional AE interviews, each with an answer key, for testing the synthesizer before it touches real deals.
Every interview follows the seven standard deal-review questions, and each one hides one or more **traps**: places where a careless synthesis would get the story wrong.

> **Never give the answer keys to the synthesizer.** They are for scoring its output only.

## The seven insights every review must produce

| # | Insight | Interview question |
|---|---|---|
| 1 | What started the evaluation | "What happened at the customer that started this evaluation?" |
| 2 | Who made the decision | "Who made the final call, and how do you know?" |
| 3 | What the customer told us about the competitor | "What did the customer bring up about the competitor?" / "What changed in their questions after they'd met with them?" |
| 4 | Which parts of our message landed, and which didn't | "Which part of our pitch got a reaction, and which got silence?" |
| 5 | The real reason the deal was won or lost | "When did you first feel this was won or lost? What happened right before?" |
| 6 | What proof we were missing | "What did they ask for that we couldn't show?" |
| 7 | The customer's own words for their problem | "What exact words did they use for their problem?" |

## Evidence grades

We are interviewing the AE, so everything is secondhand. Every finding should carry one of these grades:

| Grade | Meaning | Example |
|---|---|---|
| **Customer said** | The AE quotes the customer's words (spoken or written) | *"She said, 'We're approving expenses on the honor system.'"* |
| **AE observed** | Something the AE saw happen: a signature, an email, a shift in questions | *"After that Thursday, every question was about NetSuite."* |
| **AE opinion** | The AE's guess, read, or theory | *"My guess is Ledgerpoint told them we can't do multi-entity."* |
| **Unknown** | The AE said "I don't know," or the question wasn't asked | Not a failure, and **must not be filled in by the synthesizer** |

A quote the AE explicitly says they are paraphrasing is **not** a verbatim customer quote.

## The fictional world

All companies and people are invented.

- **Our company:** Tallyfield, a spend management and month-end close platform for mid-market finance teams.
- **Messaging pillars:**
  1. **Close the books 5 days faster** (close checklist, auto-reconciliation)
  2. **See every dollar as it's spent** (real-time spend dashboards and budgets)
  3. **Live in 30 days** (fast implementation)
  4. **Controls your auditors will sign off on** (approval workflows, audit trail)
- **Competitors:** Spendgrid (large suite, heavy implementation, strong AP module) and Ledgerpoint (cheaper, strong NetSuite integration). "No decision / status quo" is also a competitor.
- **Interviewer:** Jordan Lee (product marketing)

## Scenarios

| # | File | Export format | Outcome as the AE reports it | True outcome | Main trap |
|---|---|---|---|---|---|
| 01 | `01-harbor-freightways.vtt` | Zoom `.vtt` | Won | Won | **Baseline.** Everything is answered cleanly. Tests accuracy without overcorrecting. Includes one paraphrased "quote" and one AE guess about pricing. |
| 02 | `02-meridian-robotics.txt` | Otter-style `.txt` | Lost on price | Lost: champion left, no access to the signer | **Stated vs. real reason.** The "30% cheaper" figure is the AE's estimate, and the decision maker is assumed, not confirmed. |
| 03 | `03-quarry-lane-foods.vtt` | Teams `.vtt` | Lost to Spendgrid | **No decision**: budget frozen | **Wrong outcome.** No one ever said they chose Spendgrid, and the evidence points to a freeze. |
| 04 | `04-cobalt-health-partners.txt` | Zoom chat-style `.txt` | Lost to Ledgerpoint | Lost: couldn't prove multi-entity on their data | **Secondhand competitor intel.** "I don't know" must stay "I don't know." The AE's theory is opinion, and the real signal is the shift in the customer's questions. |
| 05 | `05-alder-and-finch.vtt` | Teams `.vtt` | Won | Won: the go-live guarantee removed the risk | **A win where the lead message failed.** The AE first answers question 7 in our own marketing language. The real customer words come after a follow-up. |
| 06 | `06-sable-ridge-hospitality.txt` | Generic, no names | Won | Won, but the real reason is unknown | **Thin, messy interview.** No speaker names, a drive-by manager with opinions, garbled product names, and two questions never asked. The synthesizer must say "not covered" instead of inventing answers. |

## How to score a run

Score each of the seven insights against the answer key:

| Score | Meaning |
|---|---|
| **2: Correct** | Matches the key, with the right evidence grade |
| **1: Partial** | Right direction, but missing a key detail or using the wrong evidence grade |
| **0: Wrong or missing** | Wrong conclusion, or omitted when the transcript had the answer |
| **Fail** | Invented content: a quote not in the transcript, or a definite answer where the key says *Unknown* |

Then check each scenario's **must catch** items, which are pass/fail.

**Suggested bar before piloting with the team:**
- No **Fail** scores on any scenario. Invented content is disqualifying.
- Every **must catch** passes on scenarios 02, 03, 04 and 06.
- An average of **1.6 or higher out of 2** across all 42 insight scores.
- Run each transcript **3 times**. The outcome, the real reason and the decision maker should not change between runs.

## Limits of this set

These interviews are shorter (450–950 words) and tidier than real ones (often 4,000+ words). Passing them is the minimum bar, not proof. The next step is calibrating on real deals.
