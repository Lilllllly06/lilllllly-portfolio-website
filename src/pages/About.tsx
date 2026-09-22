import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";
import { workExperiences } from "@/data/experience";
import { careerContext } from "@/data/career-context";
import { useResume } from "@/components/workspace/resume-context";
import usePageAnchor from "@/hooks/use-page-anchor";

export default function About() {
  const { openResume } = useResume();
  usePageAnchor();
  return (
    <div className="workspace-page experience-page">
      <header className="page-heading">
        <p className="micro-label">
          <BriefcaseBusiness size={14} /> Experience
        </p>
        <h1>Work experience</h1>
        <p>
          AI systems, merchant-facing software, and the infrastructure behind
          them.
        </p>
        <button
          className="text-action"
          onClick={() => openResume()}
          aria-haspopup="dialog"
        >
          Open industry resume <ArrowUpRight size={15} />
        </button>
      </header>
      <section className="impact-strip" aria-label="Impact highlights">
        <div>
          <strong>
            43.4% <span>to</span> 87%
          </strong>
          <p>Sidekick subagent test pass rate</p>
          <small>Shopify / Agentic reinforcement learning</small>
        </div>
        <div>
          <strong>
            &lt; 30 <span>sec</span>
          </strong>
          <p>Merchant device activation</p>
          <small>Shopify / Down from about 5 minutes</small>
        </div>
        <div>
          <strong>
            20+ <span>hrs / week</span>
          </strong>
          <p>Saved through reporting automation</p>
          <small>AGF Investments / Across 4 departments</small>
        </div>
      </section>
      <div className="experience-list">
        {workExperiences.map((role, i) => (
          <article key={role.id} id={role.id} className="experience-entry">
            <div className="experience-date">
              <span className="micro-label">{role.date}</span>
              <span>{role.role}</span>
            </div>
            <div className="experience-body">
              <div className="experience-title">
                <div>
                  <p className="experience-company">{role.company}</p>
                  <h2>{role.title}</h2>
                </div>
                <span className="entry-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="experience-focus">{role.focus}</p>
              <ul>
                {role.description.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
              <p className="technology-line">{role.skills.join(" / ")}</p>
            </div>
          </article>
        ))}
      </div>
      <section id="sidekick-story" className="career-story">
        <p className="micro-label">Shopify Sidekick</p>
        <h2>My first reinforcement learning project</h2>
        {careerContext
          .find((item) => item.id === "sidekick-story")!
          .paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
      </section>
      <div className="page-end">
        <p>Want to connect the dots?</p>
        <Link
          to="/?ask=What%20are%20Lily%27s%20strongest%20engineering%20skills%3F"
          className="text-action"
        >
          Ask about my experience <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
