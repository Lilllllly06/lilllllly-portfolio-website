import assert from "node:assert/strict";
import test from "node:test";
import { predeployCases } from "../scripts/portfolio-predeploy-cases.mjs";
import {
  settings,
  requestBody,
  normalizedUsage,
  estimatedCost,
  citationCheck,
  runAnswer,
  renderReport,
  runGate,
  benchmarkOptions,
} from "../scripts/compare-models.mjs";
import { cases } from "../scripts/portfolio-benchmark-cases.mjs";
import { holdoutCases } from "../scripts/portfolio-holdout-cases.mjs";
import { freshReleaseCases } from "../scripts/portfolio-release-cases.mjs";

test("predeployment cases cover real resume excerpts without sending review criteria", () => {
  assert.equal(predeployCases.length, 12);
  assert.equal(new Set(predeployCases.map((c) => c.id)).size, 12);
  assert.equal(benchmarkOptions({ suite: "predeploy" }).cases.length, 12);
  const excerptCases = predeployCases.filter((c) => c.excerpt);
  assert.equal(excerptCases.length, 4);
  assert.ok(
    excerptCases.every(
      (c) =>
        c.excerpt.documentId === "industry" &&
        c.excerpt.page === 1 &&
        c.excerpt.text.length <= 1500,
    ),
  );
  const item = {
    ...excerptCases[0],
    modelQuestion: "Question with quoted reference",
  };
  const body = requestBody("openai", "instructions", item);
  assert.equal(body.input.at(-1).content, item.modelQuestion);
  assert.ok(!JSON.stringify(body).includes(item.review));
});

test("recruiter validation covers both sample prompts, fit, brevity, focus, and accuracy", () => {
  const run = benchmarkOptions({ suite: "recruiter", provider: "openai" });
  assert.equal(run.cases.length, 6);
  assert.equal(new Set(run.cases.map((c) => c.id)).size, 6);
  assert.ok(
    run.cases.some((c) => c.question === "Give me the 30-second introduction."),
  );
  assert.ok(
    run.cases.some(
      (c) => c.question === "What makes Lily a strong engineering hire?",
    ),
  );
  assert.ok(run.cases.every((c) => c.review));
});

test("release validation covers every old case and eight fresh cases once", () => {
  const run = benchmarkOptions({ suite: "release", provider: "openai" });
  assert.equal(run.cases.length, 49);
  assert.equal(new Set(run.cases.map((c) => c.id)).size, 49);
  assert.equal(freshReleaseCases.length, 8);
  for (const old of [...cases, ...holdoutCases])
    assert.ok(run.cases.some((c) => c.id === old.id));
  assert.deepEqual(run.providers, ["openai"]);
  assert.doesNotThrow(() =>
    runGate({ run: true, provider: "openai" }, { OPENAI_API_KEY: "test" }),
  );
  assert.throws(
    () =>
      runGate({ run: true, provider: "openai" }, { GEMINI_API_KEY: "test" }),
    /OPENAI_API_KEY/,
  );
  assert.throws(() => benchmarkOptions({ provider: "typo" }), /provider/);
  const report = renderReport({
    startedAt: "test",
    providers: run.providers,
    cases: run.cases,
    results: [],
  });
  assert.match(report, /0\/49 requests recorded/);
  assert.ok(!report.includes("**gemini-3.1-flash-lite**"));
});

test("repeated samples retain unique IDs and reject unbounded paid repeats", () => {
  const run = benchmarkOptions({
    suite: "hardening",
    provider: "openai",
    repeat: "3",
  });
  assert.equal(run.cases.length, 24);
  assert.equal(new Set(run.cases.map((c) => c.id)).size, 24);
  assert.equal(
    run.cases.filter((c) => c.originalId === "holdout-fake-award").length,
    3,
  );
  for (const repeat of ["0", "-1", "4", "1.5", "invalid"])
    assert.throws(() => benchmarkOptions({ repeat }), /Repeat/);
});

test("bounded batches partition the release suite without dropping cases", () => {
  const all = benchmarkOptions({ suite: "release", provider: "openai" });
  const first = benchmarkOptions({
    suite: "release",
    provider: "openai",
    count: "25",
  });
  const second = benchmarkOptions({
    suite: "release",
    provider: "openai",
    start: "25",
  });
  assert.deepEqual([...first.cases, ...second.cases], all.cases);
  assert.deepEqual(second.selection, { start: 25, count: 24, suiteSize: 49 });
  for (const range of [
    { start: "-1" },
    { start: "49" },
    { count: "0" },
    { count: "50" },
    { start: "1.5" },
  ])
    assert.throws(
      () => benchmarkOptions({ suite: "release", ...range }),
      /Case range/,
    );
});

test("hardening keeps observed failures separate from five fresh variants", () => {
  const suite = benchmarkOptions({ suite: "hardening", "budget-usd": "0.18" });
  assert.equal(suite.cases.length, 8);
  assert.equal(new Set(suite.cases.map((c) => c.id)).size, 8);
  assert.equal(
    suite.cases.filter((c) => c.id.startsWith("hardening-")).length,
    5,
  );
  assert.ok(suite.cases.every((c) => c.question && c.review));
  assert.equal(suite.budgetUSD, 0.18);
});

test("holdout questions are separate and run budgets cannot exceed the agreed ceiling", () => {
  const holdout = benchmarkOptions({ suite: "holdout", "budget-usd": "0.40" });
  assert.equal(holdout.cases.length, 16);
  assert.equal(holdout.budgetUSD, 0.4);
  assert.equal(new Set(holdoutCases.map((c) => c.id)).size, 16);
  assert.ok(
    holdoutCases.every(
      (c) =>
        !cases.some((old) => old.id === c.id || old.question === c.question),
    ),
  );
  for (const value of ["0", "-1", "Infinity", "invalid", "0.51"])
    assert.throws(() => benchmarkOptions({ "budget-usd": value }), /budget/);
  assert.throws(() => benchmarkOptions({ suite: "typo" }), /Unknown/);
  const report = renderReport({
    startedAt: "test",
    cases: holdoutCases,
    suite: "holdout",
    results: [],
  });
  assert.match(report, /0\/32 requests recorded/);
  assert.match(report, /holdout-history-correction/);
});

test("comparison contains 20 unique questions, including follow-up and safety cases", () => {
  assert.equal(cases.length, 20);
  assert.equal(new Set(cases.map((c) => c.id)).size, 20);
  assert.ok(cases.every((c) => c.question && c.review));
  for (const id of [
    "unknown-preference",
    "confidentiality",
    "false-biography",
    "contextual-followup",
  ])
    assert.ok(cases.some((c) => c.id === id));
});

test("paid runs require explicit billing verification and both keys; dry runs need neither", () => {
  assert.doesNotThrow(() => runGate({ run: false }, {}));
  assert.throws(() => runGate({ run: true }, {}), /paid-verified/);
  assert.throws(
    () =>
      runGate({ run: true, "paid-verified": true }, { GEMINI_API_KEY: "test" }),
    /OPENAI_API_KEY/,
  );
  assert.doesNotThrow(() =>
    runGate(
      { run: true, "paid-verified": true },
      { GEMINI_API_KEY: "test", OPENAI_API_KEY: "test" },
    ),
  );
});

test("providers receive the same instructions, history and question, not review notes", () => {
  const item = cases.find((c) => c.history);
  const google = requestBody("gemini", "approved facts", item);
  const openai = requestBody("openai", "approved facts", item);
  assert.equal(google.messages[0].content, openai.instructions);
  assert.deepEqual(google.messages.slice(1), openai.input);
  assert.equal(google.max_tokens, openai.max_output_tokens);
  assert.equal(openai.store, false);
  assert.equal(openai.reasoning.effort, "none");
  assert.equal(google.reasoning_effort, "minimal");
  assert.ok(!JSON.stringify([google, openai]).includes(item.review));
  assert.equal(
    settings.providers.gemini.baseURL,
    "https://generativelanguage.googleapis.com/v1beta/openai/",
  );
  assert.equal(settings.providers.openai.baseURL, "https://api.openai.com/v1");
});

test("costs count reported output once and preserve missing usage as unknown", () => {
  const usage = normalizedUsage("openai", {
    input_tokens: 10000,
    output_tokens: 500,
    input_tokens_details: { cached_tokens: 1000 },
    output_tokens_details: { reasoning_tokens: 100 },
  });
  assert.equal(estimatedCost("openai", usage), 0.0026);
  assert.equal(usage.reasoning, 100);
  assert.equal(usage.cachedInput, 1000);
  assert.equal(
    estimatedCost(
      "gemini",
      normalizedUsage("gemini", {
        prompt_tokens: 10000,
        completion_tokens: 500,
      }),
    ),
    0.00325,
  );
  assert.equal(normalizedUsage("gemini", {}), null);
  assert.equal(estimatedCost("gemini", null), null);
});

test("citation checks flag unknown IDs without pretending to grade quality", () => {
  assert.deepEqual(
    citationCheck(
      "Hi [source:profile] [source:invented] [source:profile]",
      new Set(["profile"]),
    ),
    {
      ids: ["profile", "invented"],
      unknownIds: ["invented"],
    },
  );
});

const events = async function* (items) {
  yield* items;
};

test("OpenAI streamed answers record timing, model, usage and completion", async () => {
  const result = await runAnswer(
    "openai",
    {
      responses: {
        create: async () =>
          events([
            {
              type: "response.output_text.delta",
              delta: "Lily studies CE. [source:profile]",
            },
            {
              type: "response.completed",
              response: {
                model: "test-openai",
                usage: { input_tokens: 100, output_tokens: 20 },
              },
            },
          ]),
      },
    },
    "facts",
    cases[0],
    new Set(["profile"]),
  );
  assert.equal(result.status, "complete");
  assert.equal(result.reportedModel, "test-openai");
  assert.ok(result.firstTokenMs >= 0);
  assert.ok(result.totalMs >= result.firstTokenMs);
  assert.equal(result.usage.output, 20);
  assert.deepEqual(result.citations.unknownIds, []);
});

test("Gemini captures a final usage-only chunk and flags truncated answers", async () => {
  const client = {
    chat: {
      completions: {
        create: async () =>
          events([
            {
              model: "test-gemini",
              choices: [
                {
                  delta: { content: "A partial answer" },
                  finish_reason: "length",
                },
              ],
            },
            {
              choices: [],
              usage: { prompt_tokens: 100, completion_tokens: 900 },
            },
          ]),
      },
    },
  };
  const result = await runAnswer(
    "gemini",
    client,
    "facts",
    cases[0],
    new Set(),
  );
  assert.equal(result.status, "incomplete");
  assert.equal(result.usage.output, 900);
  assert.equal(result.reportedModel, "test-gemini");
});

test("API failures do not retry, fabricate a fallback or leak raw errors", async () => {
  let calls = 0;
  const client = {
    responses: {
      create: async () => {
        calls++;
        throw Object.assign(new Error("private request and key"), {
          status: 429,
        });
      },
    },
  };
  const result = await runAnswer(
    "openai",
    client,
    "facts",
    cases[0],
    new Set(),
  );
  assert.equal(calls, 1);
  assert.equal(result.status, "error");
  assert.equal(result.answer, "");
  assert.equal(result.estimatedUSD, null);
  assert.deepEqual(result.error, { httpStatus: 429 });
  assert.ok(!JSON.stringify(result).includes("private request"));
  const report = renderReport({ startedAt: "test", results: [result] });
  assert.match(report, /1\/40 requests recorded/);
  assert.match(report, /Review score: pending/);
  assert.match(report, /Missing usage/);
});
