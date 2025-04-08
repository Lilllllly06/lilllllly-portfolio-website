
import { FileText } from 'lucide-react';
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
            className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ x: 5, transition: { duration: 0.2 } }}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{pdf.name}</span>
              <Button variant="outline" asChild size="sm" className="hover:bg-navy hover:text-white transition-colors">
                <a href={pdf.url} target="_blank" rel="noopener noreferrer">View PDF</a>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ResearchSection;
