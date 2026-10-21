import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import { spawnSync } from "node:child_process";

const bundle = await build({
  entryPoints: ["server/request-budget.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const {
  reservationCommand,
  reserveSharedBudget,
  sharedBudgetReady,
  reservationScript,
  settlementScript,
  usageCostMicroUSD,
} = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);
const env = {
  VERCEL: "1",
  KV_REST_API_URL: "https://portfolio-test.upstash.io",
  KV_REST_API_TOKEN: "test-counter-secret",
};
const now = Date.UTC(2026, 8, 22, 12, 30);

test("production requires a valid shared store; local development can use in-process limits", async () => {
  assert.equal(sharedBudgetReady({ VERCEL: "1" }), false);
  assert.equal(sharedBudgetReady(env), true);
  assert.ok(
    await reserveSharedBudget({}, "openai", "gpt-5.6-luna", "test"),
  );
  assert.equal(
    await reserveSharedBudget(
      { VERCEL: "1" },
      "openai",
      "gpt-5.6-luna",
      "test",
    ),
    false,
  );
  for (const url of [
    "http://x.upstash.io",
    "https://upstash.io.evil.test",
    "https://x.upstash.io/path",
    "https://user:pass@x.upstash.io",
    "https://x.upstash.io?token=x",
  ]) {
    assert.equal(
      sharedBudgetReady({ ...env, KV_REST_API_URL: url }),
      false,
      url,
    );
  }
});

test("counter payload has UTC boundaries, conservative prices and no visitor content", () => {
  const command = reservationCommand(env, "private visitor question", now);
  assert.deepEqual(command.slice(3, 6), [
    `portfolio:ai:minute:${Math.floor(now / 60000)}`,
    "portfolio:ai:day:2026-09-22",
    "portfolio:ai:month:2026-09",
  ]);
  assert.match(command[6], /^portfolio:ai:reservation:2026-09:/);
  assert.deepEqual(command.slice(7, 9), [1, 1]);
  assert.ok(command[9] > 1489);
  assert.deepEqual(command.slice(10, 13), [12, 200, 8000000]);
  assert.equal(command[15], Date.UTC(2026, 9, 1) / 1000 + 60);
  assert.ok(!JSON.stringify(command).includes("private visitor"));
  assert.ok(reservationCommand(env, "x".repeat(60000), now)[9] > command[9]);
  assert.equal(
    reservationCommand(
      { ...env, PORTFOLIO_LLM_MONTHLY_BUDGET_USD: "999" },
      "",
      now,
    )[12],
    8000000,
  );
  for (const budget of ["0", "-1", "invalid"])
    assert.equal(
      reservationCommand(
        { ...env, PORTFOLIO_LLM_MONTHLY_BUDGET_USD: budget },
        "",
        now,
      )[12],
      0,
    );
});

test("preview and local quotas cannot consume production counters", () => {
  const production = reservationCommand(env, "question", now, "same-receipt");
  for (const [name, overrides] of [["preview", {VERCEL_ENV:"preview"}], ["development", {VERCEL:"0"}]]) {
    const other = reservationCommand({...env,...overrides,PORTFOLIO_LLM_MONTHLY_BUDGET_USD:"999"}, "question", now, "same-receipt");
    assert.equal(other[12],2000000);
    for (let i=3;i<=6;i++) {
      assert.notEqual(other[i],production[i]);
      assert.ok(other[i].startsWith(`portfolio:ai:${name}:`));
    }
  }
  assert.equal(reservationCommand({...env,PORTFOLIO_LLM_MONTHLY_BUDGET_USD:"1"},"",now)[12],1000000);
});

test("shared reservation sends a single atomic command and accepts only explicit success", async (t) => {
  let calls = 0;
  let reply = { result: 1 };
  t.mock.method(globalThis, "fetch", async (url, init) => {
    calls++;
    assert.equal(url, env.KV_REST_API_URL);
    assert.equal(init.headers.Authorization, "Bearer test-counter-secret");
    assert.equal(JSON.parse(init.body)[0], "EVAL");
    assert.ok(init.signal);
    return Response.json(reply);
  });
  assert.ok(
    await reserveSharedBudget(env, "openai", "gpt-5.6-luna", "hello"),
  );
  for (const response of [
    { result: 0 },
    { result: "1" },
    { error: "unavailable" },
    {},
  ]) {
    reply = response;
    assert.equal(
      await reserveSharedBudget(env, "openai", "gpt-5.6-luna", "hello"),
      false,
    );
  }
  assert.equal(calls, 5);
  assert.equal(
    await reserveSharedBudget(env, "openai", "unpriced-model", "hello"),
    false,
  );
  assert.equal(calls, 5);
});

test("storage errors, denied requests and malformed responses never fail open", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("network or timeout");
  });
  assert.equal(
    await reserveSharedBudget(env, "openai", "gpt-5.6-luna", "hello"),
    false,
  );
  mock.mock.mockImplementation(
    async () => new Response("unavailable", { status: 503 }),
  );
  assert.equal(
    await reserveSharedBudget(env, "openai", "gpt-5.6-luna", "hello"),
    false,
  );
  mock.mock.mockImplementation(async () => new Response("invalid JSON"));
  assert.equal(
    await reserveSharedBudget(env, "openai", "gpt-5.6-luna", "hello"),
    false,
  );
});

test("Lua reservation rejects every exhausted dimension without partial increments", (t) => {
  const available = spawnSync("lua", ["-v"]);
  if (available.error?.code === "ENOENT")
    return t.skip(
      "Lua interpreter not installed; REST integration test still runs",
    );
  const run = spawnSync("lua", ["-"], {
    encoding: "utf8",
    input: `
local values = {}
local expiries = {}
redis = { call = function(cmd, key, value)
  if cmd == 'GET' then return values[key] end
  if cmd == 'EXISTS' then return values[key] and 1 or 0 end
  if cmd == 'SET' then values[key] = tonumber(value); return 'OK' end
  if cmd == 'DEL' then values[key] = nil; return 1 end
  if cmd == 'INCRBY' then values[key] = (values[key] or 0) + tonumber(value); return values[key] end
  if cmd == 'EXPIREAT' then expiries[key] = value; return 1 end
  error('Unexpected Redis command')
end }
KEYS = {'minute', 'day', 'month', 'receipt1'}
ARGV = {1, 1, 20, 2, 3, 100, 60, 86400, 2678400}
local reserve = function() ${reservationScript} end
assert(reserve() == 1)
assert(values.minute == 1 and values.day == 1 and values.month == 20)
assert(reserve() == 0 and values.month == 20)
KEYS[4] = 'receipt2'
assert(reserve() == 1)
assert(reserve() == 0 and values.month == 40)
KEYS[4] = 'receipt3'
values.minute = 0; values.day = 3
assert(reserve() == 0 and values.minute == 0)
values.day = 0; values.month = 90
assert(reserve() == 0 and values.minute == 0 and values.day == 0)
values.month = 80
KEYS[4] = 'receipt3'
assert(reserve() == 1 and values.month == 100)
assert(expiries.month == 2678400)
assert(expiries.receipt3 == expiries.month)
KEYS = {'month', 'receipt3'}; ARGV = {4}
local settle = function() ${settlementScript} end
assert(settle() == 1 and values.month == 84)
assert(values.minute == 1 and values.day == 1)
assert(settle() == 0 and values.month == 84)
KEYS = {'month', 'receipt2'}; ARGV = {30}
assert(settle() == 1 and values.month == 94)
values.month = nil; KEYS = {'month', 'receipt1'}; ARGV = {1}
assert(settle() == 0 and values.month == nil)
`,
  });
  assert.equal(run.status, 0, run.stderr);
});

const usage = {
  input_tokens: 10000,
  output_tokens: 200,
  total_tokens: 10200,
  input_tokens_details: { cached_tokens: 8000, cache_write_tokens: 1000 },
};

test("settlement prices provider usage including cache reads, writes and output", () => {
  assert.equal(usageCostMicroUSD(usage), 850);
  assert.equal(usageCostMicroUSD({ ...usage, input_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 } }), 2240);
  assert.equal(usageCostMicroUSD({ ...usage, input_tokens_details: { cached_tokens: 8000 } }), 900);
  assert.equal(usageCostMicroUSD({ ...usage, input_tokens: 300000, total_tokens: 300200, input_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 } }), 120360);
  const longReservation = reservationCommand(env, "x".repeat(300000), now);
  assert.ok(longReservation[9] > 150000);
});

test("invalid or missing usage never releases a reservation", () => {
  for (const invalid of [
    undefined, null, {},
    { ...usage, input_tokens: 0 },
    { ...usage, output_tokens: -1 },
    { ...usage, output_tokens: NaN },
    { ...usage, total_tokens: 10201 },
    { ...usage, input_tokens_details: { cached_tokens: 10001 } },
    { ...usage, input_tokens_details: { cached_tokens: 9000, cache_write_tokens: 2000 } },
    { ...usage, input_tokens_details: { cached_tokens: -1 } },
  ]) assert.equal(usageCostMicroUSD(invalid), null);
});

test("settlement reuses its reservation receipt and original month, never visitor data", async (t) => {
  const calls = [];
  let currentTime = Date.UTC(2026, 8, 30, 23, 59, 59);
  t.mock.method(Date, "now", () => currentTime);
  t.mock.method(globalThis, "fetch", async (_url, init) => {
    calls.push(JSON.parse(init.body));
    return Response.json({ result: 1 });
  });
  const reservation = await reserveSharedBudget(env, "openai", "gpt-5.6-luna", "private question");
  assert.ok(reservation);
  assert.equal(calls[0][5], "portfolio:ai:month:2026-09");
  currentTime = Date.UTC(2026, 9, 1);
  await reservation.settle(undefined);
  assert.equal(calls.length, 1);
  await reservation.settle(usage);
  assert.deepEqual(calls[1], ["EVAL", settlementScript, 2, calls[0][5], calls[0][6], 850]);
  assert.ok(!JSON.stringify(calls).includes("private question"));
  await reservation.settle(usage);
  assert.deepEqual(calls[2], calls[1]);
});

test("failed reconciliation retains the reservation without breaking the answer", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    if (++calls === 1) return Response.json({ result: 1 });
    throw new Error("store unavailable");
  });
  const reservation = await reserveSharedBudget(env, "openai", "gpt-5.6-luna", "hello");
  assert.ok(reservation);
  await assert.doesNotReject(() => reservation.settle(usage));
  assert.equal(calls, 2);
});
