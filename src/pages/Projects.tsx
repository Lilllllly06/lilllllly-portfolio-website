
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { projects, getAllCategories } from '@/data/projects';
import ProjectsGrid from '@/components/ProjectsGrid';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Projects = () => {
  const categories = ['All', ...getAllCategories()];
  const [activeCategory, setActiveCategory] = useState('All');
  const location = useLocation();
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Handle category change with animation
  const handleCategoryChange = (category: string) => {
    setIsFiltering(true);
    setActiveCategory(category);
    
    // Short delay to allow exit animations to complete
    setTimeout(() => {
      setFilteredProjects(
        category === 'All' 
          ? projects 
          : projects.filter(project => project.category === category)
      );
      setIsFiltering(false);
    }, 300);
  };
  
  // Scroll to top when navigating to this page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-navy mb-2"
            >
              Projects
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-600 mb-8"
            >
              Explore my research work and engineering projects
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <Button
                    variant={activeCategory === category ? "default" : "outline"}
                    onClick={() => handleCategoryChange(category)}
                    className={`
                      ${activeCategory === category ? "bg-navy hover:bg-navy-dark" : ""}
                      relative overflow-hidden group
                    `}
                  >
                    {activeCategory === category && (
                      <motion.span
                        layoutId="activeCategoryIndicator"
                        className="absolute inset-0 bg-navy-light/10"
                        initial={{ borderRadius: 8 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <span className="relative z-10">{category}</span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={isFiltering ? "opacity-0" : "opacity-100"}
              >
                <ProjectsGrid 
                  projects={filteredProjects}
                  filter={undefined}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Projects;
