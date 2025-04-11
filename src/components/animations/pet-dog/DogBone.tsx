
import { motion, PanInfo } from 'framer-motion';
import { Bone } from 'lucide-react';

interface DogBoneProps {
  position: { x: number; y: number };
  onDragStart: () => void;
  onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}

const DogBone = ({ position, onDragStart, onDragEnd }: DogBoneProps) => {
  return (
    <motion.div
      className="absolute cursor-grab active:cursor-grabbing"
      style={{ 
        left: position.x,
        top: position.y,
        zIndex: 50,
        pointerEvents: "auto",
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      drag
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.2 }}
      whileHover={{ scale: 1.1 }}
    >
      <Bone size={24} className="text-amber-400 drop-shadow-md transform rotate-45" />
    </motion.div>
  );
};

export default DogBone;
