
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
      whileHover={{ 
        y: -10,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={`/project/${id}`} className="block h-full">
        <Card className="overflow-hidden transition-all hover:shadow-lg h-full">
          <div className="aspect-video overflow-hidden relative">
            <motion.img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent opacity-85 hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-4"
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 0.9 }}
            >
              <motion.span 
                className="text-xs font-medium bg-navy text-white px-3 py-1.5 rounded-full w-fit mb-2 shadow-md"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "#2a4a7f",
                  transition: { duration: 0.2 }
                }}
              >
                {category}
              </motion.span>
              <motion.h3 
                className="text-xl font-bold text-white mb-1 text-shadow"
                initial={{ x: -5, opacity: 0.9 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {title}
              </motion.h3>
            </motion.div>
          </div>
          <CardContent className="p-4">
            <motion.p 
              className="text-gray-600 text-sm line-clamp-2"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
            >
              {description}
            </motion.p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
