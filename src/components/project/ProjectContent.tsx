
import { Project } from '@/data/projects';
import CADSection from './CADSection';
import PCBSection from './PCBSection';
import ResearchSection from './ResearchSection';
import DemonstrationSection from './DemonstrationSection';

interface ProjectContentProps {
  project: Project;
}

const ProjectContent = ({ project }: ProjectContentProps) => {
  const { sections } = project;

  return (
    <div className="space-y-12">
      {/* Research Report Section - Placed first */}
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
          images={sections.demonstration.images}
          videos={sections.demonstration.videos}
        />
      )}
    </div>
  );
};

export default ProjectContent;
