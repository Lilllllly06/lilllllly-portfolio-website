# Private assistant activity

Run `npm run usage` from the repository to see the last seven UTC calendar days
and 20 recent model requests. Timestamps in the recent-activity list use
America/Toronto. The report uses server-side Redis credentials from the ignored
`.env.deployment.local` file (or the environment). It never calls a model.

```sh
npm run usage -- --days 30 --limit 50
npm run usage -- --days 1 --json
npm run usage -- --environment development --env-file .env.local
```

These reports are private. Do not commit env files, embed Redis credentials in
the browser, or publish the raw report.

## Local dashboard

Run `npm run usage:dashboard` and open the printed local URL (normally
`http://127.0.0.1:5176/`). Keep the process running while using it; Ctrl+C stops
the dashboard. If the port is occupied, the launcher chooses another one.

This is a separate local app, not a route on the deployed portfolio. It binds to
loopback only, rejects non-local peers and unexpected Host/Origin headers, and
does not enable CORS. Only Redis credentials from `.env.deployment.local` or the
server environment are loaded. No model credentials or Redis secrets are sent
to the browser. It is not designed to be exposed through a tunnel or hosted
publicly without adding authentication.

The page reads real production, preview, or development records, with 1-, 7-,
and 30-day ranges, daily totals, searchable recent requests, request details,
and a CSV export of the filtered recent records. It shows at most 100 retained
requests; totals include all recorded requests in the selected range. Daily
buckets use UTC; request timestamps use Toronto time. Unknown token usage stays
unknown. Exported CSV files contain private technical records, not conversations.

Auto-refresh is off initially. When enabled, it checks once per minute while
the tab is visible. A 30-second server cache coalesces repeated reads. The
dashboard never calls a model, writes to Redis, or changes the public website.

## What it measures

One record is attempted for each admitted model request, whether it completes,
fails, times out, is interrupted, or is cancelled. Each record contains:

- Start/end timestamps and duration.
- Provider, model, response ID when provided, and a random request ID.
- Outcome and validated input/output/total token counts when provided.
- Cached-input token counts when the provider reports them.

The random ID identifies a request, not a visitor or conversation. There are no
prompts, answers, excerpts, histories, IP addresses, user agents, or visitor IDs
in these records. Technical metadata is not described as guaranteed anonymous:
in particular, response IDs can be correlated with provider-side records.

Daily totals count requests, not unique people. They exclude page views,
validation failures, quota-blocked calls, and notes-only fallback answers that
never attempted a model call. Token counts come from the provider, not an
estimate; missing usage is shown as unknown, not zero. This best-effort report is
not a billing ledger and cannot recover visits from before deployment.

## Storage and failure behavior

Tracking is on by default only for Vercel production. Set
`PORTFOLIO_USAGE_ENABLED=false` to disable future recording, or `true` to opt in
a local/preview environment. Development, preview, and production histories have
separate Redis namespaces. For local testing, leave `VERCEL_ENV` unset or set it
to `development`; do not copy the production scope into a local server.

The existing Upstash store holds daily aggregates and at most 500 recent records
per UTC day. Both expire at the day's UTC midnight plus 30 days, so records live
for at most 30 days. Daily totals continue to include requests whose detailed
records were trimmed. Recording uses one atomic, bounded Lua operation per
attempt. The report only reads Redis. Disabling recording does not delete
existing records; their existing expiration still applies.

Writes are awaited before ending the HTTP response, with a 1.5-second storage
timeout. A failed metadata write is dropped and produces only a generic warning;
it does not replace a successful AI answer. There is no retry queue or external
analytics service. Chat's separate shared spending guard still fails closed if
its reservation cannot be made. Monitoring uses Redis commands/storage, not
additional model tokens, and remains subject to the store's plan limits.

## Interface and data handling

The owner requested removal of the dedicated Privacy link and dialog. The
composer retains its existing AI-provider and sensitive-information reminder.
This UI choice is not a determination of applicable privacy-notice requirements.
Chat history remains in browser session storage; this feature does not add a
server conversation database.
Hosting and model providers have their own policies and logs. OpenAI's
`store: false` is unchanged and does not override abuse-monitoring retention.
See [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).

There are no per-use notifications to the owner. Run the report when needed.

## Saved questions

The local dashboard's Questions tab reads a separate log. It is disabled in
every environment unless the chat server sets `PORTFOLIO_QUESTION_LOG_ENABLED=true`.
It uses the same server-side Redis connection but separate keys by environment.
The dashboard does not need that flag to read existing records.

When enabled, a valid question that passes local request admission is recorded
even if the assistant returns notes or the model fails. Only the submitted
question text, timestamp, and a random record ID are stored. Prior messages,
answers, separately attached resume excerpts, and visitor identifiers are not
included. Automated prompts are not filtered out. Invalid or locally throttled
requests are not recorded. Storage is best effort and does not block chat on
failure. Nothing is backfilled.

Each UTC day retains at most its latest 1,000 questions and expires at the
day's UTC midnight plus seven days. Turning recording off stops future writes;
existing records expire on schedule. Questions can contain personal information
in the text itself. Restrict access to Redis and the local dashboard, and do
not publish or expose the dashboard through a tunnel.
