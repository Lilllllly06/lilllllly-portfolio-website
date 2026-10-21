# Portfolio Agent Evaluation

## Experiment record

Run date: **October 21, 2026**. Content revision: `cb91603043210e6c11a498fd54c97c44a51c63ca` (the deployed portfolio, not dirty local notes).

Plan SHA-256: `d4da842db8e40c5c70c92602110782097b138e793000ea0ba3c017d07a80cfe0`.

[Sanitized answers, reviews, hashes, and aggregate results](../evals/results/portfolio-holdout-v1-d4da842db8e4.json) | [Cases](../evals/holdout-v1.mjs) | [Protocol and rubric](../evals/protocol.mjs) | [Scoring implementation](../evals/scoring.mjs)

The experiment measures whether the existing portfolio prompt handles unseen combinations of facts, unknown details, conversation context, and adversarial selections. It is not a new foundation-model training run, an independent employer-metric audit, or a general AI benchmark.

## Splits and controls

- **24 new holdout scenarios** across quantitative reasoning, synthesis, conversation, uncertainty, adversarial input, and attribution; four per category.
- **Eight hard scenarios**, chosen before inference, each sampled three times. This produces 40 holdout responses per prompt variant, not 40 independent scenarios.
- **76 deduplicated regression scenarios** from previously used suites, run separately under production instructions. Earlier files named `holdout` are treated as regression because they were already used.
- **Two variants:** minimal grounding instructions versus production instructions, with the same 61 source entries, model, questions, history, excerpt formatting, and inference settings. The production prompt also contains its existing examples and policies; this is a practical prompt-package comparison, not a single-rule causal ablation.
- `gpt-5.6-luna`, reasoning `none`, standard service tier, 900 output tokens, 25-second timeout, zero SDK retries. Requested and reported model aliases are recorded; no immutable provider snapshot was returned.
- Holdout ordering alternates variant order. Execution is sequential; cache state and service conditions are not experimentally isolated.

The plan froze source content, instructions, cases, criteria, task ordering, and runner hashes before answers were generated. Exact duplicates are rejected by question/history/excerpt, but the themes deliberately overlap the product's scope; this is not a claim of statistical independence or semantic novelty for every concept.

No case requirements or reference answers enter the API request. Only the question, supplied history/excerpt, and variant context are sent. No live visitor conversations were used. The v1 holdout was not used for prompt tuning before this run. It is now inspected and published: future tuning must call it a regression set and reserve a new untouched holdout.

## Scoring

Every completed holdout response was inspected against the frozen sources using the predeclared 0-2 rubric for factual grounding, citation support, and uncertainty. Each scenario requirement is scored explicitly. Findings identify the problematic claim, source IDs, and rationale. Review records bind to the exact answer hash.

An answer is accepted only when it completed, has no unknown citation IDs, scores 2 on grounding and citation support, scores 2 or not-applicable on uncertainty, satisfies every scenario requirement, and has no critical failure. Missing reviews never count as passes. Completeness deductions are kept separate from false claims; for example, omitting AGF's four-department scope can fail acceptance without inventing a metric.

**Review method: Codex-assisted, not independent human review.** The assistant that helped build the harness also reviewed the answers. This introduces judge and author bias. All 80 answer-level reviews are inspectable; independent human adjudication remains pending. The 76 regression requests are transport/source-ID smoke checks only, not an accuracy denominator.

## Results

| Metric | Minimal | Production |
| --- | ---: | ---: |
| First-sample acceptance | 19/24 (79.2%) | 20/24 (83.3%) |
| Acceptance across all samples | 30/40 (75.0%) | 33/40 (82.5%) |
| Fully grounded reviewed responses | 38/40 (95.0%) | 38/40 (95.0%) |
| Requirements satisfied | 109/119 (91.6%) | 116/119 (97.5%) |
| Hard scenarios passing 3/3 | 5/8 | 5/8 |
| Hard scenarios with mixed pass/fail outcomes | 2/8 | 2/8 |
| Unknown source-ID responses | 0/40 | 0/40 |
| Median / p95 time to first text | 1.039 / 2.183 s | 1.050 / 3.960 s |
| Median / p95 total response time | 2.222 / 3.734 s | 2.597 / 5.360 s |

All **156/156 requests completed**, including **76/76 regression smoke checks** with no unknown source IDs. This is a single small run, not an uptime estimate. All requests reported token usage: **1,783,771 input tokens** and **19,531 output tokens**.

At the protocol's uncached rates, the run estimate is **US$0.3801914**. Conservatively pricing all reported input at the cache-write rate gives **US$0.46937995**. Neither is a provider invoice; actual cache reads/writes affect billing. Both fit within the run's US$1 guard. There were no paid grading-model calls. Credential preflights and the separate live-site health check are not included in this experiment total.

The production variant has a small observed acceptance advantage but no factual-grounding advantage in this sample. Repeated outputs are correlated; neither 40-response acceptance nor nearest-rank p95 should be treated as a population estimate, confidence bound, or SLA. Do not claim a statistically established quality improvement from this experiment.

## What the failures reveal

1. **Valid IDs can still be wrong citations.** The production answer about ranking metrics cited the project summary instead of the motivation note that actually describes MRR/nDCG. An academic-CV link description also cannot establish what metadata is absent from the underlying PDF.
2. **Mixed true/false excerpts need claim-level checking.** One production answer rejected real Sidekick involvement along with forged credentials, then affirmed it later. Rejecting an injected instruction is not enough to guarantee factual interpretation.
3. **Unknown is not false.** One minimal answer called a report unpublished even though publication status was simply undocumented.
4. **Completeness is inconsistent.** Repeats omitted scoped details such as four departments; one award line omitted juror nomination. These are not equivalent to invented achievements.
5. **Source scope matters.** One minimal answer attached broader six-system validation to a specific staff-assignment modal. Correct numbers alone do not prove correct attribution.

These are preserved findings, not hidden retries. No production prompt was changed in response to this holdout run. A next iteration should add development cases for these failure classes, then use a separately frozen v2 holdout. Improving citation attribution and mixed-evidence interpretation is a stronger next step than simply increasing test counts.

## Reproduce

The runner exports tracked context from an explicit, reviewed commit. It never silently bundles the dirty working biography.

```sh
npm run eval:portfolio -- prepare --ref cb91603043210e6c11a498fd54c97c44a51c63ca --budget-usd 1
# Use the plan path printed by prepare. This next command is a no-network dry run:
npm run eval:portfolio -- run --plan outputs/evaluation/<run>/plan.json
# Explicit paid inference, using the development key in .env.local:
npm run eval:portfolio -- run --plan outputs/evaluation/<run>/plan.json --run
npm run eval:portfolio -- report --plan outputs/evaluation/<run>/plan.json
```

The report emits a review packet and incomplete review template. Fill `reviews.json` by inspecting answers and supporting evidence; do not auto-fill passes from a keyword check. `report --publish` validates all review hashes and criteria, then exports only allowlisted fields into `evals/results`. Despite its name, `--publish` writes a local repository artifact; it does not push or deploy anything.

The runner persists an attempt before sending it, locks against concurrent execution, stops on incomplete/error/unmetered responses, and never silently retries a recorded attempt. Runner edits invalidate an existing frozen plan. Unknown usage retains its reservation rather than being treated as free. Raw plans/results are Git-ignored because they contain full context and operational detail.

An earlier frozen run (`7900d8f6f473`) stopped on its first request with HTTP 401 and produced no model answers. That record is retained locally and excluded from model-quality scoring. This run used newly validated credentials and a newly frozen plan after improving the cost guard; no successful answers were discarded from a previous run.

## Resume-safe description

> Built and deployed a source-grounded conversational portfolio with streamed answers, citation resolution, resume-excerpt Q&A, and a notes fallback; designed a reproducible evaluation harness with 24 held-out scenarios, 3-run difficult-case testing, structured factual/citation review, and separate regression coverage.

Prefer this description over "trained a personal LLM," "100% accurate," or a bare "95% accuracy" claim. The meaningful contribution is the application, evaluation discipline, and production controls; any numeric claim should name its sample and review method.

Methodology reference: [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices). Pricing reference: [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna), checked October 21, 2026.
