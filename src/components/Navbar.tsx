
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { profile } from '@/data/profile';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') {
      sessionStorage.setItem('hasVisitedOtherPage', 'true');
    }
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const navigateToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  const navItems = [
    { path: "/projects", label: "Projects" },
    { path: "/about", label: "About" }
  ];

  return (
    <nav className="sticky top-0 z-50 h-[68px] border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <a
        href="#main-content"
        className="absolute left-4 top-0 z-[60] -translate-y-full rounded-md bg-navy px-3 py-2 text-sm font-medium text-white focus:translate-y-2"
      >
        Skip to content
      </a>
      <div className="section-shell flex h-full items-center justify-between">
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-3 text-navy"
          onClick={navigateToTop}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy text-xs font-semibold text-white transition-colors group-hover:bg-sky-700">
            YD
          </span>
          <span className="truncate text-sm font-semibold sm:text-base">{profile.name}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <div className="mr-3 flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={navigateToTop}
                className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-slate-100 text-navy"
                    : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Button asChild size="sm" className="bg-navy hover:bg-navy-dark">
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4" />
              Resume
            </a>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute left-0 right-0 top-[68px] border-b border-slate-200 bg-white px-5 py-4 shadow-lg md:hidden"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <div className="mx-auto flex max-w-[1180px] flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-md px-3 py-3 text-sm font-medium ${
                    isActive(item.path) ? "bg-slate-100 text-navy" : "text-slate-600"
                  }`}
                  onClick={() => {
                    navigateToTop();
                    setIsMenuOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 rounded-md bg-navy px-3 py-3 text-sm font-medium text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                View resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
