import { useEffect } from 'react';
import { ArrowLeft, Github } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { projects } from '@/data/projects';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotFound from './NotFound';
import projectTracker from '@/utils/projectTracker';
import { Button } from '@/components/ui/button';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ProjectContent from '@/components/project/ProjectContent';

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projects.find((item) => item.id === id);

  useEffect(() => {
    if (project) projectTracker.trackProject(project.id);
  }, [project]);

  if (!project) return <NotFound />;

  const sameCategory = projects.filter(
    (candidate) => candidate.id !== project.id && candidate.category === project.category,
  );
  const otherCategories = projects.filter(
    (candidate) => candidate.id !== project.id && candidate.category !== project.category,
  );
  const relatedProjects = [...sameCategory, ...otherCategories].slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main-content" className="flex-grow">
        <header className="border-b border-slate-200 bg-[#f7fbfe] py-12 sm:py-16">
          <div className="section-shell">
            <Link to="/projects" className="subtle-link text-sm">
              <ArrowLeft className="h-4 w-4" />
              All projects
            </Link>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-4xl">
                <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase text-sky-700">
                  <span>{project.category}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                  <span>{project.date}</span>
                </div>
                <h1 className="balanced-heading text-4xl font-semibold leading-tight text-navy sm:text-5xl lg:text-6xl">
                  {project.title}
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  {project.description}
                </p>
              </div>

              {project.githubUrl && (
                <Button asChild className="w-fit bg-navy hover:bg-navy-dark">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    View source
                  </a>
                </Button>
              )}
            </div>

            <div className="mt-12 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img
                src={project.image}
                alt={`${project.title} project preview`}
                className="max-h-[560px] w-full object-contain"
              />
            </div>
          </div>
        </header>

        <section className="bg-white py-16 sm:py-20">
          <div className="section-shell grid gap-14 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <ProjectContent project={project} />
            <ProjectSidebar project={project} relatedProjects={relatedProjects} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
