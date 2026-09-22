import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function loadModule(entry) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    jsx: "automatic",
    packages: "external",
    write: false,
  });
  // Resolve React from the project instead of giving a bundled component its own hook runtime.
  const code = result.outputFiles[0].text.replace(
    /from "(react|react\/jsx-runtime|framer-motion|lucide-react)"/g,
    (_, name) => `from ${JSON.stringify(import.meta.resolve(name))}`,
  );
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}
const {
  waitingMessages,
  waitingMessageAt,
  waitingMessageInterval,
  longWaitThreshold,
} = await loadModule("src/data/waiting-messages.ts");
const { default: WaitingIndicator } = await loadModule(
  "src/components/workspace/WaitingIndicator.tsx",
);

test("waiting copy cycles without repeats until every original line is shown", () => {
  for (const seed of ["one", "another-chat", ""]) {
    const cycle = Array.from(
      { length: waitingMessages.length },
      (_, step) => waitingMessageAt(seed, step).text,
    );
    assert.equal(new Set(cycle).size, waitingMessages.length);
    assert.deepEqual(
      waitingMessageAt(seed, waitingMessages.length),
      waitingMessageAt(seed, 0),
    );
    assert.equal(waitingMessageAt(seed, 0), waitingMessageAt(seed, 0));
  }
  assert.ok(waitingMessageInterval >= 2500);
  assert.equal(longWaitThreshold, 10000);
});

test("waiting messages stay short and do not invent progress percentages or completion estimates", () => {
  for (const { text, prop } of waitingMessages) {
    assert.ok(text.length <= 40);
    assert.doesNotMatch(text, /\d+%|almost done|seconds left|thinking/i);
    assert.ok(
      [
        "bone",
        "heart",
        "keyboard",
        "music",
        "pencil",
        "search",
        "sparkle",
      ].includes(prop),
    );
  }
});

test("waiting UI provides a stable accessible status and a pause control", () => {
  const html = renderToStaticMarkup(
    createElement(WaitingIndicator, { seed: "test" }),
  );
  assert.match(html, /role="status"/);
  assert.match(html, /Waiting for Lily&#x27;s assistant to respond/);
  assert.match(html, /aria-label="Pause waiting animation"/);
  assert.match(html, /class="waiting-scene" aria-hidden="true"/);
  assert.match(html, /class="waiting-copy" aria-hidden="true"/);
  assert.doesNotMatch(html, />Thinking</);
});
