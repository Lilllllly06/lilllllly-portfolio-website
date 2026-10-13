import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { spawnSync } from "node:child_process";
import { Readable } from "node:stream";
import test from "node:test";
import { build } from "esbuild";
import { formatUsageReport } from "../scripts/usage-report.mjs";

async function load(entry) {
  const bundle = await build({ entryPoints: [entry], bundle: true, platform: "node", format: "esm", write: false });
  return import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
}
const { createUsageTracker, usageCommand, recordUsage, readUsageReport, usageEnabled, usageScope, usageScript } = await load("server/usage.ts");
const { handleChat } = await load("server/chat.ts");
const env = {
  VERCEL: "1", VERCEL_ENV: "production",
  KV_REST_API_URL: "https://portfolio-test.upstash.io", KV_REST_API_TOKEN: "test-redis-secret",
  OPENAI_API_KEY: "test-model-secret", PORTFOLIO_LLM_PROVIDER: "openai",
  PORTFOLIO_LLM_REQUESTS_PER_MINUTE: "60",
};
const now = Date.UTC(2026, 9, 13, 14);
const tokens = { input_tokens: 120, output_tokens: 30, total_tokens: 150, input_tokens_details: { cached_tokens: 40 } };
const response = { id: "resp_test123", model: "gpt-5.6-luna-2026-09-01", usage: tokens };
function event(timestamp = now) {
  const tracker = createUsageTracker("openai", "gpt-5.6-luna", timestamp);
  tracker.observe(response);
  return tracker.event("completed", timestamp + 2300);
}

test("only production records by default; explicit opt-in has a separate namespace", () => {
  assert.equal(usageEnabled(env), true);
  for (const value of [{}, { ...env, VERCEL_ENV: "preview" }, { ...env, VERCEL_ENV: "development" }, { ...env, PORTFOLIO_USAGE_ENABLED: "false" }])
    assert.equal(usageEnabled(value), false);
  assert.equal(usageEnabled({ PORTFOLIO_USAGE_ENABLED: "true" }), true);
  assert.equal(usageScope({}), "development");
  assert.equal(usageScope({ VERCEL_ENV: "invalid:scope" }), "development");
  assert.match(usageCommand({ PORTFOLIO_USAGE_ENABLED: "true" }, event())[3], /:development:/);
});

test("metadata is allowlisted, never retaining provider content or visitor fields", () => {
  const tracker = createUsageTracker("openai", "gpt-5.6-luna", now);
  tracker.observe({ ...response, input: "private question", output: "private answer", metadata: { ip: "private IP" }, error: "private error" });
  const result = tracker.event("completed", now + 2300);
  assert.deepEqual(result.usage, { inputTokens: 120, outputTokens: 30, totalTokens: 150, cachedInputTokens: 40 });
  assert.equal(result.responseId, response.id);
  assert.equal(result.model, response.model);
  assert.equal(result.durationMs, 2300);
  const command = usageCommand(env, { ...result, question: "private question", ip: "private IP", visitorId: "private visitor" });
  assert.doesNotMatch(JSON.stringify(command), /private|test-redis-secret|test-model-secret/);
  assert.deepEqual(Object.keys(JSON.parse(command[6])).sort(), ["id", "timestamp", "finishedAt", "durationMs", "provider", "model", "responseId", "outcome", "usage"].sort());
  assert.notEqual(event().id, event().id);
});

test("missing or invalid provider usage stays unknown, and invalid identifiers are discarded", () => {
  const tracker = createUsageTracker("openai", "gpt-5.6-luna", now);
  for (const usage of [null, {}, { ...tokens, total_tokens: 151 }, { ...tokens, input_tokens: -1 }, { ...tokens, input_tokens: "120" }]) {
    tracker.observe({ usage, id: "visitor supplied text", model: "my private model name" });
    assert.equal(tracker.event("failed", now).usage, null);
  }
  const result = tracker.event("failed", now);
  assert.equal(result.responseId, null);
  assert.equal(result.model, "gpt-5.6-luna");
  tracker.observe(response);
  tracker.observe({ usage: null });
  assert.equal(tracker.event("completed", now).usage.totalTokens, 150);
});

test("compatible streams normalize reported tokens without fabricating unavailable cache counts", () => {
  const tracker = createUsageTracker("compatible", "local-model", now);
  tracker.observe({ id: "chatcmpl-test123", usage: { prompt_tokens: 80, completion_tokens: 20, total_tokens: 100 } });
  assert.deepEqual(tracker.event("completed", now).usage, { inputTokens: 80, outputTokens: 20, totalTokens: 100, cachedInputTokens: null });
});

test("storage has fixed UTC retention, bounded details and atomic aggregates", () => {
  const command = usageCommand(env, event(Date.UTC(2026, 9, 31, 23, 59, 59)));
  assert.deepEqual(command.slice(0, 3), ["EVAL", usageScript, 2]);
  assert.deepEqual(command.slice(3, 5), ["portfolio:usage:v1:production:2026-10-31:events", "portfolio:usage:v1:production:2026-10-31:totals"]);
  assert.deepEqual(command.slice(7), ["completed", 1, 150, 120, 30, 500, Date.UTC(2026, 10, 30) / 1000]);
  assert.match(usageScript, /'ZADD', KEYS\[1\], 'NX'/);
  assert.match(usageScript, /if added == 0 then return 1 end/);
  assert.match(usageScript, /ZREMRANGEBYRANK/);
  assert.equal((usageScript.match(/EXPIREAT/g) ?? []).length, 2);
});

test("Lua trims details without losing totals and identical writes do not double count", (t) => {
  if (spawnSync("lua", ["-v"]).error?.code === "ENOENT") return t.skip("Lua interpreter not installed");
  const run = spawnSync("lua", ["-"], { encoding: "utf8", input: `
local events, totals, expiries = {}, {}, {}
redis = { call = function(cmd, key, ...)
  local args = {...}
  if cmd == 'ZADD' then
    for _, event in ipairs(events) do if event == args[3] then return 0 end end
    table.insert(events, args[3]); return 1
  end
  if cmd == 'HINCRBY' then
    totals[args[1]] = (totals[args[1]] or 0) + tonumber(args[2]); return totals[args[1]]
  end
  if cmd == 'ZREMRANGEBYRANK' then
    local stop = tonumber(args[2]); if stop < 0 then stop = #events + stop end
    for i = 0, stop do table.remove(events, 1) end
    return 1
  end
  if cmd == 'EXPIREAT' then expiries[key] = args[1]; return 1 end
  error('Unexpected Redis command')
end }
KEYS = {'events', 'totals'}
ARGV = {1, 'first', 'completed', '1', 150, 120, 30, 2, 99999999}
local record = function() ${usageScript} end
assert(record() == 1 and #events == 1 and totals.requests == 1)
assert(record() == 1 and #events == 1 and totals.requests == 1)
ARGV[1] = 2; ARGV[2] = 'second'; record()
ARGV[1] = 3; ARGV[2] = 'third'; ARGV[3] = 'timeout'; ARGV[4] = '0'; record()
assert(#events == 2 and events[1] == 'second' and events[2] == 'third')
assert(totals.requests == 3 and totals.completed == 2 and totals.timeout == 1)
assert(totals.usageKnown == 2 and totals.totalTokens == 300)
assert(expiries.events == 99999999 and expiries.totals == 99999999)
` });
  assert.equal(run.status, 0, run.stderr);
});

test("writer is disabled locally and otherwise sends only a bounded metadata command", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    calls.push({ url, init });
    return Response.json({ result: 1 });
  });
  await recordUsage({}, event());
  assert.equal(calls.length, 0);
  await recordUsage(env, event());
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, env.KV_REST_API_URL);
  assert.equal(calls[0].init.redirect, "error");
  assert.ok(calls[0].init.signal);
});

test("logging errors never throw or print sensitive diagnostics", async (t) => {
  const warnings = [];
  t.mock.method(console, "warn", (...args) => warnings.push(args));
  t.mock.method(globalThis, "fetch", async () => { throw new Error("private response and test-redis-secret"); });
  await assert.doesNotReject(() => recordUsage(env, event()));
  await assert.doesNotReject(() => recordUsage({ ...env, KV_REST_API_URL: "https://evil.test" }, event()));
  assert.equal(warnings.length, 2);
  assert.doesNotMatch(JSON.stringify(warnings), /private|secret|evil/);
});

test("report is read-only, ordered by time, and separates known tokens from unknown usage", async (t) => {
  const older = event(now - 86400000);
  const newer = { ...event(), outcome: "failed", usage: null };
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(url, `${env.KV_REST_API_URL}/pipeline`);
    assert.equal(init.redirect, "error");
    const commands = JSON.parse(init.body);
    assert.deepEqual(commands.map((row) => row[0]), ["HGETALL", "ZREVRANGE", "HGETALL", "ZREVRANGE"]);
    assert.match(commands[0][1], /:production:2026-10-13:totals$/);
    assert.match(commands[2][1], /:production:2026-10-12:totals$/);
    return Response.json([
      { result: ["requests", "1", "failed", "1"] }, { result: [JSON.stringify(newer)] },
      { result: ["requests", "1", "completed", "1", "usageKnown", "1", "totalTokens", "150", "inputTokens", "120", "outputTokens", "30"] },
      { result: [JSON.stringify(older)] },
    ]);
  });
  const report = await readUsageReport(env, { days: 2, limit: 1 }, now);
  assert.equal(report.totals.requests, 2);
  assert.equal(report.totals.usageKnown, 1);
  assert.equal(report.totals.totalTokens, 150);
  assert.deepEqual(report.events, [newer]);
  const text = formatUsageReport(report);
  assert.match(text, /requests, not unique visitors/);
  assert.match(text, /1 without token counts/);
  assert.match(text, /unknown tokens/);
});

test("empty report explains history is not retroactive; errors do not expose server diagnostics", async (t) => {
  let reply = [{ result: [] }, { result: [] }];
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; return Response.json(reply); });
  for (const options of [{ days: 31 }, { days: 0 }, { limit: 101 }, { environment: "../private" }])
    await assert.rejects(() => readUsageReport(env, options, now));
  assert.equal(calls, 0);
  const report = await readUsageReport(env, { days: 1 }, now);
  assert.equal(report.totals.requests, 0);
  assert.match(formatUsageReport(report), /Tracking is not retroactive/);
  reply = [{ error: "test-redis-secret: private storage error" }];
  await assert.rejects(() => readUsageReport(env, { days: 1 }, now), (error) => !/private storage|test-redis-secret/.test(error.message));
});

function exchange(body = { question: "unique-private-question-marker", stream: true }, method = "POST") {
  const req = Readable.from([JSON.stringify(body)]);
  req.method = method;
  req.headers = {};
  const res = Object.assign(new EventEmitter(), {
    output: "", statusCode: 200, writableEnded: false, destroyed: false,
    setHeader() {},
    write(value) { this.output += value; },
    end(value = "") { this.output += value; this.writableEnded = true; },
  });
  return { req, res };
}

function mockChat(t, connection, events, { storageFails = false, modelFails = false, blocked = false } = {}) {
  const recorded = [];
  let modelCalls = 0;
  t.mock.method(console, "warn", () => {});
  t.mock.method(globalThis, "fetch", async (url, init) => {
    if (String(url).includes(".upstash.io")) {
      const command = JSON.parse(init.body);
      if (command[1] === usageScript) {
        assert.equal(connection.res.writableEnded, false, "record before ending serverless response");
        recorded.push(JSON.parse(command[6]));
        if (storageFails) throw new Error("private store error");
      }
      return Response.json({ result: blocked ? 0 : 1 });
    }
    assert.match(String(url), /^https:\/\/api\.openai\.com\/v1\/responses$/);
    modelCalls++;
    if (modelFails) return Response.json({ error: { message: "private provider error" } }, { status: 500 });
    return new Response(events.map((item) => `data: ${JSON.stringify(item)}\n\n`).join(""), { headers: { "Content-Type": "text/event-stream" } });
  });
  return { recorded, modelCalls: () => modelCalls };
}
const completed = [
  { type: "response.created", response: { ...response, usage: null } },
  { type: "response.output_text.delta", delta: "A useful reply." },
  { type: "response.completed", response },
];

test("chat records actual provider metadata exactly once without exposing it to the visitor", async (t) => {
  const connection = exchange();
  const mock = mockChat(t, connection, completed);
  await handleChat(connection.req, connection.res, env);
  assert.equal(mock.modelCalls(), 1);
  assert.equal(mock.recorded.length, 1);
  assert.equal(mock.recorded[0].outcome, "completed");
  assert.equal(mock.recorded[0].usage.totalTokens, 150);
  assert.equal(mock.recorded[0].responseId, response.id);
  assert.doesNotMatch(JSON.stringify(mock.recorded), /unique-private-question-marker|A useful reply|secret/);
  assert.doesNotMatch(connection.res.output, /resp_test123|totalTokens|responseId|secret/);
  assert.match(connection.res.output, /"type":"complete"/);
});

test("successful replies survive failed metadata storage", async (t) => {
  const connection = exchange();
  mockChat(t, connection, completed, { storageFails: true });
  await handleChat(connection.req, connection.res, env);
  assert.match(connection.res.output, /"type":"complete"/);
  assert.doesNotMatch(connection.res.output, /private store|"type":"fallback"/);
});

for (const [name, events, options, outcome, known] of [
  ["provider failures", [], { modelFails: true }, "failed", false],
  ["incomplete responses", [{ type: "response.incomplete", response }], {}, "incomplete", true],
  ["failed terminal events", [{ type: "response.failed", response }], {}, "failed", true],
  ["missing terminal events", completed.slice(0, 2), {}, "incomplete", false],
]) test(`chat records ${name} without inventing token counts`, async (t) => {
  const connection = exchange();
  const mock = mockChat(t, connection, events, options);
  await handleChat(connection.req, connection.res, env);
  assert.equal(mock.recorded.length, 1);
  assert.equal(mock.recorded[0].outcome, outcome);
  assert.equal(Boolean(mock.recorded[0].usage), known);
  assert.match(connection.res.output, /"type":"fallback"/);
});

test("status checks, invalid questions, blocked calls and notes-only answers create no activity", async (t) => {
  const connection = exchange();
  const mock = mockChat(t, connection, [], { blocked: true });
  for (const [body, method, config] of [
    [{}, "GET", env], [{ question: "" }, "POST", env],
    [{ question: "hello" }, "POST", {}], [{ question: "hello" }, "POST", env],
  ]) {
    const { req, res } = exchange(body, method);
    await handleChat(req, res, config);
    assert.equal(res.writableEnded, true);
  }
  assert.equal(mock.modelCalls(), 0);
  assert.equal(mock.recorded.length, 0);
});

for (const outcome of ["timeout", "cancelled"]) test(`chat records ${outcome} attempts without messages`, async (t) => {
  const connection = exchange();
  const recorded = [];
  let deadline;
  const originalSetTimeout = globalThis.setTimeout;
  t.mock.method(globalThis, "setTimeout", (fn, delay, ...args) => {
    if (delay === 25000 && !deadline) deadline = fn;
    return originalSetTimeout(fn, delay, ...args);
  });
  t.mock.method(globalThis, "fetch", async (url, init) => {
    if (String(url).includes(".upstash.io")) {
      const command = JSON.parse(init.body);
      if (command[1] === usageScript) recorded.push(JSON.parse(command[6]));
      return Response.json({ result: 1 });
    }
    if (outcome === "cancelled") {
      connection.res.destroyed = true;
      connection.res.emit("close");
    } else deadline();
    throw new Error("private interrupted request");
  });
  await handleChat(connection.req, connection.res, env);
  assert.equal(recorded.length, 1);
  assert.equal(recorded[0].outcome, outcome);
  assert.equal(recorded[0].usage, null);
  assert.doesNotMatch(JSON.stringify(recorded), /private|secret/);
});
