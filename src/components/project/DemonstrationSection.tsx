
import { Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemonstrationSectionProps {
  title: string;
  description?: string;
  images: {
    url: string;
    caption: string;
  }[];
  videos?: { name: string; url: string }[];
}

const DemonstrationSection = ({ title, description, images, videos }: DemonstrationSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg p-6 shadow-sm"
    >
      <div className="flex items-center mb-4">
        <Monitor className="h-5 w-5 mr-2 text-navy" />
        <h2 className="text-2xl font-semibold text-navy">{title}</h2>
      </div>
      {description && (
        <p className="text-gray-700 mb-4">{description}</p>
      )}
      
      {/* Demonstration Images */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 mb-8">
          {images.map((img, index) => (
            <motion.div 
              key={index} 
              className="rounded-lg overflow-hidden shadow-md bg-white"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
            >
              <div className="relative overflow-hidden flex items-center justify-center bg-gray-50 p-4">
                <img 
                  src={img.url} 
                  alt={img.caption} 
                  className="max-w-full object-contain"
                  style={{ maxHeight: "500px" }}
                />
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <p className="text-sm text-gray-700 text-center font-medium">{img.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic mb-6">Images will be added soon.</p>
      )}
      
      {/* Demonstration Videos */}
      {videos && videos.length > 0 && (
        <div className="space-y-6">
          {videos.map((video, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-medium mb-2">{video.name}</h4>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={video.url} 
                  title={video.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DemonstrationSection;
