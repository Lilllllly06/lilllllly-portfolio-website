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
      {sections.research && (
        <div id="research" className="scroll-mt-28">
          <ResearchSection
            title={sections.research.title}
            description={sections.research.description}
            pdfFiles={sections.research.pdfFiles}
          />
        </div>
      )}

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

      {project.versions && (
        <Reveal>
          <section id="evolution" className="scroll-mt-28">
            <p className="section-kicker">Project evolution</p>
            <h2 className="text-3xl font-semibold text-navy">Two implementations, one core mechanic</h2>
            <div className="mt-8 border-t border-slate-200">
              {project.versions.map((version) => (
                <div key={version.title} className="grid gap-4 border-b border-slate-200 py-7 md:grid-cols-[11rem_1fr]">
                  <p className="text-xs font-semibold uppercase leading-5 text-sky-700">{version.label}</p>
                  <div>
                    <h3 className="text-xl font-semibold text-navy">{version.title}</h3>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{version.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {version.technologies.map((technology) => (
                        <span key={technology} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                          {technology}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {sections.demonstration && (
        <div id="demonstration" className="scroll-mt-28">
          <DemonstrationSection
            title={sections.demonstration.title}
            description={sections.demonstration.description}
            imagesFirst={sections.demonstration.imagesFirst}
            images={sections.demonstration.images || []}
            videos={sections.demonstration.videos}
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
