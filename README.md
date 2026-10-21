# Lily's Conversational Portfolio

A portfolio people can browse or ask questions about. Built by Yuezhen (Lily) Dong with React, TypeScript, and a server-side language-model API.

[Live website](https://www.yuezhen-dong.com) | [Architecture](docs/architecture.md) | [Evaluation report](docs/evaluation.md) | [API setup](docs/api-setup.md)

## What it does

- Answers questions about work, projects, research, and professional decisions with links to approved sources.
- Streams responses, preserves separate conversations within a browser tab, and supports stop/regenerate.
- Opens the resume beside the conversation; selected passages become editable quoted questions.
- Keeps experience, project filters, research reports, and recognition usable without the model.
- Falls back to labeled, searchable portfolio notes when credentials, quotas, or the provider fail.
- Includes light/dark themes, reduced-motion support, and an interactive puppy companion.

## Engineering choices

The assistant uses an existing model, not a foundation model trained or fine-tuned for this site. The live path supplies a bounded, curated source collection and recent conversation context. MiniSearch supports the local notes fallback; the live path is not a vector-database RAG pipeline.

The application handles source-ID validation, untrusted resume excerpts, cancellation, streamed failure recovery, and server-only credentials. Atomic Redis reservations limit paid usage across Vercel instances; terminal token usage reconciles conservative reservations. Production and nonproduction use different quota namespaces. A private, loopback-only dashboard displays technical usage metadata without retaining visitor conversations.

## Evaluation

The [latest tuning experiment](docs/evaluation-v2.md) compares the prior production prompt against added evidence guidance on **20 new scenarios**, with four hard cases sampled three times. First-response acceptance was **17/20 vs 19/20**, and acceptance across all samples was **23/28 vs 25/28**. Both had 28/28 grounded responses under Codex-assisted review; this is not a general accuracy guarantee. The revised prompt was slower (median first text 2.613 s vs 1.050 s) and still omitted recognition in one introduction scenario. Experiment runs do not deploy; releases follow the normal Git deployment workflow.

The original October 21, 2026 experiment below is preserved. It froze the deployed content revision, datasets, rubric, runner hashes, and request settings before inference, comparing the production prompt against a minimal prompt with the same source facts and model.

| Measurement | Minimal prompt | Production prompt |
| --- | ---: | ---: |
| New holdout scenarios, first response accepted | 19/24 | 20/24 |
| All holdout responses accepted, including repeats | 30/40 | 33/40 |
| Fully grounded responses under the review rubric | 38/40 | 38/40 |
| Hard scenarios accepted on all three attempts | 5/8 | 5/8 |
| Median time to first text | 1.039 s | 1.050 s |

Acceptance requires factual grounding, appropriate citations, uncertainty handling, and every scenario requirement. These are **Codex-assisted reviews, not independent human judgments**. Repeated responses are not independent new scenarios; the small difference does not establish statistical superiority. The report retains failures, including a contradictory rejection of a true fact in an otherwise untrusted excerpt.

The experiment also completed **76 separate regression smoke checks** with no unknown source IDs. Those checks were not factually graded by this protocol. There were **156 total API requests**, with a US$0.3802 uncached-rate estimate; that estimate is not an invoice. [Read the protocol, evidence, and limitations](docs/evaluation.md).

## Run locally

Use Node.js 22.12+ and npm. The site works in notes-only mode without an API key.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

For model answers, create a Git-ignored `.env.local` using the variable names in `.env.example`. Use a development-project key, never the production key or a `VITE_` credential. See [API setup and recovery](docs/api-setup.md).

```sh
npm test
npm run typecheck
npm run build
npm run health:agent
```

The default health command checks configuration, not credentials. `npm run health:agent -- --live` sends one small paid question and fails if the server returns fallback notes, even with HTTP 200. The default target is the public website; use `--url http://127.0.0.1:5173` for local testing.

## Repository map

| Path | Responsibility |
| --- | --- |
| `src/pages`, `src/components` | Portfolio, conversations, resume viewer, companion interactions |
| `src/data` | Profile, experience, projects, approved background notes |
| `src/lib/portfolio-answer.ts` | Source collection and local notes retrieval |
| `server/chat.ts`, `api/chat.ts` | Validated chat handler and Vercel entry point |
| `server/portfolio-prompt.ts` | Model instructions and source-grounded context |
| `server/evidence-guidance.ts` | Claim-level source routing, scope checks, and grounded perspective synthesis |
| `server/request-budget.ts` | Atomic reservations, environment isolation, token settlement |
| `server/usage.ts` | Content-free operational usage records |
| `evals`, `scripts/evaluate-portfolio.mjs` | Frozen experiment protocol, scoring, sanitized evidence |
| `tests` | Offline regression and failure-path tests |

## Boundaries

Source-ID validation does not prove a claim is supported; that needs content review. The assistant cannot browse live inventories, change Lily's biography, or contact employers. API providers still process submitted messages. Browser session history is not a durable or cross-device archive. Quotas limit spend, not all possible abuse, and API availability is not guaranteed.

For credential rotation, deployment checks, and the distinction between provider limits and application counters, see [the recovery runbook](docs/api-setup.md#recovery-record).
