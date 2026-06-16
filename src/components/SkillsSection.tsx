
import { motion } from "framer-motion";

const SkillsSection = () => {
  const skills = {
    Languages: ["Python", "Java", "TypeScript", "JavaScript", "C/C++", "SQL", "Ruby", "Bash"],
    "ML / AI": ["PyTorch", "scikit-learn", "OpenAI API", "Gemini API", "RAG", "LLM Agents", "Prompt Engineering", "A/B Testing"],
    Frameworks: ["FastAPI", "Flask", "React", "React Native", "Node/Express", "Ruby on Rails", "Spring Boot", "GraphQL"],
    Infrastructure: ["Docker", "PostgreSQL", "AWS", "Git", "Linux", "CI/CD", "Monitoring", "Site Reliability"],
    "Research + Hardware": ["MATLAB", "COMSOL", "Arduino", "EasyEDA", "OpenCV", "ImageJ", "Tracker", "Instrumentation"]
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
      backgroundColor: "#173b63", 
      color: "#ffffff",
      transition: { duration: 0.2 }
    }
  };

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="mb-3 text-center text-3xl font-bold text-navy"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Technical Skills
        </motion.h2>
        <motion.p
          className="mx-auto mb-12 max-w-2xl text-center text-gray-600"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          A software-first toolkit with AI, infrastructure, and engineering research depth.
        </motion.p>
        
        <motion.div 
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {Object.entries(skills).map(([category, skillList]) => (
            <motion.div 
              key={category} 
              className="rounded-lg border border-slate-100 bg-slate-50/80 p-6 shadow-sm transition-all duration-300 hover:border-sky-200 hover:bg-white hover:shadow-lg hover:shadow-sky-100/60"
              variants={itemVariants}
              whileHover={{ 
                boxShadow: "0 18px 35px -18px rgba(23, 59, 99, 0.28)",
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
                    className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm transition-colors"
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
