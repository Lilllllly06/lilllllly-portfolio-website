
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById } from '@/data/projects';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotFound from './NotFound';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const project = id ? getProjectById(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) {
    return <NotFound />;
  }

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
              
              {project.images && project.images.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-navy-dark mb-3">Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.images.map((img, index) => (
                      <div key={index} className="rounded-lg overflow-hidden shadow-md">
                        <img 
                          src={img} 
                          alt={`${project.title} - image ${index + 1}`} 
                          className="w-full h-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {project.pdfFiles && project.pdfFiles.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-navy-dark mb-3">Documents</h3>
                  <div className="space-y-4">
                    {project.pdfFiles.map((pdf, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{pdf.name}</span>
                          <Button variant="outline" asChild size="sm">
                            <a href={pdf.url} target="_blank" rel="noopener noreferrer">View PDF</a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {project.videos && project.videos.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-navy-dark mb-3">Videos</h3>
                  <div className="space-y-6">
                    {project.videos.map((video, index) => (
                      <div key={index}>
                        <h4 className="font-medium mb-2">{video.name}</h4>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <iframe 
                            width="100%" 
                            height="100%" 
                            src={video.url} 
                            title={video.name}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="sticky top-24">
                <div className="rounded-lg overflow-hidden shadow-md mb-6">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-auto"
                  />
                </div>
                
                <Separator className="my-6" />
                
                <h3 className="text-lg font-semibold text-navy-dark mb-2">Other Projects</h3>
                <div className="space-y-4">
                  {projects
                    .filter(p => p.id !== project.id)
                    .slice(0, 3)
                    .map(relatedProject => (
                      <Link 
                        key={relatedProject.id} 
                        to={`/project/${relatedProject.id}`}
                        className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <h4 className="font-medium text-navy">{relatedProject.title}</h4>
                        <p className="text-sm text-gray-500">{relatedProject.category}</p>
                      </Link>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDetail;
