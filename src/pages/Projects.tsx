
import { useState } from 'react';
import { projects, getAllCategories } from '@/data/projects';
import ProjectsGrid from '@/components/ProjectsGrid';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Projects = () => {
  const categories = ['All', ...getAllCategories()];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-navy mb-2">Projects</h1>
            <p className="text-gray-600 mb-8">
              Explore my research work and engineering projects
            </p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className={activeCategory === category ? "bg-navy hover:bg-navy-dark" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <ProjectsGrid 
              projects={filteredProjects} 
              filter={activeCategory === 'All' ? undefined : activeCategory} 
            />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Projects;
