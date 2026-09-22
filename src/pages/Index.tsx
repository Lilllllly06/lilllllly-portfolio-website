import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Copy,
  FastForward,
  FileText,
  Medal,
  RotateCcw,
  Sparkles,
  Square,
  Trophy,
  X,
} from "lucide-react";
import {
  useConversation,
  type Turn,
} from "@/components/workspace/conversation-context";
import PetDog from "@/components/animations/PetDog";
import WaitingIndicator from "@/components/workspace/WaitingIndicator";
import usePromptSuggestions from "@/hooks/use-prompt-suggestions";
import useProgressiveText from "@/hooks/use-progressive-text";
import { answerText } from "@/lib/portfolio-answer";
import { projects } from "@/data/projects";
import { resumeDocuments } from "@/lib/resume";
import { useResume } from "@/components/workspace/resume-context";

const selected = ["asterfind", "temporal-maze", "ecoland"].map((id) =>
  projects.find((p) => p.id === id)!,
);

function Answer({
  turn,
  busy,
  latest,
}: {
  turn: Turn;
  busy: boolean;
  latest: boolean;
}) {
  const { ask, settleAnimation } = useConversation();
  const { openResume } = useResume();
  const [copyState, setCopyState] = useState("");
  const text = answerText(turn.answer);
  const { visible, revealing, finish } = useProgressiveText(
    text,
    Boolean(turn.animate),
  );
  const waiting = turn.status === "waiting";
  const streaming = turn.status === "streaming";
  useEffect(() => {
    if (turn.animate && !waiting && !streaming && !revealing)
      settleAnimation(turn.id);
  }, [turn.animate, turn.id, waiting, streaming, revealing, settleAnimation]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${text}\n\n${turn.answer.sources.map((s) => `${s.title}: ${new URL(s.href, window.location.origin).href}`).join("\n")}`,
      );
      setCopyState("Copied");
    } catch {
      setCopyState("Copy unavailable");
    }
  };
  return (
    <article
      className="conversation-turn"
      id={`turn-${turn.id}`}
      aria-label={`Question: ${turn.question}`}
    >
      <div className={`user-question ${turn.excerpt ? "has-excerpt" : ""}`}>
        {turn.excerpt && (
          <blockquote className="resume-quote sent-quote">
            <button
              className="quote-source"
              onClick={() =>
                openResume(turn.excerpt!.documentId, turn.excerpt!.page)
              }
            >
              <FileText size={14} />
              {resumeDocuments[turn.excerpt.documentId].title} · p.{" "}
              {turn.excerpt.page}
            </button>
            <p>{turn.excerpt.text}</p>
          </blockquote>
        )}
        <h2>{turn.question}</h2>
      </div>
      <div className="portfolio-response" aria-busy={waiting || streaming}>
        <div className="response-byline">
          <span className="response-symbol">L</span>
          <span>Lily's assistant</span>
          <span className="response-mode">
            {waiting
              ? ""
              : turn.answer.mode === "model"
                ? "AI"
                : "Portfolio notes"}
          </span>
        </div>
        {turn.answer.notice && (
          <p className="answer-notice">{turn.answer.notice}</p>
        )}
        {waiting ? (
          <WaitingIndicator seed={turn.id} />
        ) : (
          <div
            className={`answer-prose ${revealing || streaming ? "is-revealing" : ""}`}
          >
            <ReactMarkdown
              skipHtml
              components={{
                a: ({ children }) => <span>{children}</span>,
                img: () => null,
                h1: ({ children }) => <h3>{children}</h3>,
                h2: ({ children }) => <h3>{children}</h3>,
              }}
            >
              {visible}
            </ReactMarkdown>
          </div>
        )}
        {turn.status === "stopped" && (
          <p className="answer-notice">Response stopped.</p>
        )}
        {!waiting && !streaming && !revealing && (
          <>
            {turn.answer.sources.length > 0 && (
              <div className="answer-sources" aria-label="Answer sources">
                {turn.answer.sources.map((source) =>
                  source.href.startsWith("/") ? (
                    <Link key={source.id} to={source.href}>
                      <FileText size={14} />
                      {source.title}
                      <ArrowUpRight size={13} />
                    </Link>
                  ) : (
                    <a
                      key={source.id}
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText size={14} />
                      {source.title}
                      <ArrowUpRight size={13} />
                    </a>
                  ),
                )}
              </div>
            )}
            <div className="answer-actions">
              <button
                className="icon-button"
                onClick={copy}
                title="Copy answer"
                aria-label="Copy answer"
              >
                {copyState === "Copied" ? (
                  <Check size={17} />
                ) : (
                  <Copy size={17} />
                )}
              </button>
              {latest && (
                <button
                  className="icon-button"
                  disabled={busy}
                  onClick={() => void ask(turn.question, turn.id)}
                  title="Regenerate answer"
                  aria-label="Regenerate answer"
                >
                  <RotateCcw size={17} />
                </button>
              )}
              <span role="status">{copyState}</span>
            </div>
          </>
        )}
        {revealing && !streaming && (
          <button
            className="icon-button reveal-all"
            onClick={finish}
            title="Show full answer"
            aria-label="Show full answer"
          >
            <FastForward size={17} />
          </button>
        )}
      </div>
    </article>
  );
}

export default function Index() {
  const {
    turns,
    conversations,
    activeConversationId,
    draft: input,
    setDraft: setInput,
    draftExcerpt,
    setDraftExcerpt,
    openConversation,
    pending,
    configured,
    ask,
    stop,
  } = useConversation();
  const { openResume, composerFocusRequest } = useResume();
  const [booped, setBooped] = useState(false);
  const [params, setParams] = useSearchParams();
  const { state: navigationState } = useLocation();
  const handledAsk = useRef("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const [showScroll, setShowScroll] = useState(false);
  useEffect(() => {
    if (!composerFocusRequest) return;
    const frame = requestAnimationFrame(() => {
      textarea.current?.focus({ preventScroll: true });
      textarea.current?.scrollIntoView({ block: "center", behavior: "auto" });
    });
    return () => cancelAnimationFrame(frame);
  }, [composerFocusRequest]);
  const suggestions = usePromptSuggestions(
    Boolean(input || pending),
    Boolean(draftExcerpt),
  );
  const hasConversation = turns.length > 0;
  useEffect(() => {
    const turnId = params.get("turn");
    const chatId =
      params.get("chat") ||
      (turnId
        ? conversations.find((chat) =>
            chat.turns.some((turn) => turn.id === turnId),
          )?.id
        : null);
    if (
      chatId &&
      chatId !== activeConversationId &&
      conversations.some((chat) => chat.id === chatId)
    ) {
      openConversation(chatId);
      return;
    }
    const question = params.get("ask");
    if (question && !pending && handledAsk.current !== question) {
      handledAsk.current = question;
      void ask(question);
      setParams({}, { replace: true, state: navigationState });
    }
    if (!question && !chatId && activeConversationId)
      setParams(
        { chat: activeConversationId },
        { replace: true, state: navigationState },
      );
    if (turnId)
      document
        .getElementById(`turn-${turnId}`)
        ?.scrollIntoView({ block: "start" });
  }, [
    params,
    ask,
    setParams,
    pending,
    activeConversationId,
    conversations,
    openConversation,
    navigationState,
  ]);
  useEffect(() => {
    const last = turns[turns.length - 1];
    if (last?.status === "waiting")
      requestAnimationFrame(() =>
        document
          .getElementById(`turn-${last.id}`)
          ?.scrollIntoView({ block: "start", behavior: "auto" }),
      );
  }, [turns]);
  useEffect(() => {
    const update = () =>
      setShowScroll(
        window.scrollY + window.innerHeight <
          document.documentElement.scrollHeight - 320,
      );
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [turns.length]);
  useEffect(() => {
    if (textarea.current) {
      textarea.current.style.height = "auto";
      textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 176)}px`;
    }
  }, [input]);
  const submit = () => {
    if (!input.trim() || pending) return;
    void ask(input);
    setInput("");
  };
  const acceptSuggestion = () => {
    setInput(suggestions.prompt);
    textarea.current?.focus();
  };
  const boop = () => {
    setBooped(true);
    try {
      localStorage.setItem(
        "nameClickCount",
        String(Number(localStorage.getItem("nameClickCount") || 0) + 1),
      );
    } catch {
      /* Optional interaction. */
    }
  };
  return (
    <div
      className={`conversation-layout ${hasConversation ? "chat-started" : "chat-empty"}`}
    >
      <div className="conversation-column">
        {!hasConversation && (
          <header className="conversation-welcome">
            <h1>
              Hi, I&rsquo;m{" "}
              <button
                onClick={boop}
                className={booped ? "name-booped" : ""}
                title="Boop Lily's name"
                data-name-trigger
              >
                Lily.
              </button>
            </h1>
            <p className="welcome-identity">Yuezhen (Lily) Dong</p>
            <p>
              Computer Engineering at Waterloo.
              <br />
              Ask my assistant about me, or browse my projects below.
            </p>
          </header>
        )}
        {hasConversation && (
          <div className="conversation-history">
            {turns.map((turn, index) => (
              <Answer
                key={turn.id}
                turn={turn}
                busy={Boolean(pending)}
                latest={index === turns.length - 1}
              />
            ))}
            <div ref={end} />
          </div>
        )}
        <div className="composer-area">
          <div className="companion-track" aria-label="Lily's puppy">
            <PetDog />
          </div>
          {hasConversation && showScroll && (
            <button
              className="scroll-latest icon-button"
              aria-label="Scroll to latest response"
              title="Scroll to latest response"
              onClick={() =>
                end.current?.scrollIntoView({ block: "end", behavior: "auto" })
              }
            >
              <ArrowDown size={18} />
            </button>
          )}
          <form
            className="question-composer"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            {draftExcerpt && (
              <blockquote className="resume-quote draft-quote">
                <div>
                  <button
                    type="button"
                    className="quote-source"
                    onClick={() =>
                      openResume(draftExcerpt.documentId, draftExcerpt.page)
                    }
                  >
                    <FileText size={14} />
                    {resumeDocuments[draftExcerpt.documentId].title} · p.{" "}
                    {draftExcerpt.page}
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Remove selected passage"
                    title="Remove selected passage"
                    onClick={() => setDraftExcerpt(undefined)}
                  >
                    <X size={15} />
                  </button>
                </div>
                <p>{draftExcerpt.text}</p>
              </blockquote>
            )}
            <div className="composer-input">
              <label className="sr-only" htmlFor="portfolio-question">
                Ask about Lily
              </label>
              {!input && !pending && (
                <div className="animated-prompt" aria-hidden="true">
                  <span>{suggestions.text || "\u00a0"}</span>
                  <span className="prompt-caret" />
                </div>
              )}
              <textarea
                id="portfolio-question"
                ref={textarea}
                value={input}
                rows={2}
                maxLength={2000}
                aria-label="Ask about Lily"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (
                    e.key === "Tab" &&
                    !e.shiftKey &&
                    !e.altKey &&
                    !e.ctrlKey &&
                    !e.metaKey &&
                    !input &&
                    !pending
                  ) {
                    e.preventDefault();
                    acceptSuggestion();
                  }
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
            </div>
            <div className="composer-bottom">
              <div className="composer-tools">
                <button
                  type="button"
                  onClick={() => openResume()}
                  aria-haspopup="dialog"
                  className="composer-manual"
                  title="Open industry resume"
                >
                  <FileText size={18} />
                  Resume
                </button>
                {!input && !pending && (
                  <button
                    type="button"
                    className="suggestion-autofill"
                    onClick={acceptSuggestion}
                    title="Use the current suggestion (Tab)"
                    aria-label={`Use suggestion: ${suggestions.prompt}`}
                  >
                    <Sparkles size={16} />
                    <kbd>Tab</kbd>
                  </button>
                )}
              </div>
              {pending ? (
                <button
                  type="button"
                  className="send-question"
                  aria-label="Stop response"
                  title="Stop response"
                  onClick={stop}
                >
                  <Square size={17} fill="currentColor" />
                </button>
              ) : (
                <button
                  className="send-question"
                  disabled={!input.trim()}
                  aria-label="Send question"
                  title="Send question"
                >
                  <ArrowUp size={21} />
                </button>
              )}
            </div>
          </form>
          <p className="composer-caption">
            {configured
              ? "Questions go to the AI provider. Don't share sensitive information. Check sources."
              : "Portfolio notes mode. Live AI is not connected yet."}
          </p>
        </div>
        {!hasConversation && (
          <>
            <div className="suggested-prompts">
              <button
                onClick={() => void ask("What is Lily's work experience?")}
              >
                Work experience
              </button>
              <button onClick={() => void ask("Show me your best AI projects")}>
                Explore projects
              </button>
              <button
                onClick={() =>
                  void ask("Tell me about her research and awards")
                }
              >
                Research & awards
              </button>
            </div>
            <section
              className="home-highlights"
              aria-label="Experience and recognition"
            >
              <div className="home-role-list">
                <Link to="/about#meta">
                  <span>Meta</span>
                  <strong>Engineering Fellow</strong>
                </Link>
                <Link to="/about#shopify-2026">
                  <span>Shopify</span>
                  <strong>Software Engineering Intern</strong>
                </Link>
              </div>
              <div className="home-recognition" aria-label="Recognition">
                <Link to="/recognition#caypt" className="home-award">
                  <span
                    className="home-award-icon award-gold"
                    aria-hidden="true"
                  >
                    <Trophy size={20} />
                  </span>
                  <span className="home-award-copy">
                    <strong>National Champion & Team Captain</strong>
                    <span>CaYPT</span>
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
                <Link to="/recognition#iypt" className="home-award">
                  <span
                    className="home-award-icon award-bronze"
                    aria-hidden="true"
                  >
                    <Medal size={20} />
                  </span>
                  <span className="home-award-copy">
                    <strong>Bronze Medalist</strong>
                    <span>IYPT</span>
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </section>
            <section className="home-work">
              <div className="section-line">
                <h2>Selected work</h2>
                <Link to="/projects">
                  View all
                  <ArrowUpRight size={15} />
                </Link>
              </div>
              <div className="home-work-grid">
                {selected.map((project) => (
                  <Link
                    to={`/project/${project.id}`}
                    key={project.id}
                    className="home-work-item"
                  >
                    <div className="work-thumbnail">
                      <img
                        src={project.image}
                        alt={`${project.title} preview`}
                      />
                    </div>
                    <h3>
                      {project.id === "temporal-maze"
                        ? "Temporal Maze"
                        : project.title}
                    </h3>
                    <p>
                      {project.id === "asterfind"
                        ? "AI commerce"
                        : project.id === "temporal-maze"
                          ? "Temporal puzzle game"
                          : "Ecosystem simulation"}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
