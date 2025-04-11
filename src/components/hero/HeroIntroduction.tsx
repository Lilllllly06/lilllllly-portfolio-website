
import { motion } from 'framer-motion';

const HeroIntroduction = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          Engineering Portfolio
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="text-gray-600 mb-10 text-lg max-w-2xl mx-auto">
          BASc in electrical engineering student focused on building practical software and web applications,
          with experience in both industry and research projects. Passionate about applying engineering principles
          to solve complex problems in fluid dynamics, heat transfer, and materials science.
        </p>
      </motion.div>
    </>
  );
};

export default HeroIntroduction;
