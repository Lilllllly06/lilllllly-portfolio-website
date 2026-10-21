import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile, rename, rm, symlink, open, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, parseEnv } from "node:util";
import { build } from "esbuild";
import OpenAI from "openai";
import { settings, runAnswer } from "./compare-models.mjs";
import { holdoutCases, holdoutVersion } from "../evals/holdout-v1.mjs";
import { protocol, minimalInstructions, reportProtocol } from "../evals/protocol.mjs";
import { digest, reviewTemplate, summarize } from "../evals/scoring.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = path.join(root, "outputs/evaluation");
const runnerFiles = ["scripts/evaluate-portfolio.mjs", "scripts/compare-models.mjs", "evals/scoring.mjs", "evals/protocol.mjs", "evals/holdout-v1.mjs"];
const json = (value) => JSON.stringify(value, null, 2) + "\n";

export function deduplicateCases(cases) {
  const seen = new Set();
  return cases.filter((c) => {
    const key = digest({ question: c.question, history: c.history || [], excerpt: c.excerpt || null });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function makeTasks(holdout, regression, config = protocol) {
  const tasks = [];
  for (let sample = 1; sample <= config.hardCaseRepetitions; sample++) {
    for (const [index, c] of holdout.entries()) {
      if (sample > 1 && !c.hard) continue;
      const variants = (index + sample) % 2 ? config.variants : [...config.variants].reverse();
      for (const variant of variants) tasks.push({
        attemptId: `${c.id}/${variant}/${sample}`, caseId: c.id, variant, sample, split: "holdout",
      });
    }
  }
  for (const c of regression) tasks.push({
    attemptId: `${c.id}/production/1`, caseId: c.id, variant: "production", sample: 1, split: "regression",
  });
  return tasks;
}

export function checkDataset(holdout, regression, sources) {
  const known = new Set(sources.map((s) => s.id));
  if (new Set(holdout.map((c) => c.id)).size !== holdout.length) throw new Error("Duplicate holdout ID.");
  if (deduplicateCases([...regression, ...holdout]).length !== regression.length + holdout.length)
    throw new Error("Holdout contains an exact duplicate of a regression scenario.");
  for (const item of holdout) {
    if (!item.requirements.length || item.sourceIds.some((id) => !known.has(id)))
      throw new Error(`Missing criteria or unknown reference in ${item.id}.`);
  }
}

export function allowance(instructions, item, config = protocol) {
  const bytes = Buffer.byteLength(instructions + JSON.stringify(item.history || []) + item.modelQuestion);
  const longContext = bytes + 2048 > 272000;
  return ((bytes + 2048) * config.reservationInputPerMillion * (longContext ? 2 : 1) + config.maxOutputTokens * config.outputPerMillion * (longContext ? 1.5 : 1)) / 1e6;
}

export function budgetCharge(usage, config = protocol) {
  if (!usage || ![usage.input, usage.output].every((n) => Number.isInteger(n) && n >= 0)) return null;
  const longContext = usage.input > 272000;
  // Retain a ceiling that covers cache writes; the uncached estimate is not an invoice.
  return (usage.input * config.reservationInputPerMillion * (longContext ? 2 : 1) + usage.output * config.outputPerMillion * (longContext ? 1.5 : 1)) / 1e6;
}

export function assertBudget(plan, results, nextAllowance) {
  const used = results.reduce((sum, r) => sum + (r.budgetChargeUSD ?? r.estimatedUSD ?? r.reservedUSD), 0);
  if (!Number.isFinite(used) || !Number.isFinite(nextAllowance) || used + nextAllowance > plan.budgetUSD)
    throw new Error("Estimated spending guard reached; no next request sent.");
  return used;
}

async function hashes(files = runnerFiles) {
  const result = {};
  for (const name of files) result[name] = digest(await readFile(path.join(root, name), "utf8"));
  return result;
}

export async function candidateGuidance(sources) {
  const bundle = await build({ entryPoints: [path.join(root, "server/evidence-guidance.ts")], bundle: true, platform: "node", format: "esm", write: false });
  const module = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
  return module.evidenceGuidance(sources);
}

export async function experiment(suite, snapshot) {
  if (!suite || suite === "v1") return {
    cases: holdoutCases, version: holdoutVersion, purpose: "holdout",
    config: protocol,
    instructions: { minimal: minimalInstructions(snapshot.portfolioSources), production: snapshot.portfolioInstructions() },
    files: runnerFiles,
  };
  if (!["development-v2", "holdout-v2"].includes(suite)) throw new Error("Unknown evaluation suite.");
  const dataset = await import(`../evals/${suite}.mjs`);
  const baseline = snapshot.portfolioInstructions();
  const guidance = await candidateGuidance(snapshot.portfolioSources);
  if (baseline.includes("CLAIM-LEVEL EVIDENCE:")) throw new Error("V2 comparison needs the pre-tuning baseline revision.");
  return {
    ...dataset, config: { ...protocol, version: "portfolio-evaluation-v2", variants: ["baseline", "revised"] },
    instructions: { baseline, revised: baseline + guidance },
    files: [...runnerFiles, "server/evidence-guidance.ts", `evals/${suite}.mjs`],
  };
}

// Import only tracked source files from the explicit commit. Never bundle the
// dirty working profile, environment files, or private attachments as context.
export async function committedContext(ref) {
  const commit = execFileSync("git", ["rev-parse", "--verify", `${ref}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("Invalid content commit.");
  const temp = await mkdtemp(path.join(tmpdir(), "portfolio-eval-"));
  try {
    const archive = execFileSync("git", ["archive", commit, "src/data", "src/lib", "server", "scripts/portfolio-benchmark-cases.mjs", "scripts/portfolio-holdout-cases.mjs", "scripts/portfolio-hardening-cases.mjs", "scripts/portfolio-release-cases.mjs", "scripts/portfolio-recruiter-cases.mjs", "scripts/portfolio-predeploy-cases.mjs"], { cwd: root, maxBuffer: 16 * 1024 * 1024 });
    execFileSync("tar", ["-x", "-C", temp], { input: archive });
    await symlink(path.join(root, "node_modules"), path.join(temp, "node_modules"), "dir");
    const bundle = await build({
      stdin: { resolveDir: temp, contents: `export { portfolioInstructions } from './server/portfolio-prompt.ts'; export { portfolioSources } from './src/lib/portfolio-answer.ts'; export { questionWithExcerpt } from './src/lib/resume.ts'; export { releaseCases } from './scripts/portfolio-release-cases.mjs'; export { recruiterCases } from './scripts/portfolio-recruiter-cases.mjs'; export { predeployCases } from './scripts/portfolio-predeploy-cases.mjs';` },
      bundle: true, platform: "node", format: "esm", write: false,
    });
    const module = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
    return { commit, ...module };
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

async function atomicJSON(file, value) {
  await writeFile(`${file}.tmp`, json(value), { mode: 0o600 });
  await rename(`${file}.tmp`, file);
}

async function prepare(values) {
  if (!values.ref) throw new Error("Prepare requires --ref with an approved content commit.");
  const budgetUSD = Number(values["budget-usd"] ?? protocol.maxBudgetUSD);
  if (!Number.isFinite(budgetUSD) || budgetUSD <= 0 || budgetUSD > protocol.maxBudgetUSD)
    throw new Error("Budget must be positive and at most US$1.");
  const snapshot = await committedContext(values.ref);
  const selected = await experiment(values.suite, snapshot);
  const regression = deduplicateCases([...snapshot.releaseCases, ...snapshot.recruiterCases, ...snapshot.predeployCases]);
  checkDataset(selected.cases, values.suite === "holdout-v2" ? [...regression, ...holdoutCases] : regression, snapshot.portfolioSources);
  // V2 isolates prompt tuning; v1's observed cases remain development data.
  const smoke = selected.config === protocol ? regression : [];
  const contextualize = (c) => ({ ...c, modelQuestion: snapshot.questionWithExcerpt(c.question, c.excerpt) });
  const plan = {
    schemaVersion: 2, createdAt: new Date().toISOString(), holdoutVersion: selected.version, purpose: selected.purpose,
    contentCommit: snapshot.commit, budgetUSD, protocol: selected.config,
    instructions: selected.instructions,
    sources: snapshot.portfolioSources, holdout: selected.cases.map(contextualize), regression: smoke.map(contextualize),
    runnerHashes: await hashes(selected.files), tasks: makeTasks(selected.cases, smoke, selected.config),
  };
  const id = `${selected.version}-${digest(plan).slice(0,12)}`;
  const dir = path.join(outputRoot, id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await writeFile(path.join(dir, "plan.json"), json({ planHash: digest(plan), plan }), { flag: "wx", mode: 0o600 });
  console.log(json({ mode: "prepared; no network requests", plan: path.join(dir, "plan.json"), planHash: digest(plan), contentCommit: plan.contentCommit, holdoutCases: plan.holdout.length, regressionCases: plan.regression.length, hardCases: plan.holdout.filter((c) => c.hard).length, plannedCalls: plan.tasks.length, budgetUSD }));
}

async function loadPlan(file) {
  if (!file) throw new Error("Provide --plan outputs/evaluation/<run>/plan.json.");
  const resolved = await realpath(path.resolve(root, file));
  if (!resolved.startsWith(`${await realpath(outputRoot)}${path.sep}`)) throw new Error("Plans must be inside outputs/evaluation.");
  const envelope = JSON.parse(await readFile(resolved, "utf8"));
  if (envelope.planHash !== digest(envelope.plan)) throw new Error("Frozen plan changed; do not mix experiments.");
  return { ...envelope, dir: path.dirname(resolved) };
}

async function readOptional(file, fallback) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}

async function run(values) {
  const { plan, planHash, dir } = await loadPlan(values.plan);
  if (JSON.stringify(plan.runnerHashes) !== JSON.stringify(await hashes(Object.keys(plan.runnerHashes))))
    throw new Error("Runner or dataset changed after freezing. Restore it or prepare a new explicitly labeled experiment.");
  if (settings.providers.openai.model !== plan.protocol.model || settings.maxOutputTokens !== plan.protocol.maxOutputTokens || settings.timeoutMs !== plan.protocol.timeoutMs)
    throw new Error("Provider settings no longer match the frozen protocol.");
  if (!values.run) {
    console.log(json({ mode: "dry run; add --run to authorize paid inference", planHash, tasks: plan.tasks.length, budgetUSD: plan.budgetUSD }));
    return;
  }
  let env = {};
  try { env = parseEnv(await readFile(path.join(root, ".env.local"), "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const key = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!key?.trim()) throw new Error("OPENAI_API_KEY is not configured; no request sent.");
  const lockPath = path.join(dir, "run.lock");
  const lock = await open(lockPath, "wx", 0o600);
  try {
    await lock.writeFile(json({ pid: process.pid, startedAt: new Date().toISOString() }));
    const file = path.join(dir, "results.json");
    const record = await readOptional(file, { planHash, results: [] });
    if (record.planHash !== planHash) throw new Error("Result fingerprint mismatch.");
    summarize(plan, record.results);
    const client = new OpenAI({ apiKey: key, baseURL: "https://api.openai.com/v1", maxRetries: 0, timeout: plan.protocol.timeoutMs });
    const known = new Set(plan.sources.map((s) => s.id));
    for (const task of plan.tasks) {
      if (record.results.some((r) => r.attemptId === task.attemptId)) continue;
      const item = plan[task.split].find((c) => c.id === task.caseId);
      const instructions = plan.instructions[task.variant];
      const reservedUSD = allowance(instructions, item, plan.protocol);
      assertBudget(plan, record.results, reservedUSD);
      const pending = { ...task, status: "interrupted", answer: "", usage: null, estimatedUSD: null, reservedUSD, startedAt: new Date().toISOString(), citations: { ids: [], unknownIds: [] } };
      record.results.push(pending);
      await atomicJSON(file, record);
      const answer = await runAnswer("openai", client, instructions, item, known);
      Object.assign(pending, answer, { ...task, budgetChargeUSD: budgetCharge(answer.usage), finishedAt: new Date().toISOString() });
      await atomicJSON(file, record);
      console.log(`${record.results.length}/${plan.tasks.length} ${task.attemptId}: ${answer.status}`);
      if (answer.status !== "complete" || !answer.usage)
        throw new Error("Stopped after failed/incomplete or unmetered attempt. Inspect records before explicitly resuming; recorded attempts will not be retried.");
    }
    console.log(json({ completed: record.results.length, estimatedUncachedUSD: record.results.reduce((s,r) => s + (r.estimatedUSD ?? 0),0), results: file }));
  } finally {
    await lock.close();
    await rm(lockPath);
  }
}

async function report(values) {
  const { plan, planHash, dir } = await loadPlan(values.plan);
  const record = await readOptional(path.join(dir, "results.json"), { planHash, results: [] });
  if (record.planHash !== planHash) throw new Error("Result fingerprint mismatch.");
  const reviews = await readOptional(path.join(dir, "reviews.json"), []);
  const summary = summarize(plan, record.results, reviews);
  await atomicJSON(path.join(dir, "summary.json"), summary);
  await writeFile(path.join(dir, "review-template.json"), json(reviewTemplate(plan, record.results)), { mode: 0o600 });
  const packet = record.results.filter((r) => r.split === "holdout").map((r) => ({
    attemptId: r.attemptId, question: plan.holdout.find((c) => c.id === r.caseId),
    status: r.status, answer: r.answer, answerHash: digest(r.answer),
  }));
  await atomicJSON(path.join(dir, "review-packet.json"), packet);
  if (values.publish) {
    if (summary.totalAttempted !== summary.totalPlanned || Object.values(summary.variants).some((v) => v.pendingReview))
      throw new Error("Public export requires every planned attempt and a review for each completed holdout answer.");
    const destination = path.join(root, "evals/results", `${plan.holdoutVersion}-${planHash.slice(0,12)}.json`);
    await mkdir(path.dirname(destination), { recursive: true });
    const publicReport = {
      planHash, contentCommit: plan.contentCommit, createdAt: plan.createdAt, purpose: plan.purpose ?? "holdout",
      protocol: reportProtocol(plan.protocol), runnerHashes: plan.runnerHashes,
      instructionHashes: Object.fromEntries(Object.entries(plan.instructions).map(([k,v]) => [k,digest(v)])),
      sourceHash: digest(plan.sources), datasetHash: digest(plan.holdout),
      summary: { ...summary, reviewMethod: protocol.scoring.reviewMethod },
      holdout: plan.holdout.map(({ modelQuestion: _modelQuestion, ...c }) => c),
      answers: record.results.filter((r) => r.split === "holdout").map((r) => ({
        attemptId: r.attemptId, caseId: r.caseId, variant: r.variant, sample: r.sample,
        status: r.status, answer: r.answer, answerHash: digest(r.answer),
        requestedModel: r.requestedModel ?? null, reportedModel: r.reportedModel ?? null,
        startedAt: r.startedAt, finishedAt: r.finishedAt ?? null,
        firstTokenMs: r.firstTokenMs ?? null, totalMs: r.totalMs ?? null,
        usage: r.usage, estimatedUSD: r.estimatedUSD, citations: r.citations,
      })),
      reviews,
    };
    await writeFile(destination, json(publicReport));
    console.log(`Sanitized public benchmark: ${destination}`);
  }
  console.log(json(summary));
}

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    ref: { type: "string" }, suite: { type: "string" }, plan: { type: "string" }, run: { type: "boolean", default: false }, publish: { type: "boolean", default: false }, "budget-usd": { type: "string" },
  } });
  switch (positionals[0]) {
    case "prepare": return prepare(values);
    case "run": return run(values);
    case "report": return report(values);
    default: console.log("Usage: npm run eval:portfolio -- prepare --ref <approved-commit> [--budget-usd 1]\n       npm run eval:portfolio -- run --plan <plan.json> [--run]\n       npm run eval:portfolio -- report --plan <plan.json> [--publish]");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((error) => { console.error(error instanceof Error ? error.message : "Evaluation failed."); process.exitCode = 1; });
