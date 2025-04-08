
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

const ProjectCard = ({ id, title, category, image, description }: ProjectCardProps) => {
  return (
    <Link to={`/project/${id}`} className="project-card block">
      <div className="aspect-video overflow-hidden relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="project-card-overlay">
          <h3 className="text-xl font-semibold mb-1">{title}</h3>
          <p className="text-sm opacity-80">{category}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-navy">{title}</h3>
          <span className="text-xs bg-navy-light text-white px-2 py-1 rounded-full">
            {category}
          </span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
      </div>
    </Link>
  );
};

export default ProjectCard;
