import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { readUsageReport } from "./usage.js";

type Environment = Record<string, string | undefined>;
type Report = Awaited<ReturnType<typeof readUsageReport>>;
const querySchema = z.object({
  days: z.enum(["1", "7", "30"]).default("7"),
  environment: z.enum(["production", "preview", "development"]).default("production"),
}).strict();

// This middleware is only mounted by the loopback-only dashboard launcher.
export function createLocalUsageMiddleware(
  env: Environment,
  readReport = readUsageReport,
  now = Date.now,
) {
  const cache = new Map<string, { expires: number; pending: Promise<Report> }>();
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("Referrer-Policy", "no-referrer");
    const json = (status: number, body: unknown) => {
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(body));
    };
    const peer = req.socket.remoteAddress;
    const port = req.socket.localPort;
    const host = req.headers.host;
    if (!port || !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(peer ?? "") ||
      ![`127.0.0.1:${port}`, `localhost:${port}`].includes(host ?? "")) {
      json(403, { error: "This dashboard is only available on this computer." });
      return;
    }
    const origin = `http://${host}`;
    if (req.headers.origin && req.headers.origin !== origin) {
      json(403, { error: "Cross-origin requests are not allowed." });
      return;
    }
    let url: URL;
    try {
      url = new URL(req.url ?? "/", origin);
      if (url.origin !== origin) throw new Error();
    } catch {
      json(400, { error: "Invalid request." });
      return;
    }
    if (!url.pathname.startsWith("/api/")) {
      next();
      return;
    }
    if (req.headers["sec-fetch-site"] && !["same-origin", "none"].includes(String(req.headers["sec-fetch-site"]))) {
      json(403, { error: "Cross-origin requests are not allowed." });
      return;
    }
    if (url.pathname !== "/api/usage") {
      json(404, { error: "Not found." });
      return;
    }
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      json(405, { error: "Use GET." });
      return;
    }
    const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success || [...url.searchParams.keys()].length !== new Set(url.searchParams.keys()).size) {
      json(400, { error: "Choose a valid date range and environment." });
      return;
    }
    const key = `${parsed.data.environment}:${parsed.data.days}`;
    try {
      let entry = cache.get(key);
      if (!entry || entry.expires <= now()) {
        const pending = readReport(env, { days: Number(parsed.data.days), environment: parsed.data.environment, limit: 100 });
        const fresh = { expires: Infinity, pending };
        entry = fresh;
        cache.set(key, fresh);
        // There are only nine possible query combinations. Coalesce concurrent
        // reads and briefly cache successes to keep Redis reads bounded.
        void pending.then(() => { fresh.expires = now() + 30000; }, () => { cache.delete(key); });
      }
      const report = await entry.pending;
      if (!res.destroyed) json(200, report);
    } catch {
      if (!res.destroyed) json(503, { error: "Could not read usage. Check the local Redis configuration or try again." });
    }
  };
}
