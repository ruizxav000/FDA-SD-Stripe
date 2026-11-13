# Test Set

Eight fictional deal-review interviews, with answer keys, for testing the synthesizer before it touches real deals.
The originals are in [`../deal-reviews/`](../deal-reviews/). This folder holds the versions the synthesizer is tested on.

> **Never give the answer keys, or the headers of the original files, to the synthesizer.** They are for scoring only.
> All customers, people and conversations are invented. Competitor behavior described in them is fiction, not intel.

## What's different from the originals

Every interview includes a deal-size exchange ("Before that, how big was the deal?") and a product exchange ("And what were we selling them?"), so ACV and product extraction are tested on all eight. Fernbrook also mentions a $4,000 greenhouse, a product price the review must not mistake for ACV.


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

Each key matches the report the page shows: a header, then one expected **messaging change** for each of the six insight areas, with the line from `messaging-baseline.md` it should touch (ids below).

| Item | Points |
|---|---|
| Account | 1 |
| Products (main product right) | 1 |
| ACV | 1 |
| Outcome | 1 |
| Reason tag (the key's tag 2, its acceptable alternative 1) | 2 |
| Real reason (not the AE's framing where they differ) | 2 |
| Six insights: 1 each when the messaging change points the same way as one of the key's expected changes for that area (the key often lists several; any one counts), 0.5 when partly | 6 |
| **Total** | **14** |

Also checked: **must catch** items, **fails if** conditions, whether every insight is a messaging change (not sales process), readability for someone skimming the feed, and whether two insights repeat each other.

**Messaging line ids** (`messaging-baseline.md`): H1-H3 company headline · A1-A5 approvals · S1-S4 stores and online · F1-F3 finance · B1-B2 billing · C1-C2 marketplaces · P1-P3 support. The full list is `MESSAGING` in `app/core.js`.

**Suggested bar before piloting with the team:**
- No **fails if** triggered and no invented content.
- All **must catch** items pass.
- 12 or more out of 14 on average.
- Repeat runs give the same outcome and reason tag.

## Limits

These interviews are 550–820 words. Real ones are often 4,000+. Passing this set is the minimum bar, not proof. Calibration on real deals comes next.
