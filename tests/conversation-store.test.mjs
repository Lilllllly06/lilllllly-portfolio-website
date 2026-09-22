import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";

const bundle = await build({
  entryPoints: ["src/lib/conversation-store.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const {
  conversationReducer: reduce,
  emptyStore,
  readConversationStore,
} = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);
const answer = {
  title: "Answer",
  intro: "Approved answer",
  sections: [],
  sources: [],
  followUps: [],
  mode: "portfolio",
};
const turn = (id, question = "What did Lily build?") => ({
  id,
  question,
  answer,
  status: "complete",
  animate: false,
});
const ask = (state, conversationId, item, replaceId) =>
  reduce(state, { type: "ask", conversationId, turn: item, replaceId, now: 1 });

const excerpt = {
  documentId: "industry",
  page: 1,
  text: "Sidekick agent evaluation and GRPO training.",
};
test("resume quotes survive refresh in sent turns and remain scoped to each draft", () => {
  let state = reduce(emptyStore(), { type: "excerpt", value: excerpt });
  state = ask(state, "one", { ...turn("1", "Explain this"), excerpt });
  assert.equal(state.draftExcerpt, undefined);
  assert.equal(state.conversations[0].draftExcerpt, undefined);
  state = reduce(state, {
    type: "excerpt",
    value: { ...excerpt, documentId: "academic", page: 2 },
  });
  state = reduce(state, { type: "new" });
  assert.equal(state.draftExcerpt, undefined);
  state = ask(state, "two", turn("2"));
  const restored = readConversationStore(JSON.stringify(state), null);
  assert.deepEqual(restored.conversations[1].turns[0].excerpt, excerpt);
  assert.equal(restored.conversations[1].draftExcerpt.documentId, "academic");
  assert.equal(restored.conversations[0].draftExcerpt, undefined);
  state = reduce(restored, { type: "open", id: "one" });
  state = reduce(state, { type: "excerpt", value: undefined });
  assert.equal(state.conversations[1].draftExcerpt, undefined);
  assert.deepEqual(state.conversations[1].turns[0].excerpt, excerpt);
});

test("corrupt quote metadata is discarded without losing the conversation", () => {
  const state = ask(emptyStore(), "one", {
    ...turn("1"),
    excerpt: { ...excerpt, documentId: "javascript:bad" },
  });
  state.conversations[0].draftExcerpt = { ...excerpt, text: "x".repeat(1501) };
  const restored = readConversationStore(JSON.stringify(state), null);
  assert.equal(restored.conversations.length, 1);
  assert.equal(restored.conversations[0].turns[0].excerpt, undefined);
  assert.equal(restored.conversations[0].draftExcerpt, undefined);
});

test("regenerating a quoted answer does not consume a different unfinished draft", () => {
  let state = ask(emptyStore(), "one", { ...turn("1"), excerpt });
  state = reduce(state, { type: "draft", value: "A different question" });
  const nextExcerpt = { ...excerpt, documentId: "academic", page: 2 };
  state = reduce(state, { type: "excerpt", value: nextExcerpt });
  state = ask(state, "one", { ...turn("replacement"), excerpt }, "1");
  assert.equal(state.conversations[0].draft, "A different question");
  assert.deepEqual(state.conversations[0].draftExcerpt, nextExcerpt);
  assert.deepEqual(state.conversations[0].turns[0].excerpt, excerpt);
});

test("new conversation keeps prior turns and reopening restores the full chat", () => {
  let state = ask(emptyStore(), "one", turn("1"));
  state = ask(state, "one", turn("2", "And what did she learn?"));
  state = reduce(state, { type: "draft", value: "A follow-up draft" });
  state = reduce(state, { type: "new" });
  assert.equal(state.activeId, null);
  assert.equal(state.conversations.length, 1);
  state = ask(state, "two", turn("3", "What are her hobbies?"));
  state = reduce(state, { type: "open", id: "one" });
  assert.equal(state.activeId, "one");
  assert.deepEqual(
    state.conversations
      .find((chat) => chat.id === "one")
      .turns.map((item) => item.id),
    ["1", "2"],
  );
  assert.equal(
    state.conversations.find((chat) => chat.id === "one").draft,
    "A follow-up draft",
  );
  assert.equal(state.conversations.length, 2);
});

test("refresh preserves multiple chats, selected chat, and each draft", () => {
  let state = ask(emptyStore(), "one", turn("1"));
  state = reduce(state, { type: "draft", value: "First draft" });
  state = reduce(state, { type: "new" });
  state = ask(state, "two", turn("2"));
  state = reduce(state, { type: "draft", value: "Second draft" });
  const restored = readConversationStore(JSON.stringify(state), null);
  assert.equal(restored.activeId, "two");
  assert.deepEqual(
    restored.conversations.map((chat) => chat.draft),
    ["Second draft", "First draft"],
  );
});

test("legacy session history migrates without losing turns", () => {
  const legacy = Array.from({ length: 25 }, (_, index) => turn(String(index)));
  const restored = readConversationStore(null, JSON.stringify(legacy));
  assert.equal(restored.conversations[0].turns.length, 25);
  assert.equal(restored.activeId, "legacy-0");
  assert.ok(restored.conversations[0].turns.every((item) => !item.animate));
});

test("new or reopened conversations do not create empty duplicates", () => {
  let state = ask(emptyStore(), "one", turn("1"));
  for (let index = 0; index < 4; index++)
    state = reduce(state, { type: "new" });
  assert.equal(state.conversations.length, 1);
  assert.equal(reduce(state, { type: "open", id: "missing" }), state);
  assert.equal(
    reduce(state, { type: "open", id: "one" }).conversations.length,
    1,
  );
});

test("switching during a response preserves partial text and stops it", () => {
  let state = ask(emptyStore(), "one", {
    ...turn("1"),
    status: "streaming",
    answer: { ...answer, prose: "Partial answer" },
  });
  state = reduce(state, { type: "stop", conversationId: "one", turnId: "1" });
  state = reduce(state, { type: "new" });
  state = ask(state, "two", turn("2"));
  assert.equal(state.conversations[1].turns[0].status, "stopped");
  assert.equal(state.conversations[1].turns[0].answer.prose, "Partial answer");
  state = reduce(state, {
    type: "update",
    conversationId: "one",
    turnId: "1",
    patch: { animate: false },
  });
  assert.equal(state.conversations[0].turns[0].id, "2");
});

test("refresh marks unfinished responses stopped rather than complete or reissuing them", () => {
  for (const status of ["waiting", "streaming"]) {
    const state = ask(emptyStore(), "one", {
      ...turn("1"),
      status,
      animate: true,
    });
    const restored = readConversationStore(JSON.stringify(state), null);
    assert.equal(restored.conversations[0].turns[0].status, "stopped");
    assert.equal(restored.conversations[0].turns[0].animate, false);
  }
});

test("regeneration replaces only its target conversation and history is not capped at twenty", () => {
  let state = emptyStore();
  for (let index = 0; index < 25; index++)
    state = ask(state, "one", turn(String(index)));
  state = ask(state, "two", turn("other"));
  state = ask(state, "one", turn("replacement"), "24");
  assert.equal(state.conversations[0].turns.length, 25);
  assert.equal(state.conversations[0].turns.at(-1).id, "replacement");
  assert.equal(state.conversations[1].turns[0].id, "other");
});

test("deleting the active chat preserves others and does not resurrect legacy data", () => {
  let state = ask(emptyStore(), "one", turn("1"));
  state = ask(state, "two", turn("2"));
  state = reduce(state, { type: "delete", id: "two" });
  assert.equal(state.activeId, null);
  assert.equal(state.conversations.length, 1);
  state = reduce(state, { type: "delete", id: "one" });
  assert.deepEqual(
    readConversationStore(JSON.stringify(state), JSON.stringify([turn("old")])),
    emptyStore(),
  );
});

test("saved source links are rebuilt from approved sources, and corrupt storage is safe", () => {
  const state = ask(emptyStore(), "one", {
    ...turn("1"),
    answer: {
      ...answer,
      sources: [
        { id: "profile", href: "javascript:alert(1)" },
        { id: "invented", href: "https://example.com" },
      ],
    },
  });
  const restored = readConversationStore(JSON.stringify(state), null);
  assert.deepEqual(
    restored.conversations[0].turns[0].answer.sources.map(
      (source) => source.href,
    ),
    ["/manual"],
  );
  for (const saved of [
    "not JSON",
    "null",
    "{}",
    '{"version":2,"conversations":[null]}',
  ])
    assert.deepEqual(readConversationStore(saved, null), emptyStore());
});
