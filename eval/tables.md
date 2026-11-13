### Overall (8 test deals, judged against the answer keys; max score 24)

| Setup (reader → analyst → strategist) | Score /24 | Header /6 | Sections /14 | Close /2 | Messaging /2 | Must-catch | Invented content | Quotes verbatim | Time per review | Cost per review |
|---|---|---|---|---|---|---|---|---|---|---|
| Sonnet → Opus → Opus · v4b | **22.5** | 6.0 | 12.8 | 1.8 | 2.0 | 94% | 1 | 100% | 108s | $0.336 |
| Sonnet → Opus → Opus · v1 | **22.0** | 5.4 | 13.3 | 1.5 | 1.9 | 94% | 7 | 100% | 108s | $0.342 |
| Sonnet → Opus → Opus · v7a | **21.9** | 5.6 | 12.9 | 1.4 | 2.0 | 92% | 2 | 100% | 117s | $0.349 |
| Sonnet → Opus → Opus · v8a | **21.9** | 5.5 | 13.0 | 1.5 | 1.9 | 95% | 2 | 100% | 113s | $0.358 |
| Haiku → Opus → Opus · v1 | **21.8** | 5.4 | 13.0 | 1.4 | 2.0 | 94% | 10 | 100% | 155s | $0.287 |
| Opus → Opus → Opus · v1 | **21.8** | 5.4 | 12.9 | 1.5 | 2.0 | 94% | 2 | 100% | 137s | $0.464 |
| Sonnet → Opus → Opus · v4a | **21.5** | 5.5 | 12.6 | 1.4 | 2.0 | 88% | 1 | 100% | 113s | $0.316 |
| Sonnet → Opus → Opus · v3a | **21.4** | 5.3 | 12.5 | 1.8 | 1.9 | 88% | 4 | 100% | 110s | $0.348 |
| Single prompt, Opus | **21.4** | 5.1 | 12.8 | 1.5 | 2.0 | 97% | 9 | 100% | 56s | $0.152 |
| Opus → Opus → Opus · v2a | **21.3** | 5.1 | 13.0 | 1.4 | 1.8 | 94% | 1 | 100% | 136s | $0.439 |
| Sonnet → Sonnet → Sonnet · v2a | **21.3** | 5.3 | 12.9 | 1.4 | 1.8 | 97% | 3 | 100% | 83s | $0.181 |
| Sonnet → Opus → Opus · v2c | **21.1** | 5.1 | 12.7 | 1.6 | 1.7 | 93% | 4 | 100% | 111s | $0.339 |
| Sonnet → Opus → Opus · v5a | **21.1** | 5.5 | 12.4 | 1.4 | 1.9 | 91% | 3 | 100% | 120s | $0.367 |
| Sonnet → Opus → Opus · v6a | **21.1** | 5.3 | 12.6 | 1.3 | 1.9 | 97% | 1 | 100% | 103s | $0.329 |
| Sonnet → Opus → Opus · v2a | **21.0** | 5.0 | 12.8 | 1.4 | 1.9 | 100% | 1 | 100% | 116s | $0.347 |
| Sonnet → Opus → Opus · v7b | **21.0** | 4.5 | 13.5 | 1.0 | 2.0 | 88% | 4 | 100% | 107s | $0.321 |
| Single prompt, Sonnet | **21.0** | 5.3 | 12.6 | 1.1 | 2.0 | 97% | 0 | 100% | 54s | $0.087 |
| Sonnet → Opus → Opus · v3b | **20.9** | 5.1 | 12.6 | 1.3 | 1.9 | 85% | 1 | 100% | 106s | $0.332 |
| Sonnet → Sonnet → Sonnet · v1 | **20.9** | 5.3 | 12.8 | 1.1 | 1.8 | 94% | 4 | 100% | 76s | $0.186 |
| Haiku → Sonnet → Opus · v1 | **20.6** | 5.3 | 12.3 | 1.3 | 1.9 | 88% | 5 | 100% | 128s | $0.165 |
| Haiku → Sonnet → Sonnet · v1 | **20.4** | 5.1 | 12.1 | 1.4 | 1.8 | 91% | 4 | 100% | 120s | $0.122 |
| Sonnet → Opus → Opus · v2b | **20.3** | 5.1 | 12.1 | 1.3 | 1.8 | 91% | 1 | 100% | 116s | $0.347 |
| Haiku → Haiku → Haiku · v1 | **19.0** | 5.0 | 11.0 | 1.1 | 1.9 | 88% | 11 | 100% | 132s | $0.019 |

### Per step, per model (averages per call)

| Step | Model | Calls | Time | Cost | Output tokens |
|---|---|---|---|---|---|
| reader | Haiku | 8 | 80s | $0.0108 | 19992 |
| reader | Opus | 8 | 68s | $0.1982 | 8273 |
| reader | Sonnet | 8 | 38s | $0.0766 | 6014 |
| analyst | Haiku | 8 | 40s | $0.0065 | 8604 |
| analyst | Opus | 24 | 54s | $0.1924 | 5275 |
| analyst | Sonnet | 16 | 29s | $0.0788 | 3579 |
| strategist | Haiku | 8 | 13s | $0.0021 | 2089 |
| strategist | Opus | 32 | 18s | $0.0760 | 1509 |
| strategist | Sonnet | 16 | 10s | $0.0314 | 949 |
| single | Opus | 8 | 56s | $0.1524 | 5528 |
| single | Sonnet | 8 | 54s | $0.0872 | 7046 |

### Reader: evidence items and word-for-word accuracy

| Reader | Items per transcript | Excerpts found word for word | Quote / fact / opinion mix | Contradictions found | Dodges found |
|---|---|---|---|---|---|
| Haiku | 42 | 100% | 19% / 59% / 22% | 3.3 | 3.5 |
| Opus | 41 | 100% | 16% / 59% / 25% | 5.4 | 3.8 |
| Sonnet | 39 | 100% | 17% / 65% / 18% | 5.1 | 2.8 |

### Score by deal (/24)

| Setup | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 |
|---|---|---|---|---|---|---|---|---|---|
| Sonnet → Opus → Opus · v4b | – | 24 | – | – | 20* | – | 23 | 23 | – |
| Sonnet → Opus → Opus · v1 | 22 | 23 | 24* | 21* | 22* | 21 | 21* | 22 | – |
| Sonnet → Opus → Opus · v7a | 23 | 24 | 22 | 21 | 20* | 21 | 23 | 21 | 22 |
| Sonnet → Opus → Opus · v8a | 24 | 22 | 23 | 20* | 22 | 20 | 21* | 23 | – |
| Haiku → Opus → Opus · v1 | 24* | 23* | 24 | 21 | 21* | 19* | 22* | 20* | – |
| Opus → Opus → Opus · v1 | 23 | 24 | 23 | 21* | 22 | 19 | 22* | 20 | – |
| Sonnet → Opus → Opus · v4a | 24 | 22 | 23 | 20 | 22 | 20* | 20 | 21 | – |
| Sonnet → Opus → Opus · v3a | 24 | 23 | 22 | 21* | 22* | 21 | 17* | 21* | – |
| Single prompt, Opus | 23 | 23* | 23* | 21 | 21* | 20 | 21 | 19* | – |
| Opus → Opus → Opus · v2a | 23* | 24 | 23 | 21 | 20 | 21 | 19 | 19 | – |
| Sonnet → Sonnet → Sonnet · v2a | 23 | 24* | 21 | 21 | 20 | 21 | 21* | 19 | – |
| Sonnet → Opus → Opus · v2c | 21 | 24 | 22* | – | 22 | 21 | 20* | 18 | – |
| Sonnet → Opus → Opus · v5a | 23 | 22* | 22 | 21 | 20* | 21 | 20 | 20 | – |
| Sonnet → Opus → Opus · v6a | 21 | 22 | 21 | 20 | 21 | 21 | 21 | 21 | 22* |
| Sonnet → Opus → Opus · v2a | 23 | 22 | 22 | 21 | 19* | 21 | 22 | 18 | – |
| Sonnet → Opus → Opus · v7b | – | – | – | 21* | – | 21 | – | – | – |
| Single prompt, Sonnet | 22 | 23 | 21 | 21 | 21 | 20 | 21 | 19 | – |
| Sonnet → Opus → Opus · v3b | 23 | 21 | 22 | 21 | 20* | 21 | 19 | 20 | – |
| Sonnet → Sonnet → Sonnet · v1 | 22 | 22 | 21 | 20* | 22* | 21 | 20 | 19 | – |
| Haiku → Sonnet → Opus · v1 | 23 | 20* | 19 | 20 | 21* | 20 | 22* | 20 | – |
| Haiku → Sonnet → Sonnet · v1 | 22 | 20 | 20 | 19 | 21* | 20 | 23* | 18 | – |
| Sonnet → Opus → Opus · v2b | 22 | 19 | 21 | 21 | 20* | 20 | 21 | 18 | – |
| Haiku → Haiku → Haiku · v1 | 20* | 21 | 18* | 20* | 19* | 17 | 21* | 16* | – |

`*` = the judge flagged invented content in that report.

### Consistency: Sonnet → Opus → Opus · v2 (3 independent runs)

| Deal | Outcome per run | Tag per run | Score per run |
|---|---|---|---|
| 01-tallowfield-supply | Won / Won / Won | Value proof / Value proof / Value proof | 23 / 22 / 21 |
| 02-corelane-fitness | Won / Won / Won | Value proof / Value proof / Value proof | 22 / 19 / 24 |
| 03-fetchwell | Won / Won / Won | Developer experience / Developer experience / Developer experience | 22 / 21 / 22 |
| 04-marlowe-and-finch | Lost / Lost / – | In-store and online together / In-store and online together / – | 21 / 21 / – |
| 05-kestrel-learning | Lost / Lost / Lost | Value proof / Value proof / Value proof | 19 / 20 / 22 |
| 06-tixhaven | Lost / Lost / Lost | Support and service / Support and service / Support and service | 21 / 20 / 21 |
| 07-fernbrook-garden-supply | Lost / Lost / Lost | Value proof / Value proof / Value proof | 22 / 21 / 20 |
| 08-pikeview-software | No decision / No decision / No decision | Value proof / Value proof / Value proof | 18 / 18 / 18 |

Same outcome and tag in every run: 8 of 8 deals run more than once.

### Consistency: Sonnet → Opus → Opus · v3 (2 independent runs)

| Deal | Outcome per run | Tag per run | Score per run |
|---|---|---|---|
| 01-tallowfield-supply | Won / Won | Value proof / Value proof | 24 / 23 |
| 02-corelane-fitness | Won / Won | Value proof / Approval rates | 23 / 21 |
| 03-fetchwell | Won / Won | Developer experience / Developer experience | 22 / 22 |
| 04-marlowe-and-finch | Lost / Lost | In-store and online together / In-store and online together | 21 / 21 |
| 05-kestrel-learning | Lost / Lost | Approval rates / Approval rates | 22 / 20 |
| 06-tixhaven | Lost / Lost | Support and service / Support and service | 21 / 21 |
| 07-fernbrook-garden-supply | Lost / Lost | Approval rates / Approval rates | 17 / 19 |
| 08-pikeview-software | No decision / No decision | No decision / No decision | 21 / 20 |

Same outcome and tag in every run: 7 of 8 deals run more than once.

### Consistency: Sonnet → Opus → Opus · v4 (2 independent runs)

| Deal | Outcome per run | Tag per run | Score per run |
|---|---|---|---|
| 01-tallowfield-supply | Won / – | Value proof / – | 24 / – |
| 02-corelane-fitness | Won / Won | Value proof / Value proof | 22 / 24 |
| 03-fetchwell | Won / – | Developer experience / – | 23 / – |
| 04-marlowe-and-finch | Lost / – | In-store and online together / – | 20 / – |
| 05-kestrel-learning | Lost / Lost | Approval rates / Approval rates | 22 / 20 |
| 06-tixhaven | Lost / – | Support and service / – | 20 / – |
| 07-fernbrook-garden-supply | Lost / Lost | Value proof / Value proof | 20 / 23 |
| 08-pikeview-software | No decision / No decision | No decision / No decision | 21 / 23 |

Same outcome and tag in every run: 4 of 4 deals run more than once.

### Consistency: Sonnet → Opus → Opus · v7 (2 independent runs)

| Deal | Outcome per run | Tag per run | Score per run |
|---|---|---|---|
| 01-tallowfield-supply | Won / – | Value proof / – | 23 / – |
| 02-corelane-fitness | Won / – | Value proof / – | 24 / – |
| 03-fetchwell | Won / – | Developer experience / – | 22 / – |
| 04-marlowe-and-finch | Lost / Lost | In-store and online together / In-store and online together | 21 / 21 |
| 05-kestrel-learning | Lost / – | Approval rates / – | 20 / – |
| 06-tixhaven | Lost / Lost | Support and service / Support and service | 21 / 21 |
| 07-fernbrook-garden-supply | Lost / – | Value proof / – | 23 / – |
| 08-pikeview-software | No decision / – | No decision / – | 21 / – |
| 09-fernbrook-acv-stated | Lost / – | Value proof / – | 22 / – |

Same outcome and tag in every run: 2 of 2 deals run more than once.
