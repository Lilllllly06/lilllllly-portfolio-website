import { randomUUID } from "node:crypto";
import { z } from "zod";
import { redisCredentials as credentials } from "./redis-config.js";

type Environment = Record<string, string | undefined>;

// Atomic reservations across all instances and deployments. Redis holds only
// counters and random receipts, never visitor messages or IP addresses.
export const reservationScript = `
if redis.call('EXISTS', KEYS[4]) == 1 then return 0 end
for i = 1, 3 do
  local used = tonumber(redis.call('GET', KEYS[i]) or '0')
  if used + tonumber(ARGV[i]) > tonumber(ARGV[i + 3]) then return 0 end
end
for i = 1, 3 do
  redis.call('INCRBY', KEYS[i], ARGV[i])
  redis.call('EXPIREAT', KEYS[i], ARGV[i + 6])
end
redis.call('SET', KEYS[4], ARGV[3])
redis.call('EXPIREAT', KEYS[4], ARGV[9])
return 1`;

export const settlementScript = `
local reserved = tonumber(redis.call('GET', KEYS[2]))
local used = tonumber(redis.call('GET', KEYS[1]))
if not reserved or not used or used < reserved then return 0 end
redis.call('INCRBY', KEYS[1], tonumber(ARGV[1]) - reserved)
redis.call('DEL', KEYS[2])
return 1`;

const tokenCount = z.number().int().nonnegative().max(2000000);
const usageSchema = z.object({
  input_tokens: tokenCount,
  output_tokens: tokenCount,
  total_tokens: tokenCount,
  input_tokens_details: z.object({
    cached_tokens: tokenCount,
    cache_write_tokens: tokenCount.optional(),
  }),
});

export function usageCostMicroUSD(usage: unknown): number | null {
  const parsed = usageSchema.safeParse(usage);
  if (!parsed.success) return null;
  const {
    input_tokens: input,
    output_tokens: output,
    total_tokens: total,
  } = parsed.data;
  const cached = parsed.data.input_tokens_details.cached_tokens;
  // Older usage payloads omit cache writes; price unknown non-cached tokens
  // at the higher cache-write rate rather than risk refunding too much.
  const written =
    parsed.data.input_tokens_details.cache_write_tokens ?? input - cached;
  if (
    input === 0 ||
    input + output !== total ||
    cached > input ||
    written < 0 ||
    cached + written > input
  ) return null;
  const longContext = input > 272000;
  return Math.ceil(
    (((input - cached - written) * 20 + cached * 2 + written * 25) *
      (longContext ? 2 : 1)) / 100 +
      (output * (longContext ? 180 : 120)) / 100,
  );
}

export type BudgetReservation = {
  settle: (usage: unknown) => Promise<void>;
};

export function sharedBudgetReady(env: Environment) {
  return env.VERCEL !== "1" || Boolean(credentials(env));
}

function limit(value: string | undefined, fallback: number, maximum: number) {
  const number = value === undefined ? fallback : Number(value);
  return Number.isFinite(number) && number > 0
    ? Math.min(maximum, Math.floor(number))
    : 0;
}

export function reservationCommand(
  env: Environment,
  input: string,
  now = Date.now(),
  id = randomUUID(),
) {
  const date = new Date(now);
  const today = date.toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const environment = env.VERCEL_ENV === "preview" ? "preview" :
    env.VERCEL_ENV === "development" || env.VERCEL !== "1" ? "development" : "production";
  // Preserve existing production usage during rollout; isolate nonproduction.
  const prefix = environment === "production" ? "portfolio:ai" : `portfolio:ai:${environment}`;
  const maximumBudget = environment === "production" ? 8 : 2;
  // Reserve a worst-case planning allowance before starting the model call.
  // Account for cache writes, long-context pricing and all 900 output tokens.
  const inputBound = Buffer.byteLength(input) + 2048;
  const microUSD = Math.ceil(
    inputBound * (inputBound > 272000 ? 0.5 : 0.25) +
      900 * (inputBound > 272000 ? 1.8 : 1.2),
  );
  const budget = Number(env.PORTFOLIO_LLM_MONTHLY_BUDGET_USD ?? maximumBudget);
  const monthlyLimit =
    Number.isFinite(budget) && budget > 0
      ? Math.floor(Math.min(maximumBudget, budget) * 1e6)
      : 0;
  const minute = Math.floor(now / 60000);
  const tomorrow =
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1) /
    1000;
  const nextMonth =
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) / 1000;
  return [
    "EVAL",
    reservationScript,
    4,
    `${prefix}:minute:${minute}`,
    `${prefix}:day:${today}`,
    `${prefix}:month:${month}`,
    `${prefix}:reservation:${month}:${id}`,
    1,
    1,
    microUSD,
    limit(env.PORTFOLIO_LLM_REQUESTS_PER_MINUTE, 12, 60),
    limit(env.PORTFOLIO_LLM_DAILY_REQUEST_LIMIT, 200, 10000),
    monthlyLimit,
    (minute + 1) * 60 + 60,
    tomorrow + 60,
    nextMonth + 60,
  ];
}

export async function reserveSharedBudget(
  env: Environment,
  provider: string,
  model: string,
  input: string,
): Promise<BudgetReservation | false> {
  const config = credentials(env);
  if (!config) return env.VERCEL !== "1" ? { settle: async () => {} } : false;
  // A different model needs an explicitly reviewed pricing allowance.
  if (provider !== "openai" || model !== "gpt-5.6-luna") return false;
  const command = reservationCommand(env, input);
  if (!(await runCommand(config, command))) return false;
  return {
    async settle(usage) {
      const cost = usageCostMicroUSD(usage);
      if (cost === null) return;
      // The receipt is deleted atomically, so repeated settlement cannot refund
      // twice. Keep the original month even when a request crosses midnight.
      await runCommand(config, [
        "EVAL",
        settlementScript,
        2,
        command[5],
        command[6],
        cost,
      ]);
    },
  };
}

async function runCommand(
  config: NonNullable<ReturnType<typeof credentials>>,
  command: (string | number)[],
): Promise<boolean> {
  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return (
      typeof result === "object" &&
      result !== null &&
      !("error" in result) &&
      "result" in result &&
      result.result === 1
    );
  } catch {
    // No retries or model call on uncertain quota outcomes.
    return false;
  }
}
