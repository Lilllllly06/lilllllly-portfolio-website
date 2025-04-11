
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import CuteParticlesBurst from './animations/CuteParticlesBurst';
import PetDog from './animations/PetDog';

const Hero = () => {
  const [showParticles, setShowParticles] = useState(false);
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [showFirstMessage, setShowFirstMessage] = useState(false);
  const [showThirdMessage, setShowThirdMessage] = useState(false);
  const [showFourthMessage, setShowFourthMessage] = useState(false);
  const [showFifthMessage, setShowFifthMessage] = useState(false);
  const [showSixthMessage, setShowSixthMessage] = useState(false);
  const [showSeventhMessage, setShowSeventhMessage] = useState(false);
  const [showEighthMessage, setShowEighthMessage] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);

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
    } else if (newClickCount === 25) {
      setShowFifthMessage(true);
      setTimeout(() => setShowFifthMessage(false), 3000);
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
      <PetDog />
      
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
              className="text-4xl md:text-6xl font-bold text-navy mb-6 cursor-pointer hover:text-navy-dark transition-colors duration-300" 
              onClick={handleNameClick}
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

            {/* Fifth message bubble (25 clicks) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ opacity: showFifthMessage ? 1 : 0, scale: showFifthMessage ? 1 : 0.8, y: showFifthMessage ? 0 : 10 }}
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
              Engineering Portfolio
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
