import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import CuteParticlesBurst from './animations/CuteParticlesBurst';
import PetDog from './animations/PetDog';
import { CongratsDialog, useEasterEggs } from './EasterEggTracker';
import { profile } from '@/data/profile';

const pawCursorStyle = {
  cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%2391D8FA'><path d='M8.35,3C9.53,2.83 10.78,4.12 11.14,5.9C11.5,7.67 10.85,9.25 9.67,9.43C8.5,9.61 7.24,8.32 6.87,6.54C6.5,4.77 7.17,3.19 8.35,3M15.5,3C16.69,3.19 17.35,4.77 17,6.54C16.62,8.32 15.37,9.61 14.19,9.43C13,9.25 12.35,7.67 12.72,5.9C13.08,4.12 14.33,2.83 15.5,3M3,7.6C4.14,7.11 5.69,8 6.5,9.55C7.26,11.13 7,12.79 5.87,13.28C4.74,13.77 3.2,12.89 2.41,11.32C1.62,9.75 1.9,8.08 3,7.6M21,7.6C22.1,8.08 22.38,9.75 21.59,11.32C20.8,12.89 19.26,13.77 18.13,13.28C17,12.79 16.74,11.13 17.5,9.55C18.31,8 19.86,7.11 21,7.6M19.33,18.38C19.37,19.32 18.65,20.36 17.79,20.75C16,21.57 13.88,19.87 11.89,19.87C9.9,19.87 7.81,21.64 6,20.75C5,20.31 4.27,19.33 4.35,18.38C4.63,13.5 12.14,13.5 19.33,18.38Z'/></svg>") 16 16, auto`,
};

const nameMilestones = new Map<number, string>([
  [5, 'hiiii ˶ᵔ ᵕ ᵔ˶'],
  [15, '404 not found ⸝⸝๑﹏๑⸝⸝'],
  [20, "no more clicking ,,⩌'︿'⩌,,"],
  [30, 'this is the last one...'],
  [45, '( ˶°ㅁ°)!!'],
  [50, 'that was fun... byebye ˶˃ ᵕ ˂˶'],
]);

const highlights = [
  { label: 'Meta', value: 'Engineering Fellow' },
  { label: 'Shopify', value: 'Software Engineering Intern' },
  { label: 'Waterloo', value: 'Computer Engineering' },
];

const Hero = () => {
  const [showParticles, setShowParticles] = useState(false);
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [nameMessage, setNameMessage] = useState('');
  const [showWelcomeBackMessage, setShowWelcomeBackMessage] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const { markEggFound, showCongrats, handleCloseCongrats } = useEasterEggs();

  useEffect(() => {
    const hasVisitedBefore = sessionStorage.getItem('hasVisitedHomePage');
    const hasVisitedOtherPage = sessionStorage.getItem('hasVisitedOtherPage');

    if (hasVisitedBefore && hasVisitedOtherPage) {
      setShowWelcomeBackMessage(true);
      window.setTimeout(() => setShowWelcomeBackMessage(false), 5000);
    }

    sessionStorage.setItem('hasVisitedHomePage', 'true');

    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  const handleNameClick = () => {
    const nextClickCount = clickCount + 1;
    setClickCount(nextClickCount);

    const storedClickCount = Number(localStorage.getItem('nameClickCount') || '0') + 1;
    localStorage.setItem('nameClickCount', storedClickCount.toString());
    if (storedClickCount >= 5) markEggFound('clickedName');

    const milestoneMessage = nameMilestones.get(nextClickCount);
    if (milestoneMessage) {
      setNameMessage(milestoneMessage);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      messageTimerRef.current = setTimeout(() => setNameMessage(''), 3000);
    }

    const rect = nameRef.current?.getBoundingClientRect();
    if (rect && !reduceMotion) {
      setParticleOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setShowParticles(true);
    }
  };

  const entry = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <>
      <section className="portfolio-banner relative isolate overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-24">
        <PetDog showWelcomeBack={showWelcomeBackMessage} />
        <CongratsDialog open={showCongrats} onClose={handleCloseCongrats} />

        <div className="section-shell relative">
          <motion.div
            {...entry}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
          <Link
            to="/doggy-diary"
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase text-sky-700 hover:text-sky-800 sm:mb-6"
            style={pawCursorStyle}
            onClick={() => {
              localStorage.setItem('diaryFound', 'true');
              markEggFound('foundDiary');
            }}
          >
            <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />
            Computer Engineering · University of Waterloo
          </Link>

          <div className="relative w-fit">
            <h1
              ref={nameRef}
              className="balanced-heading cursor-pointer text-5xl font-semibold leading-[1.05] text-navy transition-colors hover:text-navy-dark sm:text-6xl lg:text-7xl"
              onClick={handleNameClick}
              style={pawCursorStyle}
            >
              {profile.name}
            </h1>

            <motion.div
              className="absolute bottom-full left-0 mb-3 max-w-[min(18rem,calc(100vw-2.5rem))] rounded-md bg-navy px-3 py-2 text-sm font-medium text-white shadow-lg"
              initial={false}
              animate={{
                opacity: nameMessage ? 1 : 0,
                y: nameMessage ? 0 : 6,
                scale: nameMessage ? 1 : 0.96,
              }}
              transition={{ duration: 0.18 }}
              aria-live="polite"
            >
              {nameMessage}
            </motion.div>
          </div>

            <motion.p
              {...entry}
              transition={{ duration: 0.28, delay: reduceMotion ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="balanced-heading mt-5 max-w-4xl text-3xl font-medium leading-tight text-slate-800 sm:mt-8 sm:text-4xl"
            >
            Engineer building AI infrastructure, developer tools, and reliable systems.
            </motion.p>

            <motion.p
              {...entry}
              transition={{ duration: 0.28, delay: reduceMotion ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg"
            >
            I work across production engineering, agentic AI, and full-stack product development,
            with a research background in physical systems, simulation, and instrumentation.
            </motion.p>

            <motion.div
              {...entry}
              transition={{ duration: 0.28, delay: reduceMotion ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 flex flex-wrap gap-3 sm:mt-8"
            >
            <Button asChild size="lg" className="bg-navy hover:bg-navy-dark">
              <Link to="/projects">
                Explore projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-slate-300 bg-white/80">
              <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                View resume
              </a>
            </Button>
            </motion.div>
          </motion.div>
          <div className="h-16 sm:hidden" aria-hidden="true" />
        </div>

        <CuteParticlesBurst
          isActive={showParticles}
          originX={particleOrigin.x}
          originY={particleOrigin.y}
          onComplete={() => setShowParticles(false)}
        />
      </section>

      <motion.section
        {...entry}
        transition={{ duration: 0.28, delay: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="border-y border-slate-200 bg-white"
      >
        <div className="section-shell grid grid-cols-3 divide-x divide-slate-200">
          {highlights.map((item) => (
            <div key={item.label} className="min-w-0 px-3 py-5 first:pl-0 last:pr-0 sm:px-6 sm:py-6">
              <p className="text-[0.65rem] font-semibold uppercase text-sky-700 sm:text-xs">{item.label}</p>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-800 sm:text-base">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </>
  );
};

export default Hero;
