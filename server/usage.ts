import { randomUUID } from "node:crypto";
import { z } from "zod";
import { redisCredentials } from "./redis-config.js";

type Environment = Record<string, string | undefined>;
export const retentionDays = 30;
export const dailyEventLimit = 500;
const dayMs = 86400000;
const scopeSchema = z.enum(["production", "preview", "development"]);
export const outcomeSchema = z.enum(["completed", "failed", "incomplete", "timeout", "cancelled"]);
export type UsageOutcome = z.infer<typeof outcomeSchema>;
const tokenCount = z.number().int().nonnegative().max(2000000);
const modelName = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/);
const responseId = z.string().regex(/^(?:resp_|chatcmpl-)[a-zA-Z0-9_-]{1,180}$/);
const tokenUsage = z.object({
  inputTokens: tokenCount,
  outputTokens: tokenCount,
  totalTokens: tokenCount,
  cachedInputTokens: tokenCount.nullable(),
}).refine((value) => value.inputTokens + value.outputTokens === value.totalTokens &&
  (value.cachedInputTokens === null || value.cachedInputTokens <= value.inputTokens));

export const usageEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  finishedAt: z.string().datetime(),
  durationMs: z.number().int().nonnegative().max(300000),
  provider: z.enum(["openai", "gemini", "compatible"]),
  model: modelName,
  responseId: responseId.nullable(),
  outcome: outcomeSchema,
  usage: tokenUsage.nullable(),
});
export type UsageEvent = z.infer<typeof usageEventSchema>;

export function usageScope(env: Environment) {
  return scopeSchema.catch("development").parse(env.VERCEL_ENV);
}

export function usageEnabled(env: Environment) {
  if (env.PORTFOLIO_USAGE_ENABLED !== undefined)
    return env.PORTFOLIO_USAGE_ENABLED === "true";
  return env.VERCEL === "1" && usageScope(env) === "production";
}

// Only explicit metadata fields leave this object; never retain provider payloads.
export function createUsageTracker(provider: string, model: string, now = Date.now()) {
  const id = randomUUID();
  let reportedModel = modelName.catch("unknown").parse(model);
  let reportedId: string | null = null;
  let usage: UsageEvent["usage"] = null;
  return {
    observe(value: unknown) {
      const parsed = z.object({
        id: z.unknown().optional(), model: z.unknown().optional(),
        usage: z.record(z.unknown()).nullish(),
      }).safeParse(value);
      if (!parsed.success) return;
      const data = parsed.data;
      const modelResult = modelName.safeParse(data.model);
      if (modelResult.success) reportedModel = modelResult.data;
      const idResult = responseId.safeParse(data.id);
      if (idResult.success) reportedId = idResult.data;
      if (!data.usage) return;
      const raw = data.usage;
      const cached = provider === "openai" ? raw.input_tokens_details : raw.prompt_tokens_details;
      const cachedResult = z.object({ cached_tokens: tokenCount }).safeParse(cached);
      const tokens = tokenUsage.safeParse({
        inputTokens: provider === "openai" ? raw.input_tokens : raw.prompt_tokens,
        outputTokens: provider === "openai" ? raw.output_tokens : raw.completion_tokens,
        totalTokens: raw.total_tokens,
        cachedInputTokens: cachedResult.success ? cachedResult.data.cached_tokens : null,
      });
      if (tokens.success) usage = tokens.data;
    },
    event(outcome: UsageOutcome, finished = Date.now()): UsageEvent {
      return usageEventSchema.parse({
        id, timestamp: new Date(now).toISOString(), finishedAt: new Date(finished).toISOString(),
        durationMs: Math.max(0, Math.min(300000, finished - now)),
        provider, model: reportedModel, responseId: reportedId, outcome, usage,
      });
    },
  };
}

function keys(scope: z.infer<typeof scopeSchema>, date: string) {
  const prefix = `portfolio:usage:v1:${scope}:${date}`;
  return [`${prefix}:events`, `${prefix}:totals`];
}

export const usageScript = `
local added = redis.call('ZADD', KEYS[1], 'NX', ARGV[1], ARGV[2])
if added == 0 then return 1 end
redis.call('HINCRBY', KEYS[2], 'requests', 1)
redis.call('HINCRBY', KEYS[2], ARGV[3], 1)
if ARGV[4] == '1' then
  redis.call('HINCRBY', KEYS[2], 'usageKnown', 1)
  redis.call('HINCRBY', KEYS[2], 'totalTokens', ARGV[5])
  redis.call('HINCRBY', KEYS[2], 'inputTokens', ARGV[6])
  redis.call('HINCRBY', KEYS[2], 'outputTokens', ARGV[7])
end
redis.call('ZREMRANGEBYRANK', KEYS[1], 0, -tonumber(ARGV[8]) - 1)
redis.call('EXPIREAT', KEYS[1], ARGV[9])
redis.call('EXPIREAT', KEYS[2], ARGV[9])
return 1`;

export function usageCommand(env: Environment, value: unknown) {
  const event = usageEventSchema.parse(value);
  const time = Date.parse(event.timestamp);
  const midnight = Math.floor(time / dayMs) * dayMs;
  return [
    "EVAL", usageScript, 2, ...keys(usageScope(env), event.timestamp.slice(0, 10)),
    time, JSON.stringify(event), event.outcome, event.usage ? 1 : 0,
    event.usage?.totalTokens ?? 0, event.usage?.inputTokens ?? 0, event.usage?.outputTokens ?? 0,
    dailyEventLimit, Math.floor((midnight + retentionDays * dayMs) / 1000),
  ];
}

export async function recordUsage(env: Environment, event: unknown) {
  if (!usageEnabled(env)) return;
  try {
    const config = redisCredentials(env);
    if (!config) throw new Error("Storage unavailable");
    const response = await fetch(config.url, {
      method: "POST", redirect: "error",
      headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(usageCommand(env, event)),
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok || !(z.object({ result: z.literal(1) }).safeParse(await response.json()).success))
      throw new Error("Storage unavailable");
  } catch {
    // Never log SDK errors, request content, IDs or credentials to runtime logs.
    console.warn("Portfolio usage recording unavailable; chat continues without a usage record.");
  }
}

const totalsSchema = z.object({
  requests: z.coerce.number().int().nonnegative().default(0),
  completed: z.coerce.number().int().nonnegative().default(0),
  failed: z.coerce.number().int().nonnegative().default(0),
  incomplete: z.coerce.number().int().nonnegative().default(0),
  timeout: z.coerce.number().int().nonnegative().default(0),
  cancelled: z.coerce.number().int().nonnegative().default(0),
  usageKnown: z.coerce.number().int().nonnegative().default(0),
  totalTokens: z.coerce.number().int().nonnegative().default(0),
  inputTokens: z.coerce.number().int().nonnegative().default(0),
  outputTokens: z.coerce.number().int().nonnegative().default(0),
});

export async function readUsageReport(
  env: Environment,
  options: { days?: number; limit?: number; environment?: string } = {},
  now = Date.now(),
) {
  const days = z.number().int().min(1).max(retentionDays).parse(options.days ?? 7);
  const limit = z.number().int().min(1).max(100).parse(options.limit ?? 20);
  const environment = scopeSchema.parse(options.environment ?? "production");
  const config = redisCredentials(env);
  if (!config) throw new Error("Usage report needs server-side Redis credentials in the selected env file.");
  const dates = Array.from({ length: days }, (_, i) => new Date(now - i * dayMs).toISOString().slice(0, 10));
  const commands = dates.flatMap((date) => {
    const [events, totals] = keys(environment, date);
    return [["HGETALL", totals], ["ZREVRANGE", events, 0, limit - 1]];
  });
  let results;
  try {
    const response = await fetch(`${config.url}/pipeline`, {
      method: "POST", redirect: "error",
      headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands), signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error();
    results = z.array(z.object({ result: z.array(z.string()) })).length(commands.length).parse(await response.json());
  } catch {
    throw new Error("Could not read usage storage. No credentials or raw server errors were printed.");
  }
  const daily = dates.map((date, i) => {
    const fields = results[i * 2].result;
    if (fields.length % 2) throw new Error("Invalid usage summary.");
    const pairs = Array.from({ length: fields.length / 2 }, (_, j) => [fields[j * 2], fields[j * 2 + 1]]);
    return { date, ...totalsSchema.parse(Object.fromEntries(pairs)) };
  });
  const events = results.filter((_, i) => i % 2).flatMap(({ result }) => result.map((raw) => usageEventSchema.parse(JSON.parse(raw))));
  events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const totals = totalsSchema.parse({});
  for (const row of daily)
    for (const key of Object.keys(totals) as (keyof typeof totals)[]) totals[key] += row[key];
  return {
    environment, generatedAt: new Date(now).toISOString(), retentionDays, dailyEventLimit,
    totals, daily, events: events.slice(0, limit),
  };
}
