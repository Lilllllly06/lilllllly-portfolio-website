import { Folder, Search, X } from "lucide-react";
import { useLocation, useSearchParams } from "react-router-dom";
import { getAllCategories, projects } from "@/data/projects";
import ProjectsGrid from "@/components/ProjectsGrid";

export default function Projects() {
  const categories = ["All", ...getAllCategories()];
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const activeCategory = categories.includes(params.get("category") || "")
    ? params.get("category")!
    : "All";
  const query = params.get("q") || "";
  const changeFilter = (name: string, value: string, replace = false) => {
    const next = new URLSearchParams(params);
    if (!value || value === "All") next.delete(name);
    else next.set(name, value);
    setParams(next, { replace });
  };
  const filtered = projects.filter(
    (p) =>
      (activeCategory === "All" || p.category === activeCategory) &&
      `${p.title} ${p.description} ${p.technologies.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <div className="workspace-page projects-page">
      <header className="page-heading">
        <p className="micro-label">
          <Folder size={14} /> Project archive
        </p>
        <h1>Ideas, made real.</h1>
        <p>
          AI products, interactive systems, and experiments in how the world
          works.
        </p>
      </header>
      <div className="project-controls">
        <div
          className="project-filters"
          role="group"
          aria-label="Project category"
        >
          {categories.map((category) => (
            <button
              key={category}
              aria-pressed={activeCategory === category}
              className={activeCategory === category ? "selected" : ""}
              onClick={() => changeFilter("category", category)}
            >
              {category}
              <span>
                {category === "All"
                  ? projects.length
                  : projects.filter((p) => p.category === category).length}
              </span>
            </button>
          ))}
        </div>
        <div className="project-search">
          <Search size={16} />
          <input
            aria-label="Search projects"
            placeholder="Search projects"
            value={query}
            onChange={(e) => changeFilter("q", e.target.value, true)}
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Clear search"
              title="Clear search"
              onClick={() => changeFilter("q", "", true)}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="archive-count" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "project" : "projects"}{" "}
        <span>
          / {activeCategory === "All" ? "All disciplines" : activeCategory}
        </span>
      </div>
      <ProjectsGrid
        projects={filtered}
        returnTo={`${location.pathname}${location.search}`}
      />
    </div>
  );
}
