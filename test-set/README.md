# Test Set

Eight fictional deal-review interviews, with answer keys, for testing the synthesizer before it touches real deals.
The originals are in [`../deal-reviews/`](../deal-reviews/). This folder holds the versions the synthesizer is tested on.

> **Never give the answer keys, or the headers of the original files, to the synthesizer.** They are for scoring only.
> All customers, people and conversations are invented. Competitor behavior described in them is fiction, not intel.

## What's different from the originals

- **Headers removed.** Outcome, competitor and incumbent were stated at the top of each original. Real Zoom and Teams files don't include them, and the synthesizer has to work them out. Those answers now live in the answer keys.
- **Converted to real export formats,** so file handling is tested too:

| # | Input file | Format | Notes |
|---|---|---|---|
| 01 | `01-tallowfield-supply.vtt` | Zoom `.vtt` | Long answers split across several caption blocks |
| 02 | `02-corelane-fitness.txt` | **No speaker names** ("Speaker 1/2") | The user must pick which speaker is the AE |
| 03 | `03-fetchwell.vtt` | Teams `.vtt` | |
| 04 | `04-marlowe-and-finch.txt` | Plain text | |
| 05 | `05-kestrel-learning.txt` | Plain text | |
| 06 | `06-tixhaven.txt` | Otter-style `.txt` | |
| 07 | `07-fernbrook-garden-supply.txt` | Plain text | |
| 08 | `08-pikeview-software.txt` | Plain text | |

When the synthesizer runs a test, the **deal name** is entered the way a user would enter it, not taken from the file.

## Scenarios

| # | Deal | True outcome | Expected tag | Main traps |
|---|---|---|---|---|
| 01 | Tallowfield Supply | Won | Value proof | The stated trigger (an ordering portal) isn't the real one (the CFO's month-end close). The rep doesn't know what the competitor showed. A dollar figure the rep can't remember must not be invented. |
| 02 | Corelane Fitness | Won, **online only** | Value proof | A partial win. The rep corrects who decided. The customer-language question was skipped. No speaker names. |
| 03 | Fetchwell | Won | Developer experience | The rep says there were no gaps, then reveals two. The theory about the competitor is opinion. Approval-rate messaging got silence even in a win. |
| 04 | Marlowe & Finch | Lost | In-store and online together | The rep names the wrong decision maker. Our "unified commerce" slide got called "a diagram." Gap between their words and ours. |
| 05 | Kestrel Learning | Lost, **international only** | Approval rates | A partial loss on a renewal. The rep says it was "decided before we got in the room," but the account hadn't had a business review in 9–10 months. |
| 06 | Tixhaven | Lost | Support and service | The technical win convinced the wrong person. Support tiers answered "who's my person?" with a queue. |
| 07 | Fernbrook Garden Supply | Lost | Value proof | The rep says price. The transcript shows no value case ever reached the CFO, and the rep turned down the analysis. |
| 08 | Pikeview Software | No decision | No decision | The rep says "nothing we could have done," but the payback number was asked for a month before the freeze. |

## How to score a run

**Header:** outcome, scope note, competitor, incumbent and tag. An acceptable alternative tag gets half credit.

**Each of the seven sections:**

| Score | Meaning |
|---|---|
| **2: Correct** | Cites the key evidence with the right label (quote / fact / opinion), and reaches the key insight |
| **1: Partial** | Right evidence but a shallow insight, or a wrong label |
| **0: Wrong or missing** | Wrong conclusion, or "not covered" when the transcript had the answer |
| **Fail** | Invented content: a quote not in the transcript, a figure or name that isn't there, or an answer where the key says *Not covered* |

**Close:** does it list the skipped or dodged questions the key names, and is the rep takeaway on the key's theme?

**Must catch:** pass/fail items in each key.

**Messaging changes:** each one must point to evidence in a section and quote a real current line. Until the messaging ingredients arrive, the keys give only the **direction** each change should take.

**Suggested bar before piloting with the team:**
- No **Fail** scores on any scenario.
- All **must catch** items pass.
- An average of **1.6 or higher out of 2** across the 56 section scores.
- Each transcript run **3 times** gives the same outcome, tag and decision maker.

## Limits

These interviews are 550–820 words. Real ones are often 4,000+. Passing this set is the minimum bar, not proof. Calibration on real deals comes next.
