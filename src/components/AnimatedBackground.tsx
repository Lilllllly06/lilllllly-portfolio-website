
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
  color: string;
}

const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    // Generate random particles
    const generateParticles = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const particleCount = Math.floor((windowWidth * windowHeight) / 12000); // Increased density
      
      const colors = ['bg-navy', 'bg-blue-400', 'bg-indigo-500', 'bg-purple-400'];
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100, // Position in percentage
          y: Math.random() * 100,
          size: Math.random() * 8 + 3, // Size between 3-11px (slightly larger)
          opacity: Math.random() * 0.12 + 0.05, // Higher opacity between 0.05-0.17
          duration: Math.random() * 25 + 10, // Animation duration 10-35s
          delay: Math.random() * 5, // Random delay 0-5s
          color: colors[Math.floor(Math.random() * colors.length)]
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
          className={`absolute rounded-full ${particle.color}`}
          animate={{
            x: [`${particle.x}%`, `${(particle.x + 15) % 100}%`], // Increased movement range
            y: [`${particle.y}%`, `${(particle.y + 15) % 100}%`],
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
