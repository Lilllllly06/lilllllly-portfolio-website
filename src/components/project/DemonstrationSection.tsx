import { MonitorPlay } from 'lucide-react';
import Reveal from '@/components/Reveal';

interface DemonstrationSectionProps {
  title: string;
  description?: string;
  images: {
    url: string;
    caption: string;
  }[];
  videos?: {
    name: string;
    url: string;
  }[];
}

const isDirectVideo = (url: string) => /\.(webm|mp4)(\?.*)?$/i.test(url);

const DemonstrationSection = ({ title, description, images, videos }: DemonstrationSectionProps) => {
  return (
    <Reveal>
      <section>
        <div className="flex items-center gap-3">
          <MonitorPlay className="h-5 w-5 text-sky-600" />
          <h2 className="text-3xl font-semibold text-navy">{title}</h2>
        </div>
        {description && <p className="mt-4 max-w-3xl leading-7 text-slate-600">{description}</p>}

        {videos && videos.length > 0 && (
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
                      poster={images[0]?.url}
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
                <figcaption className="mt-3 text-sm text-slate-500">{video.name}</figcaption>
              </figure>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-8 grid gap-8">
            {images.map((image) => (
              <figure key={image.url} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex min-h-64 items-center justify-center p-3 sm:p-5">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="max-h-[620px] w-auto max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <figcaption className="border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  {image.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </Reveal>
  );
};

export default DemonstrationSection;
