
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import CuteParticlesBurst from './animations/CuteParticlesBurst';
import PetDog from './animations/PetDog';
import { useToast } from "@/hooks/use-toast";

// Custom CSS for paw cursor
const pawCursorStyle = {
  cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%230f4c81' stroke='%230f4c81' stroke-width='2'><path d='M22 16.7c0 1.7-1.4 2.4-2 2.4-1.8 0-2.4-1.7-3.5-1.7s-1.8 1.7-3.5 1.7-2.4-1.7-3.5-1.7-1.8 1.7-3.5 1.7-2.4-1.7-3.5-1.7S.8 19 .1 16.7C-.5 14.3 1.6 7.1 3.9 7.1c1 0 1.8.8 2.9.8s1.9-.8 2.9-.8 1.8.8 2.9.8 1.9-.8 2.9-.8 1.8.8 2.9.8 1.9-.8 2.9-.8c2.4 0 4.4 7.3 3.8 9.6z'/><path d='M8 20v2c0 1 .4 2 2 2s2-1 2-2v-2M12 20v2c0 1 .4 2 2 2s2-1 2-2v-2'/></svg>") 16 16, auto`,
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

  // Effect to show welcome back message when returning to home page
  useEffect(() => {
    // Check if user is returning to the home page
    const hasVisitedBefore = sessionStorage.getItem('hasVisitedHomePage');
    const hasVisitedOtherPage = sessionStorage.getItem('hasVisitedOtherPage');
    
    if (hasVisitedBefore && hasVisitedOtherPage) {
      setShowWelcomeBackMessage(true);
      setTimeout(() => setShowWelcomeBackMessage(false), 5000);
    }
    
    // Mark that user has visited the home page
    sessionStorage.setItem('hasVisitedHomePage', 'true');
  }, []);

  const handleNameClick = (e: React.MouseEvent) => {
    // Increment click counter
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    
    // Check for special messages with updated click thresholds
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
    
    // Calculate click position for animation origin
    const rect = nameRef.current?.getBoundingClientRect();
    if (rect) {
      // Center of the name element
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
            
            {/* First message bubble */}
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
            
            {/* Third message bubble (15th click) */}
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

            {/* Fourth message bubble (20 clicks) */}
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

            {/* Sixth message bubble (30 clicks) */}
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

            {/* Seventh message bubble (45 clicks) */}
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

            {/* Eighth message bubble (50 clicks) */}
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
              <Link to="/doggy-diary" className="hover:text-navy-dark transition-colors">
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
