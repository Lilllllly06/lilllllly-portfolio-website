
import { CircuitBoard } from 'lucide-react';
import { motion } from 'framer-motion';

interface PCBSectionProps {
  title: string;
  description?: string;
  images: {
    url: string;
    caption: string;
  }[];
}

const PCBSection = ({ title, description, images }: PCBSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center mb-4">
        <CircuitBoard className="h-5 w-5 mr-2 text-navy" />
        <h2 className="text-2xl font-semibold text-navy">{title}</h2>
      </div>
      {description && (
        <p className="text-gray-700 mb-4">{description}</p>
      )}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((img, index) => (
            <motion.div 
              key={index} 
              className="rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow flex flex-col h-full"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
            >
              <div className="relative overflow-hidden flex-grow flex items-center justify-center bg-gray-50 p-4" style={{ minHeight: "220px" }}>
                <img 
                  src={img.url} 
                  alt={img.caption} 
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <p className="text-sm text-gray-700 text-center font-medium">{img.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Images will be added soon.</p>
      )}
    </motion.div>
  );
};

export default PCBSection;
