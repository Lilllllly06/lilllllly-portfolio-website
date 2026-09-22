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
  assert.equal(
    await reserveSharedBudget({}, "openai", "gpt-5.6-luna", "test"),
    true,
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
  assert.deepEqual(command.slice(6, 8), [1, 1]);
  assert.ok(command[8] > 1489);
  assert.deepEqual(command.slice(9, 12), [12, 200, 5000000]);
  assert.equal(command[14], Date.UTC(2026, 9, 1) / 1000 + 60);
  assert.ok(!JSON.stringify(command).includes("private visitor"));
  assert.ok(reservationCommand(env, "x".repeat(60000), now)[8] > command[8]);
  assert.equal(
    reservationCommand(
      { ...env, PORTFOLIO_LLM_MONTHLY_BUDGET_USD: "999" },
      "",
      now,
    )[11],
    5000000,
  );
  for (const budget of ["0", "-1", "invalid"])
    assert.equal(
      reservationCommand(
        { ...env, PORTFOLIO_LLM_MONTHLY_BUDGET_USD: budget },
        "",
        now,
      )[11],
      0,
    );
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
  assert.equal(
    await reserveSharedBudget(env, "openai", "gpt-5.6-luna", "hello"),
    true,
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
  if cmd == 'INCRBY' then values[key] = (values[key] or 0) + tonumber(value); return values[key] end
  if cmd == 'EXPIREAT' then expiries[key] = value; return 1 end
  error('Unexpected Redis command')
end }
KEYS = {'minute', 'day', 'month'}
ARGV = {1, 1, 20, 2, 3, 100, 60, 86400, 2678400}
local reserve = function() ${reservationScript} end
assert(reserve() == 1)
assert(values.minute == 1 and values.day == 1 and values.month == 20)
assert(reserve() == 1)
assert(reserve() == 0 and values.month == 40)
values.minute = 0; values.day = 3
assert(reserve() == 0 and values.minute == 0)
values.day = 0; values.month = 90
assert(reserve() == 0 and values.minute == 0 and values.day == 0)
values.month = 80
assert(reserve() == 1 and values.month == 100)
assert(expiries.month == 2678400)
`,
  });
  assert.equal(run.status, 0, run.stderr);
});
