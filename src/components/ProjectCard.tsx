
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectCardProps {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

const ProjectCard = ({ id, title, category, image, description }: ProjectCardProps) => {
  return (
    <Link to={`/project/${id}`} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="aspect-video overflow-hidden relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/80">{category}</p>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-navy line-clamp-1">{title}</h3>
            <span className="text-xs bg-navy-light text-white px-2 py-1 rounded-full">
              {category}
            </span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;
