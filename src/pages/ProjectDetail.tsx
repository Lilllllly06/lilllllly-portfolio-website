
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projects } from '@/data/projects';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotFound from './NotFound';
import projectTracker from '@/utils/projectTracker';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { CircuitBoard, Cpu, FileText, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

import ProjectSidebar from '@/components/project/ProjectSidebar';
import ProjectContent from '@/components/project/ProjectContent';

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);

  // Get 3 related projects, excluding the current one
  const relatedProjects = projects
    .filter(p => p.id !== id)
    .sort(() => 0.5 - Math.random()) // Shuffle array
    .slice(0, 3); // Get first 3 items

  useEffect(() => {
    // Track this project view if it exists
    if (project) {
      projectTracker.trackProject(project.id);
    }
    
    // Scroll to top when project changes
    window.scrollTo(0, 0);
  }, [project]);

  if (!project) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left column - Project content */}
          <div className="lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-navy mb-2">{project.title}</h1>
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium bg-navy text-white px-3 py-1.5 rounded-full shadow-sm">
                  {project.category}
                </span>
              </div>
              <p className="text-gray-700 mb-8">{project.longDescription}</p>
            </motion.div>
            
            <ProjectContent project={project} />
          </div>
          
          {/* Right column - Project image and related projects */}
          <div className="lg:w-1/3">
            <ProjectSidebar project={project} relatedProjects={relatedProjects} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDetail;
