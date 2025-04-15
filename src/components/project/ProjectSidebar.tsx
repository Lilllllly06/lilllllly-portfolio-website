
import { Project } from '@/data/projects';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Code2, GitFork, Database } from 'lucide-react';

interface ProjectSidebarProps {
  project: Project;
  relatedProjects: Project[];
}

const ProjectSidebar = ({ project, relatedProjects }: ProjectSidebarProps) => {
  const isEcoland = project.id === 'ecoland';
  const techStack = project.technologies || [];

  return (
    <div className="sticky top-24 space-y-6">
      <div className="rounded-lg overflow-hidden shadow-lg bg-white border border-gray-200">
        {isEcoland ? (
          <div className="aspect-video w-full relative overflow-hidden">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://lilllllly06.github.io/portfolio-pdfs/ecoland%20simulation%20gif.mp4" type="video/mp4" />
            </video>
          </div>
        ) : (
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-auto object-contain bg-white"
          />
        )}
      </div>

      {project.category === "Software Development" && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="h-5 w-5 text-navy" />
              <h3 className="text-lg font-semibold text-navy-dark">Tech Stack</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge 
                    variant="tech" 
                    className="transition-all duration-300 hover:scale-105 cursor-default"
                  >
                    {tech}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
      
      <Separator className="my-6" />
      
      <h3 className="text-lg font-semibold text-navy-dark mb-4">Other Projects</h3>
      <div className="space-y-4">
        {relatedProjects.map((relatedProject, index) => (
          <motion.div
            key={relatedProject.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(243, 244, 246, 0.6)" }}
            className="rounded-md"
          >
            <Link 
              to={`/project/${relatedProject.id}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-white shadow-sm">
                <img 
                  src={relatedProject.image} 
                  alt={relatedProject.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium text-navy">{relatedProject.title}</h4>
                <p className="text-xs text-gray-500">{relatedProject.category}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectSidebar;
