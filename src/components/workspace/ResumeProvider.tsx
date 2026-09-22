import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import {
  readResumeView,
  type ResumeDocumentId,
  type ResumeExcerpt,
} from "@/lib/resume";
import { useConversation } from "./conversation-context";
import { ResumeContext } from "./resume-context";

export default function ResumeProvider({ children }: { children: ReactNode }) {
  const [composerFocusRequest, setComposerFocusRequest] = useState(0);
  const opener = useRef<HTMLElement | null>(null);
  const originScroll = useRef({ x: 0, y: 0 });
  const focusComposerAfterClose = useRef(false);
  const { activeConversationId, setDraftExcerpt } = useConversation();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const view = useMemo(() => readResumeView(location.state), [location.state]);
  const documentId = view?.documentId ?? null;
  const page = view?.page ?? 1;
  const previousView = useRef(view);
  const returnLabel =
    view?.returnPath === "/manual"
      ? "Return to the manual"
      : view?.returnPath === "/"
        ? "Return to chat"
        : "Return to the page";
  useEffect(() => {
    const previous = previousView.current;
    previousView.current = view;
    if (!previous || view) return;
    if (focusComposerAfterClose.current) {
      focusComposerAfterClose.current = false;
      setComposerFocusRequest((count) => count + 1);
      return;
    }
    if (navigationType !== "POP" || location.pathname !== previous.returnPath)
      return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({
        left: originScroll.current.x,
        top: originScroll.current.y,
        behavior: "instant",
      });
      if (opener.current?.isConnected)
        opener.current.focus({ preventScroll: true });
      else
        document
          .querySelector<HTMLButtonElement>(".topbar-resume")
          ?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [view, location.pathname, navigationType]);
  const openResume = useCallback(
    (id: ResumeDocumentId = "industry", page = 1) => {
      if (!view) {
        opener.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        originScroll.current = { x: window.scrollX, y: window.scrollY };
      }
      // One history entry per opening; document/page changes stay in the viewer.
      navigate(location, {
        replace: Boolean(view),
        state: {
          ...location.state,
          resumeViewer: {
            documentId: id,
            page,
            returnPath: view?.returnPath ?? location.pathname,
          },
        },
      });
    },
    [location, navigate, view],
  );
  const setPage = useCallback(
    (nextPage: number) => {
      if (documentId) openResume(documentId, nextPage);
    },
    [documentId, openResume],
  );
  const closeResume = useCallback(() => {
    if (view) navigate(-1);
  }, [navigate, view]);
  const quoteResume = useCallback(
    (excerpt: ResumeExcerpt, fullscreen: boolean) => {
      setDraftExcerpt(excerpt);
      if (location.pathname !== "/") {
        navigate(
          activeConversationId
            ? `/?chat=${encodeURIComponent(activeConversationId)}`
            : "/",
          { replace: true, state: fullscreen ? null : location.state },
        );
      } else if (fullscreen) {
        focusComposerAfterClose.current = true;
        closeResume();
        return;
      }
      setComposerFocusRequest((count) => count + 1);
    },
    [activeConversationId, closeResume, location, navigate, setDraftExcerpt],
  );
  return (
    <ResumeContext.Provider
      value={{
        documentId,
        page,
        setPage,
        openResume,
        closeResume,
        returnLabel,
        quoteResume,
        composerFocusRequest,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}
