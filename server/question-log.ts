import { randomUUID } from "node:crypto";
import { z } from "zod";
import { redisCredentials } from "./redis-config.js";
import { usageScope } from "./usage.js";

type Environment = Record<string, string | undefined>;
const dayMs = 86400000;
const retentionDays = 7;
const dailyLimit = 1000;
const pageSize = 20;

export const questionTextSchema = z.string().trim().min(1).max(2000);
const questionRecord = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  question: questionTextSchema,
});

export const questionLogQuery = z.object({
  environment: z.enum(["production", "preview", "development"]).default("production"),
  day: z.coerce.number().int().min(0).max(retentionDays - 1).default(0),
  page: z.coerce.number().int().min(1).max(dailyLimit / pageSize).default(1),
}).strict();

function questionKey(environment: string, date: string) {
  return `portfolio:questions:v1:${environment}:${date}`;
}

const appendQuestion = `
redis.call('ZADD', KEYS[1], ARGV[1], ARGV[2])
redis.call('ZREMRANGEBYRANK', KEYS[1], 0, -tonumber(ARGV[3]) - 1)
redis.call('EXPIREAT', KEYS[1], ARGV[4])
return 1`;

export function questionLogEnabled(env: Environment) {
  return env.PORTFOLIO_QUESTION_LOG_ENABLED === "true";
}

async function runCommand(env: Environment, command: (number | string)[], timeout: number) {
  const config = redisCredentials(env);
  if (!config) throw new Error("Question storage is not configured.");
  const response = await fetch(config.url, {
    method: "POST", redirect: "error",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command), signal: AbortSignal.timeout(timeout),
  });
  if (!response.ok) throw new Error("Question storage unavailable.");
  return (await response.json() as { result?: unknown }).result;
}

export async function recordQuestion(env: Environment, question: string, now = Date.now()) {
  if (!questionLogEnabled(env)) return;
  try {
    const timestamp = new Date(now).toISOString();
    const record = questionRecord.parse({ id: randomUUID(), timestamp, question });
    const expiresAt = (Math.floor(now / dayMs) + retentionDays) * dayMs / 1000;
    const result = await runCommand(env, [
      "EVAL", appendQuestion, 1, questionKey(usageScope(env), timestamp.slice(0, 10)),
      now, JSON.stringify(record), dailyLimit, expiresAt,
    ], 1500);
    if (result !== 1) throw new Error("Question storage unavailable.");
  } catch {
    console.warn("Portfolio question recording unavailable; chat continues without a question record.");
  }
}

export async function readQuestionLog(env: Environment, options: z.input<typeof questionLogQuery>, now = Date.now()) {
  const { environment, day, page } = questionLogQuery.parse(options);
  const date = new Date(now - day * dayMs).toISOString().slice(0, 10);
  const offset = (page - 1) * pageSize;
  const raw = z.array(z.string()).max(pageSize + 1).parse(await runCommand(env, [
    "ZREVRANGE", questionKey(environment, date), offset, offset + pageSize,
  ], 5000));
  return {
    date, page, hasNext: raw.length > pageSize,
    questions: raw.slice(0, pageSize).map((item) => questionRecord.parse(JSON.parse(item))),
  };
}
