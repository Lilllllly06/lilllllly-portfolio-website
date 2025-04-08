
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

const Index = () => {
  const [featuredProjects] = useState(projects.slice(0, 3));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        <section className="py-16 container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-navy">Featured Projects</h2>
            <Button variant="ghost" asChild>
              <Link to="/projects" className="flex items-center text-navy hover:text-navy-dark">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <ProjectsGrid projects={featuredProjects} />
        </section>
        
        <SkillsSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
