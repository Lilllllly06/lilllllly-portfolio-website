
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Sparkles } from 'lucide-react';

type ParticleType = 'heart' | 'star' | 'sparkle';
type Particle = {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  type: ParticleType;
  color: string;
};

interface CuteParticlesBurstProps {
  isActive: boolean;
  originX: number;
  originY: number;
  onComplete: () => void;
}

// Colors taken from the website's theme (navy blues and complementary colors)
const colors = [
  '#1a365d', // navy default
  '#2a4a7f', // navy light
  '#0f2a4a', // navy dark
  '#3182ce', // blue
  '#4299e1', // lighter blue
  '#63b3ed', // even lighter blue
  '#ffd93d', // accent yellow
];

const CuteParticlesBurst = ({ isActive, originX, originY, onComplete }: CuteParticlesBurstProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate random particles when animation is triggered
  useEffect(() => {
    if (isActive) {
      const particleTypes: ParticleType[] = ['heart', 'star', 'sparkle'];
      const newParticles: Particle[] = [];
      
      // Generate between 15-25 particles
      const count = Math.floor(Math.random() * 10) + 15;
      
      for (let i = 0; i < count; i++) {
        // Randomize particle properties
        const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const scale = Math.random() * 0.5 + 0.5; // 0.5 - 1
        const rotation = Math.random() * 360;
        
        newParticles.push({
          id: i,
          x: 0,
          y: 0,
          scale,
          rotation,
          type,
          color,
        });
      }
      
      setParticles(newParticles);
      
      // Clean up animation after it completes
      const timer = setTimeout(() => {
        onComplete();
        setParticles([]);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  const getParticleIcon = (type: ParticleType) => {
    switch (type) {
      case 'heart':
        return <Heart size={24} />;
      case 'star':
        return <Star size={24} />;
      case 'sparkle':
        return <Sparkles size={24} />;
      default:
        return <Heart size={24} />;
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50" style={{ overflow: 'hidden' }}>
          {particles.map((particle) => {
            // Calculate random destination in all directions (360 degrees)
            const angle = Math.random() * Math.PI * 2; // Random angle in radians (0 to 2π)
            const distance = 100 + Math.random() * 250; // Increased range: 100 to 350px from origin
            
            const destinationX = Math.cos(angle) * distance; // X component of the vector
            const destinationY = Math.sin(angle) * distance; // Y component of the vector
            
            return (
              <motion.div
                key={particle.id}
                initial={{ 
                  x: originX, 
                  y: originY,
                  scale: 0,
                  rotate: 0,
                  opacity: 0
                }}
                animate={{ 
                  x: originX + destinationX,
                  y: originY + destinationY,
                  scale: particle.scale,
                  rotate: particle.rotation,
                  opacity: 1
                }}
                exit={{ 
                  scale: 0,
                  opacity: 0
                }}
                transition={{
                  type: "spring", 
                  duration: 1 + Math.random() * 0.5,
                  bounce: 0.25
                }}
                style={{ position: 'absolute', color: particle.color }}
              >
                {getParticleIcon(particle.type)}
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
};

export default CuteParticlesBurst;
