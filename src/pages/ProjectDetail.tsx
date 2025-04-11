
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
          {/* Left column - Project image and related projects */}
          <div className="lg:w-1/3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="sticky top-24"
            >
              <Card className="overflow-hidden shadow-md mb-6 bg-white">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-auto object-contain bg-white"
                />
              </Card>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold text-navy-dark mb-4">Other Projects</h3>
              <div className="space-y-4">
                {relatedProjects.map((relatedProject, index) => (
                  <motion.div
                    key={relatedProject.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(243, 244, 246, 0.6)" }}
                    className="rounded-md"
                  >
                    <Link 
                      to={`/project/${relatedProject.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-white shadow-sm">
                        <img 
                          src={relatedProject.image} 
                          alt={relatedProject.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-navy">{relatedProject.title}</h4>
                        <p className="text-xs text-gray-500">{relatedProject.category}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Right column - Project content */}
          <div className="lg:w-2/3 space-y-12">
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
              <p className="text-gray-700 mb-8">{project.description}</p>
            </motion.div>
            
            {/* Research Report Section */}
            {project.sections.research && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 mr-2 text-navy" />
                  <h2 className="text-2xl font-semibold text-navy">{project.sections.research.title}</h2>
                </div>
                {project.sections.research.description && (
                  <p className="text-gray-700 mb-4">{project.sections.research.description}</p>
                )}
                <div className="space-y-4">
                  {project.sections.research.pdfFiles.map((pdf, index) => (
                    <motion.div 
                      key={index} 
                      className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-navy-dark">{pdf.name}</span>
                        <Button 
                          variant="outline" 
                          asChild 
                          size="sm" 
                          className="hover:bg-navy hover:text-white transition-colors"
                        >
                          <a 
                            href={pdf.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            View PDF
                          </a>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* CAD Section */}
            {project.sections.cad && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="flex items-center mb-4"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <motion.div 
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.6 }}
                    className="mr-2"
                  >
                    <Cpu className="h-5 w-5 text-navy" />
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-navy">{project.sections.cad.title}</h2>
                </motion.div>
                
                {project.sections.cad.description && (
                  <motion.p 
                    className="text-gray-700 mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    {project.sections.cad.description}
                  </motion.p>
                )}
                
                {project.sections.cad.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {project.sections.cad.images.map((img, index) => (
                      <motion.div 
                        key={index} 
                        className="rounded-lg overflow-hidden shadow-md flex flex-col h-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                        }}
                      >
                        <div className="flex-grow">
                          <motion.img 
                            src={img.url} 
                            alt={img.caption} 
                            className="w-full h-auto object-cover"
                            whileHover={{ 
                              scale: 1.05,
                              transition: { duration: 0.3 }
                            }}
                          />
                        </div>
                        <motion.div 
                          className="p-3 bg-gray-50"
                          whileHover={{ backgroundColor: "#f0f4f8" }}
                        >
                          <p className="text-sm text-gray-700 text-center">{img.caption}</p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.p 
                    className="text-gray-500 italic"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    Images will be added soon.
                  </motion.p>
                )}
              </motion.div>
            )}
            
            {/* PCB Design Section */}
            {project.sections.pcb && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <CircuitBoard className="h-5 w-5 mr-2 text-navy" />
                  <h2 className="text-2xl font-semibold text-navy">{project.sections.pcb.title}</h2>
                </div>
                {project.sections.pcb.description && (
                  <p className="text-gray-700 mb-4">{project.sections.pcb.description}</p>
                )}
                {project.sections.pcb.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {project.sections.pcb.images.map((img, index) => (
                      <motion.div 
                        key={index} 
                        className="rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow flex flex-col h-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5, transition: { duration: 0.3 } }}
                      >
                        <div className="relative overflow-hidden flex-grow flex items-center justify-center bg-gray-50 p-4" style={{ minHeight: "220px" }}>
                          <img 
                            src={img.url} 
                            alt={img.caption} 
                            className="max-w-full max-h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                          <p className="text-sm text-gray-700 text-center font-medium">{img.caption}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Images will be added soon.</p>
                )}
              </motion.div>
            )}
            
            {/* Setup Demonstration Section */}
            {project.sections.demonstration && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <Monitor className="h-5 w-5 mr-2 text-navy" />
                  <h2 className="text-2xl font-semibold text-navy">{project.sections.demonstration.title}</h2>
                </div>
                {project.sections.demonstration.description && (
                  <p className="text-gray-700 mb-4">{project.sections.demonstration.description}</p>
                )}
                
                {/* Demonstration Images */}
                {project.sections.demonstration.images.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8 mb-8">
                    {project.sections.demonstration.images.map((img, index) => (
                      <motion.div 
                        key={index} 
                        className="rounded-lg overflow-hidden shadow-md bg-white"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5, transition: { duration: 0.3 } }}
                      >
                        <div className="relative overflow-hidden flex items-center justify-center bg-gray-50 p-4">
                          <img 
                            src={img.url} 
                            alt={img.caption} 
                            className="max-w-full object-contain mx-auto"
                            style={{ maxHeight: "550px", width: "auto" }}
                          />
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                          <p className="text-sm text-gray-700 text-center font-medium">{img.caption}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic mb-6">Images will be added soon.</p>
                )}
                
                {/* Demonstration Videos */}
                {project.sections.demonstration.videos && project.sections.demonstration.videos.length > 0 && (
                  <div className="space-y-6">
                    {project.sections.demonstration.videos.map((video, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <h4 className="font-medium mb-2">{video.name}</h4>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDetail;
