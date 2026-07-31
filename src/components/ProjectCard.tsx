import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Project } from '@/data/projects';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

const ProjectCard = ({ project, featured = false }: ProjectCardProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        to={`/project/${project.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-[0_18px_45px_-30px_rgba(15,35,56,0.5)]"
      >
        <div className={cn("overflow-hidden bg-slate-100", featured ? "aspect-[16/10]" : "aspect-[16/9]")}>
          <img
            src={project.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>

        <div className={cn("flex flex-1 flex-col", featured ? "p-6 sm:p-7" : "p-5")}>
          <div className="mb-4 flex items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <span>{project.category}</span>
            <span className="shrink-0">{project.date}</span>
          </div>

          <h3 className={cn("balanced-heading font-semibold leading-tight text-navy", featured ? "text-2xl" : "text-xl")}>
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p>

          {featured && project.signal && (
            <div className="mt-6 border-l-2 border-sky-500 pl-3">
              <p className="text-xs font-medium text-slate-500">{project.signal.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{project.signal.value}</p>
            </div>
          )}

          <div className="mt-auto flex items-end justify-between gap-4 pt-6">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
              {project.technologies.slice(0, 3).map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-navy transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default ProjectCard;
