
import { useState } from 'react';
import { motion } from 'framer-motion';
import PetDog from './animations/PetDog';
import NameInteraction from './hero/NameInteraction';
import HeroIntroduction from './hero/HeroIntroduction';
import HeroButtons from './hero/HeroButtons';

const Hero = () => {
  const [clickCount, setClickCount] = useState(0);

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-white to-gray-100 relative">
      <PetDog />
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <NameInteraction 
              clickCount={clickCount}
              setClickCount={setClickCount}
            />
          </motion.div>
          
          <HeroIntroduction />
          
          <HeroButtons />
        </div>
      </div>
    </section>
  );
};

export default Hero;
