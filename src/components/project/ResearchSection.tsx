import { ArrowUpRight, FileText } from 'lucide-react';
import Reveal from '@/components/Reveal';

interface ResearchSectionProps {
  title: string;
  description?: string;
  pdfFiles: { name: string; url: string }[];
}

const ResearchSection = ({ title, description, pdfFiles }: ResearchSectionProps) => {
  return (
    <Reveal>
      <section className="overflow-hidden rounded-lg border border-sky-200 bg-[#f3f9fd] shadow-[0_22px_55px_-42px_rgba(15,35,56,0.55)]">
        <div className="px-6 py-7 sm:px-8 sm:py-9">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-sky-700">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Featured research
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-navy sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {description || 'Read the complete experimental write-up, analysis, and findings.'}
          </p>
        </div>

        <div className="border-t border-sky-200 bg-white">
          {pdfFiles.map((pdf) => (
            <a
              key={pdf.url}
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-4 border-b border-slate-200 px-6 py-5 transition-colors last:border-b-0 hover:bg-sky-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-8"
            >
              <span className="flex min-w-0 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium uppercase text-slate-500">PDF document</span>
                  <span className="mt-1 block break-words font-semibold text-navy">{pdf.name}</span>
                </span>
              </span>
              <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-sky-700">
                Open report
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>
    </Reveal>
  );
};

export default ResearchSection;
