import { createHash } from "node:crypto";
import { z } from "zod";

export const digest = (value) => createHash("sha256")
  .update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");

const grade = z.number().int().min(0).max(2);
export const reviewSchema = z.object({
  attemptId: z.string(),
  answerHash: z.string().length(64),
  reviewer: z.enum(["model", "human"]),
  factualAccuracy: grade,
  citationSupport: grade,
  uncertainty: grade.nullable(),
  requirements: z.array(z.object({ id: z.string(), met: z.boolean() }).strict()),
  criticalFailure: z.boolean(),
  findings: z.array(z.object({
    claim: z.string().min(1),
    classification: z.enum(["unsupported", "contradicted"]),
    sourceIds: z.array(z.string()),
    rationale: z.string().min(1),
  }).strict()),
  notes: z.string().min(1),
}).strict();

export function validateReview(input, result, item, sourceIds) {
  const review = reviewSchema.parse(input);
  if (result.status !== "complete") throw new Error("Incomplete answers cannot receive a factual review.");
  if (review.attemptId !== result.attemptId || review.answerHash !== digest(result.answer))
    throw new Error("Review does not match the recorded answer.");
  const actual = review.requirements.map((r) => r.id).sort();
  const expected = item.requirements.map((r) => r.id).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error("Review must score each requirement exactly once.");
  if (review.findings.some((f) => f.sourceIds.some((id) => !sourceIds.has(id))))
    throw new Error("Review references an unknown source.");
  if (review.factualAccuracy === 2 && (review.findings.length || review.criticalFailure))
    throw new Error("A fully grounded score cannot contain factual failures.");
  if (review.factualAccuracy < 2 && !review.findings.length)
    throw new Error("A factual deduction needs an evidence-based finding.");
  if (review.findings.some((f) => f.classification === "contradicted") && review.factualAccuracy !== 0)
    throw new Error("Contradicted facts require a zero factual score.");
  if (review.criticalFailure && review.factualAccuracy !== 0)
    throw new Error("Critical failures require a zero factual score.");
  return review;
}

export function accepted(result, review) {
  return Boolean(result?.status === "complete" && review &&
    result.citations?.unknownIds.length === 0 &&
    review.factualAccuracy === 2 && review.citationSupport === 2 &&
    (review.uncertainty === null || review.uncertainty === 2) &&
    !review.criticalFailure && review.requirements.every((r) => r.met));
}

export function quantile(values, percentile) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  // Nearest-rank quantiles; small-sample p95 is descriptive, not an SLA.
  return sorted[Math.max(0, Math.ceil(percentile * sorted.length) - 1)];
}

export function summarize(plan, results, reviews = []) {
  const reviewMap = new Map();
  const resultMap = new Map();
  const taskMap = new Map(plan.tasks.map((t) => [t.attemptId, t]));
  const sourceIds = new Set(plan.sources.map((s) => s.id));
  for (const result of results) {
    if (!taskMap.has(result.attemptId) || resultMap.has(result.attemptId))
      throw new Error("Unknown or duplicate recorded attempt.");
    resultMap.set(result.attemptId, result);
  }
  for (const input of reviews) {
    const result = resultMap.get(input.attemptId);
    const task = taskMap.get(input.attemptId);
    if (!result || task.split !== "holdout" || reviewMap.has(input.attemptId))
      throw new Error("Unknown, duplicate, or non-holdout review.");
    const item = plan.holdout.find((c) => c.id === task.caseId);
    reviewMap.set(input.attemptId, validateReview(input, result, item, sourceIds));
  }
  const ratio = (numerator, denominator) => ({
    numerator, denominator, rate: denominator ? numerator / denominator : null,
  });
  const variants = {};
  for (const variant of plan.protocol.variants) {
    const tasks = plan.tasks.filter((t) => t.variant === variant && t.split === "holdout");
    const rows = tasks.map((t) => resultMap.get(t.attemptId)).filter(Boolean);
    const complete = rows.filter((r) => r.status === "complete");
    const scored = rows.filter((r) => reviewMap.has(r.attemptId));
    const first = tasks.filter((t) => t.sample === 1);
    const hard = plan.holdout.filter((c) => c.hard);
    const perCase = hard.map((c) => {
      const repeats = tasks.filter((t) => t.caseId === c.id);
      const ready = repeats.every((t) => {
        const row = resultMap.get(t.attemptId);
        return row && (row.status !== "complete" || reviewMap.has(t.attemptId));
      });
      const passes = repeats.filter((t) => accepted(resultMap.get(t.attemptId), reviewMap.get(t.attemptId))).length;
      return { id: c.id, ready, passes, samples: repeats.length, unstable: ready && passes > 0 && passes < repeats.length };
    });
    const requirements = scored.flatMap((r) => reviewMap.get(r.attemptId).requirements);
    variants[variant] = {
      planned: tasks.length, attempted: rows.length, completed: complete.length,
      reviewed: scored.length,
      pendingReview: complete.length - scored.length,
      firstSampleAcceptance: ratio(first.filter((t) => accepted(resultMap.get(t.attemptId), reviewMap.get(t.attemptId))).length, first.length),
      allSampleAcceptance: ratio(scored.filter((r) => accepted(r, reviewMap.get(r.attemptId))).length, tasks.length),
      factualGroundingAmongReviewed: ratio(scored.filter((r) => reviewMap.get(r.attemptId).factualAccuracy === 2).length, scored.length),
      requirementCoverageAmongReviewed: ratio(requirements.filter((r) => r.met).length, requirements.length),
      criticalFailures: scored.filter((r) => reviewMap.get(r.attemptId).criticalFailure).length,
      invalidCitationResponses: rows.filter((r) => r.citations?.unknownIds.length).length,
      repeatConsistency: { cases: perCase, allPassed: perCase.filter((c) => c.ready && c.passes === c.samples).length, unstable: perCase.filter((c) => c.unstable).length, total: hard.length },
      latencyMs: { p50FirstText: quantile(complete.map((r) => r.firstTokenMs), 0.5), p95FirstText: quantile(complete.map((r) => r.firstTokenMs), 0.95), p50Total: quantile(complete.map((r) => r.totalMs), 0.5), p95Total: quantile(complete.map((r) => r.totalMs), 0.95) },
      estimatedUncachedUSD: rows.reduce((sum, r) => sum + (r.estimatedUSD ?? 0), 0),
      missingUsage: rows.filter((r) => !r.usage).length,
    };
  }
  const regressions = results.filter((r) => taskMap.get(r.attemptId).split === "regression");
  return {
    planHash: digest(plan), contentCommit: plan.contentCommit,
    reviewMethod: plan.protocol.scoring.reviewMethod,
    humanReviewed: reviews.filter((r) => r.reviewer === "human").length,
    totalPlanned: plan.tasks.length, totalAttempted: results.length,
    totalEstimatedUncachedUSD: results.reduce((s, r) => s + (r.estimatedUSD ?? 0), 0),
    missingUsage: results.filter((r) => !r.usage).length,
    variants,
    regression: { planned: plan.tasks.filter((t) => t.split === "regression").length, attempted: regressions.length, completed: regressions.filter((r) => r.status === "complete").length, invalidCitationResponses: regressions.filter((r) => r.citations?.unknownIds.length).length, factualReview: "Not scored by this protocol; transport/citation-ID smoke checks only." },
  };
}

export function reviewTemplate(plan, results) {
  return results.filter((r) => r.status === "complete" && r.split === "holdout").map((r) => ({
    attemptId: r.attemptId, answerHash: digest(r.answer), reviewer: "model",
    factualAccuracy: null, citationSupport: null, uncertainty: null,
    requirements: plan.holdout.find((c) => c.id === r.caseId).requirements.map(({ id }) => ({ id, met: null })),
    criticalFailure: null, findings: [], notes: "",
  }));
}
