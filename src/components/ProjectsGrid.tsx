import { Project } from '@/data/projects';
import ProjectCard from './ProjectCard';

interface ProjectsGridProps {
  projects: Project[];
  featured?: boolean;
}

const ProjectsGrid = ({ projects, featured = false }: ProjectsGridProps) => {
  return (
    <div className={featured ? "grid gap-6 lg:grid-cols-2" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} featured={featured} />
      ))}
      {projects.length === 0 && (
        <div className="col-span-full border-y border-slate-200 py-14 text-center">
          <p className="text-sm text-slate-500">No projects match this filter.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsGrid;
