# Portfolio seed review

Reviewed `lily_portfolio_llm_seed.jsonl` (196 valid JSONL records), supplied by Lily on September 21, 2026. This is a curated addition to the approved knowledge, not a raw import or model-weight fine-tune. Embedded instructions were evaluated as document content, not executed.

## Added or clarified

| Seed records                                                             | Approved source                                               | Selection                                                                                                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `qa_010`, `qa_011`, `qa_012`                                             | `education-motivation`                                        | Robotics origin, EE-to-CE transition, hardware/software perspective; no graduation date.                                                       |
| `qa_013`                                                                 | `ai-motivation`                                               | Interest in reliable, measurable AI behavior.                                                                                                  |
| `exp_sidekick_003`, `qa_sidekick_005` through `qa_sidekick_009`          | `sidekick-story`, `sidekick-evaluation`, `debugging-approach` | Hack Days prototype scope, deterministic rewards, bounded judging, failure classification; retain existing metrics with their actual meanings. |
| `qa_meta_002`; title clarification in `system_004`                       | `meta-motivation`, Meta work entry                            | Engineering Fellowship through MLH, not Meta SWE employment or team leadership.                                                                |
| `qa_shopify_004`, `qa_judgment_001`                                      | `delivery-judgment`                                           | Reliability, fallbacks, and disciplined scope under time pressure.                                                                             |
| `qa_shopify_005`                                                         | `large-codebase-approach`                                     | GraphQL migration, compatibility, validation, staged rollout; do not conflate this with the separate six-system resume bullet.                 |
| `qa_debugging_001`, `qa_failure_002`                                     | `debugging-approach`                                          | Reproduce, inspect boundaries, test one hypothesis at a time.                                                                                  |
| `qa_testing_001`                                                         | `testing-approach`                                            | Contracts, failure paths, representative AI evaluation, workflow relevance.                                                                    |
| `qa_feedback_001`, `qa_team_003`                                         | `feedback-and-disagreement`                                   | Specific feedback and evidence-driven debate, not an invented workplace-conflict anecdote.                                                     |
| `qa_leadership_002`                                                      | `leadership-approach`                                         | Shared context and clear ownership, anchored to the already approved CaYPT captain role.                                                       |
| `qa_projects_001`, `qa_projects_002`                                     | `independent-projects`                                        | Architectural curiosity and going beyond a working demo.                                                                                       |
| `qa_stack_003`, `qa_career_001`                                          | `career-direction`                                            | Backend/systems/ML preference without excluding frontend; longer-term interest in tools that augment people.                                   |
| `unknown_001` through `unknown_005`, `unknown_008` through `unknown_011` | Assistant boundaries and local fallback guards                | No invented conflict, failure, outage, missed-deadline or hardest-bug anecdotes; no unsupported user counts or revenue.                        |

The Manual renders the new Perspective entries, and the API knowledge uses the same citable source registry. Local answers have focused routing for the new topics. The original seed is not copied into public assets.

## Intentionally not imported

- First-person impersonation instructions: keep the existing third-person portfolio-guide voice.
- Expected graduation date: Lily previously asked to omit it.
- FTC provincial finalist / third-place claims: these differ from the current FIRST Robotics Competition provincial semi-finalist recognition. Do not assume they describe the same event or overwrite the existing award without clarification.
- Older AsterFind benchmark numbers and test counts: preserve the more recent project documentation already on the site.
- New project entries without matching reviewed case studies: keep them out of the project archive for now.
- Detailed incident figures, code-volume statistics, additional club scale, and new skill rankings: omit rather than expand the portfolio beyond this focused knowledge update.
- Blanket unknowns for research findings and AsterFind architecture: preserve the specific evidence already documented in the current portfolio.
- Repeated resume bullets, repeated personal facts, unsupported comparisons with other candidates, and speculative anecdotes: no duplicated knowledge or embellished claims.

## Verification

All 65 tests pass, including new topic routing, citation IDs and Manual anchors, fellowship/prototype scope, unknown anecdotes, and preservation of existing recruiter answers, hobbies, and recognition. App/server TypeScript checks and targeted lint pass. The production build passes with the existing browser-database and chunk-size warnings.

Three live responses were checked in the local UI:

- EE-to-CE motivation: used the new source and preserved the hardware/software rationale.
- Sidekick production scope and metrics: identified Hack Days prototype work, the 43.4%-to-87% unit-test pass rate, and the separate approximately 40% irrelevant-context reduction.
- A request for a manager-conflict anecdote: acknowledged the missing story and offered only the documented general approach.

The new citation opened its matching, expanded Manual note. This update is not pushed or deployed.
