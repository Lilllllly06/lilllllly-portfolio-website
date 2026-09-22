type Environment = Record<string, string | undefined>;

// One atomic reservation across all instances and deployments. Only counters
// reach Redis: never visitor messages, IP addresses, or profile content.
export const reservationScript = `
for i = 1, 3 do
  local used = tonumber(redis.call('GET', KEYS[i]) or '0')
  if used + tonumber(ARGV[i]) > tonumber(ARGV[i + 3]) then return 0 end
end
for i = 1, 3 do
  redis.call('INCRBY', KEYS[i], ARGV[i])
  redis.call('EXPIREAT', KEYS[i], ARGV[i + 6])
end
return 1`;

function credentials(env: Environment) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const endpoint = new URL(url);
    if (
      endpoint.protocol !== "https:" ||
      !endpoint.hostname.endsWith(".upstash.io") ||
      endpoint.username ||
      endpoint.password ||
      endpoint.port ||
      endpoint.search ||
      endpoint.hash ||
      endpoint.pathname !== "/"
    )
      return null;
    return { url: endpoint.origin, token };
  } catch {
    return null;
  }
}

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
) {
  const date = new Date(now);
  const today = date.toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  // Conservative uncached Luna allowance, not a provider invoice cap. UTF-8
  // bytes overestimate input tokens; overhead and all 900 output tokens count.
  const microUSD = Math.ceil(
    (Buffer.byteLength(input) + 2048) * 0.2 + 900 * 1.2,
  );
  const budget = Number(env.PORTFOLIO_LLM_MONTHLY_BUDGET_USD ?? 5);
  const monthlyLimit =
    Number.isFinite(budget) && budget > 0
      ? Math.floor(Math.min(5, budget) * 1e6)
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
    3,
    `portfolio:ai:minute:${minute}`,
    `portfolio:ai:day:${today}`,
    `portfolio:ai:month:${month}`,
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
): Promise<boolean> {
  const config = credentials(env);
  if (!config) return env.VERCEL !== "1";
  // A different model needs an explicitly reviewed pricing allowance.
  if (provider !== "openai" || model !== "gpt-5.6-luna") return false;
  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationCommand(env, input)),
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
