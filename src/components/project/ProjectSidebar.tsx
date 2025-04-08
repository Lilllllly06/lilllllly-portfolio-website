
import { Project } from '@/data/projects';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

interface ProjectSidebarProps {
  project: Project;
  relatedProjects: Project[];
}

const ProjectSidebar = ({ project, relatedProjects }: ProjectSidebarProps) => {
  return (
    <div className="sticky top-24">
      <div className="rounded-lg overflow-hidden shadow-md mb-6 bg-white">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-auto object-contain bg-white"
        />
      </div>
      
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
