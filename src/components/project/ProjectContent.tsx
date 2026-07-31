import { Check } from 'lucide-react';
import { Project } from '@/data/projects';
import CADSection from './CADSection';
import PCBSection from './PCBSection';
import ResearchSection from './ResearchSection';
import DemonstrationSection from './DemonstrationSection';
import Reveal from '@/components/Reveal';

interface ProjectContentProps {
  project: Project;
}

const ProjectContent = ({ project }: ProjectContentProps) => {
  const { sections } = project;

  return (
    <article className="min-w-0 space-y-16">
      <Reveal>
        <section id="overview" className="scroll-mt-28">
          <p className="section-kicker">Overview</p>
          <h2 className="text-3xl font-semibold text-navy">What I built</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{project.longDescription}</p>

          {project.highlights && (
            <div className="mt-9 border-t border-slate-200">
              {project.highlights.map((highlight) => (
                <div key={highlight} className="grid grid-cols-[1.25rem_1fr] gap-3 border-b border-slate-200 py-4">
                  <Check className="mt-1 h-4 w-4 text-sky-600" />
                  <p className="text-sm leading-7 text-slate-700">{highlight}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {sections.demonstration && (
        <div id="demonstration" className="scroll-mt-28">
          <DemonstrationSection
            title={sections.demonstration.title}
            description={sections.demonstration.description}
            images={sections.demonstration.images || []}
            videos={sections.demonstration.videos}
          />
        </div>
      )}

      {sections.research && (
        <div id="research" className="scroll-mt-28">
          <ResearchSection
            title={sections.research.title}
            description={sections.research.description}
            pdfFiles={sections.research.pdfFiles}
          />
        </div>
      )}

      {sections.cad && (
        <div id="cad" className="scroll-mt-28">
          <CADSection
            title={sections.cad.title}
            description={sections.cad.description}
            images={sections.cad.images}
          />
        </div>
      )}

      {sections.pcb && (
        <div id="pcb" className="scroll-mt-28">
          <PCBSection
            title={sections.pcb.title}
            description={sections.pcb.description}
            images={sections.pcb.images}
          />
        </div>
      )}
    </article>
  );
};

export default ProjectContent;
