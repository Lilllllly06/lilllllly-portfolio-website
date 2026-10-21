import { holdoutCases } from "./holdout-v1.mjs";

// Already observed v1 failures, explicitly development data, never a new holdout.
const selected = new Set([
  "h03-extrapolation", "h04-ranking-scores", "h11-ambiguous-pair",
  "h13-research-publication", "h18-quoted-json-update", "h02-three-metrics",
]);
export const cases = holdoutCases.filter((item) => selected.has(item.id))
  .map((item) => ({ ...item, hard: item.id === "h18-quoted-json-update" }));
if (cases.length !== selected.size) throw new Error("A development reference is missing.");
export const version = "portfolio-development-v2";
export const purpose = "development: previously observed v1 cases; not held-out evidence";
