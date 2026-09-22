import { createContext, useContext } from "react";
import type { Conversation, Turn } from "@/lib/conversation-store";
import type { ResumeExcerpt } from "@/lib/resume";
export type { Turn } from "@/lib/conversation-store";

export const ConversationContext = createContext<{
  turns: Turn[];
  conversations: Conversation[];
  activeConversationId: string | null;
  draft: string;
  setDraft: (value: string) => void;
  draftExcerpt?: ResumeExcerpt;
  setDraftExcerpt: (value?: ResumeExcerpt) => void;
  openConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  storageWarning: string;
  pending: string;
  configured: boolean;
  ask: (question: string, replaceId?: string) => Promise<void>;
  reset: () => void;
  stop: () => void;
  settleAnimation: (id: string) => void;
} | null>(null);
export function useConversation() {
  const value = useContext(ConversationContext);
  if (!value) throw new Error("ConversationProvider is missing");
  return value;
}
