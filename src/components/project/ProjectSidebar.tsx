import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '@/data/projects';

interface ProjectSidebarProps {
  project: Project;
  relatedProjects: Project[];
  returnTo: string;
}

const ProjectSidebar = ({ project, relatedProjects, returnTo }: ProjectSidebarProps) => {
  const sections = [
    project.sections.research && ['Research report', '#research'],
    ['Overview', '#overview'],
    project.versions && ['Project evolution', '#evolution'],
    project.sections.demonstration && ['Demo and media', '#demonstration'],
    project.sections.cad && ['CAD models', '#cad'],
    project.sections.pcb && ['PCB design', '#pcb'],
  ].filter(Boolean) as string[][];

  return (
    <aside className="h-fit space-y-9 lg:sticky lg:top-28">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-sky-700 dark:text-[var(--blue)]">Project index</p>
        <nav className="border-t border-slate-200 dark:border-border" aria-label="Project sections">
          {sections.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="flex items-center justify-between border-b border-slate-200 py-3 text-sm text-slate-600 hover:text-navy dark:border-border dark:text-muted-foreground dark:hover:text-foreground"
            >
              {label}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          ))}
        </nav>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-sky-700 dark:text-[var(--blue)]">Project details</p>
        <dl className="space-y-4 border-t border-slate-200 pt-4 dark:border-border">
          <div>
            <dt className="text-xs text-slate-500 dark:text-muted-foreground">Discipline</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-foreground">{project.category}</dd>
          </div>
          {project.role && (
            <div>
              <dt className="text-xs text-slate-500 dark:text-muted-foreground">Role</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-foreground">{project.role}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-slate-500 dark:text-muted-foreground">Timeline</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-foreground">{project.date}</dd>
          </div>
        </dl>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-sky-700 dark:text-[var(--blue)]">Technology</p>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <span key={technology} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 dark:border-border dark:bg-muted dark:text-muted-foreground">
              {technology}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-sky-700 dark:text-[var(--blue)]">Related projects</p>
        <div className="border-t border-slate-200 dark:border-border">
          {relatedProjects.map((relatedProject) => (
            <Link
              key={relatedProject.id}
              to={`/project/${relatedProject.id}`}
              state={{ fromProjects: returnTo }}
              className="group grid grid-cols-[3rem_1fr] gap-3 border-b border-slate-200 py-3 dark:border-border"
            >
              <img
                src={relatedProject.image}
                alt=""
                className="aspect-square w-12 rounded-md bg-slate-100 object-cover dark:bg-muted"
                loading="lazy"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-medium leading-5 text-navy group-hover:text-sky-700 dark:text-foreground dark:group-hover:text-[var(--blue)]">
                  {relatedProject.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-muted-foreground">{relatedProject.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ProjectSidebar;
