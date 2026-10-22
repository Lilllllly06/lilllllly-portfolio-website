import { holdoutCases } from "./holdout-v1.mjs";
import { cases as v2 } from "./holdout-v2.mjs";

const selected = new Set([
  "h18-quoted-json-update", "v213-history-correction", "v215-recruiter-evidence",
  "h04-ranking-scores", "v216-separate-roles", "v219-personal-rankings",
]);
const hard = new Set(["h18-quoted-json-update", "v213-history-correction", "v215-recruiter-evidence"]);
export const cases = [...holdoutCases, ...v2].filter(item => selected.has(item.id))
  .map(item => ({ ...item, hard: hard.has(item.id) }));
if (cases.length !== selected.size) throw new Error("A development reference is missing.");
export const version = "portfolio-development-v3";
export const purpose = "development: previously observed v1/v2 cases; not held-out evidence";
