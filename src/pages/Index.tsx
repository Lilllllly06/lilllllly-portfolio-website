
import { useState, useEffect } from 'react';
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
import ResearchSection from '@/components/project/ResearchSection';
import WelcomeDialog from '@/components/WelcomeDialog';

const Index = () => {
  const [featuredProjects] = useState(projects.slice(0, 3));
  const [showWelcome, setShowWelcome] = useState(false);
  
  const resumes = [
    { 
      name: "Industry Resume", 
      url: "https://lilllllly06.github.io/portfolio-pdfs/Yuezhen_Dong_Resume.pdf" 
    },
    { 
      name: "Academic CV", 
      url: "https://lilllllly06.github.io/portfolio-pdfs/Yuezhen_Dong__2024___Resume_1_Research.pdf" 
    }
  ];
  
  useEffect(() => {
    // Show the welcome dialog for new users using localStorage instead of sessionStorage
    if (!localStorage.getItem('welcomeShown')) {
      // Show welcome dialog after a short delay
      const timer = setTimeout(() => {
        setShowWelcome(true);
        // Mark as shown for future visits
        localStorage.setItem('welcomeShown', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        {/* Welcome Dialog */}
        <WelcomeDialog open={showWelcome} onClose={() => setShowWelcome(false)} />
        
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
          
          <div className="text-center mt-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Button asChild variant="outline" className="mx-auto">
                <Link to="/projects" className="flex items-center">
                  More Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>
        
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-8 container mx-auto px-4"
        >
          <div className="mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-navy mb-6"
            >
              Resumes
            </motion.h2>
            <ResearchSection 
              title="Download Resume"
              description="View my resumes for industry and research positions"
              pdfFiles={resumes}
            />
          </div>
        </motion.section>
        
        <SkillsSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
