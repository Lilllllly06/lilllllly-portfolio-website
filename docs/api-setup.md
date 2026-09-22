# Portfolio API Setup

## Selected Provider

Lily selected **OpenAI GPT-5.6 Luna** on September 21, 2026 after the paid comparison. The application uses it with reasoning disabled. Both existing keys are retained privately; only the OpenAI key is configured for deployment. Gemini is an explicit alternative, not an automatic fallback. See [the final release QA](release-qa-2026-09-22.md).

The app supplies approved public notes to an existing model. It does not train weights, upload a fine-tuning dataset, or learn biography updates from visitors. Prompt/context tuning is tested with reproducible questions. See [the validation report](openai-release-review.md).

## Local Setup

Keep these settings in the Git-ignored `.env.local`:

```dotenv
OPENAI_API_KEY=your-server-only-key
PORTFOLIO_LLM_PROVIDER=openai
PORTFOLIO_LLM_MODEL=gpt-5.6-luna
```

Never put a key in chat, Git, a `VITE_` variable, or browser code. Vite normally restarts after an environment-file change; restart manually if needed. GET `/api/chat` returns only a configuration boolean, not a key or proof of paid access. A successful live question verifies the connection.

An API error, timeout, incomplete stream, missing key, or exhausted local quota returns explicitly labeled verified portfolio notes. No second provider is called automatically. Resume, projects, recognition, and the manual are ordinary pages and do not require a live model.

## Costs

Official Luna rates checked September 21, 2026: $0.20 per million input tokens, $0.02 per million cached input tokens, and $1.20 per million output tokens. No paid search tools or hosted vector store are used. These API charges exclude hosting, tax, currency conversion, and unrelated account usage. [Official pricing](https://developers.openai.com/api/docs/models/gpt-5.6-luna).

At approximately 7,500-10,000 input tokens and 100-400 output tokens per answer, plan for about $1.60-$2.50 per 1,000 answers before cache discounts. Five answers in a conversation consume five requests; visitor count is not answer count. Long histories and large answers cost more.

Keep automatic recharge disabled unless deliberately wanted, monitor project usage, and use available provider spending controls. A budget alert is not necessarily a hard cap. Local limits are 12 calls/minute, 200/day, and 3 concurrent calls per process.

On Vercel, an atomic Upstash Redis reservation additionally enforces shared limits of 12 requests/minute, 200/day, and a US$5 monthly conservative allowance. The allowance reserves UTF-8 input bytes plus overhead at uncached Luna rates and all 900 possible output tokens. Failed/cancelled requests are not refunded. This deliberately overestimates actual token costs, so notes-only mode may begin before the OpenAI invoice reaches $5. It is an application request guard, not a cap on the provider account, hosting costs, or unrelated API usage. Preview and production share the allowance; month boundaries are UTC.

The Redis resource uses the free plan, automatic upgrades off, and eviction off. Only numeric counters with expirations are stored, never messages or IP addresses. Missing credentials, an unavailable store, invalid configuration, exhausted quota, or an unpriced model disables paid requests and returns labeled notes. Changing providers/models requires reviewing the reservation pricing first.

## Privacy and Deployment

Only intentionally public profile data and approved stories belong in context. Questions and up to ten recent messages go to the selected provider. Keep confidential employer data, secrets, and private personal information out of the knowledge base and chat. OpenAI requests use `store: false`; it does not override other retention or abuse-monitoring policies. Conversation state stays in browser session storage, not a server conversation database. [Official data controls](https://developers.openai.com/api/docs/guides/your-data).

GitHub is linked to the existing Vercel project. `api/chat.ts` is a Node function with a 30-second duration limit. Filesystem routes resolve before the SPA fallback so `/api/chat` is not rewritten to HTML. Vercel production and preview need the encrypted `OPENAI_API_KEY` plus the integration's `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL/TOKEN`). No credentials enter Vite's client environment. Do not commit `.env*` or `.vercel`; `.env.example` contains placeholders only.

## Manual Alternatives

To deliberately test Gemini again, use `PORTFOLIO_LLM_PROVIDER=gemini`, `PORTFOLIO_LLM_MODEL=gemini-3.1-flash-lite`, and `GEMINI_API_KEY`. Both accounts were configured for paid testing. Do not assume a billed project is free just because its model also has a free tier. Recheck billing and data-use terms before sending new data.

For a compatible service, explicitly set `PORTFOLIO_LLM_PROVIDER=compatible`, `PORTFOLIO_LLM_BASE_URL`, `PORTFOLIO_LLM_MODEL`, and `PORTFOLIO_LLM_API_KEY`. Named providers use fixed official endpoints; custom endpoints never inherit OpenAI or Gemini keys.

## Validation Commands

Dry runs make no API calls:

```sh
npm test
npm run compare:models -- --provider openai --suite release --budget-usd 0.48
npm run compare:models -- --provider openai --suite hardening --repeat 3 --budget-usd 0.25
```

Add `--run` only for deliberately authorized paid testing. Track cumulative allowances across runs. Errors and unedited responses are preserved. No hidden retries or paid judge calls are included.
