
import { Monitor } from 'lucide-react';

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
    <div>
      <div className="flex items-center mb-4">
        <Monitor className="h-5 w-5 mr-2 text-navy" />
        <h2 className="text-2xl font-semibold text-navy">{title}</h2>
      </div>
      {description && (
        <p className="text-gray-700 mb-4">{description}</p>
      )}
      
      {/* Demonstration Images */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {images.map((img, index) => (
            <div key={index} className="rounded-lg overflow-hidden shadow-md">
              <img 
                src={img.url} 
                alt={img.caption} 
                className="w-full h-auto"
              />
              <div className="p-3 bg-gray-50">
                <p className="text-sm text-gray-700 text-center">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic mb-6">Images will be added soon.</p>
      )}
      
      {/* Demonstration Videos */}
      {videos && videos.length > 0 && (
        <div className="space-y-6">
          {videos.map((video, index) => (
            <div key={index}>
              <h4 className="font-medium mb-2">{video.name}</h4>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DemonstrationSection;
