
import { motion } from "framer-motion";

const SkillsSection = () => {
  const skills = {
    Languages: ["Python", "Java", "SQL", "C/C++", "JavaScript", "HTML/CSS", "LaTeX", "R"],
    Frameworks: ["Scrum", "Agile", "React", "ThreeJS", "NextJS", "Arduino", "Pygame", "Flask", "OOP"],
    "Developer Tools": ["Git", "Subversion", "Linux", "OpenCV", "OpenGL", "VSCode", "Android Studio", "Eclipse", "IntelliJ"],
    "Research Tools": ["MATLAB", "ImageJ", "Tracker", "Python Matplotlib", "Multimeters", "Lux Meters", "Comsol Multiphysics", "Oscilloscopes"]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    hover: { 
      scale: 1.05, 
      backgroundColor: "#0f4c81", 
      color: "#ffffff",
      transition: { duration: 0.2 }
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-navy mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Technical Skills
        </motion.h2>
        
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {Object.entries(skills).map(([category, skillList], index) => (
            <motion.div 
              key={category} 
              className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              variants={itemVariants}
              whileHover={{ 
                boxShadow: "0 10px 25px -5px rgba(15, 76, 129, 0.1), 0 10px 10px -5px rgba(15, 76, 129, 0.04)",
                y: -5
              }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-navy-dark mb-4">{category}</h3>
              <motion.div 
                className="flex flex-wrap gap-2"
                variants={containerVariants}
              >
                {skillList.map((skill, skillIndex) => (
                  <motion.span 
                    key={skill} 
                    className="bg-white text-gray-700 px-3 py-1 rounded-md text-sm border border-gray-200 transition-colors"
                    variants={skillVariants}
                    whileHover="hover"
                    custom={skillIndex}
                    transition={{ 
                      delay: skillIndex * 0.01,
                      type: "spring", 
                      stiffness: 300, 
                      damping: 15 
                    }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;
