import { ArrowUpRight, Medal, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { achievements } from "@/data/experience";
import { projects } from "@/data/projects";
import usePageAnchor from "@/hooks/use-page-anchor";

export default function Recognition() {
  usePageAnchor();
  return (
    <div className="workspace-page recognition-page">
      <header className="page-heading">
        <p className="micro-label">
          <Medal size={14} /> Recognition
        </p>
        <h1>Awards &amp; competitions</h1>
        <p>
          A few milestones in experimental physics and collaborative
          engineering.
        </p>
      </header>
      <div className="awards-list">
        {achievements.map((award, i) => (
          <article className="award-entry" key={award.id} id={award.id}>
            <span
              className={`award-emblem award-${award.trophyTone}`}
              aria-hidden="true"
            >
              <Trophy size={32} strokeWidth={1.25} />
            </span>
            <div>
              <p className="micro-label">
                {award.short} / {award.kind}
              </p>
              <h2>{award.title}</h2>
              <h3>{award.organization}</h3>
              <p>{award.detail}</p>
            </div>
            <span className="entry-index">0{i + 1}</span>
          </article>
        ))}
      </div>
      <section className="recognition-research">
        <div className="section-line">
          <div>
            <p className="micro-label">Selected projects</p>
            <h2>Experimental research</h2>
          </div>
          <Link to="/projects?category=Research" className="text-action">
            All research <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="research-shortlist">
          {["marangoni-flow", "magnetostriction", "faraday-waves"].map((id) => {
            const p = projects.find((item) => item.id === id)!;
            return (
              <Link
                to={`/project/${id}`}
                key={id}
                state={{ fromProjects: "/projects?category=Research" }}
              >
                <img src={p.image} alt="" loading="lazy" />
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <span>
                    Research report <ArrowUpRight size={13} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
