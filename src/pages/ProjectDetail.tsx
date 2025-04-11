
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projects } from '@/data/projects';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ProjectContent from '@/components/project/ProjectContent';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotFound from './NotFound';
import projectTracker from '@/utils/projectTracker';

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
      
      <main className="flex-grow grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr]">
        <ProjectSidebar project={project} relatedProjects={relatedProjects} />
        <ProjectContent project={project} />
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDetail;
