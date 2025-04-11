
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
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Link to={`/project/${id}`} className="block h-full">
        <Card className="overflow-hidden hover:shadow-lg h-full border border-gray-100">
          <div className="aspect-video overflow-hidden relative">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-80 hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-5">
              <span className="text-xs font-medium bg-navy text-white px-3 py-1.5 rounded-full w-fit mb-2 shadow-md">
                {category}
              </span>
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            </div>
          </div>
          <CardContent className="p-5">
            <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
