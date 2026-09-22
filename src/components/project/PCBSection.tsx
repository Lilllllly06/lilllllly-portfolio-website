import { CircuitBoard } from 'lucide-react';
import Reveal from '@/components/Reveal';

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
    <Reveal>
      <section>
        <div className="flex items-center gap-3">
          <CircuitBoard className="h-5 w-5 text-sky-600 dark:text-[var(--blue)]" />
          <h2 className="text-3xl font-semibold text-navy dark:text-foreground">{title}</h2>
        </div>
        {description && <p className="mt-4 max-w-3xl leading-7 text-slate-600 dark:text-muted-foreground">{description}</p>}

        {images.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {images.map((image) => (
              <figure key={image.url} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-border dark:bg-muted">
                <div className="flex aspect-[4/3] items-center justify-center p-4">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <figcaption className="border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-border dark:bg-background dark:text-muted-foreground">
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

export default PCBSection;
