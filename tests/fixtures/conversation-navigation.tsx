import { useCallback, useReducer, useRef, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConversationContext } from "@/components/workspace/conversation-context";
import ResumeProvider from "@/components/workspace/ResumeProvider";
import WorkspaceLayout from "@/components/workspace/WorkspaceLayout";
import Index from "@/pages/Index";
import Projects from "@/pages/Projects";
import { conversationReducer, emptyStore, type ConversationStore } from "@/lib/conversation-store";
import type { PortfolioAnswer } from "@/lib/portfolio-answer";
import type { ResumeExcerpt } from "@/lib/resume";
import "@fontsource-variable/open-sans";
import "@/index.css";
import "@/workspace.css";

const answer: PortfolioAnswer = {
  title: "Fixture answer", intro: "An in-memory test answer. No model request was sent.",
  sections: [], sources: [], followUps: [], mode: "portfolio",
};
const initial: ConversationStore = {
  ...emptyStore(), activeId: "fixture-two",
  conversations: ["two", "one"].map((id) => ({
    id: `fixture-${id}`, title: `Fixture ${id} question`, updatedAt: 1,
    draft: `Unsent ${id} draft`,
    turns: [{
      id: `turn-${id}`, question: `Fixture ${id} question`, answer,
      status: id === "two" ? "streaming" : "complete", animate: false,
    }],
  })),
};

// Exercise the production navigation and chat UI without storage or network access.
function FixtureConversations({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(conversationReducer, initial);
  const current = useRef(state);
  current.current = state;
  const chat = state.conversations.find((item) => item.id === state.activeId);
  const stop = useCallback(() => {
    const active = current.current.conversations.find((item) => item.id === current.current.activeId);
    if (active) dispatch({ type: "stop", conversationId: active.id, turnId: active.turns.at(-1)!.id });
  }, []);
  const reset = useCallback(() => { stop(); dispatch({ type: "new" }); }, [stop]);
  const openConversation = useCallback((id: string) => { stop(); dispatch({ type: "open", id }); }, [stop]);
  const deleteConversation = useCallback((id: string) => dispatch({ type: "delete", id }), []);
  const setDraft = useCallback((value: string) => dispatch({ type: "draft", value }), []);
  const setDraftExcerpt = useCallback((value?: ResumeExcerpt) => dispatch({ type: "excerpt", value }), []);
  const settleAnimation = useCallback(() => {}, []);
  const ask = useCallback(async (question: string) => {
    dispatch({ type: "ask", conversationId: current.current.activeId || crypto.randomUUID(),
      turn: { id: crypto.randomUUID(), question, answer, status: "complete", animate: false }, now: 1 });
  }, []);
  return (
    <ConversationContext.Provider value={{
      turns: chat?.turns || [], conversations: state.conversations,
      activeConversationId: state.activeId, draft: chat?.draft ?? state.draft,
      draftExcerpt: chat ? chat.draftExcerpt : state.draftExcerpt,
      pending: chat?.turns.some((turn) => turn.status === "streaming") ? "Fixture stream" : "",
      configured: false, storageWarning: "", stop, reset, openConversation,
      deleteConversation, setDraft, setDraftExcerpt, settleAnimation, ask,
    }}>
      {children}
    </ConversationContext.Provider>
  );
}

function RouteStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <aside aria-label="Fixture navigation" style={{ position: "fixed", right: 8, bottom: 8, zIndex: 100, padding: 8, background: "#fff", border: "1px solid #ddd", color: "#262626", fontSize: 12 }}>
      <output aria-label="Fixture route">{location.pathname}{location.search}</output>
      <button onClick={() => navigate(-1)} style={{ marginLeft: 12 }}>Fixture Back</button>
      <button onClick={() => navigate(1)} style={{ marginLeft: 12 }}>Fixture Forward</button>
    </aside>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <ThemeProvider attribute="class" forcedTheme="light">
    <TooltipProvider>
      <MemoryRouter initialEntries={["/?chat=fixture-two"]} future={{ v7_startTransition: true }}>
        <FixtureConversations>
          <ResumeProvider>
            <Routes>
              <Route element={<WorkspaceLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/projects" element={<Projects />} />
              </Route>
            </Routes>
            <RouteStatus />
          </ResumeProvider>
        </FixtureConversations>
      </MemoryRouter>
    </TooltipProvider>
  </ThemeProvider>,
);

if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
