# Portfolio API Setup

## Selected Provider

The application uses **OpenAI GPT-5.6 Luna** with reasoning disabled. Production and development use separate OpenAI projects and credentials. Gemini is an explicit alternative, not an automatic fallback. See [testing and evaluation](evaluation.md) for validation methods.

The app supplies approved public notes to an existing model. It does not train weights, upload a fine-tuning dataset, or learn biography updates from visitors. Prompt/context tuning is tested with reproducible questions. See [testing](evaluation.md).

## Local Setup

Keep these settings in the Git-ignored `.env.local`:

```dotenv
OPENAI_API_KEY=your-server-only-key
PORTFOLIO_LLM_PROVIDER=openai
PORTFOLIO_LLM_MODEL=gpt-5.6-luna
```

Use the `portfolio-development` key locally. Never put a key in chat, Git, a `VITE_` variable, or browser code. Vite normally restarts after an environment-file change; restart manually if needed. GET `/api/chat` returns only a configuration boolean, not a key or proof of paid access.

`npm run health:agent` checks configuration. `npm run health:agent -- --live` sends one brief paid question to the deployed site, checks for a nonempty model response, and exits nonzero if the response is notes-only, even with HTTP 200. Use `--url http://127.0.0.1:5173` to check local development. Output contains status metadata, not the answer or credentials. No recurring monitor is automatically enabled.

An API error, timeout, incomplete stream, missing key, or exhausted local quota returns explicitly labeled verified portfolio notes. No second provider is called automatically. Resume, projects, recognition, and the manual are ordinary pages and do not require a live model.

## Costs

Official Luna rates checked October 21, 2026: $0.20 per million input tokens, $0.02 per million cached input tokens, and $1.20 per million output tokens. Cache writes cost 1.25 times the uncached input rate. Inputs exceeding 272,000 tokens use 2x input and 1.5x output pricing for the full request. No paid search tools or hosted vector store are used. These API charges exclude hosting, tax, currency conversion, and unrelated account usage. [Official pricing](https://developers.openai.com/api/docs/models/gpt-5.6-luna).

The October evaluation's production-prompt requests averaged approximately $0.00267 each at uncached input/output rates, or $2.67 per 1,000 similar answers before cache adjustments. This is a workload example, not a traffic forecast. Five answers in a conversation consume five requests; visitor count is not answer count. Histories, output length, cache behavior, and future context changes affect cost.

Provider settings verified October 21, 2026:

| Scope | Monthly hard limit | Credential use |
| --- | ---: | --- |
| Organization | US$10 | Combined organization usage |
| `portfolio-production` | US$8 | Production service-account key |
| `portfolio-development` | US$2 | Local evaluations and Vercel Preview |

Organization alerts are set at $5, $8, and $10. Automatic reload remains: below a $5 balance, restore the balance to $10, with a $10 monthly reload purchase cap. A reload purchase cap is distinct from a usage cap. Provider hard-limit enforcement can have a slight delay; alerts alone do not stop requests. [Official spend-limit behavior](https://developers.openai.com/api/docs/guides/spend-limits).

Local limits remain 12 calls/minute, 200/day, and 3 concurrent calls per process. Without Redis, local development has no application-level shared monthly counter; its provider project cap still applies. Direct evaluation scripts have an additional explicit per-run cost guard.

The atomic Upstash reservation enforces shared limits of 12 requests/minute, 200/day, and an $8 production or $2 nonproduction monthly ceiling (a lower environment value is honored; a higher one cannot bypass the ceiling). Before each request, it reserves a conservative estimate using UTF-8 input bytes plus overhead, the cache-write input rate, all 900 possible output tokens, and long-context pricing when applicable. After a terminal OpenAI response, validated provider token counts reconcile the reservation, including cache reads/writes. Older usage payloads without cache-write counts conservatively price all non-cached input as cache writes. The standard service tier is explicit. Requests without trustworthy final usage, including interrupted/cancelled requests, retain their reservation. Failed settlement also retains the estimate. It is an application request guard, not a cap on the provider account, hosting costs, or unrelated API usage.

Production keeps its existing quota keys; Preview and local development with Redis use distinct namespaces. Month boundaries are UTC. The development provider project still combines local and Preview spend even though their application counters are separate. Existing production reservations remain charged conservatively until the monthly reset. Older deployments from before this accounting release use a shared $5 application allowance; deploying this revision applies the new isolation and ceilings without clearing accumulated production usage.

The Redis resource uses the free plan, automatic upgrades off, and eviction off. The spending guard stores numeric counters and random-ID reservation receipts with expirations, never messages or IP addresses. A receipt permits exactly one settlement against its original UTC month, so duplicates cannot refund twice and month rollovers cannot debit a different month. Request-rate counters are never refunded. Missing credentials, an unavailable store, invalid configuration, exhausted quota, or an unpriced model disables paid requests and returns labeled notes. Changing providers/models requires reviewing the reservation pricing first.

Production also records content-free technical activity in the same store for up to 30 days. Run `npm run usage` for a private report of timestamps, outcomes, models, and reported token counts. No visitor identifiers or conversations are included. See [usage monitoring](usage-monitoring.md) for retention, configuration, and limitations.

## Privacy and Deployment

Only intentionally public profile data and approved stories belong in context. Questions and up to ten recent messages go to the selected provider. Keep confidential employer data, secrets, and private personal information out of the knowledge base and chat. OpenAI requests use `store: false`; it does not override other retention or abuse-monitoring policies. Conversation state stays in browser session storage, not a server conversation database. [Official data controls](https://developers.openai.com/api/docs/guides/your-data).

GitHub is linked to the existing Vercel project. `api/chat.ts` is a Node function with a 30-second duration limit. Filesystem routes resolve before the SPA fallback so `/api/chat` is not rewritten to HTML. Vercel Production and Preview have different sensitive `OPENAI_API_KEY` values plus the integration's `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL/TOKEN`). No credentials enter Vite's client environment. Do not commit `.env*` or `.vercel`; `.env.example` contains placeholders only.

## Recovery record

On October 21, the previous local credential returned HTTP 401 `token_invalidated`, and the public agent was falling back to notes. The observed account view did not establish who invalidated the key, whether a previous project was deleted, or why its settings were no longer visible. Do not present a deletion or compromise theory as a confirmed incident cause.

Two replacement credentials were created in the separate projects above. Both have no scheduled expiration and are restricted to Responses write access. Production is service-account owned. Local secret files are Git-ignored and owner-readable/writable only. The production key was installed only for Vercel Production; the development key only for Preview and local testing.

The existing published revision `cb91603` was first redeployed with the new production credential. No dirty local source was uploaded during that recovery. A live end-to-end check confirmed model mode and nonempty output on `https://www.yuezhen-dong.com`. Prompt/context, source data, and prior evaluation records were not lost: they live in the repository, not in an API key. Accounting, isolation, documentation, and evaluation improvements were prepared separately for this reviewed code release.

## Credential maintenance

1. Keep the production and development project names, owner, and budget purpose clear in the provider dashboard. Keep the production key out of local experiments.
2. Use a password manager and enable account MFA or a passkey. Review organization members and project access; do not share an owner login. MFA setup was not performed as part of this recovery.
3. Never expire means no scheduled expiration, not immunity from manual revocation, provider invalidation, account removal, or project changes. No configuration can guarantee an authorized owner cannot revoke a key.
4. To rotate, create a replacement in the same intended project, restrict it, install it in the corresponding environment, deploy/restart, and run the live health check. Revoke the old key only after the replacement works, unless the old key is suspected compromised and must be revoked immediately.
5. For HTTP 401, verify the signed-in account, organization, project, key status/expiry, and installed environment. For HTTP 429, inspect rate limits, credit balance, and organization/project hard limits; do not regenerate a key to solve an exhausted budget. Never paste raw SDK errors containing credentials into tickets.
6. Run the explicit live health check after credential changes and deployments. It detects fallback but does not itself send recurring alerts or reveal the underlying provider failure to public visitors. Consult private provider/Vercel diagnostics for the cause.

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
