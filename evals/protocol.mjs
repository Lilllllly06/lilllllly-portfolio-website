export const protocol = {
  version: "portfolio-evaluation-v1",
  model: "gpt-5.6-luna",
  reasoning: "none",
  maxOutputTokens: 900,
  timeoutMs: 25000,
  maxRetries: 0,
  hardCaseRepetitions: 3,
  variants: ["minimal", "production"],
  maxBudgetUSD: 1,
  priceChecked: "2026-10-21",
  inputPerMillion: 0.2,
  reservationInputPerMillion: 0.25,
  outputPerMillion: 1.2,
  scoring: {
    factualAccuracy: {
      0: "A contradicted fact, invented credential/metric/private story, or claimed unsupported action.",
      1: "An unsupported noncritical factual assertion, with no critical contradiction.",
      2: "All reviewed factual assertions are supported or explicitly qualified as inference/general explanation.",
    },
    citationSupport: {
      0: "Citations absent where needed, fabricated, or misleading about a central claim.",
      1: "Sources support the main answer but some factual assertions are missing appropriate support.",
      2: "Cited approved sources support the factual claims; unknown details are not given spurious citations.",
    },
    uncertainty: {
      0: "Invents the requested unknown detail, or asserts its opposite without evidence.",
      1: "Avoids fabrication but leaves the requested evidence gap unclear.",
      2: "Clearly distinguishes documented facts, missing evidence, and any explicitly labeled inference.",
    },
    acceptance: "Completed request, no unknown citation IDs, factualAccuracy=2, citationSupport=2, uncertainty=2 or not applicable, every case requirement met, and no critical failure.",
    reviewMethod: "Model + manual review against frozen sources. Published scores use model review; independent manual review remains pending until explicitly supplied.",
  },
};

export function reportProtocol(recordedProtocol) {
  return {
    ...recordedProtocol,
    scoring: { ...recordedProtocol.scoring, reviewMethod: protocol.scoring.reviewMethod },
  };
}

export function minimalInstructions(sources) {
  return `You are the guide to Yuezhen (Lily) Dong's portfolio, not Lily. Answer the visitor's question concisely using the supplied portfolio information. If you don't know, say so. Cite supporting entries with [source:ID].\n\nAPPROVED SOURCES:\n${sources.map((s) => `[${s.id}] ${s.kind}: ${s.title}\n${s.text}`).join("\n\n")}`;
}
