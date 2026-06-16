
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { profile } from '@/data/profile';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Track user navigation to pages other than home
  useEffect(() => {
    if (location.pathname !== '/') {
      sessionStorage.setItem('hasVisitedOtherPage', 'true');
    }
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/projects", label: "Projects" },
    { path: "/about", label: "About" }
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-sky-100 bg-white/85 py-4 shadow-sm backdrop-blur-xl">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="cursor-pointer"
            >
              <Link to="/" className="text-navy font-semibold text-xl">
                {profile.name}
              </Link>
            </motion.div>
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
                      isActive(item.path) ? "font-medium text-navy" : ""
                    }`}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="navbar-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-sky-500"
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
              className="fixed left-0 right-0 top-16 z-40 border-b border-sky-100 bg-white/95 shadow-md backdrop-blur md:hidden"
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
                    whileHover={{ x: 5, backgroundColor: "#f0f9ff" }}
                  >
                    <Link 
                      to={item.path} 
                      className={`block text-gray-600 hover:text-navy transition-colors py-2 px-4 rounded-md ${
                        isActive(item.path) ? "font-medium bg-sky-50 text-navy" : ""
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
    </>
  );
};

export default Navbar;
