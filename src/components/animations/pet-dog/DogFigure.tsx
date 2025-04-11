
import { motion } from 'framer-motion';
import { Dog, SmilePlus } from 'lucide-react';

interface DogFigureProps {
  isHappy: boolean;
  isMoving: boolean;
  isBreathing: boolean;
  isSitting: boolean;
  position: { x: number; y: number };
  target: { x: number; y: number };
  onClick: () => void;
}

const DogFigure = ({ 
  isHappy, 
  isMoving, 
  isBreathing, 
  isSitting, 
  position, 
  target, 
  onClick 
}: DogFigureProps) => {
  const facingLeft = position.x > target.x && isMoving;
  
  return (
    <motion.div
      className="absolute pointer-events-auto cursor-pointer"
      style={{ 
        left: position.x, 
        bottom: 10,
        zIndex: 50
      }}
      animate={{ 
        y: isBreathing ? [0, -3, 0] : 0,
        scale: isSitting ? 0.9 : 1,
      }}
      transition={{ 
        y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
        scale: { duration: 0.3 }
      }}
      onClick={onClick}
    >
      {isHappy ? (
        <div className="relative">
          <Dog 
            size={40} 
            className="text-navy-light drop-shadow-md"
            style={{ transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)' }}
          />
          <SmilePlus 
            size={20} 
            className="text-yellow-400 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3" 
          />
        </div>
      ) : (
        <Dog 
          size={40} 
          className={`${isMoving ? 'text-navy' : 'text-navy-light'} drop-shadow-md`}
          style={{ transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)' }}
        />
      )}
    </motion.div>
  );
};

export default DogFigure;
