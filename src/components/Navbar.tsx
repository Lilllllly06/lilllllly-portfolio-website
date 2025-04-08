
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-navy font-semibold text-xl">
          Yuezhen (Lily) Dong
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-600 hover:text-navy transition-colors">
            Home
          </Link>
          <Link to="/projects" className="text-gray-600 hover:text-navy transition-colors">
            Projects
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-navy transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-navy transition-colors">
            Contact
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-md z-40 animate-fade-in">
          <div className="flex flex-col p-4 space-y-4">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-navy transition-colors py-2 px-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/projects" 
              className="text-gray-600 hover:text-navy transition-colors py-2 px-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </Link>
            <Link 
              to="/about" 
              className="text-gray-600 hover:text-navy transition-colors py-2 px-4"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 hover:text-navy transition-colors py-2 px-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
