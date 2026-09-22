import { portfolioSources, type PortfolioAnswer } from "./portfolio-answer";
import { readResumeExcerpt, type ResumeExcerpt } from "./resume";

export interface Turn {
  id: string;
  question: string;
  excerpt?: ResumeExcerpt;
  answer: PortfolioAnswer;
  status?: "waiting" | "streaming" | "complete" | "stopped";
  animate?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  turns: Turn[];
  draft: string;
  draftExcerpt?: ResumeExcerpt;
}

export interface ConversationStore {
  version: 2;
  activeId: string | null;
  conversations: Conversation[];
  draft: string;
  draftExcerpt?: ResumeExcerpt;
}

export const conversationStorageKey = "lily-conversations-v2";
export const legacyConversationKey = "lily-conversation-v1";
export const emptyStore = (): ConversationStore => ({
  version: 2,
  activeId: null,
  conversations: [],
  draft: "",
});

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const stringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

function readTurn(value: unknown): Turn | null {
  if (
    !record(value) ||
    typeof value.id !== "string" ||
    typeof value.question !== "string"
  )
    return null;
  const answer = value.answer;
  if (
    !record(answer) ||
    typeof answer.title !== "string" ||
    typeof answer.intro !== "string" ||
    !Array.isArray(answer.sections) ||
    !answer.sections.every(
      (section) =>
        record(section) &&
        typeof section.title === "string" &&
        stringList(section.body),
    ) ||
    !Array.isArray(answer.sources) ||
    !stringList(answer.followUps) ||
    (answer.mode !== "model" && answer.mode !== "portfolio")
  )
    return null;
  const sourceIds = new Set(
    answer.sources.filter(record).map((source) => source.id),
  );
  return {
    id: value.id,
    question: value.question,
    ...(readResumeExcerpt(value.excerpt)
      ? { excerpt: readResumeExcerpt(value.excerpt) }
      : {}),
    status:
      value.status === "waiting" ||
      value.status === "streaming" ||
      value.status === "stopped"
        ? "stopped"
        : "complete",
    animate: false,
    answer: {
      title: answer.title,
      intro: answer.intro,
      sections: answer.sections as PortfolioAnswer["sections"],
      sources: portfolioSources.filter((source) => sourceIds.has(source.id)),
      followUps: answer.followUps,
      mode: answer.mode,
      ...(typeof answer.prose === "string" ? { prose: answer.prose } : {}),
      ...(typeof answer.notice === "string" ? { notice: answer.notice } : {}),
    },
  };
}

export function readConversationStore(
  saved: string | null,
  legacy: string | null,
): ConversationStore {
  try {
    const value: unknown = JSON.parse(saved || "null");
    if (
      record(value) &&
      value.version === 2 &&
      Array.isArray(value.conversations)
    ) {
      const ids = new Set<string>();
      const conversations: Conversation[] = value.conversations.flatMap(
        (item) => {
          if (
            !record(item) ||
            typeof item.id !== "string" ||
            ids.has(item.id) ||
            !Array.isArray(item.turns)
          )
            return [];
          const turns = item.turns
            .map(readTurn)
            .filter((turn): turn is Turn => Boolean(turn));
          if (!turns.length) return [];
          ids.add(item.id);
          return [
            {
              id: item.id,
              title: turns[0].question.slice(0, 90),
              updatedAt:
                typeof item.updatedAt === "number" &&
                Number.isFinite(item.updatedAt)
                  ? item.updatedAt
                  : 0,
              turns,
              draft:
                typeof item.draft === "string" ? item.draft.slice(0, 2000) : "",
              ...(readResumeExcerpt(item.draftExcerpt)
                ? { draftExcerpt: readResumeExcerpt(item.draftExcerpt) }
                : {}),
            },
          ];
        },
      );
      return {
        version: 2,
        activeId:
          typeof value.activeId === "string" && ids.has(value.activeId)
            ? value.activeId
            : null,
        conversations,
        draft:
          typeof value.draft === "string" ? value.draft.slice(0, 2000) : "",
        ...(readResumeExcerpt(value.draftExcerpt)
          ? { draftExcerpt: readResumeExcerpt(value.draftExcerpt) }
          : {}),
      };
    }
  } catch {
    /* Try the previous tab-scoped format if storage is damaged. */
  }
  try {
    const value: unknown = JSON.parse(legacy || "[]");
    const turns = Array.isArray(value)
      ? value.map(readTurn).filter((turn): turn is Turn => Boolean(turn))
      : [];
    if (turns.length) {
      const id = `legacy-${turns[0].id}`;
      return {
        version: 2,
        activeId: id,
        draft: "",
        conversations: [
          {
            id,
            title: turns[0].question.slice(0, 90),
            updatedAt: 0,
            turns,
            draft: "",
          },
        ],
      };
    }
  } catch {
    /* A blocked or corrupt store must not prevent a new chat. */
  }
  return emptyStore();
}

export type ConversationAction =
  | { type: "new" }
  | { type: "open"; id: string }
  | { type: "delete"; id: string }
  | { type: "draft"; value: string }
  | { type: "excerpt"; value?: ResumeExcerpt }
  | {
      type: "ask";
      conversationId: string;
      turn: Turn;
      replaceId?: string;
      now: number;
    }
  | {
      type: "update";
      conversationId: string;
      turnId: string;
      patch: Partial<Turn>;
    }
  | { type: "stop"; conversationId: string; turnId: string };

export function conversationReducer(
  state: ConversationStore,
  action: ConversationAction,
): ConversationStore {
  if (action.type === "new") return { ...state, activeId: null };
  if (action.type === "open")
    return state.conversations.some((chat) => chat.id === action.id)
      ? { ...state, activeId: action.id }
      : state;
  if (action.type === "delete")
    return {
      ...state,
      activeId: state.activeId === action.id ? null : state.activeId,
      conversations: state.conversations.filter(
        (chat) => chat.id !== action.id,
      ),
    };
  if (action.type === "draft")
    return state.activeId
      ? {
          ...state,
          conversations: state.conversations.map((chat) =>
            chat.id === state.activeId
              ? { ...chat, draft: action.value }
              : chat,
          ),
        }
      : { ...state, draft: action.value };
  if (action.type === "excerpt")
    return state.activeId
      ? {
          ...state,
          conversations: state.conversations.map((chat) =>
            chat.id === state.activeId
              ? { ...chat, draftExcerpt: action.value }
              : chat,
          ),
        }
      : { ...state, draftExcerpt: action.value };
  if (action.type === "ask") {
    const existing = state.conversations.find(
      (chat) => chat.id === action.conversationId,
    );
    const turns = existing?.turns || [];
    const replacementIndex = action.replaceId
      ? turns.findIndex((turn) => turn.id === action.replaceId)
      : -1;
    const nextTurns = [
      ...(replacementIndex >= 0 ? turns.slice(0, replacementIndex) : turns),
      action.turn,
    ];
    const chat: Conversation = {
      id: action.conversationId,
      title: nextTurns[0].question.slice(0, 90),
      turns: nextTurns,
      draft: replacementIndex >= 0 ? existing?.draft || "" : "",
      ...(replacementIndex >= 0 && existing?.draftExcerpt
        ? { draftExcerpt: existing.draftExcerpt }
        : {}),
      updatedAt: action.now,
    };
    return {
      ...state,
      activeId: chat.id,
      draft: state.activeId ? state.draft : "",
      draftExcerpt: state.activeId ? state.draftExcerpt : undefined,
      conversations: [
        chat,
        ...state.conversations.filter((item) => item.id !== chat.id),
      ],
    };
  }
  return {
    ...state,
    conversations: state.conversations.map((chat) =>
      chat.id !== action.conversationId
        ? chat
        : {
            ...chat,
            turns: chat.turns.map((turn) => {
              if (turn.id !== action.turnId) return turn;
              if (action.type === "stop")
                return turn.status === "waiting" || turn.status === "streaming"
                  ? { ...turn, status: "stopped", animate: false }
                  : turn;
              return { ...turn, ...action.patch };
            }),
          },
    ),
  };
}
