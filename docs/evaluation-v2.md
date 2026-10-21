# Evidence-Guidance Tuning: V2

Run date: **October 21, 2026**. This records the pre-release evaluation of the v2 guidance; experiment runs do not deploy. Deployment status is tracked separately through the Git release workflow.

[Frozen cases](../evals/holdout-v2.mjs) | [Answers and structured reviews](../evals/results/portfolio-holdout-v2-bdf3413a61b8.json) | [Original v1 experiment](evaluation.md) | [Candidate guidance](../server/evidence-guidance.ts)

## What changed

The candidate adds claim-level evidence guidance to the existing production instructions. It routes evaluation details to the notes that contain them, distinguishes document links from document contents, preserves metric scope, and gives an example of verifying true and false assertions independently inside an untrusted excerpt.

For deeper questions, it connects decisions, constraints, and lessons from Lily's approved perspective notes rather than restating resume metrics. Cross-project interpretations must remain grounded synthesis, not invented private motives, quotes, or experiences. No new biographical facts were added for this experiment, and no model weights were trained or fine-tuned.

Both variants use the same **61 committed public source entries** from `50d0fac7aa79382cede75f58cbee0f856a1e77ad`. The runner does not import pending local personal notes. The only treatment difference is the appended evidence guidance. The baseline is the previous production prompt, not the minimal prompt used in v1.

## Development and freeze

Six already-observed v1 cases were used for development. All three runs are retained:

| Run | Calls | Baseline accepted | Candidate accepted | Interpretation |
| --- | ---: | ---: | ---: | --- |
| [Initial routing rules](../evals/results/portfolio-development-v2-bcad5011fdcc.json) | 12 | 3/6 | 3/6 | Generic routing hints did not reliably fix citations |
| [Explicit source scope](../evals/results/portfolio-development-v2-b86e6135a546.json) | 12 | 5/6 | 5/6 | Ranking-metric citations improved; mixed excerpts still failed |
| [Mixed-evidence example](../evals/results/portfolio-development-v2-a43ecce17d24.json) | 16 | 4/8 | 5/8 | The mixed JSON case failed strict acceptance on all three repeats for both variants |

The final development run repeats the mixed-evidence case three times. These are **development results**, not untouched-holdout scores. No successful responses were discarded or silently retried. An earlier preparation-only plan with five selected cases made no API requests; a missing development-case ID was corrected before inference.

After the candidate was fixed, **20 new scenarios** were authored across motivation, engineering, claims, conversation, and boundaries. Four preselected hard cases were sampled three times, giving **28 answers per variant, 56 total**. The candidate was not changed after these answers were inspected. The set is now observed and must be treated as regression data for future tuning.

Plan SHA-256: `bdf3413a61b8d4c23be352e1d7170632fc35c4833dd4376c280ec85de7f93586`.

The plan freezes instructions, sources, cases, criteria, ordering, and runner hashes. Case requirements are not included in requests. Both variants use `gpt-5.6-luna`, reasoning `none`, standard service tier, 900 output tokens, a 25-second timeout, and no SDK retries. Ordering alternates variants. All 56 requests completed with usage and no unknown source IDs.

## Results

| Metric | Prior production | Revised candidate |
| --- | ---: | ---: |
| First-sample acceptance | 17/20 (85.0%) | 19/20 (95.0%) |
| Acceptance including repeated samples | 23/28 (82.1%) | 25/28 (89.3%) |
| Fully grounded reviewed responses | 28/28 | 28/28 |
| Requirements satisfied | 73/80 (91.3%) | 77/80 (96.3%) |
| Hard cases passing all three samples | 3/4 | 3/4 |
| Median / p95 time to first text | 1.050 / 5.138 s | 2.613 / 8.219 s |
| Median / p95 total response time | 2.852 / 6.471 s | 4.047 / 9.637 s |

**Review workflow: Model + manual review.** Published scores come from model review; independent manual review is pending. Tuning, case design, and answer review used the same model-based workflow. Repeated samples are correlated; the small, domain-specific dataset is not statistically independent of development themes. Model aliases and service conditions can change. Do not interpret 28/28 grounded responses as a guarantee of 100% factual accuracy.

### Where the difference came from

- **Temporal Maze motivation:** the baseline's explanation was supported somewhere in the context, but its citation pointed only to implementation details. The candidate cited the actual motivation note as well.
- **Cross-project metrics:** both correctly refused to transfer Sidekick's 87% test pass rate to the portfolio. Only the candidate explicitly identified the portfolio as an existing-model application, as required by the predeclared rubric. This is a completeness difference, not a baseline hallucination.
- **Correcting a false previous introduction:** both corrected invented PhD/permanent-Meta-role claims but omitted recognition in all three repeats. Some answers also exceeded two sentences or omitted the partnered fellowship detail. This is the candidate's remaining failed scenario.
- **Fresh mixed excerpt:** both variants verified its true claims and corrected its false title on all three attempts. That does **not** erase the unresolved mixed-JSON development failures.

The candidate's observed improvement is modest and mainly about attribution/completeness. There was **no observed factual-grounding advantage**, and responses were slower. The baseline also had more prior cache exposure during development; latency is not an isolated measurement of prompt overhead. These results justify a reviewable candidate, not a claim of statistical superiority or complete robustness.

## Cost

The 56-request holdout cost estimate is **US$0.1571784** at uncached rates, or **US$0.1940781** conservatively pricing reported input at the cache-write rate. Including all three development runs, this round made **96 requests**, used **1,262,376 input tokens / 13,617 output tokens**, and cost an estimated **US$0.2688156**, with a conservative usage-based ceiling of **US$0.3319344**. These are estimates, not provider invoices. There were no paid grading-model calls.

Development plans each had a US$0.15 guard; the holdout plan had a US$0.50 guard. All attempts and failures remain in the evidence. The original v1 results and costs are unchanged.

## Reproduce and review

```sh
npm run eval:portfolio -- prepare --suite development-v2 --ref 50d0fac --budget-usd 0.15
npm run eval:portfolio -- prepare --suite holdout-v2 --ref 50d0fac --budget-usd 0.50
# Use a printed plan path. Without --run this makes no API requests:
npm run eval:portfolio -- run --plan outputs/evaluation/<run>/plan.json
# Explicit paid run with the development key:
npm run eval:portfolio -- run --plan outputs/evaluation/<run>/plan.json --run
npm run eval:portfolio -- report --plan outputs/evaluation/<run>/plan.json
```

The plan contains the exact instructions and sources. Sanitized exports contain answer hashes, every review, source/dataset/instruction hashes, timing, and token usage. `report --publish` only writes a local repository artifact; it does not deploy. Historical development prompts are frozen in their local plans; rerunning today's guidance creates a new experiment, not a reproduction of an earlier development revision.

Published reports use the [vendor-neutral review metadata convention](evaluation.md#reproduce). Original execution hashes, answers, scores, and review limitations are unchanged.

Independent review should prioritize `v206`, `v210`, and all `v213` repeats, then sample accepted answers such as `v204` and `v215`. In particular, adjudicate whether the completeness deductions reflect meaningful product requirements and whether motivation paraphrases accurately reflect Lily's intent. Human review remains **pending**, not inferred from this report.

## Resume wording

- Engineered a source-grounded conversational portfolio with streamed answers, resume-excerpt Q&A, citation resolution, failure recovery, and Redis-backed usage controls using React, TypeScript, and the OpenAI Responses API.
- Built a reproducible 120-scenario evaluation corpus spanning regression and two versioned holdouts, with three-run stress testing and structured grounding/citation review; evaluated prompt changes on 20 new scenarios while preserving all development failures.

The corpus comprises 76 existing regression scenarios plus 24 v1 and 20 v2 scenarios, not 120 newly independent holdouts. The v1 regression checks were transport/source-ID smoke tests; they were not all factually scored. A numeric resume claim should identify the sample and review method, not simply say "95% accurate" or "trained a personal LLM."
