# Portfolio Workspace

The conversational portfolio has a local notes fallback and an optional server-side model. See [the release QA](release-qa-2026-09-22.md) for deployment validation and known limitations.

## Run

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm test
npm run build
```

## Reliability

The portfolio has two independent ways to explore it:

- Projects, experience, recognition, and the manual are normal pages. They do not call a model.
- Questions retrieve the same portfolio data with MiniSearch. Without a model, the UI labels the response as portfolio notes. These are curated excerpts, not simulated LLM generation.

The browser includes the local answer function, so a missing or failed chat endpoint falls back to portfolio notes. A configured model has a 25-second timeout, with a 30-second client timeout as a second boundary. Visitors can stop requests, regenerate the latest answer, or start a new conversation. The sidebar lists separate conversations and restores their turns and unsent drafts. Starting or opening another conversation stops an in-flight response without discarding its partial text. History lives in tab-scoped session storage, survives refreshes, and is not a server database or cross-device archive. The previous single-chat format migrates automatically. Deleting a conversation requires confirmation; a storage failure shows a warning without preventing chatting.

The puppy stays above the prompt composer on both the welcome screen and active chats. Petting and feeding remain available, with a fetch interaction and a small heart reaction. Animation can be paused and respects reduced-motion preferences. These interactions do not call a model API.

Before the first response text arrives, a compact waiting scene cycles through eight original lines and illustrated props every 2.8 seconds. It includes its own pause control, a stable screen-reader status, and a reduced-motion variant. After ten seconds it acknowledges that the response is still pending, without claiming a completion estimate or revealing model reasoning. Streaming, stopping, or leaving the conversation unmounts the indicator and clears its timers; there is no artificial production delay. The dev-only `tests/fixtures/waiting-preview.html` exercises the real app with a slow local stub and no model API calls.

Both live model answers and notes appear progressively. Model responses arrive as real streamed deltas, while notes use a local text reveal and are explicitly labeled. Reduced-motion preferences disable text animation. The composer cycles sample prompts character by character, holds each for 1.1 seconds, and lets Tab fill the current suggestion when the input is empty. The next Tab moves focus normally.

There is no 100% uptime guarantee. Hosting, browser support, the network, external PDFs, and linked project media are still dependencies. Model outputs also require source verification; local notes are more predictable but cannot understand arbitrary questions like a model can.

## Optional Model

Lily selected OpenAI `gpt-5.6-luna` after the paid comparison. The review default uses the Responses API with reasoning disabled, matching the evaluation configuration. Keep `OPENAI_API_KEY` in `.env.local`, then restart Vite if needed. Never put a secret in chat, source control, or a `VITE_` variable. This is a measured product choice, not a quality guarantee. See `docs/api-setup.md` for costs and privacy details, and `docs/openai-release-review.md` for validation results.

- `GEMINI_API_KEY`: server-side Gemini credential, used only by `gemini`.
- `OPENAI_API_KEY`: server-side OpenAI credential, used only by `openai`.
- `PORTFOLIO_LLM_PROVIDER`: `openai` (default, Responses API), `gemini`, or `compatible` (Chat Completions).
- `PORTFOLIO_LLM_BASE_URL`: a custom Chat Completions base URL, used only by `compatible`. Named providers use fixed official endpoints.
- `PORTFOLIO_LLM_MODEL`: the provider's installed or available model ID.
- `PORTFOLIO_LLM_API_KEY`: custom provider credential, used only by `compatible`; never falls back to another provider's key.

Provider selection is explicit. An outage or exhausted quota returns local notes; it never triggers a paid call to a second provider. Luna uses no reasoning and a bounded output; the explicit Gemini alternative uses minimal reasoning.

For local experiments, Ollama's compatible base URL is `http://localhost:11434/v1`. Install Ollama and a model separately; neither is bundled here. See the [official compatibility documentation](https://docs.ollama.com/api/openai-compatibility).

`server/chat.ts` implements the small portfolio API. Vite serves it at `/api/chat`; `api/chat.ts` is the Vercel Node function entry point. Only the server sends the credential. GET returns a configuration boolean, never the secret. POST with `stream: true` returns newline-delimited JSON events: start, delta, complete, or fallback. The official SDK handles the provider's streaming protocol. An interrupted response is replaced by verified notes, never presented as a finished answer.

The prompt receives the full bounded public portfolio context, approved personal facts, professional motivations, confidentiality boundaries, voice examples, and at most ten recent messages. Do not submit sensitive information. OpenAI requests set `store: false`; this does not override its other data-retention policies. The app does not train or fine-tune a model and does not save visitor messages as biography updates. Citation IDs must resolve to existing portfolio sources; model-generated URLs are not made clickable.

Local safeguards allow at most three concurrent calls, twelve calls per minute, and two hundred per day in this server process. The two request limits can be changed in `.env.local`. The quota also counts failed attempts and resets on server restart. It is not a global billing cap or an abuse-proof public deployment control.

Public Vercel requests additionally require the atomic shared Redis quota in `server/request-budget.ts`. See `docs/api-setup.md` for the conservative US$5 monthly reservation policy and its limitations. A storage outage fails closed to notes, not to an unmetered model call. The full portfolio remains available without the API.

## Content

- `src/data/recruiter-overview.ts`: shared concise introduction and hiring-pitch highlights, used by both fallback notes and the live model's worked example. Broad recruiter answers lead with Waterloo, both Shopify internships and Meta, then measurable results, independent AI work, and individual/team recognition. Focused questions keep their own scope. The `recruiter` benchmark suite covers the sample prompts, role fit, a stricter length limit, a focused question, and credential inflation.
- `src/data/profile.ts`: contact, education, resume and academic CV URLs.
- `src/data/experience.ts`: roles, exact resume bullets, recognition, and skills.
- `src/data/projects.ts`: project summaries, case studies, media, and reports.
- `src/data/personal.ts`: approved public personal facts and examples of the personal/work voice split.
- `src/data/career-context.ts`: Lily's professional motivations, project decisions, learning and collaboration style, career interests, and confidentiality boundaries. No invented experience or candidate comparisons. The manual's "Behind the work" section exposes the approved notes as source-linked disclosures.
- `docs/lily-profile-questions.md`: optional interview questions for more specific stories and preferences.
- `server/portfolio-prompt.ts`: factual boundaries, tone, and citation instructions.
- `src/lib/portfolio-answer.ts`: retrieval, explicit common intents, source links, and local answer shaping.

The research filter and project search live in URL parameters. Project links carry that URL into the case study's return link. The conversation stays available while navigating between workspace pages.

Official references: [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [compatible streaming API](https://ai.google.dev/gemini-api/docs/openai), and [API key setup](https://ai.google.dev/gemini-api/docs/api-key).
