
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SkillsSection from '@/components/SkillsSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';

const experiences = [
  {
    title: "Grätzel Cell",
    role: "Research Project",
    company: "University of Waterloo",
    date: "JUL 2023 - JUL 2024",
    description: [
      "Constructed and optimized a dye-sensitized solar cell using titanium dioxide and iodine electrolyte to study the mechanisms of photovoltaic energy conversion.",
      "Evaluated the influence of electrolyte concentration, glass conductivity, TiO₂ layer thickness, and temperature on cell efficiency through electrochemical analysis and precise measurements using multimeters and lux meters.",
      "Employed MATLAB for data modeling and simulations to assess the impact of parameter variations on electron transport and photocurrent, validating experimental results with theoretical predictions."
    ]
  },
  {
    title: "Faraday Waves",
    role: "Research Project",
    company: "University of Waterloo",
    date: "JUL 2023 - JUL 2024",
    description: [
      "Investigated Faraday waves and oscillating droplets, examining surface waves and instabilities in vertically oscillating systems.",
      "Analyzed surface and gravity-capillary waves using ImageJ and Tracker to study the effects of frequency, amplitude, and viscosity on wave patterns.",
      "Simulated droplet dynamics in MATLAB and processed data using Python and Matplotlib to quantify variations and validate theoretical predictions."
    ]
  },
  {
    title: "Junior Web Developer",
    role: "Coop",
    company: "AGF Investments",
    date: "JAN 2025 - APR 2025",
    description: [
      "Developed a Java-based ScoreCard application, featuring robust file archiving, large XLSX handling via Apache POI streaming, data validation/transformation, and a flexible properties-based configuration system.",
      "Developed a PegaRecon app that ingests large XLSX files via Apache POI streaming, applies date/time filtering and duplicate-skip logic, archives input, and outputs consolidated Excel/CSV reports—fully configurable, automated email distributions, and maintained under Maven/Git with Spring Boot.",
      "Developed automated Pega test cases verifying front-end UI interactions, ensuring robust coverage and reliability."
    ]
  },
  {
    title: "Lab Teaching Assistant",
    role: "Teaching Assistant",
    company: "SciTechnia",
    date: "OCT 2023 - MAR 2024",
    description: [
      "Instructed 20+ high school students on using lab instruments, including oscilloscopes, multimeters, and 3D printers, to enhance practical skills in electronics and physics.",
      "Designed and constructed PCBs, integrating analog and digital components for educational demonstrations and experiments.",
      "Guided students in simulation modeling with Comsol Multiphysics and data analysis using Tracker, bridging theoretical concepts with hands-on applications."
    ]
  }
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-navy mb-4">About Me</h1>
              <p className="text-xl text-gray-600 mb-6">
                BSc in Electrical Engineering from University of Waterloo
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                I'm an electrical engineering student with a passion for research, data analysis, and experimental design. 
                My work focuses on electromagnetics, fluid dynamics, and photovoltaic systems. 
                I enjoy applying computational methods to solve complex engineering problems.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <a href="#" download>
                    <Download className="mr-2 h-4 w-4" /> Download Resume
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Contact Me</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <SkillsSection />
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy mb-8 text-center">Experience</h2>
            
            <div className="max-w-3xl mx-auto">
              <div className="relative border-l-2 border-gray-200 pl-8 ml-4">
                {experiences.map((exp, index) => (
                  <div 
                    key={index} 
                    className="mb-12 relative"
                  >
                    <div className="absolute -left-12 top-0 bg-navy w-6 h-6 rounded-full flex items-center justify-center">
                      <div className="bg-white w-2 h-2 rounded-full"></div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-navy">{exp.title}</h3>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">{exp.date}</span>
                      </div>
                      <p className="text-gray-600 mb-3">{exp.role} • {exp.company}</p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        {exp.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/projects" className="flex items-center mx-auto">
                  View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-navy text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Education</h2>
              <div className="bg-navy-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">University of Waterloo - Faculty of Engineering</h3>
                <p className="mb-2 italic">BSc in Electrical Engineering</p>
                <p className="mb-4">Expected Graduation MAY 2029 • Waterloo, ON, CAN</p>
                <p className="text-gray-300">President's Scholarship of Distinction $2000</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-navy mb-6">Achievements</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-navy mb-2">IBDP Graduate</h3>
                  <p className="text-gray-600">International Baccalaureate Diploma Programme</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-navy mb-2">CaYPT National Champion</h3>
                  <p className="text-gray-600">Canadian Young Physicists' Tournament</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-navy mb-2">IYPT Bronze Medalist</h3>
                  <p className="text-gray-600">International Young Physicists' Tournament</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
