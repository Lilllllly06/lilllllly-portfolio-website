import {
  useCallback,
  useEffect,
  useRef,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  answerPortfolio,
  answerText,
  withoutCitations,
  type PortfolioAnswer,
} from "@/lib/portfolio-answer";
import { readChatStream } from "@/lib/chat-stream";
import {
  questionForNotes,
  questionWithExcerpt,
  type ResumeExcerpt,
} from "@/lib/resume";
import {
  conversationReducer,
  conversationStorageKey,
  emptyStore,
  legacyConversationKey,
  readConversationStore,
} from "@/lib/conversation-store";
import { ConversationContext, type Turn } from "./conversation-context";

function readConversation() {
  try {
    return readConversationStore(
      sessionStorage.getItem(conversationStorageKey),
      sessionStorage.getItem(legacyConversationKey),
    );
  } catch {
    try {
      return readConversationStore(
        null,
        sessionStorage.getItem(legacyConversationKey),
      );
    } catch {
      return emptyStore();
    }
  }
}

const emptyAnswer: PortfolioAnswer = {
  title: "Lily's portfolio",
  intro: "",
  sections: [],
  sources: [],
  followUps: [],
  mode: "model",
  prose: "",
};

export default function ConversationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    conversationReducer,
    undefined,
    readConversation,
  );
  const activeConversation = state.conversations.find(
    (chat) => chat.id === state.activeId,
  );
  const turns = activeConversation?.turns || [];
  const stateRef = useRef(state);
  stateRef.current = state;
  const [storageWarning, setStorageWarning] = useState("");
  const [pending, setPending] = useState("");
  const [configured, setConfigured] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const activeId = useRef("");
  const requestConversationId = useRef("");
  useEffect(() => {
    const request = new AbortController();
    void fetch("/api/chat", { signal: request.signal })
      .then((r) => r.json())
      .then((result) => setConfigured(result.configured === true))
      .catch(() => {});
    return () => {
      request.abort();
      controller.current?.abort();
    };
  }, []);
  const persist = useCallback(() => {
    try {
      sessionStorage.setItem(
        conversationStorageKey,
        JSON.stringify(stateRef.current),
      );
      sessionStorage.removeItem(legacyConversationKey);
      setStorageWarning("");
    } catch {
      setStorageWarning(
        "Chat history could not be saved in this tab. Keep this page open to retain it.",
      );
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(persist, 150);
    return () => window.clearTimeout(timer);
  }, [state, persist]);
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") persist();
    };
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [persist]);
  const stop = useCallback(() => {
    const stoppedId = activeId.current;
    controller.current?.abort();
    controller.current = null;
    dispatch({
      type: "stop",
      conversationId: requestConversationId.current,
      turnId: stoppedId,
    });
    setPending("");
  }, []);
  const reset = useCallback(() => {
    stop();
    dispatch({ type: "new" });
  }, [stop]);
  const openConversation = useCallback(
    (id: string) => {
      if (
        stateRef.current.activeId === id ||
        !stateRef.current.conversations.some((chat) => chat.id === id)
      )
        return;
      stop();
      dispatch({ type: "open", id });
    },
    [stop],
  );
  const deleteConversation = useCallback(
    (id: string) => {
      if (stateRef.current.activeId === id) stop();
      dispatch({ type: "delete", id });
    },
    [stop],
  );
  const setDraft = useCallback(
    (value: string) => dispatch({ type: "draft", value }),
    [],
  );
  const settleAnimation = useCallback(
    (id: string) =>
      dispatch({
        type: "update",
        conversationId: stateRef.current.activeId || "",
        turnId: id,
        patch: { animate: false },
      }),
    [],
  );
  const setDraftExcerpt = useCallback(
    (value?: ResumeExcerpt) => dispatch({ type: "excerpt", value }),
    [],
  );
  const ask = useCallback(async (input: string, replaceId?: string) => {
    const question = input.trim().slice(0, 2000);
    if (!question || controller.current) return;
    const active = new AbortController();
    const id = crypto.randomUUID();
    activeId.current = id;
    controller.current = active;
    const current = stateRef.current;
    const conversationId = current.activeId || crypto.randomUUID();
    requestConversationId.current = conversationId;
    const turns =
      current.conversations.find((chat) => chat.id === conversationId)?.turns ||
      [];
    const previousTurns = replaceId
      ? turns.slice(
          0,
          Math.max(
            0,
            turns.findIndex((t) => t.id === replaceId),
          ),
        )
      : turns;
    const excerpt = replaceId
      ? turns.find((turn) => turn.id === replaceId)?.excerpt
      : current.activeId
        ? current.conversations.find((chat) => chat.id === current.activeId)
            ?.draftExcerpt
        : current.draftExcerpt;
    const nextTurn: Turn = {
      id,
      question,
      ...(excerpt ? { excerpt } : {}),
      answer: { ...emptyAnswer },
      status: "waiting",
      animate: true,
    };
    dispatch({
      type: "ask",
      conversationId,
      turn: nextTurn,
      replaceId,
      now: Date.now(),
    });
    setPending(question);
    const update = (patch: Partial<Turn>) => {
      if (controller.current === active)
        dispatch({ type: "update", conversationId, turnId: id, patch });
    };
    const timer = window.setTimeout(() => active.abort("timeout"), 30000);
    let rawText = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: active.signal,
        body: JSON.stringify({
          question,
          excerpt,
          stream: true,
          history: previousTurns
            .filter((t) => t.status !== "stopped")
            .slice(-5)
            .flatMap((t) => [
              {
                role: "user",
                content: questionWithExcerpt(t.question, t.excerpt),
              },
              {
                role: "assistant",
                content: answerText(t.answer).slice(0, 6000),
              },
            ]),
        }),
      });
      if (!response.ok || !response.body)
        throw new Error("Assistant unavailable");
      if (
        !response.headers.get("content-type")?.includes("application/x-ndjson")
      )
        throw new Error("Invalid response type");
      for await (const event of readChatStream(response.body)) {
        if (controller.current !== active) break;
        if (event.type === "delta") {
          rawText += event.text;
          if (rawText.length > 18000) throw new Error("Response limit reached");
          update({
            status: "streaming",
            answer: {
              ...emptyAnswer,
              prose: withoutCitations(rawText, true),
            },
          });
        }
        if (event.type === "complete" || event.type === "fallback")
          update({ status: "complete", answer: event.answer });
      }
    } catch {
      if (controller.current !== active) return;
      update({
        status: "complete",
        answer: {
          ...answerPortfolio(
            questionForNotes(question, excerpt),
            questionForNotes(
              previousTurns.at(-1)?.question || "",
              previousTurns.at(-1)?.excerpt,
            ),
          ),
          notice:
            "The connection is unavailable. This answer uses verified portfolio notes.",
        },
      });
    } finally {
      window.clearTimeout(timer);
    }
    if (controller.current === active) {
      controller.current = null;
      setPending("");
    }
  }, []);
  return (
    <ConversationContext.Provider
      value={{
        turns,
        conversations: state.conversations,
        activeConversationId: state.activeId,
        draft: activeConversation?.draft ?? state.draft,
        setDraft,
        draftExcerpt: activeConversation
          ? activeConversation.draftExcerpt
          : state.draftExcerpt,
        setDraftExcerpt,
        openConversation,
        deleteConversation,
        storageWarning,
        pending,
        configured,
        ask,
        reset,
        stop,
        settleAnimation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
