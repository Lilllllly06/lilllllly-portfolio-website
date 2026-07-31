import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '@/data/projects';

interface ProjectSidebarProps {
  project: Project;
  relatedProjects: Project[];
}

const ProjectSidebar = ({ project, relatedProjects }: ProjectSidebarProps) => {
  const sections = [
    ['Overview', '#overview'],
    project.sections.demonstration && ['Demo and media', '#demonstration'],
    project.sections.research && ['Research report', '#research'],
    project.sections.cad && ['CAD models', '#cad'],
    project.sections.pcb && ['PCB design', '#pcb'],
  ].filter(Boolean) as string[][];

  return (
    <aside className="h-fit space-y-9 lg:sticky lg:top-28">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-sky-700">Project index</p>
        <nav className="border-t border-slate-200" aria-label="Project sections">
          {sections.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="flex items-center justify-between border-b border-slate-200 py-3 text-sm text-slate-600 hover:text-navy"
            >
              {label}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          ))}
        </nav>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-sky-700">Project details</p>
        <dl className="space-y-4 border-t border-slate-200 pt-4">
          <div>
            <dt className="text-xs text-slate-500">Discipline</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">{project.category}</dd>
          </div>
          {project.role && (
            <div>
              <dt className="text-xs text-slate-500">Role</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">{project.role}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-slate-500">Timeline</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">{project.date}</dd>
          </div>
        </dl>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-sky-700">Technology</p>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <span key={technology} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
              {technology}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-sky-700">Related projects</p>
        <div className="border-t border-slate-200">
          {relatedProjects.map((relatedProject) => (
            <Link
              key={relatedProject.id}
              to={`/project/${relatedProject.id}`}
              className="group grid grid-cols-[3rem_1fr] gap-3 border-b border-slate-200 py-3"
            >
              <img
                src={relatedProject.image}
                alt=""
                className="aspect-square w-12 rounded-md bg-slate-100 object-cover"
                loading="lazy"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-medium leading-5 text-navy group-hover:text-sky-700">
                  {relatedProject.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{relatedProject.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ProjectSidebar;
