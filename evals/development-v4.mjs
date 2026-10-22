import { holdoutCases } from "./holdout-v1.mjs";
import { cases as v2 } from "./holdout-v2.mjs";
import { cases as v3 } from "./holdout-v3.mjs";
const selected = new Set(["h18-quoted-json-update", "v213-history-correction", "v302-brief-shortlist", "v309-metric-repair", "v317-stage-vs-jury", "v320-why-not-sources"]);
const hard = new Set(["h18-quoted-json-update", "v213-history-correction", "v309-metric-repair"]);
export const cases = [...holdoutCases, ...v2, ...v3].filter(c => selected.has(c.id)).map(c => ({...c, hard:hard.has(c.id)}));
if(cases.length !== selected.size) throw new Error("A development reference is missing.");
export const version = "portfolio-development-v4";
export const purpose = "development: observed v1/v2/v3 cases, including the rejected v3 candidate's failures";
