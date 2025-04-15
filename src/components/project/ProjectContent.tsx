
import { Project } from '@/data/projects';
import CADSection from './CADSection';
import PCBSection from './PCBSection';
import ResearchSection from './ResearchSection';
import DemonstrationSection from './DemonstrationSection';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectContentProps {
  project: Project;
}

const ProjectContent = ({ project }: ProjectContentProps) => {
  const { sections } = project;

  return (
    <div className="space-y-12">
      {/* Project Links */}
      {project.githubUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-white rounded-lg shadow-sm"
        >
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto group hover:bg-[#24292e] hover:text-white transition-colors"
            asChild
          >
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
              View Source Code
              <ExternalLink className="h-4 w-4 opacity-50" />
            </a>
          </Button>
        </motion.div>
      )}

      {/* Research Report Section */}
      {sections.research && (
        <ResearchSection
          title={sections.research.title}
          description={sections.research.description}
          pdfFiles={sections.research.pdfFiles}
        />
      )}
      
      {/* CAD Section */}
      {sections.cad && (
        <CADSection
          title={sections.cad.title}
          description={sections.cad.description}
          images={sections.cad.images}
        />
      )}
      
      {/* PCB Design Section */}
      {sections.pcb && (
        <PCBSection
          title={sections.pcb.title}
          description={sections.pcb.description}
          images={sections.pcb.images}
        />
      )}
      
      {/* Setup Demonstration Section */}
      {sections.demonstration && (
        <DemonstrationSection
          title={sections.demonstration.title}
          description={sections.demonstration.description}
          images={sections.demonstration.images || []}
          videos={sections.demonstration.videos}
        />
      )}
    </div>
  );
};

export default ProjectContent;

