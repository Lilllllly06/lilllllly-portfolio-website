import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";

const bundle = await build({
  stdin: {
    contents:
      'export * from "./src/lib/puppy-interactions.ts"; export { puppyMessages } from "./src/data/puppy-messages.ts";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const {
  isTreatOverDog,
  nextPuppyDestination,
  puppyBounds,
  treatOfferDuration,
  shouldOfferTreat,
  puppyMessages,
  treatLanding,
} = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);

test("a released treat falls to the puppy's floor without snapping horizontally back", () => {
  const landing = treatLanding(
    { left: 240, right: 272, top: 200, bottom: 232 },
    400,
    { width: 1440, height: 940 },
  );
  assert.equal(landing.x, 0);
  assert.equal(landing.y, 168);
  assert.ok(landing.duration > 0.4 && landing.duration < 0.5);
  assert.equal(landing.bounce, 14);
});

test("a treat released below the puppy falls to the viewport floor and stays reachable", () => {
  for (const width of [375, 1440]) {
    const landing = treatLanding(
      { left: width - 12, right: width + 32, top: 500, bottom: 544 },
      400,
      { width, height: 812 },
    );
    assert.equal(landing.x, -40);
    assert.equal(landing.y, 260);
    assert.ok(landing.duration < 0.8);
  }
  const atFloor = treatLanding(
    { left: 10, right: 42, top: 368, bottom: 400 },
    400,
    { width: 375, height: 812 },
  );
  assert.equal(atFloor.y, 0);
  assert.equal(atFloor.bounce, 0);
});

test("dragging has no CSS transform lag or snap-back and interrupted falls are cleaned up", async () => {
  const component = await readFile(
    "src/components/animations/PetDog.tsx",
    "utf8",
  );
  const css = await readFile("src/workspace.css", "utf8");
  assert.doesNotMatch(component, /dragSnapToOrigin/);
  assert.match(component, /dragMomentum=\{false\}/);
  assert.match(component, /onPointerDown=\{\(\) => \{\s*stopFall\(\)/);
  assert.match(component, /if \(!showBone\) stopFall\(\);\s*return stopFall;/);
  assert.match(
    component,
    /if \(reduceMotion \|\| paused\) \{\s*boneX.set\(target.x\)/,
  );
  assert.match(css, /\.dog-treat \{[^}]*transition: none;/);
  assert.match(css, /\.companion-track \{[^}]*z-index: 2;/);
});

test("bone drops use the same coordinate space as the dog, even after scrolling", () => {
  const dog = { left: 240, right: 284, top: 150, bottom: 194 };
  assert.equal(isTreatOverDog({ x: 262, y: 172 }, dog, { x: 0, y: 0 }), true);
  assert.equal(isTreatOverDog({ x: 262, y: 772 }, dog, { x: 0, y: 600 }), true);
  assert.equal(
    isTreatOverDog({ x: 362, y: 772 }, dog, { x: 100, y: 600 }),
    true,
  );
  assert.equal(
    isTreatOverDog({ x: 262, y: 172 }, dog, { x: 0, y: 600 }),
    false,
  );
  assert.equal(
    isTreatOverDog({ x: 420, y: 772 }, dog, { x: 0, y: 600 }),
    false,
  );
});

test("the drop target tolerates an imprecise touch without accepting the resting bone", () => {
  const dog = { left: 100, right: 144, top: 100, bottom: 144 };
  assert.equal(isTreatOverDog({ x: 155, y: 120 }, dog, { x: 0, y: 0 }), true);
  assert.equal(isTreatOverDog({ x: 181, y: 122 }, dog, { x: 0, y: 0 }), false);
  assert.equal(isTreatOverDog({ x: 122, y: 180 }, dog, { x: 0, y: 0 }), false);
});

test("roaming covers visible distances on mobile and desktop and stays within bounds", () => {
  for (const width of [288, 343, 780, 1024]) {
    const { left, right } = puppyBounds(width);
    assert.ok(right - left >= 70);
    assert.ok(left >= 0 && right + 44 <= width);
    for (const current of [left, (left + right) / 2, right]) {
      for (const random of [0, 0.5, 1]) {
        const next = nextPuppyDestination(current, width, random);
        assert.ok(next >= left && next <= right);
        assert.ok(Math.abs(next - current) >= (right - left) * 0.29);
      }
    }
  }
});

test("small layouts remain bounded and an ignored treat is not permanent", () => {
  const { left, right } = puppyBounds(80);
  assert.ok(left >= 0 && right + 44 <= 80);
  assert.equal(treatOfferDuration, 8000);
});

test("treat offers start on the first click and repeat without a once-per-session restriction", async () => {
  assert.equal(shouldOfferTreat(0), false);
  assert.deepEqual([1, 2, 3].map(shouldOfferTreat), [true, false, false]);
  assert.deepEqual([4, 5, 8, 10, 12].map(shouldOfferTreat), [
    true,
    false,
    true,
    false,
    true,
  ]);
  assert.equal(puppyMessages.treats[0], "Treat please?");
  const component = await readFile(
    "src/components/animations/PetDog.tsx",
    "utf8",
  );
  assert.match(component, /showBone \|\| shouldOfferTreat\(clicks.current\)/);
  assert.match(
    component,
    /clicks.current <= 3 \? boneMessages\[0\] : pick\(boneMessages\)/,
  );
  assert.doesNotMatch(component, /sessionBoneReceived|\bsetFed\b|!fed/);
  assert.match(component, /localStorage.setItem\("boneReceived", "true"\)/);
});

test("all puppy copy stays short and avoids retired portfolio easter-egg prompts", () => {
  const collectStrings = (value) =>
    typeof value === "string"
      ? [value]
      : typeof value === "object" && value !== null
        ? Object.values(value).flatMap(collectStrings)
        : [];
  const messages = collectStrings(puppyMessages);
  assert.ok(messages.length >= 40);
  assert.equal(new Set(messages).size, messages.length);
  for (const message of messages) {
    assert.ok(message.length <= 44, message);
    assert.doesNotMatch(
      message,
      /easter|eggs?\b|diary|confetti|dog mode|unlock|\d+\/\d+|click.*name|secret hunt/i,
    );
  }
  assert.ok(puppyMessages.pets.some((text) => text.includes("questions")));
  assert.ok(puppyMessages.pets.some((text) => text.includes("Lily")));
  assert.equal(puppyMessages.tenthPet, "Ten pets. A very good meeting.");
});

test("puppy interactions use the current message catalogue, including the old tenth-click branch", async () => {
  const component = await readFile(
    "src/components/animations/PetDog.tsx",
    "utf8",
  );
  assert.match(
    component,
    /clicks\.current === 10[\s\S]*?display\(puppyMessages\.tenthPet\)/,
  );
  assert.match(component, /pick\(boneMessages\)/);
  assert.match(component, /display\(pick\(happyMessages\)\)/);
  assert.doesNotMatch(
    component,
    /easter|confetti|dog mode|Try clicking the name/i,
  );
  assert.ok(puppyMessages.treats.length >= 4);
  assert.ok(puppyMessages.fed.length >= 4);
});
