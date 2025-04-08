
import { motion } from "framer-motion";

const SkillsSection = () => {
  const skills = {
    Languages: ["Python", "Java", "SQL", "C/C++", "JavaScript", "HTML/CSS", "LaTeX", "R"],
    Frameworks: ["Scrum", "Agile", "React", "ThreeJS", "NextJS", "Arduino", "Pygame", "Flask", "OOP"],
    "Developer Tools": ["Git", "Subversion", "Linux", "OpenCV", "OpenGL", "VSCode", "Android Studio", "Eclipse", "IntelliJ"],
    "Research Tools": ["MATLAB", "ImageJ", "Tracker", "Python Matplotlib", "Multimeters", "Lux Meters", "Comsol Multiphysics", "Oscilloscopes"]
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-navy mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Technical Skills
        </motion.h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(skills).map(([category, skillList], index) => (
            <motion.div 
              key={category} 
              className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold text-navy-dark mb-4">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {skillList.map((skill, skillIndex) => (
                  <motion.span 
                    key={skill} 
                    className="bg-white text-gray-700 px-3 py-1 rounded-md text-sm border border-gray-200 hover:bg-navy hover:text-white transition-colors"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 + skillIndex * 0.03 }}
                    whileHover={{ y: -3 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
