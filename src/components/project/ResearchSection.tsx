
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ResearchSectionProps {
  title: string;
  description?: string;
  pdfFiles: { name: string; url: string }[];
}

const ResearchSection = ({ title, description, pdfFiles }: ResearchSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center mb-4">
        <FileText className="h-5 w-5 mr-2 text-navy" />
        <h2 className="text-2xl font-semibold text-navy">{title}</h2>
      </div>
      {description && (
        <p className="text-gray-700 mb-4">{description}</p>
      )}
      <div className="space-y-4">
        {pdfFiles.map((pdf, index) => (
          <motion.div 
            key={index} 
            className="rounded-lg border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md hover:shadow-sky-100/70"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-navy-dark">{pdf.name}</span>
              <Button 
                variant="outline" 
                asChild 
                size="sm" 
                className="w-fit hover:bg-navy hover:text-white transition-colors"
              >
                <a 
                  href={pdf.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  View PDF
                </a>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ResearchSection;
