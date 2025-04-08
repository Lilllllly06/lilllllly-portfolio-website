
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link to="/" className="text-navy font-semibold text-xl">
            Yuezhen (Lily) Dong
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {[
            { path: "/", label: "Home" },
            { path: "/projects", label: "Projects" },
            { path: "/about", label: "About" },
            { path: "/contact", label: "Contact" }
          ].map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ 
                scale: 1.1, 
                y: -3,
                color: '#0f4c81' 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 10 
              }}
            >
              <Link 
                to={item.path} 
                className={`relative text-gray-600 hover:text-navy transition-colors ${
                  isActive(item.path) ? "font-medium" : ""
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-navy"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Menu">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-md z-40"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col p-4 space-y-4">
            {[
              { path: "/", label: "Home" },
              { path: "/projects", label: "Projects" },
              { path: "/about", label: "About" },
              { path: "/contact", label: "Contact" }
            ].map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ x: 10, color: '#0f4c81' }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link 
                  to={item.path} 
                  className={`block text-gray-600 hover:text-navy transition-colors py-2 px-4 ${
                    isActive(item.path) ? "font-medium" : ""
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
    </nav>
  );
};

export default Navbar;
