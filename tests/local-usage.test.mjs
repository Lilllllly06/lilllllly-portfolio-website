import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { build } from "esbuild";

async function load(file) {
  const bundle = await build({ entryPoints: [file], bundle: true, platform: "node", format: "esm", write: false });
  return import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
}
const { createLocalUsageMiddleware } = await load("server/local-usage.ts");
const { eventsCsv, filterEvents, dayLabel, duration } = await load("usage-dashboard/format.ts");
const fixture = { environment: "production", generatedAt: "2026-10-13T12:00:00.000Z", totals: { requests: 1 }, daily: [], events: [] };

async function request(middleware, overrides = {}) {
  const req = { method: "GET", url: "/api/usage", headers: { host: "127.0.0.1:5176" }, socket: { remoteAddress: "127.0.0.1", localPort: 5176 }, ...overrides };
  const res = { statusCode: 200, headers: {}, output: "", next: false,
    setHeader(key, value) { this.headers[key] = value; }, end(text) { this.output = text; } };
  await middleware(req, res, () => { res.next = true; });
  return res;
}

test("local report reads bounded metadata with no browser credentials or model calls", async () => {
  let calls = 0;
  const handler = createLocalUsageMiddleware({ KV_REST_API_TOKEN: "private-token" }, async (env, options) => {
    calls++;
    assert.equal(env.KV_REST_API_TOKEN, "private-token");
    assert.deepEqual(options, { days: 7, environment: "production", limit: 100 });
    return fixture;
  });
  const res = await request(handler);
  assert.equal(res.statusCode, 200);
  assert.equal(calls, 1);
  assert.deepEqual(JSON.parse(res.output), fixture);
  assert.equal(res.headers["Cache-Control"], "no-store");
  assert.equal(res.headers["X-Frame-Options"], "DENY");
  assert.equal(res.headers["Cross-Origin-Resource-Policy"], "same-origin");
  assert.equal(res.headers["Access-Control-Allow-Origin"], undefined);
  assert.doesNotMatch(res.output, /private-token/);
});

test("remote peers, rebinding hosts and cross-origin browsers are rejected before reading Redis", async () => {
  const handler = createLocalUsageMiddleware({}, async () => { assert.fail("Must not access Redis"); });
  const attempts = [
    { socket: { remoteAddress: "192.168.0.4", localPort: 5176 } },
    { socket: { remoteAddress: "203.0.113.8", localPort: 5176 }, headers: { host: "127.0.0.1:5176", "x-forwarded-for": "127.0.0.1" } },
    { headers: { host: "evil.test:5176" } },
    { headers: { host: "127.0.0.1:9999" } },
    { headers: { host: "127.0.0.1:5176", origin: "https://evil.test" } },
    { headers: { host: "127.0.0.1:5176", origin: "null" } },
    { headers: { host: "127.0.0.1:5176", origin: "http://127.0.0.1:5173" } },
    { headers: { host: "127.0.0.1:5176", "sec-fetch-site": "cross-site" } },
    { headers: { host: "127.0.0.1:5176", "sec-fetch-site": "same-site" } },
  ];
  for (const attempt of attempts) assert.equal((await request(handler, attempt)).statusCode, 403);
});

test("same-origin localhost works and non-API assets pass through without data reads", async () => {
  const handler = createLocalUsageMiddleware({}, async () => fixture);
  assert.equal((await request(handler, { headers: { host: "localhost:5176", origin: "http://localhost:5176", "sec-fetch-site": "same-origin" } })).statusCode, 200);
  const asset = await request(handler, { url: "/main.tsx" });
  assert.equal(asset.next, true);
  assert.equal(asset.output, "");
});

test("unknown APIs, writes, malformed origins and invalid queries cannot fetch reports", async () => {
  const handler = createLocalUsageMiddleware({}, async () => { assert.fail("Must not access Redis"); });
  for (const method of ["POST", "PUT", "DELETE", "OPTIONS", "HEAD"]) {
    const res = await request(handler, { method });
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.Allow, "GET");
  }
  assert.equal((await request(handler, { url: "/api/chat" })).statusCode, 404);
  assert.equal((await request(handler, { url: "http://evil.test/api/usage" })).statusCode, 400);
  for (const query of ["days=31", "days=0", "days=2", "environment=../private", "limit=999", "days=7&days=30"])
    assert.equal((await request(handler, { url: `/api/usage?${query}` })).statusCode, 400);
});

test("cache refreshes after 30 seconds and keeps environment/date selections separate", async () => {
  let time = 1000;
  let calls = 0;
  const handler = createLocalUsageMiddleware({}, async () => { calls++; return fixture; }, () => time);
  await request(handler);
  await request(handler);
  assert.equal(calls, 1);
  await request(handler, { url: "/api/usage?days=1" });
  await request(handler, { url: "/api/usage?environment=preview" });
  assert.equal(calls, 3);
  time += 30000;
  await request(handler);
  assert.equal(calls, 4);
});

test("saved questions are read-only, loopback-only, and never cached in the browser", async () => {
  const data = { date: "2026-10-13", page: 1, hasNext: false, questions: [{ question: "Synthetic test question" }] };
  let reads = 0;
  const handler = createLocalUsageMiddleware({}, async () => fixture, Date.now, async (_env, options) => {
    reads++;
    assert.deepEqual(options, { environment: "development", day: 0, page: 1 });
    return data;
  });
  const url = "/api/questions?environment=development";
  assert.equal((await request(handler, { url, method: "POST" })).statusCode, 405);
  assert.equal((await request(handler, { url: `${url}&day=0&day=1` })).statusCode, 400);
  assert.equal((await request(handler, { url: `${url}&page=999` })).statusCode, 400);
  assert.equal((await request(handler, { url, headers: { host: "127.0.0.1:5176", origin: "https://evil.test" } })).statusCode, 403);
  assert.equal((await request(handler, { url, socket: { remoteAddress: "192.168.0.4", localPort: 5176 } })).statusCode, 403);
  assert.equal(reads, 0);
  const response = await request(handler, { url });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Cache-Control"], "no-store");
  assert.deepEqual(JSON.parse(response.output), data);
});

test("concurrent reads share a pending request; failed reads are not cached or leaked", async () => {
  let resolve;
  let calls = 0;
  const handler = createLocalUsageMiddleware({}, () => { calls++; return new Promise((done) => { resolve = done; }); });
  const first = request(handler);
  const second = request(handler);
  assert.equal(calls, 1);
  resolve(fixture);
  assert.equal((await first).statusCode, 200);
  assert.equal((await second).statusCode, 200);
  let failures = 0;
  const failing = createLocalUsageMiddleware({}, async () => { failures++; throw new Error("private-token and private payload"); });
  for (let i = 0; i < 2; i++) {
    const res = await request(failing);
    assert.equal(res.statusCode, 503);
    assert.doesNotMatch(res.output, /private-token|private payload/);
  }
  assert.equal(failures, 2);
});

const event = { id: "00000000-0000-4000-8000-000000000001", timestamp: "2026-10-13T18:00:00.000Z", finishedAt: "2026-10-13T18:00:02.000Z", model: "test-model", provider: "openai", responseId: "resp_test", outcome: "completed", durationMs: 2000, usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15, cachedInputTokens: 0 } };
test("filters match model or IDs without changing aggregate data", () => {
  const events = [event, { ...event, id: "other", outcome: "failed", usage: null }];
  assert.equal(filterEvents(events, "TEST-MODEL", "all").length, 2);
  assert.equal(filterEvents(events, "resp_test", "completed").length, 1);
  assert.equal(filterEvents(events, "missing", "all").length, 0);
  assert.equal(events.length, 2);
  assert.equal(dayLabel("2026-10-13"), "Oct 13");
  assert.equal(duration(2586), "2.59 s");
});

test("CSV export preserves unknown usage, quotes fields and neutralizes spreadsheet formulas", () => {
  const csv = eventsCsv([event, { ...event, model: '=danger,"quoted"', usage: null }]);
  assert.match(csv, /"10","5","15","0"/);
  assert.match(csv, /"'=danger,""quoted"""/);
  assert.match(csv, /"","","",""/);
  assert.doesNotMatch(csv, /undefined|NaN/);
});

test("dashboard is separate from the public app and launcher disables environment exposure", async () => {
  const app = await readFile("src/App.tsx", "utf8");
  const config = await readFile("vite.config.ts", "utf8");
  const launcher = await readFile("scripts/usage-dashboard.mjs", "utf8");
  assert.doesNotMatch(app + config, /local-usage|usage-dashboard|api\/(?:usage|questions)/);
  assert.match(launcher, /host: "127\.0\.0\.1"/);
  assert.match(launcher, /cors: false/);
  assert.match(launcher, /envDir: false/);
  assert.doesNotMatch(launcher, /OPENAI_API_KEY|GEMINI_API_KEY/);
  const bundle = await build({ entryPoints: ["usage-dashboard/main.tsx"], bundle: true, platform: "browser", write: false, outdir: "/private/tmp/usage-test-bundle", loader: { ".woff2": "dataurl", ".woff": "dataurl" } });
  const code = bundle.outputFiles.map((file) => file.text).join("\n");
  assert.doesNotMatch(code, /KV_REST_API_TOKEN|UPSTASH_REDIS_REST_TOKEN|readUsageReport|readQuestionLog|api\.openai\.com/);
});
