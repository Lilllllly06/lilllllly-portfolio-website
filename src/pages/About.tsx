import { ArrowRight, ArrowUpRight, FileText, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SkillsSection from '@/components/SkillsSection';
import Reveal from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { profile, resumeFiles } from '@/data/profile';
import { projects } from '@/data/projects';

const workExperiences = [
  {
    title: 'Engineering Fellow',
    role: 'Fellowship',
    company: 'Meta',
    date: 'JUN 2026 - SEP 2026',
    skills: 'Linux, Python, Bash, Docker, CI/CD, Networking, Monitoring, Site Reliability Engineering',
    description: [
      'Selected to work with Meta engineers on production-scale infrastructure.',
      'Developing SRE tooling for automated deployments, service health monitoring, log-based diagnostics, failure analysis, and Linux systems reliability.',
    ],
  },
  {
    title: 'Software Engineering Intern',
    role: 'Internship',
    company: 'Shopify',
    date: 'MAY 2026 - AUG 2026',
    skills: 'Python, TypeScript, React Native, Ruby on Rails, RAG, LLM, OAuth, BLE',
    description: [
      'Contributed to agentic AI tooling infrastructure by implementing RAG-based context retrieval, embedding reranking, and prompt orchestration pipelines, reducing irrelevant context fed to the LLM by about 40%.',
      'Built Quick Device Activation for Shopify POS using BLE pairing, QR/manual-code fallback, and OAuth Device Authorization, reducing merchant device setup time from about 5 minutes to under 30 seconds.',
      'Instrumented login-conversion metrics across React Native and Rails using feature flags, enabling A/B testing of activation flows and identifying a drop-off step that accounted for 35% of incomplete activations.',
    ],
  },
  {
    title: 'Software Engineering Intern',
    role: 'Internship',
    company: 'Shopify',
    date: 'SEP 2025 - DEC 2025',
    skills: 'React, TypeScript, Ruby on Rails, GraphQL',
    description: [
      'Owned a staff assignment modal in Retail Admin end-to-end, building React components and GraphQL queries with server-side pagination that reduced staff search query response time by about 60%.',
      'Shipped full-stack features across 6 systems including Admin Web, POS Mobile, Shopify Core, Business Platform, Cloud Sync Streamer, and POS Channel while maintaining backward-compatible data contracts.',
      'Led a cross-repository migration of a critical GraphQL query across 5 codebases, unifying schemas and consumers and reducing query drift risk in production.',
    ],
  },
  {
    title: 'Junior Web Developer',
    role: 'Co-op',
    company: 'AGF Investments',
    date: 'JAN 2025 - APR 2025',
    skills: 'Java, Spring Boot, Maven, Apache POI, Git',
    description: [
      'Built a Java/Spring Boot ScoreCard application with XLSX streaming via Apache POI, configurable transformation pipelines, and input validation, automating report generation across 4 departments and saving 20+ staff hours per week.',
      'Developed a PegaRecon app that ingests large XLSX files via Apache POI streaming, applies date/time filtering and duplicate-skip logic, archives input, and outputs consolidated Excel/CSV reports with automated email distributions.',
      'Developed automated Pega test cases verifying front-end UI interactions, ensuring robust coverage and reliability.',
    ],
  },
  {
    title: 'Lab Teaching Assistant',
    role: 'Teaching Assistant',
    company: 'SciTechnia',
    date: 'OCT 2023 - MAR 2024',
    skills: 'Tracker, COMSOL Multiphysics, Instrumentation, Prototyping',
    description: [
      'Instructed 20+ high school students on oscilloscopes, multimeters, and 3D printers.',
      'Designed and constructed PCBs with analog and digital components for educational demonstrations.',
      'Guided simulation modeling and data analysis, connecting theory with hands-on experiments.',
    ],
  },
  {
    title: 'Technology Mentor',
    role: 'Mentor',
    company: 'CyberSeniors',
    date: 'OCT 2020 - AUG 2024',
    skills: 'iOS, iPadOS, macOS, Windows, Linux',
    description: [
      'Guided 100+ seniors to proficiency across operating systems, software accounts, device setup, and everyday applications.',
    ],
  },
  {
    title: 'Website Developer',
    role: 'Developer',
    company: 'Beyond the Wards / Kindness Catalogue',
    date: 'DEC 2020 - DEC 2023',
    skills: 'Java, HTML/CSS, JavaScript, Blender, Git',
    description: [
      'Built a responsive full-stack website and integrated interactive 3D models created with Blender and JavaScript.',
    ],
  },
];

const achievements = [
  ['IBDP Graduate', 'International Baccalaureate Diploma Programme'],
  ['CaYPT National Champion', "Canadian Young Physicists' Tournament"],
  ['IYPT Bronze Medalist', "International Young Physicists' Tournament"],
  ['FIRST Robotics Semi-Finalist', 'Provincial robotics competition'],
];

const About = () => {
  const researchProjects = projects.filter((project) => project.category === 'Research');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main-content" className="flex-grow">
        <section className="portfolio-banner relative overflow-hidden border-b border-slate-200 py-16 sm:py-20">
          <div className="portfolio-banner-panel" aria-hidden="true" />
          <div className="section-shell relative">
            <div className="max-w-4xl">
              <p className="section-kicker">About</p>
              <h1 className="balanced-heading text-4xl font-semibold text-navy sm:text-5xl">
                Product-minded engineering, grounded in systems thinking.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                I am a Computer Engineering student focused on AI tooling, full-stack product engineering,
                and production infrastructure. My recent work spans RAG pipelines, React Native activation
                flows, Rails and GraphQL systems, Java automation, and reliability tooling, backed by
                an experimental research background.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {resumeFiles.map((resume, index) => (
                  <Button
                    key={resume.name}
                    asChild
                    variant={index === 0 ? 'default' : 'outline'}
                    className={index === 0 ? 'bg-navy hover:bg-navy-dark' : 'border-slate-300 bg-white/80'}
                  >
                    <a href={resume.url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4" />
                      {resume.name}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="section-shell grid gap-12 lg:grid-cols-[15rem_1fr]">
            <Reveal className="h-fit lg:sticky lg:top-28">
              <p className="section-kicker">Experience</p>
              <h2 className="text-3xl font-semibold text-navy">Where I have worked.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Product development, infrastructure, automation, teaching, and technical mentorship.
              </p>
            </Reveal>

            <div className="border-t border-slate-300">
              {workExperiences.map((experience, index) => (
                <Reveal key={`${experience.company}-${experience.date}`} delay={index * 0.025}>
                  <article className="grid gap-5 border-b border-slate-300 py-8 md:grid-cols-[9.5rem_1fr]">
                    <div>
                      <p className="text-xs font-semibold uppercase text-sky-700">{experience.date}</p>
                      <p className="mt-2 text-sm text-slate-500">{experience.role}</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-navy">{experience.title}</h3>
                      <p className="mt-1 font-medium text-slate-700">{experience.company}</p>
                      <p className="mt-4 text-sm font-medium leading-6 text-slate-500">{experience.skills}</p>
                      <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                        {experience.description.map((description) => (
                          <li key={description} className="grid grid-cols-[0.75rem_1fr] gap-2">
                            <span className="mt-[0.7rem] h-1 w-1 rounded-full bg-sky-500" aria-hidden="true" />
                            <span>{description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <SkillsSection />

        <section className="bg-white py-20 sm:py-24">
          <div className="section-shell grid gap-12 lg:grid-cols-[15rem_1fr]">
            <Reveal className="h-fit lg:sticky lg:top-28">
              <p className="section-kicker">Research</p>
              <h2 className="text-3xl font-semibold text-navy">Experimental foundations.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Physical systems studied through simulation, instrumentation, prototyping, and quantitative analysis.
              </p>
            </Reveal>

            <div className="border-t border-slate-300">
              {researchProjects.map((project, index) => (
                <Reveal key={project.id} delay={index * 0.025}>
                  <Link
                    to={`/project/${project.id}`}
                    className="group grid gap-5 border-b border-slate-300 py-7 sm:grid-cols-[7rem_1fr_auto] sm:items-start"
                  >
                    <img
                      src={project.image}
                      alt=""
                      className="aspect-[4/3] w-28 rounded-md bg-slate-100 object-cover"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-navy">{project.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p>
                      <p className="mt-3 text-xs font-medium text-slate-500">{project.date}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-navy" />
                  </Link>
                </Reveal>
              ))}
              <Link to="/projects" className="subtle-link mt-7">
                Browse the full archive
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-950 py-20 text-white">
          <div className="section-shell grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <Reveal>
              <GraduationCap className="h-7 w-7 text-sky-300" />
              <p className="mt-6 text-xs font-semibold uppercase text-sky-300">Education</p>
              <h2 className="mt-3 text-3xl font-semibold">{profile.university}</h2>
              <p className="mt-4 text-slate-300">{profile.program}</p>
              <p className="mt-2 text-sm text-slate-400">{profile.graduation} · {profile.location}</p>
            </Reveal>

            <Reveal>
              <p className="mb-4 text-xs font-semibold uppercase text-sky-300">Selected achievements</p>
              <div className="border-t border-slate-700">
                {achievements.map(([title, description]) => (
                  <div key={title} className="grid gap-2 border-b border-slate-700 py-5 sm:grid-cols-[1fr_1.25fr]">
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="text-sm text-slate-400">{description}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
