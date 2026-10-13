import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, parseEnv } from "node:util";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));

export function formatUsageReport(report) {
  const { totals } = report;
  const lines = [
    `Portfolio AI usage (${report.environment})`,
    `${report.daily.length} UTC calendar days | ${totals.requests} model requests | ${totals.completed} completed`,
    `Reported tokens: ${totals.totalTokens.toLocaleString("en-CA")} across ${totals.usageKnown} requests; ${totals.requests - totals.usageKnown} without token counts.`,
    "Counts are requests, not unique visitors. No prompts, answers, IP addresses or visitor identifiers are stored.",
    "Page views, invalid/blocked requests and notes-only answers are not counted. Missing records are possible during storage failures.",
    "",
    "Date (UTC)   Requests  Completed  Tokens (known)",
    ...report.daily.map((row) => `${row.date}   ${String(row.requests).padStart(8)}  ${String(row.completed).padStart(9)}  ${String(row.totalTokens).padStart(14)}`),
    "",
    "Recent activity (America/Toronto)",
  ];
  const time = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto", dateStyle: "short", timeStyle: "medium",
  });
  for (const event of report.events) {
    lines.push(`${time.format(new Date(event.timestamp))} | ${event.outcome} | ${event.model} | ${event.usage?.totalTokens ?? "unknown"} tokens | ${event.durationMs} ms | ${event.responseId ?? "no response ID"}`);
  }
  if (!report.events.length) lines.push("No recorded activity in this window. Tracking is not retroactive.");
  return lines.join("\n");
}

async function main() {
  const { values } = parseArgs({ options: {
    days: { type: "string", default: "7" },
    limit: { type: "string", default: "20" },
    environment: { type: "string", default: "production" },
    "env-file": { type: "string", default: ".env.deployment.local" },
    json: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  } });
  if (values.help) {
    console.log("npm run usage -- [--days 1..30] [--limit 1..100] [--environment production|preview|development] [--env-file .env.deployment.local] [--json]\nRead-only metadata report using server-side Redis credentials. Never calls a model.");
    return;
  }
  let local = {};
  try {
    local = parseEnv(await readFile(path.resolve(root, values["env-file"]), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw new Error("Could not read the selected env file.");
  }
  const bundle = await build({
    entryPoints: [path.join(root, "server/usage.ts")],
    bundle: true, platform: "node", format: "esm", write: false,
  });
  const { readUsageReport } = await import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
  );
  const report = await readUsageReport({ ...local, ...process.env }, {
    days: Number(values.days), limit: Number(values.limit), environment: values.environment,
  });
  console.log(values.json ? JSON.stringify(report, null, 2) : formatUsageReport(report));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => {
    console.error("Usage report unavailable. Check the env file's Redis credentials and --help options. No secrets or raw server errors were printed.");
    process.exitCode = 1;
  });
}
