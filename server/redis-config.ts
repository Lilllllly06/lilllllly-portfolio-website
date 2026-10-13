type Environment = Record<string, string | undefined>;

export function redisCredentials(env: Environment) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const endpoint = new URL(url);
    if (
      endpoint.protocol !== "https:" ||
      !endpoint.hostname.endsWith(".upstash.io") ||
      endpoint.username || endpoint.password || endpoint.port ||
      endpoint.search || endpoint.hash || endpoint.pathname !== "/"
    ) return null;
    return { url: endpoint.origin, token };
  } catch {
    return null;
  }
}
