# Portfolio Model Comparison

## Status

Lily has since selected OpenAI Luna. The local defaults and environment are switched; see [OpenAI validation and monthly cost](openai-release-review.md) for the completed full-suite and repeated checks. No deployment has occurred. The comparison below preserves the earlier decision-stage results.

The overnight tuning and fresh-question comparison are complete. **Read [the morning review](overnight-model-review.md) for the current recommendation, limitations, costs, and all four result sets.** Gemini is still selected and nothing was pushed or deployed. Both models made factual errors during testing; the final targeted check improved biography handling but does not establish zero hallucination risk.

The first live comparison completed on September 21, 2026: 20 answers from each paid API, all 40 requests successful. Both keys were present, and Gemini's paid tier was verified for the project matching the local key. Codex's qualitative review recommends OpenAI GPT-5.6 Luna with reasoning disabled for this portfolio, based on streaming latency, concision and citation-format consistency. The current site provider is unchanged; nothing was pushed or deployed.

Local artifacts are in `outputs/model-comparison/2026-09-21T05-28-17-473Z/`: `review.md` contains the recommendation and caveats, `comparison.md` contains all paired answers, and `results.json` preserves raw output, timing and usage. These files are intentionally ignored by Git. Combined estimated cost at uncached list rates was US$0.06962 before tax; provider invoices may be lower because both reported cached tokens.

## Setup

1. In [Google AI Studio projects](https://aistudio.google.com/projects), enable billing for the portfolio project. Confirm that the API key in `GEMINI_API_KEY` belongs to that paid project, not a different free project. Accept terms and payment confirmations yourself. Disable automatic recharge if you do not want it.
2. In [OpenAI API billing](https://platform.openai.com/settings/organization/billing/overview), sign in and add a small amount of API credit. ChatGPT subscriptions do not supply API credits. Create a key for the portfolio project in [API keys](https://platform.openai.com/api-keys).
3. Put the keys in the existing, ignored `.env.local` file under `GEMINI_API_KEY` and `OPENAI_API_KEY`. Do not paste them in chat, put them in `VITE_*` variables, or commit them. Leave the site's provider/model variables unchanged for this comparison.

The benchmark sends the approved portfolio biography, project/work stories, public contact details and personal interests to both Google and OpenAI, along with the test question/history. It does not read resumes, private attachments, other repositories or arbitrary environment variables as model context. It uses existing `portfolioInstructions()` directly. Review that public source content before running if employer confidentiality is a concern. This is inference, not fine-tuning.

The `--paid-verified` flag is an operator acknowledgement, not an automatic billing check. Do not use it before confirming the Gemini project's paid status. No setup or payment is performed by the script.

## Models and Cost

| Provider | Model                   | Input / 1M tokens | Output / 1M tokens | Reasoning setting |
| -------- | ----------------------- | ----------------- | ------------------ | ----------------- |
| Google   | `gemini-3.1-flash-lite` | US$0.25           | US$1.50            | minimal           |
| OpenAI   | `gpt-5.6-luna`          | US$0.20           | US$1.20            | none              |

Prices checked September 21, 2026: [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna). Recheck before reusing this experiment later.

At 10,000 input tokens and 500 output tokens per answer, 20 answers each would cost approximately **US$0.117 combined** before tax. Actual token counts vary. Initial credit deposits are separate from this usage estimate. No web search, external tools, or paid judging calls are included.

Reported cost uses uncached list rates, so cache discounts can make the actual invoice lower. Usage includes billed reasoning output without double counting it. Missing usage is unknown, not free. The script makes a conservative byte-based planning allowance plus output limit and stops if the estimate would exceed US$0.50; this is not a provider-enforced financial cap or a guarantee against billing changes/other application usage.

## Run

From the repository root, inspect configuration and questions without any network requests:

```sh
npm run compare:models
```

After verifying paid Gemini billing and both keys:

```sh
npm run compare:models -- --run --paid-verified
```

The default regression run makes up to 40 requests, one per question per provider. It alternates which provider goes first and does not automatically retry. It stops on a failed/incomplete response or missing usage. Results are saved after each attempt under ignored `outputs/model-comparison/<timestamp>/`, including a JSON record and paired Markdown report. Keys and full system instructions are not written to those artifacts; a fingerprint detects changes to the context and suite. New runs include the approved source snapshot and the app's rendered prose/source IDs alongside raw output. The raw response remains the basis for factual review.

Additional suites can be inspected without paid calls:

```sh
npm run compare:models -- --suite holdout --budget-usd 0.40
npm run compare:models -- --suite hardening --budget-usd 0.18
npm run compare:models -- --provider openai --suite release --budget-usd 0.48
npm run compare:models -- --provider openai --suite hardening --repeat 3 --budget-usd 0.25
```

The holdout suite contains 16 questions originally fresh after the first tuning pass. The hardening suite contains three observed failures and five then-new variants. The release suite deduplicates those and the original cases, then adds eight new questions: 49 total. They become regression cases once used for tuning. `--provider` is `both` by default, or explicitly `openai`/`gemini`; only the selected provider's key is required or used. `--repeat` allows 1-3 labeled samples. `--start` (zero-based) and `--count` select a bounded batch, recorded in the output.

Add `--run` only for deliberately authorized paid testing; also use `--paid-verified` for any run including Gemini after verifying its paid status. The budget must be positive and at most $0.50. It applies to one run, not cumulatively; track the combined budget and unknown usage separately. Starting any new run incurs new requests.

After inspecting a stopped run, explicitly resume the remaining questions:

```sh
npm run compare:models -- --run --paid-verified --resume outputs/model-comparison/<timestamp>/results.json
```

When resuming, include the same suite, provider, repeat, start/count, and budget values used originally. Changed instructions, settings, cases, or budgets fail the fingerprint check. Recorded attempts, including interrupted or failed ones, are not repeated.

## Method

- Same complete approved context, 20 questions, fixed prior history for the follow-up question, 900-token output cap and 25-second deadline. Reviewer expectations are never sent to the models.
- Production-compatible streaming endpoints: Gemini's OpenAI-compatible chat endpoint and OpenAI Responses with `store: false`. No retrieval fallback is scored as a model answer.
- Gemini uses the site's existing minimal-reasoning configuration. OpenAI Luna uses no reasoning for this low-latency Q&A experiment. The server now applies that same setting if Luna is explicitly selected; the current provider/model remain unchanged.
- Record completion status, actual returned model ID, time to first text, total time, input/output/cached/reasoning usage and estimated cost. Model aliases may change over time; preserve the reported ID.
- Review all pairs for factual accuracy, relevance, tone, source support and uncertainty/privacy handling. The generated reports offer optional 0-2 human-review fields; the completed Codex review uses qualitative findings instead of numerical scores. Unsupported credentials, invented motivations or confidentiality violations are critical failures. Merely emitting a valid citation ID does not establish factual accuracy.
- One sample per prompt is enough for an initial product comparison, not statistical proof of overall model superiority. Network conditions, caching and output lengths affect timing. Keep any recommendation specific to this portfolio.

## Questions

1. A recruiter-friendly three-sentence introduction.
2. Differences between the two Shopify internships.
3. Sidekick challenge, personal contribution and measured results.
4. Why she sought an ML/RL opportunity herself.
5. What she enjoyed most at Shopify.
6. Meta fellowship motivation and career direction.
7. AGF automation motivation and lessons.
8. Why AsterFind limits the LLM's responsibility.
9. An experiment with an unfavorable result.
10. Temporal Maze's Python and Unreal versions.
11. Ecoland's completion status and motivation.
12. Research awards and physics mindset.
13. Learning an unfamiliar field and asking for help.
14. Evidence-based fit for ML infrastructure.
15. Foods and fruit tea versus milk tea.
16. Music and unwinding.
17. Unknown favorite movie: admit uncertainty.
18. Confidential source code/merchant data: respect boundaries.
19. An ambiguous follow-up about AsterFind.
20. A visitor trying to overwrite her biography with false credentials.

The exact wording and manual-review criteria live in `scripts/portfolio-benchmark-cases.mjs`.
