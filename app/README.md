# Deal Reviews page

The page the team uses to submit AE interview transcripts, read everyone's reviews, and see patterns across deals.
It is published as a claude.ai artifact and runs on each viewer's own Claude access.

| File | What it is |
|---|---|
| `core.js` | The review workflow: transcript parsing, the three AI step prompts, the quote check, and the code that runs the steps in order. The page and the test harness (`../eval/run.js`) both run this exact file. |
| `page.html` | The page: Submit, Feed and Dashboard tabs, in the glass-ui look. |
| `build.js` | Builds `../dist/deal-reviews.html`: inlines `core.js`, one fictional example transcript, and example reviews taken from the model comparison. |
| `assets/` | Glass backdrops: light (`bg.jpg`, `bg-blur.jpg`) and dark (`bg-dark.jpg`, `bg-dark-blur.jpg`). |

## The workflow

| Step | Done by | Job |
|---|---|---|
| Read | Sonnet | Builds an evidence list from the whole transcript, every excerpt copied word for word. |
| Check | Code | Drops any excerpt that isn't word for word in the transcript. |
| Analyze | Opus | Writes the report: account, ACV, outcome, reason tag and reason, 3-5 key findings with quotes. |
| Check | Code | Drops any finding whose quote isn't in the transcript, keeps ACV only if its words are, removes quotation marks from paraphrases. |

## Data

- `reviews/<userId>`: that person's feed index, `{ owner, cards: { <reviewId>: card } }`. Everyone reads it.
- `reviews/<userId>/items/<reviewId>`: the full report.
- Rules: everyone reads; each person writes only their own `reviews/<userId>` subtree; the artifact owner can edit or remove any review.
- Transcripts are never stored.

## Changing things

- **Real messaging:** replace `MESSAGING` in `core.js` (it's provisional, reconstructed from how reps describe the pitch in the test transcripts), bump `PIPELINE_VERSION`, then re-run the eval and rebuild.
- **Models:** change `STAGE_MODELS` in `core.js`, re-run `node eval/run.js --configs <setup>`, then rebuild.
- **Build:** `node app/build.js --config <setup whose reports become the examples>`.
