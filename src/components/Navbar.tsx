import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import CuteParticlesBurst from './animations/CuteParticlesBurst';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [showFirstMessage, setShowFirstMessage] = useState(false);
  const [showSecondMessage, setShowSecondMessage] = useState(false);
  const [showThirdMessage, setShowThirdMessage] = useState(false);
  const [showFifthMessage, setShowFifthMessage] = useState(false);
  const [showSixthMessage, setShowSixthMessage] = useState(false);
  const location = useLocation();
  const nameRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNameClick = (e: React.MouseEvent) => {
    // Increment click counter
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    
    // Check for special messages with updated click thresholds
    if (newClickCount === 5) {
      setShowFirstMessage(true);
      setTimeout(() => setShowFirstMessage(false), 3000);
    } else if (newClickCount === 10) {
      setShowSecondMessage(true);
      setTimeout(() => setShowSecondMessage(false), 3000);
    } else if (newClickCount === 25) {
      setShowThirdMessage(true);
      setTimeout(() => setShowThirdMessage(false), 3000);
    } else if (newClickCount === 45) {
      setShowFifthMessage(true);
      setTimeout(() => setShowFifthMessage(false), 3000);
    } else if (newClickCount === 50) {
      setShowSixthMessage(true);
      setTimeout(() => setShowSixthMessage(false), 3000);
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

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/projects", label: "Projects" },
    { path: "/about", label: "About" }
  ];

  return (
    <>
      <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="relative">
            <motion.div
              ref={nameRef}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              onClick={handleNameClick}
              className="cursor-pointer"
            >
              <Link to="/" className="text-navy font-semibold text-xl">
                Yuezhen (Lily) Dong
              </Link>
            </motion.div>
            
            {/* First message bubble */}
            <AnimatePresence>
              {showFirstMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute left-full ml-4 top-0 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
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
                      left: '-6px', 
                      top: '12px',
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      transform: 'rotate(45deg)'
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Second message bubble */}
            <AnimatePresence>
              {showSecondMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute left-full ml-4 top-0 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
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
                      left: '-6px', 
                      top: '12px',
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      transform: 'rotate(45deg)'
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Third message bubble (25 clicks) */}
            <AnimatePresence>
              {showThirdMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute left-full ml-4 top-0 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
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
                      left: '-6px', 
                      top: '12px',
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      transform: 'rotate(45deg)'
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fifth message bubble (45 clicks) */}
            <AnimatePresence>
              {showFifthMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute left-full ml-4 top-0 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
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
                      left: '-6px', 
                      top: '12px',
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      transform: 'rotate(45deg)'
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sixth message bubble (50 clicks) */}
            <AnimatePresence>
              {showSixthMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute left-full ml-4 top-0 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
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
                      left: '-6px', 
                      top: '12px',
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      transform: 'rotate(45deg)'
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ 
                    color: '#0f4c81',
                    scale: 1.05,
                    transition: { duration: 0.3, ease: "easeInOut" }
                  }}
                >
                  <Link 
                    to={item.path} 
                    className={`relative text-gray-600 transition-colors ${
                      isActive(item.path) ? "font-medium" : ""
                    }`}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="navbar-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-navy"
                        initial={false}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 30,
                          duration: 0.3
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Menu">
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-md z-40"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: "easeInOut"
              }}
            >
              <div className="flex flex-col p-4 space-y-4">
                {navItems.map((item) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ x: 5, backgroundColor: "#f3f4f6" }}
                  >
                    <Link 
                      to={item.path} 
                      className={`block text-gray-600 hover:text-navy transition-colors py-2 px-4 rounded-md ${
                        isActive(item.path) ? "font-medium bg-gray-50" : ""
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Cute particles animation */}
      <CuteParticlesBurst 
        isActive={showParticles} 
        originX={particleOrigin.x}
        originY={particleOrigin.y}
        onComplete={handleAnimationComplete} 
      />
    </>
  );
};

export default Navbar;
