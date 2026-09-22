import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight, Download, Github } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { projects } from "@/data/projects";
import NotFound from "./NotFound";
import projectTracker from "@/utils/projectTracker";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import ProjectContent from "@/components/project/ProjectContent";
import usePageAnchor from "@/hooks/use-page-anchor";

export default function ProjectDetail() {
  const { id } = useParams();
  const location = useLocation();
  const project = projects.find((item) => item.id === id);
  const fromProjects = (location.state as { fromProjects?: unknown } | null)
    ?.fromProjects;
  const projectsPath =
    typeof fromProjects === "string" && /^\/projects(?:\?|$)/.test(fromProjects)
      ? fromProjects
      : "/projects";
  usePageAnchor();
  useEffect(() => {
    if (project) projectTracker.trackProject(project.id);
  }, [project]);
  if (!project) return <NotFound />;
  const related = [
    ...projects.filter((p) => p.id !== id && p.category === project.category),
    ...projects.filter((p) => p.id !== id && p.category !== project.category),
  ].slice(0, 3);
  return (
    <div className="workspace-page project-dossier">
      <Link to={projectsPath} className="dossier-back">
        <ArrowLeft size={15} />
        {projectsPath.includes("Research")
          ? "Research projects"
          : "All projects"}
      </Link>
      <header className="page-heading dossier-heading">
        <p className="micro-label">
          {project.category} <span>/</span> {project.date}
        </p>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <div className="dossier-actions">
          {project.githubUrl && (
            <a
              className="text-action"
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} />
              Source code
              <ArrowUpRight size={14} />
            </a>
          )}
          {project.releaseUrl && (
            <a
              className="text-action"
              href={project.releaseUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Download size={16} />
              Download release
            </a>
          )}
          <Link
            className="text-action"
            to={`/?ask=${encodeURIComponent(`Tell me about ${project.title}`)}`}
          >
            Ask about this project <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>
      <div className="dossier-layout">
        <div className="dossier-content">
          {!project.sections.research && (
            <div className="dossier-preview">
              <img src={project.image} alt={`${project.title} preview`} />
            </div>
          )}
          <ProjectContent project={project} />
        </div>
        <ProjectSidebar
          project={project}
          relatedProjects={related}
          returnTo={projectsPath}
        />
      </div>
    </div>
  );
}
