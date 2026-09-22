import type { IncomingMessage, ServerResponse } from "node:http";
import OpenAI from "openai";
import { z } from "zod";
import {
  answerPortfolio,
  citedSources,
  withoutCitations,
  type PortfolioAnswer,
} from "../src/lib/portfolio-answer.js";
import type { ChatEvent } from "../src/lib/chat-stream.js";
import { portfolioInstructions } from "./portfolio-prompt.js";
import { reserveSharedBudget, sharedBudgetReady } from "./request-budget.js";
import {
  questionForNotes,
  questionWithExcerpt,
  resumeExcerptSchema,
} from "../src/lib/resume.js";

type Environment = Record<string, string | undefined>;
const requestSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  excerpt: resumeExcerptSchema.optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(6000),
      }),
    )
    .max(12)
    .optional()
    .default([]),
  stream: z.boolean().optional().default(false),
});
let windowStart = 0;
let windowRequests = 0;
let day = "";
let dailyRequests = 0;
let concurrent = 0;

export function modelConfiguration(env: Environment) {
  const provider =
    env.PORTFOLIO_LLM_PROVIDER ||
    (env.PORTFOLIO_LLM_BASE_URL ? "compatible" : "openai");
  // Provider-specific credentials never follow a custom endpoint or cross providers.
  const baseURL =
    provider === "gemini"
      ? "https://generativelanguage.googleapis.com/v1beta/openai/"
      : provider === "openai"
        ? "https://api.openai.com/v1"
        : env.PORTFOLIO_LLM_BASE_URL || "";
  const apiKey =
    provider === "gemini"
      ? env.GEMINI_API_KEY
      : provider === "openai"
        ? env.OPENAI_API_KEY
        : env.PORTFOLIO_LLM_API_KEY;
  const model =
    env.PORTFOLIO_LLM_MODEL ||
    (provider === "gemini"
      ? "gemini-3.1-flash-lite"
      : provider === "openai"
        ? "gpt-5.6-luna"
        : "");
  const local =
    provider === "compatible" &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(baseURL);
  return {
    baseURL,
    provider,
    apiKey,
    model,
    configured: Boolean(
      ["gemini", "openai", "compatible"].includes(provider) &&
      baseURL &&
      model &&
      (apiKey || local),
    ),
  };
}

function withinBudget(env: Environment): boolean {
  const now = Date.now();
  if (now - windowStart >= 60000) {
    windowStart = now;
    windowRequests = 0;
  }
  const today = new Date(now).toISOString().slice(0, 10);
  if (day !== today) {
    day = today;
    dailyRequests = 0;
  }
  const perMinute = Math.max(
    1,
    Math.min(60, Number(env.PORTFOLIO_LLM_REQUESTS_PER_MINUTE) || 12),
  );
  const perDay = Math.max(
    1,
    Math.min(10000, Number(env.PORTFOLIO_LLM_DAILY_REQUEST_LIMIT) || 200),
  );
  if (windowRequests >= perMinute || dailyRequests >= perDay || concurrent >= 3)
    return false;
  windowRequests += 1;
  dailyRequests += 1;
  return true;
}

export async function handleChat(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
  env: Environment = process.env,
) {
  res.setHeader("Cache-Control", "no-store");
  const json = (status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
  };
  const config = modelConfiguration(env);
  if (req.method === "GET") {
    json(200, { configured: config.configured && sharedBudgetReady(env) });
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    json(405, { error: "Use GET or POST." });
    return;
  }
  const origin = req.headers?.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) {
        json(403, {
          error: "This endpoint is only available from the portfolio.",
        });
        return;
      }
    } catch {
      json(403, { error: "Invalid origin." });
      return;
    }
  }
  let input: z.infer<typeof requestSchema>;
  try {
    let body = req.body;
    if (body === undefined) {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 80000) {
          json(413, { error: "Request is too large." });
          return;
        }
      }
      body = JSON.parse(raw);
    } else if (typeof body === "string") body = JSON.parse(body);
    if (JSON.stringify(body)?.length > 80000) {
      json(413, { error: "Request is too large." });
      return;
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      json(400, { error: "Enter a question of up to 2,000 characters." });
      return;
    }
    input = parsed.data;
  } catch {
    json(400, { error: "The request could not be read." });
    return;
  }

  const previous =
    [...input.history].reverse().find((message) => message.role === "user")
      ?.content || "";
  const contextualQuestion = questionWithExcerpt(input.question, input.excerpt);
  const fallback = answerPortfolio(
    questionForNotes(input.question, input.excerpt),
    previous,
  );
  const emit = (event: ChatEvent) => {
    if (!res.destroyed && !res.writableEnded)
      res.write(`${JSON.stringify(event)}\n`);
  };
  if (input.stream) {
    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();
  }
  const finish = (answer: PortfolioAnswer, type: "complete" | "fallback") => {
    if (res.destroyed) return;
    if (input.stream) {
      emit({ type, answer });
      res.end();
    } else json(200, answer);
  };
  if (!config.configured) {
    finish(
      {
        ...fallback,
        notice:
          "Live AI is not connected yet. This answer uses verified portfolio notes.",
      },
      "fallback",
    );
    return;
  }
  if (!withinBudget(env)) {
    finish(
      {
        ...fallback,
        notice:
          "The AI request limit has been reached. These portfolio notes are still available.",
      },
      "fallback",
    );
    return;
  }

  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 25000);
  const onClose = () => {
    if (!res.writableEnded) abort.abort();
  };
  res.on?.("close", onClose);
  concurrent += 1;
  let rawText = "";
  const delta = (text: string) => {
    rawText += text;
    if (rawText.length > 18000) throw new Error("Model output limit exceeded");
    if (input.stream) emit({ type: "delta", text });
  };
  try {
    const instructions = portfolioInstructions();
    const history = input.history.slice(-10);
    const reserved = await reserveSharedBudget(
      env,
      config.provider,
      config.model,
      instructions + JSON.stringify(history) + contextualQuestion,
    );
    if (!reserved) {
      finish(
        {
          ...fallback,
          notice:
            "Live AI is temporarily unavailable or has reached its usage limit. This answer uses verified portfolio notes.",
        },
        "fallback",
      );
      return;
    }
    if (res.destroyed || abort.signal.aborted) return;
    const client = new OpenAI({
      apiKey: config.apiKey || "local",
      baseURL: config.baseURL,
      maxRetries: 0,
      timeout: 25000,
    });
    if (input.stream) emit({ type: "start", mode: "model" });
    if (config.provider === "openai") {
      const stream = await client.responses.create(
        {
          model: config.model,
          instructions,
          input: [...history, { role: "user", content: contextualQuestion }],
          stream: true,
          store: false,
          max_output_tokens: 900,
          ...(config.model === "gpt-5.6-luna"
            ? { reasoning: { effort: "none" as const } }
            : {}),
        },
        { signal: abort.signal },
      );
      let completed = false;
      for await (const event of stream) {
        if (event.type === "response.output_text.delta") delta(event.delta);
        if (event.type === "response.completed") completed = true;
        if (
          event.type === "error" ||
          event.type === "response.failed" ||
          event.type === "response.incomplete"
        )
          throw new Error("Incomplete model response");
      }
      if (!completed) throw new Error("Interrupted model response");
    } else {
      const stream = await client.chat.completions.create(
        {
          model: config.model,
          max_tokens: 900,
          ...(config.provider === "gemini" &&
          config.model === "gemini-3.1-flash-lite"
            ? { reasoning_effort: "minimal" as const }
            : {}),
          stream: true,
          messages: [
            { role: "system", content: instructions },
            ...history,
            { role: "user", content: contextualQuestion },
          ],
        },
        { signal: abort.signal },
      );
      let completed = false;
      for await (const event of stream) {
        if (event.choices[0]?.delta?.content)
          delta(event.choices[0].delta.content);
        if (event.choices[0]?.finish_reason === "stop") completed = true;
        if (event.choices[0]?.finish_reason === "length")
          throw new Error("Incomplete model response");
      }
      if (!completed) throw new Error("Interrupted model response");
    }
    if (!withoutCitations(rawText).trim())
      throw new Error("Empty model response");
    finish(
      {
        title: "Lily's portfolio",
        intro: "",
        sections: [],
        sources: citedSources(rawText),
        followUps: [],
        mode: "model",
        prose: withoutCitations(rawText).trim(),
      },
      "complete",
    );
  } catch {
    finish(
      {
        ...fallback,
        notice: rawText
          ? "The AI response was interrupted. Here are verified portfolio notes instead."
          : "Live AI is unavailable right now. This answer uses verified portfolio notes.",
      },
      "fallback",
    );
  } finally {
    clearTimeout(timeout);
    res.off?.("close", onClose);
    concurrent -= 1;
  }
}
