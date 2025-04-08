
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResearchSectionProps {
  title: string;
  description?: string;
  pdfFiles: { name: string; url: string }[];
}

const ResearchSection = ({ title, description, pdfFiles }: ResearchSectionProps) => {
  return (
    <div>
      <div className="flex items-center mb-4">
        <FileText className="h-5 w-5 mr-2 text-navy" />
        <h2 className="text-2xl font-semibold text-navy">{title}</h2>
      </div>
      {description && (
        <p className="text-gray-700 mb-4">{description}</p>
      )}
      <div className="space-y-4">
        {pdfFiles.map((pdf, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{pdf.name}</span>
              <Button variant="outline" asChild size="sm">
                <a href={pdf.url} target="_blank" rel="noopener noreferrer">View PDF</a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchSection;
