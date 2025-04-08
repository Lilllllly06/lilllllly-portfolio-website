
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, projects } from '@/data/projects';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotFound from './NotFound';
import ProjectContent from '@/components/project/ProjectContent';
import ProjectSidebar from '@/components/project/ProjectSidebar';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const project = id ? getProjectById(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) {
    return <NotFound />;
  }

  const relatedProjects = projects
    .filter(p => p.id !== project.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/projects" className="flex items-center text-gray-600">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Link>
          </Button>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">{project.title}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-navy-light text-white text-xs px-2 py-1 rounded-full">
                  {project.category}
                </span>
                <span className="text-gray-500 text-sm">{project.date}</span>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                {project.longDescription}
              </p>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-navy-dark mb-3">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span 
                      key={tech} 
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Project Sections */}
              <ProjectContent project={project} />
            </div>
            
            <div>
              <ProjectSidebar project={project} relatedProjects={relatedProjects} />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDetail;
