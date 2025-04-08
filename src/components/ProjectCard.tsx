
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

const ProjectCard = ({ id, title, category, image, description }: ProjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/project/${id}`} className="block h-full">
        <Card className="overflow-hidden transition-all hover:shadow-lg h-full">
          <div className="aspect-video overflow-hidden relative">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60 hover:opacity-80 transition-opacity duration-300 flex flex-col justify-end p-4">
              <span className="text-xs bg-navy text-white px-2 py-1 rounded-full w-fit mb-2">
                {category}
              </span>
              <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
