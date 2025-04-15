import React from 'react';
import { Project } from '@/data/projects';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Code } from 'lucide-react';
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
          className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-white/5 rounded-lg shadow-lg border border-gray-200"
        >
          <Button
            size="lg"
            className="w-full sm:w-auto group bg-navy/10 hover:bg-navy/20 text-navy border-0 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-navy/20"
            asChild
          >
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3"
            >
              <div className="relative flex items-center justify-center w-6 h-6 overflow-hidden rounded-full bg-navy/10">
                <Github className="h-4 w-4 text-navy group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-medium">View Source Code</span>
              <div className="relative flex items-center justify-center w-5 h-5 overflow-hidden rounded-full bg-navy/10">
                <Code className="h-3 w-3 text-navy group-hover:rotate-12 transition-transform duration-300" />
              </div>
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
