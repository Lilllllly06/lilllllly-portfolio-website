
import { motion, AnimatePresence } from 'framer-motion';
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                delay: index * 0.1,
                type: "spring",
                stiffness: 260,
                damping: 20
              }
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            layout
          >
            <ProjectCard 
              id={project.id}
              title={project.title}
              category={project.category}
              image={project.image}
              description={project.description}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {filteredProjects.length === 0 && (
        <motion.div 
          className="col-span-3 py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-500">No projects found matching this filter.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProjectsGrid;
