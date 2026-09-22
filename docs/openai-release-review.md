# OpenAI Portfolio Validation

September 21, 2026. Lily approved OpenAI. Local selection: **gpt-5.6-luna**, Responses API, reasoning **none**, 900 output tokens, 25-second provider timeout, no automatic provider retry or cross-provider fallback. Nothing committed, pushed, or deployed.

## Result

The final prompt completed **73/73 live test calls**: all 49 distinct portfolio questions, plus three additional samples each of eight high-risk cases. Codex read every answer against the approved context. No critical false credential, invented private story, confidential disclosure, or claimed external action was observed in the final set. All emitted source IDs were valid. This is a local release candidate, not a guarantee of perfect answers or uptime.

There was also an initial 49-question run in this turn. It exposed a long off-topic response and an unnecessary joke in a professional story. Those outputs were preserved. A small instruction revision followed, and the entire 49-question suite was rerun on that final prompt, closing the previous broad-regression gap.

This is **prompt/context tuning and evaluation, not model-weight training or fine-tuning**. No training job was started, no new model was created, and no biography was invented. The model receives Lily's approved portfolio notes on each request; it does not learn facts from visitors.

## What Changed

- Selected OpenAI in the ignored local environment, server defaults, and setup example. Existing Gemini credentials were left intact and private.
- Retained the biography and uncertainty checks from the overnight tuning; added a final scope/tone check to keep unrelated tasks short and professional stories free of comic embellishment.
- Kept work metrics distinct, preserved team credit, and asked for clarification when a question has no identifiable subject.
- Included the existing approved motivation note alongside a cited project page when available. Some raw answers cite a technical page for a personal explanation; supplemental links make the actual rationale reachable without inventing sources. This does not prove that every claim is supported.
- Extended the benchmark to select one provider, repeat cases, and run bounded batches. Only OpenAI received new requests. Failed attempts and raw output are retained; there is no hidden retry or paid judge.
- Updated current setup documentation so it no longer tells visitors or developers that Gemini/free-tier setup is the selected configuration. Historical comparisons remain unchanged.

## Coverage

| Area                     | Final observation                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Work and projects        | Correct work dates, contributions, Sidekick results, Python and Unreal versions, and Ecoland completion in 2024.                                |
| Motivations              | Used approved stories; explicitly acknowledged unknown original predictions, application reasons, and personal explanations.                    |
| Biography manipulation   | Corrected false degree, management-role, and gold-medal claims, including a quoted document and translation request.                            |
| Repeated risk checks     | Eight cases sampled three additional times; no recurrence of the earlier gold-medal or unknown-prediction failures.                             |
| Personal conversation    | Food and music stayed grounded; topic switching did not return unrelated research. No invented music grades or home address.                    |
| Professional tone        | Shopify story stayed professional in the revised run and live UI. Personal replies can remain lightly playful.                                  |
| Multilingual and context | Chinese/French replies, project follow-ups, poisoned prior history, and ambiguous questions were handled appropriately in this sample.          |
| Scope and actions        | Unrelated coding task redirected briefly. Email request did not claim an email was sent.                                                        |
| Format                   | The exact two-sentence introduction was 52 prose words; the under-100-word recruiter summary was 76.                                            |
| Sources                  | No invalid source IDs in final calls. Project-to-motivation links are separately covered by unit tests; source validity is not factual proof.   |
| Service behavior         | All final calls completed; median first text 0.78 s, median full response 1.80 s. One repeated case took 13.57 s, so response time is variable. |

The 49-question suite includes 41 prior regression cases and eight initially fresh questions. Once used to adjust the prompt, those eight are regression cases too, not an untouched final holdout. Repeated samples are not independent evidence of broad model accuracy. This is a qualitative Codex review, not a blinded human evaluation or a statistical guarantee.

## Monthly Cost

Official Luna rates checked September 21, 2026: **$0.20 / 1M input tokens**, **$0.02 / 1M cached input tokens**, **$1.20 / 1M output tokens**. [Official pricing](https://developers.openai.com/api/docs/models/gpt-5.6-luna).

The final runs averaged about 7,600 input tokens per answer; observed uncached token cost was about **$1.64 per 1,000 answers**. A useful planning range is **$1.60-$2.50 per 1,000 answers**, assuming roughly 7,500-10,000 input and 100-400 output tokens. Costs count each answer, not each unique visitor.

| Answers per month | Approximate API cost, USD |
| ----------------- | ------------------------- |
| 100               | $0.16-$0.25               |
| 1,000             | $1.60-$2.50               |
| 5,000             | $8-$12.50                 |
| 10,000            | $16-$25                   |

For example, 1,000 visitors asking three questions each means about **$4.80-$7.50/month** in API usage. This is a scenario, not a traffic prediction. Long histories, larger outputs, model/pricing changes, and abuse can increase costs. Cache discounts may lower them. Hosting, domain costs, tax, exchange rates, and unrelated account usage are excluded. The app has no paid web-search or vector-store calls.

## Cost of This Validation

| Run                                                  | Calls | Estimated uncached token cost |
| ---------------------------------------------------- | ----- | ----------------------------- |
| Initial full review                                  | 49    | $0.0789830                    |
| Final prompt, questions 1-25                         | 25    | $0.0416418                    |
| Final prompt, questions 26-49                        | 24    | $0.0388020                    |
| Final prompt, 8 questions repeated 3 times           | 24    | $0.0391272                    |
| Total with reported usage                            | 122   | **$0.1985540**                |
| Browser verification reservation, usage not recorded | 1     | $0.0200000                    |
| Total including reservation                          | 123   | **$0.2185540**                |

This is below the US$0.50 estimated ceiling for this turn. Estimates use provider-reported tokens at uncached list rates, not invoices; cached usage may cost less. Earlier overnight comparison costs are separate. No billing settings, credit purchases, or automatic-recharge settings were changed.

## Raw Evidence

- [Initial full run, including the behavior that was corrected](../outputs/model-comparison/2026-09-21T13-45-17-621Z/comparison.md).
- [Final prompt: questions 1-25](../outputs/model-comparison/2026-09-21T13-49-43-628Z/comparison.md).
- [Final prompt: questions 26-49](../outputs/model-comparison/2026-09-21T13-51-08-721Z/comparison.md).
- [Final prompt: repeated high-risk cases](../outputs/model-comparison/2026-09-21T13-53-12-700Z/comparison.md).

Each directory includes `results.json` with questions, raw answers, usage, timing, source snapshot, and configuration fingerprint. Raw answers were not rewritten. Numeric review-score placeholders are intentionally unfilled; the assessment above is qualitative. The raw answer rendering in the two full-suite batches predates the supplemental source-link change, which does not alter model instructions or answers and is covered by focused unit tests. The repeated run includes the new source-link projection.

## Verification and Launch Gate

35 automated tests pass. Both TypeScript configurations, targeted ESLint, and the production build pass. Existing build warnings remain for an oversized JS chunk and outdated Browserslist data. The live local browser showed an OpenAI answer with professional tone, clean formatting, team credit, and links to the correct Shopify/Sidekick notes. Unit tests cover source allowlisting, incomplete streams, outages, quota fallback, provider-key isolation, request validation, and the new batch/repeat controls.

**Still required before a public paid launch:** select/configure the backend host, install server-side deployment secrets, add shared deployment-level request/spend controls, verify visitor privacy and fallback on the actual domain, and review the local experience. The current per-process 12/minute and 200/day limits reset on restart and are not shared across serverless instances. They are not a monthly financial cap. A static website alone cannot run the new API route.

No model can honestly be called permanently "fully trained" or best possible for all future questions. The final tested configuration is a stronger local candidate; future factual updates and observed failures should become new regression cases. Keep the resume/manual authoritative and retain the notes fallback.

Local preview: [http://127.0.0.1:5173/](http://127.0.0.1:5173/). Current setup: [API setup](api-setup.md). Historical provider comparison: [morning report](overnight-model-review.md).
