import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { profile } from "@/data/profile";
import { skills } from "@/data/experience";
import { personalFacts } from "@/data/personal";
import { sourceNoteFromHash } from "@/lib/manual-notes";
import usePageAnchor from "@/hooks/use-page-anchor";
import { useResume } from "@/components/workspace/resume-context";
import CareerNotes from "@/components/workspace/CareerNotes";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Manual() {
  const { openResume } = useResume();
  const location = useLocation();
  const navigate = useNavigate();
  const heading = useRef<HTMLHeadingElement>(null);
  const sourceNote = sourceNoteFromHash(location.hash);
  usePageAnchor();
  return (
    <div className="workspace-page manual-page">
      <header className="page-heading">
        <p className="micro-label">
          <BookOpen size={14} /> The manual
        </p>
        <h1 ref={heading} tabIndex={-1}>
          The details, in one place.
        </h1>
        <p>Yuezhen (Lily) Dong. Engineer, researcher, and curious person.</p>
      </header>
      <section className="manual-documents" aria-label="Resume and CV">
        {[
          {
            title: "Industry resume",
            subtitle:
              "Engineering experience, selected projects, and technical skills.",
            id: "industry" as const,
            label: "01 / INDUSTRY",
          },
          {
            title: "Academic CV",
            subtitle: "Research, education, and experimental work.",
            id: "academic" as const,
            label: "02 / ACADEMIC",
          },
        ].map((doc) => (
          <button
            className="manual-document"
            onClick={() => openResume(doc.id)}
            key={doc.title}
            aria-haspopup="dialog"
          >
            <div className="document-cover">
              <span className="micro-label">{doc.label}</span>
              <FileText size={42} strokeWidth={1} />
              <span className="document-signature">
                Yuezhen
                <br />
                Dong<span>.</span>
              </span>
              <span className="micro-label">
                PDF DOCUMENT <ArrowUpRight size={17} />
              </span>
            </div>
            <h2>
              {doc.title}
              <ArrowUpRight size={18} />
            </h2>
            <p>{doc.subtitle}</p>
          </button>
        ))}
      </section>
      <section className="manual-education">
        <p className="micro-label">Education</p>
        <div>
          <h2>University of Waterloo</h2>
          <p>{profile.program}</p>
          <p className="muted-text">
            International Baccalaureate Diploma Programme graduate
          </p>
        </div>
      </section>
      <section id="toolkit" className="manual-toolkit">
        <p className="micro-label">Technical toolkit</p>
        {Object.entries(skills).map(([label, items]) => (
          <div key={label}>
            <h3>{label}</h3>
            <p>{items.join(" / ")}</p>
          </div>
        ))}
      </section>
      <CareerNotes />
      <section id="personal" className="manual-personal">
        <p className="micro-label">Outside work</p>
        <h2>A little more Lily.</h2>
        {personalFacts.map((fact) => (
          <div key={fact.id}>
            <h3>{fact.topic}</h3>
            <p>{fact.detail}</p>
          </div>
        ))}
      </section>
      <section className="manual-contact">
        <div>
          <p className="micro-label">Contact</p>
          <h2>Let's compare notes.</h2>
        </div>
        <div>
          <a href={`mailto:${profile.email}`}>
            <Mail size={17} />
            {profile.email}
            <ArrowUpRight size={15} />
          </a>
          <a href={profile.githubUrl} target="_blank" rel="noreferrer">
            <Github size={17} />
            GitHub
            <ArrowUpRight size={15} />
          </a>
          <a href={profile.linkedInUrl} target="_blank" rel="noreferrer">
            <Linkedin size={17} />
            LinkedIn
            <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      <Dialog
        open={Boolean(sourceNote)}
        onOpenChange={(open) => {
          if (!open)
            navigate(
              {
                pathname: location.pathname,
                search: location.search,
                hash: "",
              },
              { replace: true, state: location.state },
            );
        }}
      >
        {sourceNote && (
          <DialogContent
            className="manual-source-note"
            aria-describedby={undefined}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              heading.current?.focus({ preventScroll: true });
            }}
          >
            <p className="micro-label">Source note</p>
            <DialogTitle>{sourceNote.title}</DialogTitle>
            {sourceNote.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
