import test from "node:test";
import assert from "node:assert/strict";
import { holdoutCases } from "../evals/holdout-v1.mjs";
import { protocol, minimalInstructions } from "../evals/protocol.mjs";
import { digest, validateReview, accepted, summarize, quantile, reviewTemplate } from "../evals/scoring.mjs";
import { makeTasks, checkDataset, deduplicateCases, allowance, budgetCharge, assertBudget } from "../scripts/evaluate-portfolio.mjs";
import { requestBody } from "../scripts/compare-models.mjs";

const source = { id: "profile", text: "Lily studies Computer Engineering.", title: "Profile", kind: "Profile" };
const item = { id: "test", question: "What does she study?", modelQuestion: "What does she study?", hard: true, requirements: [{id:"r1",text:"Computer Engineering"}], sourceIds: ["profile"] };
const task = { attemptId: "test/production/1", caseId: "test", variant: "production", sample: 1, split: "holdout" };
const answer = { ...task, status: "complete", answer: "Computer Engineering. [source:profile]", citations: { ids: ["profile"], unknownIds: [] }, firstTokenMs: 200, totalMs: 500, usage: {input:100,output:10}, estimatedUSD: 0.000032 };
const review = { attemptId: task.attemptId, answerHash: digest(answer.answer), reviewer: "codex-assisted", factualAccuracy: 2, citationSupport: 2, uncertainty: null, requirements: [{id:"r1",met:true}], criticalFailure: false, findings: [], notes:"Supported by profile." };
const plan = { protocol, contentCommit:"test", sources:[source], holdout:[item], regression:[], tasks:makeTasks([item], []), budgetUSD: 1 };

test("holdout has 24 scenarios across six categories and eight preselected hard cases", () => {
  assert.equal(holdoutCases.length, 24);
  assert.equal(new Set(holdoutCases.map((c)=>c.id)).size, 24);
  assert.equal(holdoutCases.filter((c)=>c.hard).length, 8);
  const counts = Object.groupBy(holdoutCases, c=>c.category);
  assert.equal(Object.keys(counts).length, 6);
  assert.ok(Object.values(counts).every((c)=>c.length===4));
  assert.ok(holdoutCases.every((c)=>c.requirements.length>=2 && c.sourceIds.length));
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

test("report rejects duplicates and exposes human versus assistant review provenance", () => {
  assert.throws(()=>summarize(plan,[answer,answer]),/duplicate/);
  assert.throws(()=>summarize(plan,[answer],[review,review]),/duplicate/);
  assert.equal(summarize(plan,[answer],[review]).humanReviewed,0);
  assert.equal(summarize(plan,[answer],[{...review,reviewer:"human"}]).humanReviewed,1);
});

test("latency quantiles exclude missing observations rather than treating them as zero", () => {
  assert.equal(quantile([null,undefined,100,500],0.95),500);
  assert.equal(quantile([],0.5),null);
});
