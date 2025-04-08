
import { Project } from '@/data/projects';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

interface ProjectSidebarProps {
  project: Project;
  relatedProjects: Project[];
}

const ProjectSidebar = ({ project, relatedProjects }: ProjectSidebarProps) => {
  return (
    <div className="sticky top-24">
      <div className="rounded-lg overflow-hidden shadow-md mb-6">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-auto"
        />
      </div>
      
      <Separator className="my-6" />
      
      <h3 className="text-lg font-semibold text-navy-dark mb-2">Other Projects</h3>
      <div className="space-y-4">
        {relatedProjects.map(relatedProject => (
          <Link 
            key={relatedProject.id} 
            to={`/project/${relatedProject.id}`}
            className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
          >
            <h4 className="font-medium text-navy">{relatedProject.title}</h4>
            <p className="text-sm text-gray-500">{relatedProject.category}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectSidebar;
