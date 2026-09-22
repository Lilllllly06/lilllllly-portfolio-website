import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, parseEnv } from "node:util";
import { performance } from "node:perf_hooks";
import OpenAI from "openai";
import { build } from "esbuild";
import { cases as regressionCases } from "./portfolio-benchmark-cases.mjs";
import { holdoutCases } from "./portfolio-holdout-cases.mjs";
import { hardeningCases } from "./portfolio-hardening-cases.mjs";
import { releaseCases } from "./portfolio-release-cases.mjs";
import { recruiterCases } from "./portfolio-recruiter-cases.mjs";
import { predeployCases } from "./portfolio-predeploy-cases.mjs";

export const settings = {
  maxOutputTokens: 900,
  timeoutMs: 25000,
  estimatedBudgetUSD: 0.5,
  priceChecked: "2026-09-21",
  providers: {
    gemini: {
      model: "gemini-3.1-flash-lite",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      key: "GEMINI_API_KEY",
      inputPerMillion: 0.25,
      outputPerMillion: 1.5,
    },
    openai: {
      model: "gpt-5.6-luna",
      baseURL: "https://api.openai.com/v1",
      key: "OPENAI_API_KEY",
      inputPerMillion: 0.2,
      outputPerMillion: 1.2,
    },
  },
};
const root = fileURLToPath(new URL("../", import.meta.url));
const digest = (value) => createHash("sha256").update(value).digest("hex");
const money = (n) => n.toFixed(5);

export function requestBody(provider, instructions, item) {
  const input = [
    ...(item.history || []),
    { role: "user", content: item.modelQuestion ?? item.question },
  ];
  const model = settings.providers[provider].model;
  return provider === "openai"
    ? {
        model,
        instructions,
        input,
        stream: true,
        store: false,
        reasoning: { effort: "none" },
        max_output_tokens: settings.maxOutputTokens,
      }
    : {
        model,
        stream: true,
        max_tokens: settings.maxOutputTokens,
        reasoning_effort: "minimal",
        stream_options: { include_usage: true },
        messages: [{ role: "system", content: instructions }, ...input],
      };
}

export function normalizedUsage(provider, usage) {
  if (!usage) return null;
  const input =
    provider === "openai" ? usage.input_tokens : usage.prompt_tokens;
  const output =
    provider === "openai" ? usage.output_tokens : usage.completion_tokens;
  if (![input, output].every((n) => Number.isFinite(n) && n >= 0)) return null;
  return {
    input,
    output,
    cachedInput:
      (provider === "openai"
        ? usage.input_tokens_details
        : usage.prompt_tokens_details
      )?.cached_tokens || 0,
    reasoning:
      (provider === "openai"
        ? usage.output_tokens_details
        : usage.completion_tokens_details
      )?.reasoning_tokens || 0,
  };
}

export function estimatedCost(provider, usage) {
  if (!usage) return null;
  const price = settings.providers[provider];
  // Deliberately use uncached rates; invoice totals can be lower with caching.
  return (
    (usage.input * price.inputPerMillion +
      usage.output * price.outputPerMillion) /
    1e6
  );
}

export function citationCheck(text, knownIds) {
  const ids = [
    ...new Set([...text.matchAll(/\[source:([^\]]+)\]/g)].map((m) => m[1])),
  ];
  return { ids, unknownIds: ids.filter((id) => !knownIds.has(id)) };
}

export function benchmarkOptions(values) {
  const suite = values.suite || "regression";
  const suites = {
    regression: regressionCases,
    holdout: holdoutCases,
    hardening: hardeningCases,
    release: releaseCases,
    recruiter: recruiterCases,
    predeploy: predeployCases,
  };
  if (!Object.hasOwn(suites, suite))
    throw new Error("Unknown benchmark suite.");
  const budgetUSD = Number(values["budget-usd"] ?? settings.estimatedBudgetUSD);
  if (
    !Number.isFinite(budgetUSD) ||
    budgetUSD <= 0 ||
    budgetUSD > settings.estimatedBudgetUSD
  )
    throw new Error(
      "The run budget must be greater than zero and at most US$0.50.",
    );
  const provider = values.provider || "both";
  if (!["both", ...Object.keys(settings.providers)].includes(provider))
    throw new Error("Unknown benchmark provider.");
  const repetitions = Number(values.repeat || 1);
  if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 3)
    throw new Error("Repeat must be an integer from 1 to 3.");
  const start = Number(values.start ?? 0);
  const count = Number(values.count ?? suites[suite].length - start);
  if (
    !Number.isInteger(start) ||
    start < 0 ||
    start >= suites[suite].length ||
    !Number.isInteger(count) ||
    count < 1 ||
    start + count > suites[suite].length
  )
    throw new Error("Case range must stay inside the selected suite.");
  const selectedCases = suites[suite].slice(start, start + count);
  return {
    suite,
    cases:
      repetitions === 1
        ? selectedCases
        : Array.from({ length: repetitions }, (_, index) =>
            selectedCases.map((item) => ({
              ...item,
              originalId: item.id,
              sample: index + 1,
              id: `${item.id}--sample-${index + 1}`,
            })),
          ).flat(),
    budgetUSD,
    providers:
      provider === "both" ? Object.keys(settings.providers) : [provider],
    repetitions,
    selection: { start, count, suiteSize: suites[suite].length },
  };
}

export async function runAnswer(
  provider,
  client,
  instructions,
  item,
  knownIds,
) {
  const start = performance.now();
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), settings.timeoutMs);
  const result = {
    caseId: item.id,
    provider,
    requestedModel: settings.providers[provider].model,
    reportedModel: null,
    status: "incomplete",
    answer: "",
    firstTokenMs: null,
    totalMs: 0,
    usage: null,
    estimatedUSD: null,
    error: null,
  };
  const append = (text) => {
    if (!text) return;
    if (result.firstTokenMs === null)
      result.firstTokenMs = Math.round(performance.now() - start);
    result.answer += text;
    if (result.answer.length > 18000) throw new Error("Output limit");
  };
  try {
    const body = requestBody(provider, instructions, item);
    if (provider === "openai") {
      const stream = await client.responses.create(body, {
        signal: abort.signal,
      });
      for await (const event of stream) {
        if (event.type === "response.output_text.delta") append(event.delta);
        if (event.response) {
          result.reportedModel = event.response.model || result.reportedModel;
          result.usage =
            normalizedUsage(provider, event.response.usage) || result.usage;
        }
        if (event.type === "response.completed") result.status = "complete";
        if (
          ["response.failed", "response.incomplete", "error"].includes(
            event.type,
          )
        )
          result.status = "incomplete";
      }
    } else {
      const stream = await client.chat.completions.create(body, {
        signal: abort.signal,
      });
      for await (const chunk of stream) {
        result.reportedModel = chunk.model || result.reportedModel;
        result.usage = normalizedUsage(provider, chunk.usage) || result.usage;
        append(chunk.choices?.[0]?.delta?.content);
        const reason = chunk.choices?.[0]?.finish_reason;
        if (reason)
          result.status = reason === "stop" ? "complete" : "incomplete";
      }
    }
    if (!result.answer.trim()) result.status = "incomplete";
  } catch (error) {
    result.status = abort.signal.aborted ? "timeout" : "error";
    // Do not serialize SDK errors: they may include request data or credentials.
    result.error = {
      httpStatus: Number.isInteger(error?.status) ? error.status : null,
    };
  } finally {
    clearTimeout(timer);
  }
  result.totalMs = Math.round(performance.now() - start);
  result.estimatedUSD = estimatedCost(provider, result.usage);
  result.citations = citationCheck(result.answer, knownIds);
  return result;
}

export function renderReport(run) {
  const cases = run.cases || regressionCases;
  const providers = run.providers || Object.keys(settings.providers);
  const plannedRequests = cases.length * providers.length;
  const lines = [
    "# Portfolio Model Comparison",
    "",
    `Started: ${run.startedAt}. ${run.results.length}/${plannedRequests} requests recorded. Suite: ${run.suite || "regression"}.`,
    "",
    providers.length > 1
      ? "Same portfolio instructions, question and fixed follow-up history for both providers. This is a practical fit check, not a general model benchmark."
      : "Single-provider validation using the portfolio instructions and recorded questions/history. Repeated samples are labeled in case IDs. This is a practical fit check, not a general model benchmark.",
    "",
    "Costs below use reported tokens at uncached list rates (USD), not invoices. Reasoning tokens are included in output usage, not added twice. Missing usage is not zero cost.",
    "",
    "## Measurements",
    "",
    "| Model | Complete | Median first text | Median total | Estimated token cost | Missing usage |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  const median = (values) => {
    if (!values.length) return "n/a";
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return `${Math.round(values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2)} ms`;
  };
  for (const provider of providers) {
    const rows = run.results.filter((r) => r.provider === provider);
    const complete = rows.filter((r) => r.status === "complete");
    lines.push(
      `| ${settings.providers[provider].model} | ${complete.length}/${rows.length} | ${median(complete.map((r) => r.firstTokenMs).filter((n) => n !== null))} | ${median(complete.map((r) => r.totalMs))} | $${money(rows.reduce((sum, r) => sum + (r.estimatedUSD || 0), 0))} | ${rows.filter((r) => !r.usage).length} |`,
    );
  }
  lines.push(
    "",
    "## Review Rubric",
    "",
    "Score each answer manually from 0-2 for factual accuracy, directly answering the question, tone, source support, and uncertainty/privacy handling (10 total). An invented credential, private data disclosure or fabricated personal motivation is a critical failure regardless of style. Citation IDs alone do not prove the claim is supported. No automatic keyword quality score or paid LLM judge is used.",
    "",
    "## Paired Answers",
    "",
  );
  for (const item of cases) {
    lines.push(`### ${item.id}`, "", `**Question:** ${item.question}`, "");
    if (item.history)
      lines.push(
        "**Fixed prior conversation:**",
        "",
        ...item.history.map((m) => `- ${m.role}: ${m.content}`),
        "",
      );
    lines.push(`**Review notes:** ${item.review}`, "");
    for (const provider of providers) {
      const answer = run.results.find(
        (r) => r.caseId === item.id && r.provider === provider,
      );
      lines.push(`**${settings.providers[provider].model}**`, "");
      if (!answer) {
        lines.push("Not run.", "");
        continue;
      }
      lines.push(
        `Status: ${answer.status}; first text: ${answer.firstTokenMs ?? "n/a"} ms; total: ${answer.totalMs} ms; estimated cost: ${answer.estimatedUSD === null ? "unknown" : `$${money(answer.estimatedUSD)}`}.`,
        "",
        ...(answer.answer || "No text returned.")
          .split("\n")
          .map((line) => `> ${line}`),
        "",
        `Unknown citation IDs: ${answer.citations.unknownIds.join(", ") || "none"}.`,
        "",
        "Review score: pending. Notes: pending.",
        "",
      );
    }
  }
  return lines.join("\n");
}

export function runGate(options, env) {
  if (!options.run) return;
  const { providers } = benchmarkOptions(options);
  if (providers.includes("gemini") && !options["paid-verified"])
    throw new Error(
      "Verify that the Gemini key belongs to a paid project, then add --paid-verified. This flag does not activate or check billing.",
    );
  for (const provider of providers) {
    const config = settings.providers[provider];
    if (!env[config.key]?.trim())
      throw new Error(`Missing ${config.key} in .env.local. No requests sent.`);
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      run: { type: "boolean", default: false },
      "paid-verified": { type: "boolean", default: false },
      resume: { type: "string" },
      suite: { type: "string", default: "regression" },
      "budget-usd": { type: "string" },
      provider: { type: "string", default: "both" },
      repeat: { type: "string", default: "1" },
      start: { type: "string" },
      count: { type: "string" },
    },
  });
  const {
    suite,
    cases: selectedCases,
    budgetUSD,
    providers,
    repetitions,
    selection,
  } = benchmarkOptions(values);
  const plannedRequests = selectedCases.length * providers.length;
  let local = {};
  try {
    local = parseEnv(await readFile(path.join(root, ".env.local"), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const env = { ...process.env, ...local };
  runGate(values, env);
  const bundle = await build({
    stdin: {
      contents:
        'export { portfolioInstructions } from "./server/portfolio-prompt.ts"; export { portfolioSources, citedSources, withoutCitations } from "./src/lib/portfolio-answer.ts"; export { questionWithExcerpt } from "./src/lib/resume.ts";',
      resolveDir: root,
    },
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  const {
    portfolioInstructions,
    portfolioSources,
    citedSources,
    withoutCitations,
    questionWithExcerpt,
  } = await import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
  );
  const instructions = portfolioInstructions();
  const cases = selectedCases.map((item) =>
    item.excerpt
      ? {
          ...item,
          modelQuestion: questionWithExcerpt(item.question, item.excerpt),
        }
      : item,
  );
  const fingerprint = digest(
    JSON.stringify({
      instructions,
      cases,
      settings,
      budgetUSD,
      ...(values.provider !== "both" ? { providers } : {}),
    }),
  );
  // A conservative planning allowance, not a provider-enforced financial limit.
  const allowance = (provider, item) =>
    estimatedCost(provider, {
      input:
        Buffer.byteLength(
          instructions +
            JSON.stringify(item.history || []) +
            (item.modelQuestion ?? item.question),
        ) + 2048,
      output: settings.maxOutputTokens,
    });
  const totalAllowance = cases.reduce(
    (sum, item) =>
      sum +
      providers.reduce(
        (subtotal, provider) => subtotal + allowance(provider, item),
        0,
      ),
    0,
  );
  console.log(
    JSON.stringify(
      {
        mode: values.run ? "live" : "dry-run (no network requests)",
        questions: cases.length,
        plannedRequests,
        suite,
        models: providers.map((p) => settings.providers[p].model),
        repetitions,
        selection,
        keysPresent: Object.fromEntries(
          providers
            .map((p) => settings.providers[p])
            .map((p) => [p.key, Boolean(env[p.key]?.trim())]),
        ),
        contextCharacters: instructions.length,
        conservativeAllowanceUSD: totalAllowance,
        estimatedBudgetUSD: budgetUSD,
        fingerprint,
      },
      null,
      2,
    ),
  );
  if (!values.run) {
    for (const item of cases) console.log(`${item.id}: ${item.question}`);
    return;
  }
  if (totalAllowance > budgetUSD)
    throw new Error(
      "Planning allowance exceeds the benchmark budget; no requests sent.",
    );
  const outputRoot = path.join(root, "outputs/model-comparison");
  let outputPath;
  let run;
  if (values.resume) {
    outputPath = path.resolve(values.resume);
    if (!outputPath.startsWith(`${outputRoot}${path.sep}`))
      throw new Error("Resume files must be inside outputs/model-comparison.");
    run = JSON.parse(await readFile(outputPath, "utf8"));
    if (run.fingerprint !== fingerprint)
      throw new Error(
        "Models, instructions or cases changed. Do not mix incompatible runs.",
      );
  } else {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    outputPath = path.join(outputRoot, stamp, "results.json");
    run = {
      startedAt: new Date().toISOString(),
      fingerprint,
      settings,
      suite,
      providers,
      repetitions,
      selection,
      cases,
      budgetUSD,
      sourceSnapshot: portfolioSources,
      results: [],
    };
  }
  const dir = path.dirname(outputPath);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const save = async () => {
    // Save after each attempt so interrupted runs never silently repeat paid calls.
    await writeFile(`${outputPath}.tmp`, JSON.stringify(run, null, 2) + "\n", {
      mode: 0o600,
    });
    await rename(`${outputPath}.tmp`, outputPath);
    await writeFile(path.join(dir, "comparison.md"), renderReport(run), {
      mode: 0o600,
    });
  };
  const clients = Object.fromEntries(
    providers.map((provider) => [
      provider,
      new OpenAI({
        baseURL: settings.providers[provider].baseURL,
        apiKey: env[settings.providers[provider].key],
        maxRetries: 0,
        timeout: settings.timeoutMs,
      }),
    ]),
  );
  const knownIds = new Set(portfolioSources.map((s) => s.id));
  await save();
  console.log(`Local results: ${outputPath}`);
  for (const [index, item] of cases.entries()) {
    // Alternate who goes first; neither model sees the other one's output.
    const order = (
      index % 2 ? ["openai", "gemini"] : ["gemini", "openai"]
    ).filter((provider) => providers.includes(provider));
    for (const provider of order) {
      if (
        run.results.some((r) => r.caseId === item.id && r.provider === provider)
      )
        continue;
      const reservedEstimate = cases.reduce(
        (sum, next) =>
          sum +
          providers.reduce((subtotal, p) => {
            const recorded = run.results.find(
              (r) => r.caseId === next.id && r.provider === p,
            );
            return subtotal + (recorded?.estimatedUSD ?? allowance(p, next));
          }, 0),
        0,
      );
      if (reservedEstimate > budgetUSD)
        throw new Error(
          "Stopped before the next call at the estimated budget guard.",
        );
      const pending = {
        caseId: item.id,
        provider,
        status: "interrupted",
        answer: "",
        usage: null,
        estimatedUSD: null,
        firstTokenMs: null,
        totalMs: 0,
        citations: { ids: [], unknownIds: [] },
      };
      run.results.push(pending);
      await save();
      const result = await runAnswer(
        provider,
        clients[provider],
        instructions,
        item,
        knownIds,
      );
      Object.assign(pending, result);
      pending.presentation = {
        prose: withoutCitations(result.answer).trim(),
        sourceIds: citedSources(result.answer).map((source) => source.id),
      };
      await save();
      console.log(
        `${run.results.length}/${plannedRequests} ${item.id} ${provider}: ${result.status}; ${result.totalMs} ms; ${result.estimatedUSD === null ? "usage unknown" : `$${money(result.estimatedUSD)}`}`,
      );
      if (result.status !== "complete" || !result.usage) {
        throw new Error(
          "Stopped after an incomplete answer, API error or missing usage. Inspect results before explicitly resuming; recorded attempts will not be repeated.",
        );
      }
    }
  }
  console.log(
    `Comparison ready for human review: ${path.join(dir, "comparison.md")}`,
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(
      error instanceof OpenAI.APIError
        ? "API request failed; details withheld to protect credentials."
        : error.message,
    );
    process.exitCode = 1;
  });
}
