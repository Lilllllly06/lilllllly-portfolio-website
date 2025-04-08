
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, projects } from '@/data/projects';
import { ArrowLeft, FileText, Cpu, CircuitBoard, Monitor } from 'lucide-react';
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

  const { sections } = project;

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
              <div className="space-y-12">
                {/* CAD Section */}
                {sections.cad && (
                  <div>
                    <div className="flex items-center mb-4">
                      <Cpu className="h-5 w-5 mr-2 text-navy" />
                      <h2 className="text-2xl font-semibold text-navy">{sections.cad.title}</h2>
                    </div>
                    {sections.cad.description && (
                      <p className="text-gray-700 mb-4">{sections.cad.description}</p>
                    )}
                    {sections.cad.images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sections.cad.images.map((img, index) => (
                          <div key={index} className="rounded-lg overflow-hidden shadow-md">
                            <img 
                              src={img} 
                              alt={`CAD Model ${index + 1}`} 
                              className="w-full h-auto"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Images will be added soon.</p>
                    )}
                  </div>
                )}
                
                {/* PCB Design Section */}
                {sections.pcb && (
                  <div>
                    <div className="flex items-center mb-4">
                      <CircuitBoard className="h-5 w-5 mr-2 text-navy" />
                      <h2 className="text-2xl font-semibold text-navy">{sections.pcb.title}</h2>
                    </div>
                    {sections.pcb.description && (
                      <p className="text-gray-700 mb-4">{sections.pcb.description}</p>
                    )}
                    {sections.pcb.images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sections.pcb.images.map((img, index) => (
                          <div key={index} className="rounded-lg overflow-hidden shadow-md">
                            <img 
                              src={img} 
                              alt={`PCB Design ${index + 1}`} 
                              className="w-full h-auto"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Images will be added soon.</p>
                    )}
                  </div>
                )}
                
                {/* Research Report Section */}
                {sections.research && (
                  <div>
                    <div className="flex items-center mb-4">
                      <FileText className="h-5 w-5 mr-2 text-navy" />
                      <h2 className="text-2xl font-semibold text-navy">{sections.research.title}</h2>
                    </div>
                    {sections.research.description && (
                      <p className="text-gray-700 mb-4">{sections.research.description}</p>
                    )}
                    <div className="space-y-4">
                      {sections.research.pdfFiles.map((pdf, index) => (
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
                
                {/* Setup Demonstration Section */}
                {sections.demonstration && (
                  <div>
                    <div className="flex items-center mb-4">
                      <Monitor className="h-5 w-5 mr-2 text-navy" />
                      <h2 className="text-2xl font-semibold text-navy">{sections.demonstration.title}</h2>
                    </div>
                    {sections.demonstration.description && (
                      <p className="text-gray-700 mb-4">{sections.demonstration.description}</p>
                    )}
                    
                    {/* Demonstration Images */}
                    {sections.demonstration.images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {sections.demonstration.images.map((img, index) => (
                          <div key={index} className="rounded-lg overflow-hidden shadow-md">
                            <img 
                              src={img} 
                              alt={`Demonstration Image ${index + 1}`} 
                              className="w-full h-auto"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic mb-6">Images will be added soon.</p>
                    )}
                    
                    {/* Demonstration Videos */}
                    {sections.demonstration.videos && sections.demonstration.videos.length > 0 && (
                      <div className="space-y-6">
                        {sections.demonstration.videos.map((video, index) => (
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
                    )}
                  </div>
                )}
              </div>
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
