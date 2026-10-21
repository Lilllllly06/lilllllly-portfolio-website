import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

export async function checkAgentHealth(baseUrl, { live = false, fetchImpl = fetch } = {}) {
  const endpoint = new URL("/api/chat", baseUrl);
  if (endpoint.protocol !== "https:" && !(endpoint.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname))) {
    throw new Error("Use HTTPS, or HTTP on localhost.");
  }
  if (endpoint.username || endpoint.password) throw new Error("Credentials must not appear in the URL.");
  try {
    const response = await fetchImpl(endpoint, {
      method: live ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      ...(live ? { body: JSON.stringify({ question: "In one sentence, what does Lily study?", history: [], stream: false }) } : {}),
      signal: AbortSignal.timeout(35000),
    });
    if (!response.ok) return { ok: false, check: live ? "live" : "configuration", reason: "http-error", httpStatus: response.status };
    const body = await response.json();
    if (!live) return { ok: body.configured === true, check: "configuration", liveVerified: false };
    const ok = body.mode === "model" && typeof body.prose === "string" && body.prose.trim().length > 0;
    return { ok, check: "live", liveVerified: ok, reason: ok ? null : body.mode === "portfolio" ? "notes-fallback" : "invalid-response" };
  } catch {
    return { ok: false, check: live ? "live" : "configuration", reason: "network-timeout-or-invalid-json" };
  }
}

async function main() {
  const { values } = parseArgs({ options: {
    url: { type: "string", default: "https://www.yuezhen-dong.com" },
    live: { type: "boolean", default: false },
  } });
  const result = await checkAgentHealth(values.url, { live: values.live });
  console.log(JSON.stringify(result, null, 2));
  if (!values.live) console.log("Configuration only. Use --live for one potentially billable end-to-end request.");
  process.exitCode = result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error("Invalid health-check configuration. No credentials or response text printed."); process.exitCode = 1; });
}
