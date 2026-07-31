import Reveal from './Reveal';

const skills = {
  Languages: ['Python', 'Java', 'TypeScript', 'JavaScript', 'C/C++', 'SQL', 'Ruby', 'Bash'],
  'ML / AI': ['PyTorch', 'scikit-learn', 'OpenAI API', 'Gemini API', 'RAG', 'LLM Agents', 'Prompt Engineering', 'A/B Testing'],
  Frameworks: ['FastAPI', 'Flask', 'React', 'React Native', 'Node/Express', 'Ruby on Rails', 'Spring Boot', 'GraphQL'],
  Infrastructure: ['Docker', 'PostgreSQL', 'AWS', 'Git', 'Linux', 'CI/CD', 'Monitoring', 'Site Reliability'],
  'Research + Hardware': ['MATLAB', 'COMSOL', 'Arduino', 'EasyEDA', 'OpenCV', 'ImageJ', 'Tracker', 'Instrumentation'],
};

const SkillsSection = () => {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="section-shell grid gap-12 lg:grid-cols-[15rem_1fr]">
        <Reveal>
          <p className="section-kicker">Technical toolkit</p>
          <h2 className="text-3xl font-semibold text-navy">Tools chosen for the problem.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Software-first, with enough infrastructure, data, and hardware depth to work across system boundaries.
          </p>
        </Reveal>

        <div className="grid border-t border-slate-300 md:grid-cols-2">
          {Object.entries(skills).map(([category, skillList], index) => (
            <Reveal
              key={category}
              delay={index * 0.03}
              className={`border-b border-slate-300 py-6 md:px-6 ${
                index % 2 === 0 ? 'md:border-r md:pl-0' : 'md:pr-0'
              }`}
            >
              <h3 className="text-sm font-semibold text-navy">{category}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{skillList.join(' · ')}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
