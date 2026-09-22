import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  featuredNoteIds,
  manualNotes,
  notesById,
  noteTopics,
  noteViewFromHash,
} from "@/lib/manual-notes";

export default function CareerNotes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState(() => noteViewFromHash(location.hash));
  const browseButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const linkedView = noteViewFromHash(location.hash);
    if (linkedView.openNote) setView(linkedView);
  }, [location.hash]);

  useEffect(() => {
    const linkedView = noteViewFromHash(location.hash);
    if (!linkedView.openNote || linkedView.openNote !== view.openNote) return;
    // A cited answer may first need its topic mounted before scrolling to it.
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(linkedView.openNote)
        ?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash, view]);

  const clearNoteAnchor = () => {
    if (noteViewFromHash(location.hash).openNote)
      navigate(
        {
          pathname: location.pathname,
          search: location.search,
          hash: "#perspectives",
        },
        { replace: true, state: location.state },
      );
  };

  const toggleCollection = () => {
    setView((current) => ({
      expanded: !current.expanded,
      topic:
        noteTopics.find((item) => item.noteIds.includes(current.openNote))
          ?.id ?? current.topic,
      openNote: "",
    }));
    clearNoteAnchor();
    browseButton.current?.focus({ preventScroll: true });
  };

  const renderNotes = (ids: string[]) => (
    <Accordion
      type="single"
      collapsible
      value={view.openNote}
      onValueChange={(openNote) =>
        setView((current) => ({ ...current, openNote }))
      }
    >
      {notesById(ids).map((note) => (
        <AccordionItem key={note.id} value={note.id} id={note.id}>
          <AccordionTrigger className="note-question">
            {note.title}
          </AccordionTrigger>
          <AccordionContent>
            {note.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <section id="perspectives" className="career-story career-notes">
      <p className="micro-label">Behind the work</p>
      <h2>Motivation, decisions, and lessons.</h2>
      <div className="note-controls">
        <span>
          {view.expanded
            ? `${manualNotes.length} questions`
            : "Selected questions"}
        </span>
        <button
          ref={browseButton}
          className="note-browse-button"
          onClick={toggleCollection}
          aria-expanded={view.expanded}
          aria-controls="manual-note-collection"
        >
          {view.expanded && <ArrowLeft size={15} aria-hidden="true" />}
          {view.expanded ? "Featured questions" : "Explore all topics"}
          {!view.expanded && <ArrowRight size={15} aria-hidden="true" />}
        </button>
      </div>
      <div id="manual-note-collection">
        {view.expanded ? (
          <Tabs
            value={view.topic}
            onValueChange={(topic) => {
              setView({ expanded: true, topic, openNote: "" });
              clearNoteAnchor();
            }}
          >
            <TabsList className="note-topics" aria-label="Question topics">
              {noteTopics.map((topic) => (
                <TabsTrigger
                  className="note-topic"
                  key={topic.id}
                  value={topic.id}
                >
                  {topic.label}
                  <span>{topic.noteIds.length}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {noteTopics.map((topic) => (
              <TabsContent
                key={topic.id}
                value={topic.id}
                className="note-topic-content"
              >
                {renderNotes(topic.noteIds)}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          renderNotes(featuredNoteIds)
        )}
      </div>
    </section>
  );
}
