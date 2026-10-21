import test from "node:test";
import assert from "node:assert/strict";
import { checkAgentHealth } from "../scripts/check-agent-health.mjs";

const response = (body, status = 200) => new Response(JSON.stringify(body), { status });
test("configuration does not claim a live model was verified", async () => {
  const result = await checkAgentHealth("https://example.com", { fetchImpl: async (_url, options) => {
    assert.equal(options.method, "GET");
    assert.equal(options.body, undefined);
    return response({ configured: true });
  } });
  assert.deepEqual(result, { ok: true, check: "configuration", liveVerified: false });
});
test("HTTP 200 with fallback notes is an unhealthy live model", async () => {
  const result = await checkAgentHealth("https://example.com", { live: true, fetchImpl: async (_url, options) => {
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body).history, []);
    return response({ mode: "portfolio", notice: "private diagnostic" });
  } });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "notes-fallback");
  assert.ok(!JSON.stringify(result).includes("private diagnostic"));
});
test("live verification requires a nonempty model response", async () => {
  for (const prose of ["", " ", undefined]) {
    assert.equal((await checkAgentHealth("https://example.com", { live: true, fetchImpl: async () => response({mode:"model",prose}) })).ok, false);
  }
  const result = await checkAgentHealth("https://example.com", { live: true, fetchImpl: async () => response({mode:"model",prose:"Computer Engineering."}) });
  assert.equal(result.liveVerified, true);
  assert.ok(!JSON.stringify(result).includes("Computer Engineering"));
});
test("network and HTTP failures fail closed without leaking errors", async () => {
  assert.equal((await checkAgentHealth("https://example.com", {fetchImpl: async()=>response({},503)})).httpStatus,503);
  const result = await checkAgentHealth("https://example.com", {fetchImpl:async()=>{throw new Error("secret");}});
  assert.equal(result.ok,false);
  assert.ok(!JSON.stringify(result).includes("secret"));
});
test("health checks reject insecure external URLs and URL credentials", async () => {
  const fetchImpl = async()=>{throw new Error("Should not fetch");};
  await assert.rejects(checkAgentHealth("http://example.com",{fetchImpl}),/HTTPS/);
  await assert.rejects(checkAgentHealth("https://user:secret@example.com",{fetchImpl}),/Credentials/);
});
