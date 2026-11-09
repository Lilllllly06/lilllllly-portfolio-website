# Lily's Conversational Portfolio

A portfolio people can browse or ask questions about. Built with React, TypeScript, and a server-side language-model API.

[Live website](https://www.yuezhen-dong.com) | [Architecture](docs/architecture.md) | [API setup](docs/api-setup.md)

## Features

- Ask about experience, projects, research, and interests, with streamed answers and source links.
- Open the resume beside the chat and ask questions about highlighted passages.
- Switch between conversations without losing previous messages within the browser tab.
- Browse projects, experience, and recognition without using the assistant.
- Use light or dark mode, reduced-motion settings, and an interactive puppy companion.

## How it works

The server sends approved portfolio context, recent messages, and an optional selected resume passage to the OpenAI Responses API. It validates source IDs and streams the answer back to the browser. Searchable local notes provide a fallback when the API is unavailable.

API keys stay on the server. Shared Redis counters limit request volume and spending. A local dashboard shows technical usage metadata. The assistant uses an existing model with curated context and prompt tuning, not custom-trained model weights.

## Evaluation

The latest comparison tested the current prompt against an experimental candidate on 12 new scenarios, with three difficult cases repeated three times:

| Measurement | Current prompt | Candidate |
| --- | ---: | ---: |
| First responses accepted | 11/12 | 10/12 |
| All responses accepted, including repeats | 15/18 | 14/18 |
| Difficult cases passing all three attempts | 2/3 | 2/3 |
| Median completion time | 1.703 s | 1.459 s |

Acceptance checks factual grounding, citations, uncertainty, and the requested details. **Model + manual review:** these scores use model review; independent manual review is pending. The candidate was not adopted: lower median completion time did not offset missed requirements. These are small, task-specific results, not a general accuracy or latency guarantee.

Test cases and the evaluation harness are included; detailed run reports remain local. See [testing](docs/evaluation.md) for the method and commands.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

The site works in notes-only mode without a key. For model answers, create a Git-ignored `.env.local` using the variables in `.env.example` and a development-project API key. Never use a `VITE_` variable for a secret. See [API setup](docs/api-setup.md).

```sh
npm test
npm run typecheck
npm run build
npm run health:agent
```

The default health check validates configuration. Add `-- --live` to send one small paid test question to the deployed assistant.

## More details

- [Architecture and request flow](docs/architecture.md)
- [Testing and evaluation](docs/evaluation.md)
- [Usage monitoring](docs/usage-monitoring.md)

Source links do not guarantee correctness. The assistant cannot browse live data, update the approved biography, or take external actions. Conversation history is stored per browser tab, not as a cross-device archive.
