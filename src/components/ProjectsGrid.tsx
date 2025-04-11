
import { motion } from 'framer-motion';
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
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
      {filteredProjects.length === 0 && (
        <div className="col-span-full py-12 text-center">
          <p className="text-gray-500 text-lg">No projects found matching this filter.</p>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectsGrid;
