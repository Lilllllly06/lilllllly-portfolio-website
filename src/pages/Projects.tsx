
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { projects, getAllCategories } from '@/data/projects';
import ProjectsGrid from '@/components/ProjectsGrid';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Projects = () => {
  const categories = ['All', ...getAllCategories()];
  const [activeCategory, setActiveCategory] = useState('All');
  const location = useLocation();
  
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
            <motion.div 
              className="max-w-4xl mx-auto mb-12 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-navy mb-3">Projects</h1>
              <p className="text-gray-600 text-lg">
                Explore my research work and engineering projects
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 mb-10"
            >
              {categories.map((category, index) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className={activeCategory === category ? "bg-navy hover:bg-navy-dark" : ""}
                >
                  {category}
                </Button>
              ))}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <ProjectsGrid 
                projects={projects}
                filter={activeCategory === 'All' ? undefined : activeCategory}
              />
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Projects;
