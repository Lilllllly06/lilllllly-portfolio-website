
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    // Generate random particles
    const generateParticles = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const particleCount = Math.floor((windowWidth * windowHeight) / 15000); // Adaptive count based on screen size
      
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100, // Position in percentage
          y: Math.random() * 100,
          size: Math.random() * 6 + 2, // Size between 2-8px
          opacity: Math.random() * 0.07 + 0.03, // Low opacity between 0.03-0.1
          duration: Math.random() * 20 + 10, // Animation duration 10-30s
          delay: Math.random() * 5, // Random delay 0-5s
        });
      }
      
      setParticles(newParticles);
    };
    
    generateParticles();
    
    // Regenerate on window resize
    const handleResize = () => {
      generateParticles();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-navy opacity-5"
          animate={{
            x: [`${particle.x}%`, `${(particle.x + 10) % 100}%`],
            y: [`${particle.y}%`, `${(particle.y + 10) % 100}%`],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
            delay: particle.delay,
          }}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
