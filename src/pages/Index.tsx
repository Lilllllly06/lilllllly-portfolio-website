
import { useState } from 'react';
import Hero from '@/components/Hero';
import SkillsSection from '@/components/SkillsSection';
import ProjectsGrid from '@/components/ProjectsGrid';
import { projects } from '@/data/projects';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const Index = () => {
  const [featuredProjects] = useState(projects.slice(0, 3));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-16 container mx-auto px-4"
        >
          <div className="flex justify-between items-center mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-navy"
            >
              Featured Projects
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ x: 5 }}
            >
              <Button variant="ghost" asChild>
                <Link to="/projects" className="flex items-center text-navy hover:text-navy-dark">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
          
          <ProjectsGrid projects={featuredProjects} />
        </motion.section>
        
        <SkillsSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
