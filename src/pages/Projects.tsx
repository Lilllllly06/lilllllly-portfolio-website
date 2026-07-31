import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getAllCategories, projects } from '@/data/projects';
import ProjectsGrid from '@/components/ProjectsGrid';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Projects = () => {
  const categories = ['All', ...getAllCategories()];
  const [activeCategory, setActiveCategory] = useState('All');
  const reduceMotion = useReducedMotion();
  const filteredProjects = useMemo(
    () => activeCategory === 'All'
      ? projects
      : projects.filter((project) => project.category === activeCategory),
    [activeCategory],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main-content" className="flex-grow">
        <section className="portfolio-banner relative overflow-hidden border-b border-slate-200 py-16 sm:py-20">
          <div className="portfolio-banner-panel" aria-hidden="true" />
          <div className="section-shell relative">
            <p className="section-kicker">Portfolio archive</p>
            <h1 className="balanced-heading max-w-3xl text-4xl font-semibold text-navy sm:text-5xl">
              Engineering projects and research.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Product systems, developer tools, simulations, and experimental work across software, AI, hardware, and physical systems.
            </p>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <div className="section-shell">
            <div className="mb-10 flex flex-col gap-5 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-fit max-w-full overflow-x-auto rounded-md bg-slate-100 p-1" role="tablist" aria-label="Project category">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                    className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-white text-navy shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
              >
                <ProjectsGrid projects={filteredProjects} />
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Projects;
