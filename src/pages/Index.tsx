import { ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import ProjectsGrid from '@/components/ProjectsGrid';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { projects } from '@/data/projects';
import { profile } from '@/data/profile';

const recentExperience = [
  {
    company: 'Meta',
    title: 'Engineering Fellow',
    date: 'Summer 2026',
    focus: 'Production infrastructure, service health, diagnostics, and Linux systems reliability.',
  },
  {
    company: 'Shopify',
    title: 'Software Engineering Intern',
    date: 'Summer 2026',
    focus: 'Agentic AI tooling, RAG context retrieval, React Native activation flows, OAuth, and BLE.',
  },
  {
    company: 'Shopify',
    title: 'Software Engineering Intern',
    date: 'Fall 2025',
    focus: 'Retail Admin, GraphQL systems, full-stack product delivery, and cross-repository migrations.',
  },
];

const Index = () => {
  const featuredProjectIds = ['ecoland', '3d-data-sandbox'];
  const featuredProjects = projects
    .filter((project) => featuredProjectIds.includes(project.id))
    .sort((first, second) => featuredProjectIds.indexOf(first.id) - featuredProjectIds.indexOf(second.id));
  const researchProjects = projects.filter((project) => project.category === 'Research').slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main-content" className="flex-grow">
        <Hero />

        <section className="bg-white py-20 sm:py-24">
          <div className="section-shell">
            <Reveal className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="section-kicker">Selected work</p>
                <h2 className="balanced-heading text-3xl font-semibold text-navy sm:text-4xl">
                  Systems designed around real workflows.
                </h2>
                <p className="mt-4 leading-7 text-slate-600">
                  A closer look at how I frame problems, make technical decisions, and turn them into working software.
                </p>
              </div>
              <Link to="/projects" className="subtle-link shrink-0">
                View all projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <ProjectsGrid projects={featuredProjects} featured />

            <Reveal className="mt-8 border-y border-slate-200">
              <Link
                to="/project/agentic-job-application"
                className="group grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <p className="text-xs font-semibold uppercase text-sky-700">Agentic workflow</p>
                  <h3 className="mt-2 text-xl font-semibold text-navy">Agentic Job Application</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    A local-first career agent for fit scoring, tailored application materials, and opportunity tracking with explicit approval gates.
                  </p>
                </div>
                <span className="flex items-center gap-2 text-sm font-medium text-navy">
                  View case study
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
          <div className="section-shell grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <Reveal>
              <p className="section-kicker">Recent experience</p>
              <h2 className="balanced-heading text-3xl font-semibold text-navy sm:text-4xl">
                Engineering across product and infrastructure.
              </h2>
              <p className="mt-4 max-w-md leading-7 text-slate-600">
                I have worked from mobile activation and GraphQL product surfaces to AI context pipelines and production reliability.
              </p>
              <Link to="/about" className="subtle-link mt-7">
                Full experience
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <div className="border-t border-slate-300">
              {recentExperience.map((experience, index) => (
                <Reveal key={`${experience.company}-${experience.date}`} delay={index * 0.04}>
                  <div className="grid gap-3 border-b border-slate-300 py-6 sm:grid-cols-[7rem_1fr_auto] sm:items-start">
                    <p className="text-sm font-semibold text-sky-700">{experience.company}</p>
                    <div>
                      <h3 className="font-semibold text-slate-900">{experience.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{experience.focus}</p>
                    </div>
                    <p className="text-xs font-medium text-slate-500 sm:text-right">{experience.date}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="section-shell">
            <Reveal className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="section-kicker">Research practice</p>
                <h2 className="balanced-heading text-3xl font-semibold text-navy sm:text-4xl">
                  Experimental thinking, carried into software.
                </h2>
                <p className="mt-4 max-w-md leading-7 text-slate-600">
                  My earlier work in fluid dynamics, materials, and instrumentation shaped how I test assumptions and reason from evidence.
                </p>
              </div>

              <div className="border-t border-slate-200">
                {researchProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className="group grid gap-4 border-b border-slate-200 py-5 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
                  >
                    <img
                      src={project.image}
                      alt=""
                      className="aspect-[4/3] w-20 rounded-md bg-slate-100 object-cover"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="font-semibold text-navy">{project.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{project.date}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-navy" />
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-[#f3f8fc] py-14">
          <Reveal className="section-shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-sky-700">More context</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">Experience, education, and the complete technical toolkit.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/about" className="subtle-link">
                About and experience
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="subtle-link">
                <FileText className="h-4 w-4" />
                Industry resume
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
