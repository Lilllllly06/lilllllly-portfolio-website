
import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import CuteParticlesBurst from './animations/CuteParticlesBurst';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 });
  const location = useLocation();
  const nameRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNameClick = (e: React.MouseEvent) => {
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
