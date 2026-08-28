import { MonitorPlay } from 'lucide-react';
import Reveal from '@/components/Reveal';

interface DemonstrationSectionProps {
  title: string;
  description?: string;
  imagesFirst?: boolean;
  images: {
    url: string;
    caption: string;
  }[];
  videos?: {
    name: string;
    url: string;
    description?: string;
    poster?: string;
  }[];
}

const isDirectVideo = (url: string) => /\.(webm|mp4)(\?.*)?$/i.test(url);

const DemonstrationSection = ({ title, description, imagesFirst = false, images, videos }: DemonstrationSectionProps) => {
  const imageGallery = images.length > 0 && (
    <div className="mt-8 grid gap-8">
      {images.map((image) => (
        <figure key={image.url} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <div className="flex min-h-64 items-center justify-center p-3 sm:p-5">
            <img
              src={image.url}
              alt={image.caption}
              className="max-h-[620px] w-auto max-w-full object-contain"
              loading={imagesFirst ? "eager" : "lazy"}
            />
          </div>
          <figcaption className="border-t border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
            {image.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );

  const videoGallery = videos && videos.length > 0 && (
    <div className="mt-8 space-y-8">
      {videos.map((video) => (
        <figure key={video.url}>
          <div className="aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
            {isDirectVideo(video.url) ? (
              <video
                className="h-full w-full"
                controls
                playsInline
                preload="metadata"
                poster={video.poster || images[0]?.url}
              >
                <source src={video.url} />
              </video>
            ) : (
              <iframe
                src={video.url}
                title={video.name}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            )}
          </div>
          <figcaption className="mt-3 text-sm leading-6 text-slate-500">
            <span className="font-medium text-slate-700">{video.name}</span>
            {video.description && <span className="mt-1 block">{video.description}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
  );

  return (
    <Reveal>
      <section>
        <div className="flex items-center gap-3">
          <MonitorPlay className="h-5 w-5 text-sky-600" />
          <h2 className="text-3xl font-semibold text-navy">{title}</h2>
        </div>
        {description && <p className="mt-4 max-w-3xl leading-7 text-slate-600">{description}</p>}

        {imagesFirst ? imageGallery : videoGallery}
        {imagesFirst ? videoGallery : imageGallery}
      </section>
    </Reveal>
  );
};

export default DemonstrationSection;
