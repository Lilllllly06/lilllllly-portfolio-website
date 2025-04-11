
import { motion } from 'framer-motion';

interface DogMessageProps {
  message: string;
  showMessage: boolean;
}

const DogMessage = ({ message, showMessage }: DogMessageProps) => {
  return (
    <motion.div
      className="absolute left-1/2 -top-16 bg-white text-navy px-3 py-1 rounded-xl shadow-md text-sm whitespace-nowrap"
      style={{ 
        zIndex: 60,
        borderRadius: '12px 12px 12px 2px',
        transform: 'translateX(-50%)'
      }}
      initial={{ opacity: 0, y: 10, scale: 0.8 }}
      animate={{ 
        opacity: showMessage ? 1 : 0,
        y: showMessage ? 0 : 10,
        scale: showMessage ? 1 : 0.8
      }}
      transition={{ duration: 0.2 }}
    >
      <span className="font-medium">{message}</span>
      <div 
        className="absolute w-2 h-2 bg-white" 
        style={{ 
          left: '50%', 
          bottom: '-4px',
          transform: 'translateX(-50%) rotate(45deg)'
        }}
      />
    </motion.div>
  );
};

export default DogMessage;
