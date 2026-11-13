# Deal Review Synthesizer — Spec

The decisions made so far, in one place. Nothing here is built yet.

**Purpose:** We aren't building a summary of the call. The synthesizer digs into an AE interview, pulls out the insights, and turns them into **changes to our messaging and positioning**.

---

## The report

### 1. Header

| Field | Values |
|---|---|
| Deal | Read from the transcript: the customer's name if it's said, otherwise a short description (never an invented name). The author can edit it after posting. |
| ACV | Annual contract value, only if stated in the interview (the stating words are checked against the transcript). If not stated, the close lists it as a follow-up; the author can add it after posting. |
| Outcome | **Won**, **Lost** or **No decision** |
| Scope note | Optional. Used when the outcome is only partly true, e.g. *"Won: online memberships only; front desk still with Global Payments."* |
| Competitor | Who we were up against; "None (status quo)" if no one |
| Incumbent | What the customer used before (provider, bank, homegrown system) |
| Reason tag | Exactly one tag from the list below |

#### Reason tags

The tags are **neutral topics**. The outcome gives the direction: on a loss, the tag is why we lost; on a win, it is why they picked us.

| Tag | Use when the deciding factor was… |
|---|---|
| **Value proof** | The decider compared *money*: price against value, payback, ROI, the cost of doing nothing, and whether we showed it in the customer's own numbers. Applies even when the underlying problem is declines. |
| **Product fit** | A capability we did or didn't have |
| **Developer experience** | Docs, sandbox, APIs, how fast their engineers could build |
| **Approval rates** | The decider compared *approval performance itself*: rates by market, card type or issuer, a competitor's test results, the customer's own approval data |
| **In-store and online together** | One platform across tills and web: in-store returns of online orders, one customer record, and the store rollout itself |
| **Migration effort** | The cost, risk or timing of switching (re-collecting cards, staged moves, freeze periods) |
| **Existing relationship or bundle** | The incumbent's bank relationship, bundled services or contract lock-in |
| **Support and service** | Who helps after the sale: named people, escalation, on-call coverage. Not store rollouts. |
| **Champion or access** | A champion leaving, or never reaching the person who decided |
| **No decision** | Nobody switched: freeze, stall, status quo. Always the tag when the outcome is No decision; the underlying cause goes in the runner-up. |
| **Not established** | The interview never got to the reason |

Changes from the original list:
- *Value not shown* → **Value proof**
- *Product gap* → **Product fit**
- **Developer experience** added
- **Champion or access** added

The first two renames are so the tags work for wins too.

**There is no "Price" tag, on purpose.** When a rep says "we lost on price," the report has to find what was really behind it. Usually it's **Value proof** (the buyer compared rates, not value) or **Existing relationship or bundle** (the incumbent matched the rate).

If two tags are close, the report picks one and names the runner-up. To choose, it asks what the decider was comparing at the moment of decision.

### 2. Messaging changes (shown first; written last)

Each change contains:
- **Current line:** quoted word for word from our current messaging *(needs the messaging ingredients)*
- **Change:** what to say instead, or what to add
- **Evidence:** links to the evidence items in the sections below
- **Strength:** every change starts as **Test this**. It becomes **Change this** only when the feed shows the same line challenged across several deals, and a person makes that call.

If the interview doesn't support a change, the report says **"No change suggested."** It never invents one.

### 3. One section per question

| Section | Interview question |
|---|---|
| Trigger | What happened at the customer that started this evaluation? |
| Who decided | Who made the final call, and how do you know? |
| What the customer told us about the competitor | What did the customer bring up about the competitor? What changed in their questions after they'd met with them? |
| Our message | Which part of our pitch got a reaction, and which got silence? |
| What decided it | When did you first feel this was won or lost? What happened right before? |
| Product or proof gaps | What did they ask for that we couldn't show? |
| Customer language | What exact words did they use for their problem? |

Each section has three layers:
1. **Evidence:** an excerpt from the transcript, labeled:
   - **Quote:** the customer's own words, as relayed by the rep
   - **Fact:** something that verifiably happened: a signature, an email, a freeze, a shift in the customer's questions
   - **Opinion:** the rep's read, guess or theory. Anything the rep says about a competitor is opinion unless the rep quotes the customer.
2. **Insight:** what it means. Draws on the *whole* conversation, including contradictions, things said in passing, the customer's words against ours, and questions the rep dodged.
3. **What it changes in our messaging**

If a question was never answered, the section says **"Not covered,"** points to the close, and has no insight or messaging layer. "I don't know" from the rep is a valid answer and is kept as-is.

### 4. Close

- **What the review never covered:** skipped or dodged questions, each with a follow-up to ask.
- **One takeaway for the rep.** Everyone reads every report, so it's written as coaching.

### Rules that apply everywhere

- Every quote must appear **word for word** in the transcript. Code checks this before posting, and any claim that fails is removed or marked.
- A line the rep says they are paraphrasing ("something like…", "I'm paraphrasing") is not a quote.
- Nothing is invented: no figures, names or outcomes the transcript doesn't contain.
- The report uses the customer's words, not our marketing vocabulary, when describing their problem.

---

## The page

- **One artifact, shared by link** with everyone in the organization. Each run uses the viewer's own Claude access, with the same built-in workflow for everyone.
- **Tabs:**
  - **Submit:** upload a transcript and confirm which speaker is the AE. No other input: deal, AE name, outcome and ACV come from the conversation.
  - **Feed:** everyone's reviews
  - **Test mode:** owner only
- **Transcripts are never stored.** The file is read in the browser and discarded. Only the finished report, including its short evidence quotes, is saved.
- **File types:** Zoom and Teams `.vtt`, `.txt` exports, and Teams `.docx`.

### Feed

- **Everyone reads everything.** Authors edit only their own reviews. The owner can edit or remove any review.
- **Posts straight to the feed,** with no review step. To make up for that:
  - Authors can edit after posting, and the card shows an "edited" marker.
  - Anyone can **flag a mistake** on a specific finding.
  - The quote check runs before posting.
- **Live:** new reviews appear without a refresh, behind an "N new reviews" button so the page doesn't jump.
- **Cards show:** deal, outcome and scope note, tag, competitor, incumbent, rep, interviewer, date, and the first messaging change.
- **Filters:** outcome, tag, competitor, incumbent, rep, date, and text search.
- **Pattern strip:** counts tags across the filtered set, and groups messaging changes aimed at the same current line. This is what flags "Test this" → "Change this."
- **Comments:** on a whole review or on a specific finding.
- Reviews are saved as **structured data**, stamped with the workflow version that produced them.
- **Test reviews are marked and hidden from the team,** so invented test content is never mistaken for real competitive intel.

---

## Workflow and models (decided by testing; see `eval/REPORT.md`)

| Step | Done by |
|---|---|
| Read the whole interview into an evidence ledger | Sonnet |
| Drop any excerpt that isn't word for word | Code |
| Analyze: header, seven sections, close | Opus |
| Plan messaging changes | Opus |
| Re-check every excerpt; remove quotation marks from paraphrases | Code |

The steps run in a fixed order under code. On the test set: same outcome and tag across independent runs, every deal tagged as the answer key expects, about 110 seconds per review.

## Still needed

- **Messaging ingredients:** the page currently uses a provisional library reconstructed from the test transcripts (`MESSAGING` in `app/core.js`). Needed: current messaging word for word, proof points, product facts (can and can't), competitors and incumbents, segments, and company and product names.
