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
      <section>
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-sky-600" />
          <h2 className="text-3xl font-semibold text-navy">{title}</h2>
        </div>
        {description && <p className="mt-4 max-w-3xl leading-7 text-slate-600">{description}</p>}

        <div className="mt-7 border-t border-slate-200">
          {pdfFiles.map((pdf) => (
            <a
              key={pdf.url}
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 border-b border-slate-200 py-4"
            >
              <span className="font-medium text-navy">{pdf.name}</span>
              <span className="flex items-center gap-2 text-sm text-slate-500 group-hover:text-sky-700">
                View PDF
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>
      </section>
    </Reveal>
  );
};

export default ResearchSection;
