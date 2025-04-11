import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import CuteParticlesBurst from './animations/CuteParticlesBurst';
import PetDog from './animations/PetDog';
import { useToast } from "@/hooks/use-toast";
import { CongratsDialog, useEasterEggs } from './EasterEggTracker';

// Custom CSS for paw cursor - using emoji for better visual appearance and light blue color
const pawCursorStyle = {
  cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%2391D8FA' stroke='none' stroke-width='2'><path d='M8.35,3C9.53,2.83 10.78,4.12 11.14,5.9C11.5,7.67 10.85,9.25 9.67,9.43C8.5,9.61 7.24,8.32 6.87,6.54C6.5,4.77 7.17,3.19 8.35,3M15.5,3C16.69,3.19 17.35,4.77 17,6.54C16.62,8.32 15.37,9.61 14.19,9.43C13,9.25 12.35,7.67 12.72,5.9C13.08,4.12 14.33,2.83 15.5,3M3,7.6C4.14,7.11 5.69,8 6.5,9.55C7.26,11.13 7,12.79 5.87,13.28C4.74,13.77 3.2,12.89 2.41,11.32C1.62,9.75 1.9,8.08 3,7.6M21,7.6C22.1,8.08 22.38,9.75 21.59,11.32C20.8,12.89 19.26,13.77 18.13,13.28C17,12.79 16.74,11.13 17.5,9.55C18.31,8 19.86,7.11 21,7.6M19.33,18.38C19.37,19.32 18.65,20.36 17.79,20.75C16,21.57 13.88,19.87 11.89,19.87C9.9,19.87 7.81,21.64 6,20.75C5,20.31 4.27,19.33 4.35,18.38C4.63,13.5 12.14,13.5 19.33,18.38Z'/></svg>") 16 16, auto`,
};

const Hero = () => {
  const [showParticles, setShowParticles] = useState(false);
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [showFirstMessage, setShowFirstMessage] = useState(false);
  const [showThirdMessage, setShowThirdMessage] = useState(false);
  const [showFourthMessage, setShowFourthMessage] = useState(false);
  const [showSixthMessage, setShowSixthMessage] = useState(false);
  const [showSeventhMessage, setShowSeventhMessage] = useState(false);
  const [showEighthMessage, setShowEighthMessage] = useState(false);
  const [showWelcomeBackMessage, setShowWelcomeBackMessage] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const { toast } = useToast();
  const { markEggFound, showCongrats, handleCloseCongrats } = useEasterEggs();

  useEffect(() => {
    const hasVisitedBefore = sessionStorage.getItem('hasVisitedHomePage');
    const hasVisitedOtherPage = sessionStorage.getItem('hasVisitedOtherPage');
    
    if (hasVisitedBefore && hasVisitedOtherPage) {
      setShowWelcomeBackMessage(true);
      setTimeout(() => setShowWelcomeBackMessage(false), 5000);
    }
    
    sessionStorage.setItem('hasVisitedHomePage', 'true');
  }, []);

  const handleNameClick = (e: React.MouseEvent) => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    
    const storedClickCount = Number(localStorage.getItem('nameClickCount') || '0');
    localStorage.setItem('nameClickCount', (storedClickCount + 1).toString());
    
    if (storedClickCount + 1 >= 5) {
      markEggFound('clickedName');
    }
    
    if (newClickCount === 5) {
      setShowFirstMessage(true);
      setTimeout(() => setShowFirstMessage(false), 3000);
    } else if (newClickCount === 15) {
      setShowThirdMessage(true);
      setTimeout(() => setShowThirdMessage(false), 3000);
    } else if (newClickCount === 20) {
      setShowFourthMessage(true);
      setTimeout(() => setShowFourthMessage(false), 3000);
    } else if (newClickCount === 30) {
      setShowSixthMessage(true);
      setTimeout(() => setShowSixthMessage(false), 3000);
    } else if (newClickCount === 45) {
      setShowSeventhMessage(true);
      setTimeout(() => setShowSeventhMessage(false), 3000);
    } else if (newClickCount === 50) {
      setShowEighthMessage(true);
      setTimeout(() => setShowEighthMessage(false), 3000);
    }
    
    const rect = nameRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setParticleOrigin({ 
        x: centerX,
        y: centerY
      });
      setShowParticles(true);
    }
  };

  const handleAnimationComplete = () => {
    setShowParticles(false);
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-white to-gray-100 relative">
      <PetDog showWelcomeBack={showWelcomeBackMessage} />
      <CongratsDialog open={showCongrats} onClose={handleCloseCongrats} />
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <h1 
              ref={nameRef}
              className="text-4xl md:text-6xl font-bold text-navy mb-6 hover:text-navy-dark transition-colors duration-300" 
              onClick={handleNameClick}
              style={pawCursorStyle}
            >
              <span>
                Yuezhen (Lily) Dong
              </span>
            </h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ opacity: showFirstMessage ? 1 : 0, scale: showFirstMessage ? 1 : 0.8, y: showFirstMessage ? 0 : 10 }}
              className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
              style={{ 
                zIndex: 60,
                borderRadius: '16px 16px 16px 4px',
                whiteSpace: 'nowrap'
              }}
            >
              <div className="font-medium">hiiii ˶ᵔ ᵕ ᵔ˶</div>
              <div 
                className="absolute w-3 h-3 bg-navy-light" 
                style={{ 
                  left: '50%', 
                  top: '-6px',
                  transform: 'translateX(-50%) rotate(45deg)'
                }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ opacity: showThirdMessage ? 1 : 0, scale: showThirdMessage ? 1 : 0.8, y: showThirdMessage ? 0 : 10 }}
              className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
              style={{ 
                zIndex: 60,
                borderRadius: '16px 16px 16px 4px',
                whiteSpace: 'nowrap'
              }}
            >
              <div className="font-medium">404 not found ⸝⸝๑﹏๑⸝⸝</div>
              <div 
                className="absolute w-3 h-3 bg-navy-light" 
                style={{ 
                  left: '50%', 
                  top: '-6px',
                  transform: 'translateX(-50%) rotate(45deg)'
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ opacity: showFourthMessage ? 1 : 0, scale: showFourthMessage ? 1 : 0.8, y: showFourthMessage ? 0 : 10 }}
              className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
              style={{ 
                zIndex: 60,
                borderRadius: '16px 16px 16px 4px',
                whiteSpace: 'nowrap'
              }}
            >
              <div className="font-medium">no more clicking ,,⩌&apos;︿&apos;⩌,,</div>
              <div 
                className="absolute w-3 h-3 bg-navy-light" 
                style={{ 
                  left: '50%', 
                  top: '-6px',
                  transform: 'translateX(-50%) rotate(45deg)'
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ opacity: showSixthMessage ? 1 : 0, scale: showSixthMessage ? 1 : 0.8, y: showSixthMessage ? 0 : 10 }}
              className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
              style={{ 
                zIndex: 60,
                borderRadius: '16px 16px 16px 4px',
                whiteSpace: 'nowrap'
              }}
            >
              <div className="font-medium">this is the last one...</div>
              <div 
                className="absolute w-3 h-3 bg-navy-light" 
                style={{ 
                  left: '50%', 
                  top: '-6px',
                  transform: 'translateX(-50%) rotate(45deg)'
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ opacity: showSeventhMessage ? 1 : 0, scale: showSeventhMessage ? 1 : 0.8, y: showSeventhMessage ? 0 : 10 }}
              className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
              style={{ 
                zIndex: 60,
                borderRadius: '16px 16px 16px 4px',
                whiteSpace: 'nowrap'
              }}
            >
              <div className="font-medium">( ˶°ㅁ°)!!</div>
              <div 
                className="absolute w-3 h-3 bg-navy-light" 
                style={{ 
                  left: '50%', 
                  top: '-6px',
                  transform: 'translateX(-50%) rotate(45deg)'
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ opacity: showEighthMessage ? 1 : 0, scale: showEighthMessage ? 1 : 0.8, y: showEighthMessage ? 0 : 10 }}
              className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
              style={{ 
                zIndex: 60,
                borderRadius: '16px 16px 16px 4px',
                whiteSpace: 'nowrap'
              }}
            >
              <div className="font-medium">that was fun... byebye ˶˃ ᵕ ˂˶</div>
              <div 
                className="absolute w-3 h-3 bg-navy-light" 
                style={{ 
                  left: '50%', 
                  top: '-6px',
                  transform: 'translateX(-50%) rotate(45deg)'
                }}
              />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              <Link to="/doggy-diary" className="hover:text-navy-dark transition-colors" style={pawCursorStyle} onClick={() => {
                localStorage.setItem('diaryFound', 'true');
                markEggFound('foundDiary');
              }}>
                Engineering Portfolio
              </Link>
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-gray-600 mb-10 text-lg max-w-2xl mx-auto">
              BASc in electrical engineering student focused on building practical software and web applications,
              with experience in both industry and research projects. Passionate about applying engineering principles
              to solve complex problems in fluid dynamics, heat transfer, and materials science.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button asChild className="bg-navy hover:bg-navy-dark">
                <Link to="/projects" className="flex items-center">
                  View Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button variant="outline" asChild>
                <a href="https://lilllllly06.github.io/portfolio-pdfs/Yuezhen_Dong_Resume.pdf" target="_blank" rel="noopener noreferrer">
                  View Resume
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <CuteParticlesBurst 
        isActive={showParticles} 
        originX={particleOrigin.x}
        originY={particleOrigin.y}
        onComplete={handleAnimationComplete} 
      />
    </section>
  );
};

export default Hero;
