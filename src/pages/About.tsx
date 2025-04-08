import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SkillsSection from '@/components/SkillsSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
import ResearchSection from '@/components/project/ResearchSection';
import { motion } from 'framer-motion';

const workExperiences = [
  {
    title: "Junior Web Developer",
    role: "Coop",
    company: "AGF Investments",
    date: "JAN 2025 - APR 2025",
    skills: "Java, Spring Boot, Maven, Apache POI, Git",
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
    skills: "Tracker, Comsol Multiphysics, Instrumentation and Prototyping Tools",
    description: [
      "Instructed 20+ high school students on using lab instruments, including oscilloscopes, multimeters, and 3D printers, to enhance practical skills in electronics and physics.",
      "Designed and constructed PCBs, integrating analog and digital components for educational demonstrations and experiments.",
      "Guided students in simulation modeling with Comsol Multiphysics and data analysis using Tracker, bridging theoretical concepts with hands-on applications."
    ]
  },
  {
    title: "Technology Mentor",
    role: "Mentor",
    company: "CyberSeniors",
    date: "OCT 2020 - AUG 2024",
    skills: "iOS, iPadOS, macOS, Windows, Linux",
    description: [
      "Guided 100+ seniors to proficiency in using various operating systems, completing the program in one month.",
      "Taught essential skills for setting up software accounts, configuring devices, and utilizing applications for daily tasks."
    ]
  },
  {
    title: "Website Developer",
    role: "Developer",
    company: "Beyond the Wards/Kindness Catalogue",
    date: "DEC 2020 - DEC 2023",
    skills: "Java, HTML/CSS, Javascript, Blender, Git",
    description: [
      "Built a dynamic website using Java for backend and HTML/CSS, JavaScript for frontend, ensuring responsive design and smooth user interaction.",
      "Created and integrated 3D models with Blender and JavaScript, while managing project versions with Git."
    ]
  }
];

const researchExperiences = [
  {
    title: "Grätzel Cell",
    company: "Research Project",
    date: "JUL 2023 - JUL 2024",
    skills: "Python Matplotlib, COMSOL Multiphysics, Multimeter, Lux Meter",
    description: [
      "Constructed and optimized a dye-sensitized solar cell using titanium dioxide and iodine electrolyte to study the mechanisms of photovoltaic energy conversion.",
      "Evaluated the influence of electrolyte concentration, glass conductivity, TiO₂ layer thickness, and temperature on cell efficiency through electrochemical analysis and precise measurements using multimeters and lux meters.",
      "Employed MATLAB for data modeling and simulations to assess the impact of parameter variations on electron transport and photocurrent, validating experimental results with theoretical predictions."
    ]
  },
  {
    title: "Faraday Waves",
    company: "Research Project",
    date: "JUL 2023 - JUL 2024",
    skills: "MATLAB, ImageJ, Tracker, Python, Matplotlib",
    description: [
      "Investigated Faraday waves and oscillating droplets, examining surface waves and instabilities in vertically oscillating systems.",
      "Analyzed surface and gravity-capillary waves using ImageJ and Tracker to study the effects of frequency, amplitude, and viscosity on wave patterns.",
      "Simulated droplet dynamics in MATLAB and processed data using Python and Matplotlib to quantify variations and validate theoretical predictions."
    ]
  },
  {
    title: "Magnetostriction",
    company: "Research Project",
    date: "SEP 2022 - JUL 2023",
    skills: "MATLAB, ImageJ, Tracker, Python, Matplotlib",
    description: [
      "Investigated the impact of external magnetic fields on magnetization and magnetostriction in various materials, focusing on ferromagnetic, paramagnetic, and diamagnetic properties.",
      "Measured B-H curves using a custom-built coil and H-bridge circuit to control magnetic fields, with real-time data captured by a Hall effect sensor to analyze magnetic saturation and hysteresis effects.",
      "Quantified magnetostriction in ferrite rods using a strain gauge and Wheatstone Bridge setup, capturing precise dimensional changes under varying magnetic fields."
    ]
  },
  {
    title: "Saffman–Taylor Instability of Miscible Fluids",
    company: "Research Project",
    date: "JUL 2022 - JUL 2023",
    skills: "ImageJ, Tracker, MATLAB, Python, Matplotlib",
    description: [
      "Conducted research, data analysis, and experiments on three-stage Marangoni flow and Saffman–Taylor instability, focusing on fluid dynamics and fractal patterns.",
      "Analyzed fractal dimensions and geometry using ImageJ and Tracker to develop a systematic theory on the role of viscosity in Saffman–Taylor instability.",
      "Simulated fluid behavior with MATLAB and processed data using Python and Matplotlib to quantify viscosity changes in paint samples with different concentrations."
    ]
  },
  {
    title: "Acoustic Analysis of Airflow-Induced Sound in Perforated Rotating Disks",
    company: "Research Project",
    date: "JUL 2022 - JUL 2023",
    skills: "MATLAB, ImageJ, Tracker, Python, Matplotlib",
    description: [
      "Investigated the sound phenomena of airflow interacting with a rotating disk with holes, analyzing how sound characteristics change with parameters like flow rate, rotational speed, and hole configuration.",
      "Developed experimental setups using a motor speed controller, air compressor, and microphone to capture sound data, with real-time analysis and visualization conducted in MATLAB and Python.",
      "Quantified relationships between sound intensity, frequency, and disk parameters, using theoretical models to validate experimental observations and identify key parameter impacts."
    ]
  },
  {
    title: "Pulsating Heat Tube in a Condensing-Heating-Condensing (CHC) System",
    company: "Research Project",
    date: "JUL 2022 - JUL 2023",
    skills: "Arduino, EasyEDA, OnShape, Python, JSON, OpenCV, Tracker, MatPlotLib",
    description: [
      "Researched thermodynamics and fluid dynamics of pulsating heat tubes to analyze two-phase heat transfer efficiency.",
      "Designed and implemented a heat tube system with Arduino and analog electronics for precise control and measurement.",
      "Developed a Python-based tool using OpenCV Object Detection to extract and analyze thermocouple data from 8 channels for real-time monitoring.",
      "Simulated vapor motion within the heat tube using Python, achieving a 96% match between simulations and experimental results."
    ]
  },
  {
    title: "Marangoni Flow and Rayleigh-Taylor Instability in Evaporating Fluids",
    company: "Research Project",
    date: "JUL 2021 - JUL 2022",
    skills: "Arduino, EasyEDA, ImageJ, Tracker, MatPlotLib, Comsol Multiphysics, MATLAB",
    description: [
      "Investigated Marangoni flow and Rayleigh-Taylor instability by analyzing fluid dynamics at interfaces to study droplet behavior in experiments.",
      "Designed and implemented a droplet release system using Arduino and 3D-printed components to enhance precision and reproducibility in experiments.",
      "Developed and optimized an interferometry analysis system with OpenCV for high-resolution tension measurement and analysis.",
      "Performed dynamic simulations using MATLAB and Comsol, achieving 93% accuracy to verify experimental results with simulations."
    ]
  }
];

const About = () => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-navy mb-4">About Me</h1>
              <p className="text-xl text-gray-600 mb-6">
                BASc in Electrical Engineering from University of Waterloo
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                I'm an electrical engineering student focused on building practical software and web applications, 
                with experience in both industry and personal projects. I have a strong background in physics research, 
                working on fluid dynamics, heat transfer, and materials experiments. My passion lies in applying computational 
                methods and engineering principles to solve complex technical challenges.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <a href="https://lilllllly06.github.io/portfolio-pdfs/Yuezhen_Dong_Resume.pdf" target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Download Resume
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/projects">View Projects</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-navy mb-6 text-center">My Resumes</h2>
              <ResearchSection 
                title="Download Resume"
                description="View my resumes for industry and research positions"
                pdfFiles={resumes}
              />
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy mb-12 text-center">Experience</h2>
            
            <div className="max-w-4xl mx-auto mb-16">
              <h3 className="text-2xl font-bold text-navy-dark mb-8 pl-4 border-l-4 border-navy">Work Experience</h3>
              <div className="relative border-l-2 border-gray-200 pl-8 ml-4">
                {workExperiences.map((exp, index) => (
                  <motion.div 
                    key={index} 
                    className="mb-12 relative"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="absolute -left-12 top-0 bg-navy w-6 h-6 rounded-full flex items-center justify-center">
                      <div className="bg-white w-2 h-2 rounded-full"></div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-navy">{exp.title}</h3>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">{exp.date}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{exp.role} • {exp.company}</p>
                      <p className="text-sm font-medium text-navy-dark mb-3">{exp.skills}</p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        {exp.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-navy-dark mb-8 pl-4 border-l-4 border-navy">Research Experience</h3>
              <div className="relative border-l-2 border-gray-200 pl-8 ml-4">
                {researchExperiences.map((exp, index) => (
                  <motion.div 
                    key={index} 
                    className="mb-12 relative"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="absolute -left-12 top-0 bg-navy w-6 h-6 rounded-full flex items-center justify-center">
                      <div className="bg-white w-2 h-2 rounded-full"></div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-navy">{exp.title}</h3>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">{exp.date}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{exp.company}</p>
                      <p className="text-sm font-medium text-navy-dark mb-3">{exp.skills}</p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        {exp.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Button variant="outline" asChild>
                <Link to="/projects" className="flex items-center mx-auto">
                  View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        <SkillsSection />
        
        <section className="py-16 bg-navy text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Education</h2>
              <div className="bg-navy-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">University of Waterloo - Faculty of Engineering</h3>
                <p className="mb-2 italic">BASc in Electrical Engineering</p>
                <p className="mb-4">Expected Graduation MAY 2029 • Waterloo, ON, CAN</p>
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
