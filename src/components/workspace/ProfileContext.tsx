import { ArrowUpRight, Infinity as InfinityIcon, Medal } from "lucide-react";
import { Link } from "react-router-dom";
import { achievements } from "@/data/experience";

export default function ProfileContext() {
  return (
    <aside className="profile-context" aria-label="About Lily">
      <p className="micro-label">A little context</p>
      <div className="profile-monogram" aria-hidden="true">
        yd<span>.</span>
      </div>
      <h2>Yuezhen (Lily) Dong</h2>
      <p className="profile-discipline">
        Computer Engineering
        <br />
        <span>University of Waterloo</span>
      </p>
      <div className="context-section">
        <div className="context-section-title">
          <span className="micro-label">Experience</span>
          <Link to="/about" aria-label="All experience">
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <Link to="/about#meta" className="context-role">
          <span className="company-mark meta-mark">
            <InfinityIcon size={20} />
          </span>
          <span>
            <strong>Engineering Fellow</strong>
            <small>
              Meta <span>2026</span>
            </small>
          </span>
        </Link>
        <Link to="/about#shopify-2026" className="context-role">
          <span className="company-mark">S</span>
          <span>
            <strong>Software Engineering Intern</strong>
            <small>
              Shopify <span>2025 / 2026</span>
            </small>
          </span>
        </Link>
        <Link to="/about#agf" className="context-role">
          <span className="company-mark agf-mark">A</span>
          <span>
            <strong>Web Developer Co-op</strong>
            <small>
              AGF Investments <span>2025</span>
            </small>
          </span>
        </Link>
      </div>
      <div className="context-section">
        <div className="context-section-title">
          <span className="micro-label">Recognition</span>
          <Link to="/recognition" aria-label="All recognition">
            <ArrowUpRight size={16} />
          </Link>
        </div>
        {achievements.slice(0, 2).map((a) => (
          <Link
            className="context-award"
            to={`/recognition#${a.id}`}
            key={a.id}
          >
            <Medal size={20} strokeWidth={1.6} />
            <span>
              <strong>{a.title}</strong>
              <small>
                {a.short} / {a.kind}
              </small>
            </span>
          </Link>
        ))}
      </div>
      <p className="context-footnote">
        Curious about how things work.
        <br />
        Intent on making them work better.
      </p>
    </aside>
  );
}
