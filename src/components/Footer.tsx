
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '@/data/profile';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="section-shell py-12">
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase text-sky-300">Get in touch</p>
            <h2 className="balanced-heading text-2xl font-semibold sm:text-3xl">
              Interested in thoughtful systems, useful products, and hard engineering problems.
            </h2>
            <a
              href={`mailto:${profile.email}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white"
            >
              {profile.email}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            {[
              { href: `mailto:${profile.email}`, label: "Email", icon: Mail },
              { href: profile.githubUrl, label: "GitHub", icon: Github },
              { href: profile.linkedInUrl, label: "LinkedIn", icon: Linkedin },
            ].map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-slate-800 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {profile.shortName}</p>
          <p>{profile.program} · {profile.university}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
