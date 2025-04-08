
import ProjectCard from './ProjectCard';

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

interface ProjectsGridProps {
  projects: Project[];
  filter?: string;
}

const ProjectsGrid = ({ projects, filter }: ProjectsGridProps) => {
  const filteredProjects = filter
    ? projects.filter(project => project.category === filter)
    : projects;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map(project => (
        <ProjectCard 
          key={project.id} 
          id={project.id}
          title={project.title}
          category={project.category}
          image={project.image}
          description={project.description}
        />
      ))}
    </div>
  );
};

export default ProjectsGrid;
