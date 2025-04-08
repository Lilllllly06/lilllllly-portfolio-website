
import { Cpu } from 'lucide-react';

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
    <div>
      <div className="flex items-center mb-4">
        <Cpu className="h-5 w-5 mr-2 text-navy" />
        <h2 className="text-2xl font-semibold text-navy">{title}</h2>
      </div>
      {description && (
        <p className="text-gray-700 mb-4">{description}</p>
      )}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <p className="text-gray-500 italic">Images will be added soon.</p>
      )}
    </div>
  );
};

export default CADSection;
