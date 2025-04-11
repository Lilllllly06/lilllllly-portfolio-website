
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

const colors = [
  '#FF6B6B', // red
  '#FFD93D', // yellow
  '#6BCB77', // green
  '#4D96FF', // blue
  '#FF9999', // pink
  '#9999FF', // lavender
];

const CuteParticlesBurst = ({ isActive, originX, originY, onComplete }: CuteParticlesBurstProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate random particles when animation is triggered
  useEffect(() => {
    if (isActive) {
      const particleTypes: ParticleType[] = ['heart', 'star', 'sparkle'];
      const newParticles: Particle[] = [];
      
      // Generate between 12-20 particles
      const count = Math.floor(Math.random() * 9) + 12;
      
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
            // Calculate random destination within viewport
            const destinationX = (Math.random() * 200) - 100; // -100 to 100px from origin
            const destinationY = (Math.random() * -250) - 50; // -50 to -300px from origin (mostly upward)
            
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
