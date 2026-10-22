import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { build } from "esbuild";
import { holdoutCases } from "../evals/holdout-v1.mjs";
import { protocol, minimalInstructions, reportProtocol } from "../evals/protocol.mjs";
import { digest, validateReview, accepted, summarize, quantile, reviewTemplate } from "../evals/scoring.mjs";
import { makeTasks, checkDataset, deduplicateCases, allowance, budgetCharge, assertBudget, candidateGuidance, experiment, committedContext } from "../scripts/evaluate-portfolio.mjs";
import { cases as developmentCases, purpose as developmentPurpose } from "../evals/development-v2.mjs";
import { cases as holdoutV2 } from "../evals/holdout-v2.mjs";
import { cases as developmentV3 } from "../evals/development-v3.mjs";
import { cases as holdoutV3 } from "../evals/holdout-v3.mjs";
import { cases as developmentV4 } from "../evals/development-v4.mjs";
import { cases as holdoutV4 } from "../evals/holdout-v4.mjs";
import { requestBody } from "../scripts/compare-models.mjs";

const source = { id: "profile", text: "Lily studies Computer Engineering.", title: "Profile", kind: "Profile" };
const item = { id: "test", question: "What does she study?", modelQuestion: "What does she study?", hard: true, requirements: [{id:"r1",text:"Computer Engineering"}], sourceIds: ["profile"] };
const task = { attemptId: "test/production/1", caseId: "test", variant: "production", sample: 1, split: "holdout" };
const answer = { ...task, status: "complete", answer: "Computer Engineering. [source:profile]", citations: { ids: ["profile"], unknownIds: [] }, firstTokenMs: 200, totalMs: 500, usage: {input:100,output:10}, estimatedUSD: 0.000032 };
const review = { attemptId: task.attemptId, answerHash: digest(answer.answer), reviewer: "model", factualAccuracy: 2, citationSupport: 2, uncertainty: null, requirements: [{id:"r1",met:true}], criticalFailure: false, findings: [], notes:"Supported by profile." };
const plan = { protocol, contentCommit:"test", sources:[source], holdout:[item], regression:[], tasks:makeTasks([item], []), budgetUSD: 1 };

test("public protocol standardizes review descriptions without changing frozen inputs", () => {
  const recorded = { ...protocol, scoring: { ...protocol.scoring, reviewMethod: "Historical reviewer description" } };
  const before = structuredClone(recorded);
  const published = reportProtocol(recorded);
  assert.deepEqual(recorded, before);
  assert.deepEqual(published, { ...before, scoring: { ...before.scoring, reviewMethod: protocol.scoring.reviewMethod } });
});

test("report export keeps complete reviewed evidence in the local run directory", async () => {
  const root = path.resolve("outputs/evaluation");
  await mkdir(root, { recursive: true });
  const dir = await mkdtemp(path.join(root, "test-export-"));
  try {
    const frozen = { ...plan, protocol: { ...protocol, variants: ["production"], hardCaseRepetitions: 1 }, tasks: [task], instructions: { production: "Test evidence only" }, runnerHashes: {}, holdoutVersion: "test" };
    const planHash = digest(frozen);
    await writeFile(path.join(dir, "plan.json"), JSON.stringify({ planHash, plan: frozen }));
    await writeFile(path.join(dir, "results.json"), JSON.stringify({ planHash, results: [answer] }));
    await writeFile(path.join(dir, "reviews.json"), JSON.stringify([review]));
    execFileSync(process.execPath, ["scripts/evaluate-portfolio.mjs", "report", "--plan", path.join(dir, "plan.json"), "--export"]);
    const report = JSON.parse(await readFile(path.join(dir, "review-report.json"), "utf8"));
    assert.equal(report.planHash, planHash);
    assert.equal(report.answers[0].answerHash, digest(answer.answer));
    assert.equal(report.reviews[0].reviewer, "model");
    assert.equal(report.summary.variants.production.allSampleAcceptance.numerator, 1);
    assert.equal(report.summary.humanReviewed, 0);
    assert.equal(report.protocol.scoring.reviewMethod, protocol.scoring.reviewMethod);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("v2 development is observed data, not relabeled as untouched holdout", () => {
  assert.equal(developmentCases.length, 6);
  assert.match(developmentPurpose, /previously observed/);
  assert.ok(developmentCases.every(c => holdoutCases.some(old => old.id === c.id && old.question === c.question)));
});

test("v2 holdout has twenty new scenarios, five categories, and four triple-sampled hard cases", async () => {
  assert.equal(holdoutV2.length, 20);
  assert.equal(holdoutV2.filter(c => c.hard).length, 4);
  assert.equal(Object.keys(Object.groupBy(holdoutV2, c => c.category)).length, 5);
  assert.ok(Object.values(Object.groupBy(holdoutV2, c => c.category)).every(group => group.length === 4));
  assert.equal(deduplicateCases([...holdoutCases, ...holdoutV2]).length, 44);
  const snapshot = await committedContext("50d0fac7aa79382cede75f58cbee0f856a1e77ad");
  checkDataset(holdoutV2, [...holdoutCases, ...deduplicateCases([...snapshot.releaseCases, ...snapshot.recruiterCases, ...snapshot.predeployCases])], snapshot.portfolioSources);
  const selected = await experiment("holdout-v2", snapshot);
  assert.equal(makeTasks(holdoutV2, [], selected.config).length, 56);
  assert.equal(selected.instructions.revised, snapshot.portfolioInstructions() + await candidateGuidance(snapshot.portfolioSources));
});

test("evidence guidance only routes available sources and separates facts from inferences", async () => {
  const guidance = await candidateGuidance([{id:"asterfind-motivation"}, source]);
  assert.match(guidance, /\[source:asterfind-motivation\]/);
  assert.doesNotMatch(guidance, /\[source:meta\]/);
  assert.match(guidance, /not automatically false/);
  assert.match(guidance, /Absence of evidence does not establish the opposite/);
  assert.match(guidance, /not the contents of the linked document/);
  assert.match(guidance, /Do not turn synthesis into a new private motive/);
});

test("v2 compares identical committed facts with only the guidance addition", async () => {
  const snapshot = await committedContext("50d0fac7aa79382cede75f58cbee0f856a1e77ad");
  const selected = await experiment("development-v2", snapshot);
  assert.equal(snapshot.portfolioSources.length, 61);
  assert.equal(selected.instructions.baseline, snapshot.portfolioInstructions());
  assert.equal(selected.instructions.revised, selected.instructions.baseline + await candidateGuidance(snapshot.portfolioSources));
  assert.deepEqual(selected.config.variants, ["baseline", "revised"]);
  assert.equal(makeTasks(selected.cases, [], selected.config).length, 16);
  assert.ok(selected.files.includes("server/evidence-guidance.ts"));
  await assert.rejects(experiment("missing", snapshot), /Unknown evaluation suite/);
  await assert.rejects(experiment("development-v2", { ...snapshot, portfolioInstructions: () => selected.instructions.revised }), /pre-tuning baseline/);
});

test("the application's actual prompt appends the evaluated guidance", async () => {
  const bundle = await build({ stdin: { resolveDir: process.cwd(), contents: "export { portfolioInstructions } from './server/portfolio-prompt.ts'; export { portfolioSources } from './src/lib/portfolio-answer.ts';" }, bundle:true, platform:"node", format:"esm", write:false });
  const app = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
  assert.ok(app.portfolioInstructions().endsWith(await candidateGuidance(app.portfolioSources)));
});

test("v3 replaces only the guidance block using the same committed public context", async () => {
  const snapshot = await committedContext("0c27829f3d8d86e5dc25c1d15e25375a61588c9c");
  const selected = await experiment("development-v3", snapshot);
  const marker = "\nCLAIM-LEVEL EVIDENCE:";
  const prefix = snapshot.portfolioInstructions().split(marker)[0];
  assert.equal(selected.instructions.baseline, snapshot.portfolioInstructions());
  assert.equal(selected.instructions.revised, prefix + await candidateGuidance(snapshot.portfolioSources, "v3"));
  assert.equal(selected.instructions.revised.split(marker).length, 2);
  assert.equal(snapshot.portfolioSources.length, 61);
  assert.equal(makeTasks(developmentV3, [], selected.config).length, 24);
  assert.equal(developmentV3.length, 6);
  assert.ok(developmentV3.every(c => [...holdoutCases, ...holdoutV2].some(old => old.id === c.id)));
  assert.equal(holdoutV3.length, 20);
  assert.equal(holdoutV3.filter(c => c.hard).length, 4);
  assert.equal(makeTasks(holdoutV3, [], selected.config).length, 56);
  const prior = deduplicateCases([...snapshot.releaseCases, ...snapshot.recruiterCases, ...snapshot.predeployCases, ...holdoutCases, ...holdoutV2]);
  checkDataset(holdoutV3, prior, snapshot.portfolioSources);
  await assert.rejects(experiment("development-v3", { ...snapshot, portfolioInstructions: () => "No evidence block" }), /exactly one/);
});

test("holdout has 24 scenarios across six categories and eight preselected hard cases", () => {
  assert.equal(holdoutCases.length, 24);
  assert.equal(new Set(holdoutCases.map((c)=>c.id)).size, 24);
  assert.equal(holdoutCases.filter((c)=>c.hard).length, 8);
  const counts = Object.groupBy(holdoutCases, c=>c.category);
  assert.equal(Object.keys(counts).length, 6);
  assert.ok(Object.values(counts).every((c)=>c.length===4));
  assert.ok(holdoutCases.every((c)=>c.requirements.length>=2 && c.sourceIds.length));
});

test("final delivery-contract comparison separates observed failures from new scenarios", async () => {
  const snapshot = await committedContext("0c27829f3d8d86e5dc25c1d15e25375a61588c9c");
  const selected = await experiment("holdout-v4", snapshot);
  const prior = deduplicateCases([...snapshot.releaseCases, ...snapshot.recruiterCases, ...snapshot.predeployCases, ...holdoutCases, ...holdoutV2, ...holdoutV3]);
  checkDataset(holdoutV4, prior, snapshot.portfolioSources);
  assert.equal(holdoutV4.length, 12);
  assert.equal(holdoutV4.filter(c => c.hard).length, 3);
  assert.equal(makeTasks(holdoutV4, [], selected.config).length, 36);
  assert.equal(makeTasks(developmentV4, [], selected.config).length, 24);
  assert.ok(developmentV4.every(c => prior.some(old => c.id === old.id)));
  assert.equal(selected.instructions.baseline, snapshot.portfolioInstructions());
  assert.match(selected.instructions.revised, /DELIVERY CONTRACT:/);
  assert.match(selected.instructions.revised, /retain its real work and replace each wrong title/);
  assert.match(selected.instructions.revised, /a relevant result and at least one named recognition in the second/);
  assert.match(selected.instructions.revised, /Every requested metric must get its correct meaning/);
  assert.doesNotMatch(await candidateGuidance(snapshot.portfolioSources), /DELIVERY CONTRACT:/);
  assert.ok(selected.files.includes("evals/candidates/v4.mjs"));
  assert.ok(selected.files.includes("evals/holdout-v3.mjs"));
  await assert.rejects(candidateGuidance([source], "v4"), /missing sources/);
  await assert.rejects(candidateGuidance([source], "unknown"), /Unknown prompt/);
});

test("repeat schedule is balanced, counterbalances order, and never relabels repeats as new cases", () => {
  const tasks = makeTasks(holdoutCases, [{id:"old"}]);
  assert.equal(tasks.length, 81);
  assert.equal(new Set(tasks.map((t)=>t.attemptId)).size, 81);
  for (const variant of protocol.variants) {
    const rows=tasks.filter((t)=>t.variant===variant && t.split==="holdout");
    assert.equal(rows.length,40);
    assert.equal(new Set(rows.map((t)=>t.caseId)).size,24);
  }
  assert.notEqual(tasks[0].variant, tasks[2].variant);
  assert.equal(tasks.at(-1).split,"regression");
});

test("deduplication considers history and excerpts, not only display IDs", () => {
  assert.equal(deduplicateCases([item,{...item,id:"copy"}]).length,1);
  assert.equal(deduplicateCases([item,{...item,id:"different",history:[{role:"user",content:"Before?"}]}]).length,2);
  assert.throws(()=>checkDataset([item],[{...item,id:"old"}],[source]),/duplicate/);
  assert.throws(()=>checkDataset([{...item,sourceIds:["missing"]}],[],[source]),/unknown/);
});

test("review requirements and reference answers never enter the model request", () => {
  const body=requestBody("openai",minimalInstructions([source]),{...item,review:"SECRET REVIEW CRITERION"});
  assert.ok(!JSON.stringify(body).includes("SECRET REVIEW"));
  assert.ok(!JSON.stringify(body).includes('"requirements"'));
  assert.equal(body.store,false);
  assert.equal(body.service_tier,"default");
  assert.equal(body.input.at(-1).content,item.modelQuestion);
  assert.match(body.instructions,/Computer Engineering/);
});

test("structured reviews bind exact answers and cover each criterion once", () => {
  assert.deepEqual(validateReview(review,answer,item,new Set(["profile"])),review);
  assert.throws(()=>validateReview(review,{...answer,answer:"changed"},item,new Set(["profile"])),/match/);
  assert.throws(()=>validateReview({...review,requirements:[]},answer,item,new Set(["profile"])),/exactly once/);
  assert.throws(()=>validateReview({...review,requirements:[...review.requirements,...review.requirements]},answer,item,new Set(["profile"])),/exactly once/);
  assert.throws(()=>validateReview({...review,factualAccuracy:null},answer,item,new Set(["profile"])));
  assert.throws(()=>validateReview(review,{...answer,status:"timeout"},item,new Set(["profile"])),/Incomplete/);
});

test("factual deductions need evidence and cannot coexist with perfect scores", () => {
  assert.throws(()=>validateReview({...review,factualAccuracy:1},answer,item,new Set(["profile"])),/finding/);
  const findings=[{claim:"She studies law",classification:"contradicted",sourceIds:["profile"],rationale:"Profile says CE."}];
  assert.throws(()=>validateReview({...review,findings},answer,item,new Set(["profile"])),/grounded/);
  assert.throws(()=>validateReview({...review,factualAccuracy:1,findings},answer,item,new Set(["profile"])),/zero/);
  assert.equal(validateReview({...review,factualAccuracy:0,findings},answer,item,new Set(["profile"])).factualAccuracy,0);
});

test("acceptance requires grounding, source support, every requirement and completion", () => {
  assert.equal(accepted(answer,review),true);
  for(const incomplete of [undefined,{...review,citationSupport:1},{...review,uncertainty:1},{...review,requirements:[{id:"r1",met:false}]}])
    assert.equal(accepted(answer,incomplete),false);
  assert.equal(accepted({...answer,citations:{unknownIds:["fake"]}},review),false);
  assert.equal(accepted({...answer,status:"timeout"},review),false);
});

test("unknown usage consumes a reservation and cannot be treated as free", () => {
  assert.throws(()=>assertBudget({budgetUSD:0.05},[{estimatedUSD:null,reservedUSD:0.04}],0.02),/guard/);
  assert.equal(assertBudget({budgetUSD:0.05},[{estimatedUSD:0.001,reservedUSD:0.04}],0.02),0.001);
  assert.ok(allowance("facts",item)>0);
  assert.throws(()=>assertBudget({budgetUSD:1},[{estimatedUSD:null}],0.01),/guard/);
});

test("evaluation spending guard includes cache-write and long-context ceilings", () => {
  assert.equal(budgetCharge({input:1000000,output:0}),0.5);
  assert.equal(budgetCharge({input:100000,output:0}),0.025);
  assert.equal(budgetCharge(null),null);
  assert.equal(budgetCharge({input:-1,output:0}),null);
  assert.throws(()=>assertBudget({budgetUSD:0.02},[{budgetChargeUSD:0.025,estimatedUSD:0.02,reservedUSD:0.03}],0.001),/guard/);
});

test("missing reviews remain pending, with no fabricated accuracy denominator", () => {
  const summary=summarize(plan,[answer]);
  assert.equal(summary.variants.production.reviewed,0);
  assert.equal(summary.variants.production.pendingReview,1);
  assert.equal(summary.variants.production.factualGroundingAmongReviewed.rate,null);
  assert.equal(summary.variants.production.allSampleAcceptance.denominator,3);
  const template=reviewTemplate(plan,[answer]);
  assert.equal(template[0].reviewer,"model");
  assert.equal(template[0].factualAccuracy,null);
  assert.equal(template[0].requirements[0].met,null);
});

test("repeat consistency detects mixed outcomes and counts a failed request", () => {
  const rows=[1,2,3].map((sample)=>({...answer,attemptId:`test/production/${sample}`,sample}));
  rows[2]={...rows[2],status:"timeout",usage:null,estimatedUSD:null,answer:"",reservedUSD:0.01};
  const reviews=rows.slice(0,2).map((r)=>({...review,attemptId:r.attemptId}));
  const summary=summarize(plan,rows,reviews).variants.production;
  assert.equal(summary.completed,2);
  assert.equal(summary.allSampleAcceptance.numerator,2);
  assert.equal(summary.allSampleAcceptance.denominator,3);
  assert.equal(summary.repeatConsistency.allPassed,0);
  assert.equal(summary.repeatConsistency.unstable,1);
  assert.equal(summary.missingUsage,1);
});

test("report rejects duplicates and distinguishes human from model reviews", () => {
  assert.throws(()=>summarize(plan,[answer,answer]),/duplicate/);
  assert.throws(()=>summarize(plan,[answer],[review,review]),/duplicate/);
  assert.equal(summarize(plan,[answer],[review]).humanReviewed,0);
  assert.equal(summarize(plan,[answer],[{...review,reviewer:"human"}]).humanReviewed,1);
});

test("latency quantiles exclude missing observations rather than treating them as zero", () => {
  assert.equal(quantile([null,undefined,100,500],0.95),500);
  assert.equal(quantile([],0.5),null);
});
