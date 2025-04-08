
import { Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

interface CADSectionProps {
  title: string;
  description?: string;
  images: {
    url: string;
    caption: string;
  }[];
}

const CADSection = ({ title, description, images }: CADSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <motion.div 
        className="flex items-center mb-4"
        initial={{ x: -20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <motion.div 
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.6 }}
          className="mr-2"
        >
          <Cpu className="h-5 w-5 text-navy" />
        </motion.div>
        <h2 className="text-2xl font-semibold text-navy">{title}</h2>
      </motion.div>
      
      {description && (
        <motion.p 
          className="text-gray-700 mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {description}
        </motion.p>
      )}
      
      {images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((img, index) => (
            <motion.div 
              key={index} 
              className="rounded-lg overflow-hidden shadow-md flex flex-col h-full"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
              }}
            >
              <div className="flex-grow">
                <motion.img 
                  src={img.url} 
                  alt={img.caption} 
                  className="w-full h-auto object-cover"
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                />
              </div>
              <motion.div 
                className="p-3 bg-gray-50"
                whileHover={{ backgroundColor: "#f0f4f8" }}
              >
                <p className="text-sm text-gray-700 text-center">{img.caption}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.p 
          className="text-gray-500 italic"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Images will be added soon.
        </motion.p>
      )}
    </motion.div>
  );
};

export default CADSection;
