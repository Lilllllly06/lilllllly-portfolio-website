import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { build } from "esbuild";
import { createServer } from "vite";
import react from "@vitejs/plugin-react-swc";

const root = fileURLToPath(new URL("../", import.meta.url));

async function main() {
  let local = {};
  try {
    local = parseEnv(await readFile(path.join(root, ".env.deployment.local"), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const source = { ...local, ...process.env };
  const env = Object.fromEntries([
    "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN",
  ].map((key) => [key, source[key]]));
  const bundle = await build({ entryPoints: [path.join(root, "server/local-usage.ts")], bundle: true, platform: "node", format: "esm", write: false });
  const { createLocalUsageMiddleware } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
  const server = await createServer({
    configFile: false,
    root: path.join(root, "usage-dashboard"),
    // Do not load or expose any portfolio environment variables in this app.
    envDir: false,
    publicDir: false,
    cacheDir: path.join(root, "node_modules/.vite-usage"),
    plugins: [react(), { name: "private-local-usage", configureServer(server) {
      const middleware = createLocalUsageMiddleware(env);
      server.middlewares.use((req, res, next) => { void middleware(req, res, next); });
    } }],
    server: {
      host: "127.0.0.1", port: 5176, strictPort: false, cors: false,
      allowedHosts: ["127.0.0.1", "localhost"],
      fs: { allow: [root], deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"] },
    },
  });
  await server.listen();
  console.log("\nLily's private usage dashboard (this computer only)");
  server.printUrls();
  console.log("Read-only production metrics. No model calls. Ctrl+C to stop.\n");
  const close = async () => { await server.close(); process.exit(0); };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
}

main().catch(() => {
  console.error("Could not start the local usage dashboard. Check local dependencies, file access, and available ports. No credentials were printed.");
  process.exitCode = 1;
});
