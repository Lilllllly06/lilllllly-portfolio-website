
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
      className="h-full"
    >
      <Link to={`/project/${id}`} className="group relative z-20 block h-full">
        <Card className="relative h-full overflow-hidden border-slate-100 bg-white shadow-sm transition-all duration-300 group-hover:border-sky-200 group-hover:shadow-xl group-hover:shadow-sky-100/70">
          <div className="aspect-video overflow-hidden relative">
            <img 
              src={image} 
              alt={title} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-navy-dark/95 via-navy/70 to-transparent p-4 opacity-90 transition-opacity duration-300 group-hover:opacity-100">
              <span className="mb-2 w-fit rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-navy shadow-sm">
                {category}
              </span>
              <h3 className="text-xl font-bold text-white mb-1 text-shadow">{title}</h3>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="line-clamp-2 text-sm leading-6 text-slate-600">{description}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
