
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bone } from 'lucide-react';

interface PetDogProps {
  showWelcomeBack?: boolean;
}

const PetDog = ({ showWelcomeBack = false }: PetDogProps) => {
  const [showDog, setShowDog] = useState(false);
  const [showBone, setShowBone] = useState(false);
  const [bonePosition, setBonePosition] = useState({ x: 0, y: 0 });
  const [dogPosition, setDogPosition] = useState({ x: 0, y: 0 });
  const [boneDragging, setBoneDragging] = useState(false);
  const [dogHasBone, setDogHasBone] = useState(false);
  const [dogMessage, setDogMessage] = useState('');
  
  useEffect(() => {
    // Show dog after a delay if showing welcome back message
    if (showWelcomeBack) {
      setTimeout(() => {
        setShowDog(true);
        setDogMessage('Welcome back! Woof!');
        setTimeout(() => setDogMessage(''), 4000);
      }, 1000);
      
      setTimeout(() => {
        setShowDog(false);
      }, 5000);
    } else {
      // Random chance to show dog and bone after 15-60 seconds
      const timeBeforeAppearance = Math.random() * 45000 + 15000; // 15-60 seconds
      
      const timer = setTimeout(() => {
        if (Math.random() > 0.5) { // 50% chance
          setShowDog(true);
          
          // Show bone a few seconds after dog appears
          setTimeout(() => {
            setShowBone(true);
            // Create a random position for the bone
            const x = window.innerWidth * 0.7;
            const y = window.innerHeight * 0.8;
            setBonePosition({ x, y });
            
            // Log the bone and dog positions
            console.info('Bone coordinates:', x, y);
            console.info('Dog coordinates:', dogPosition.x, dogPosition.y);
          }, 3000);
        }
      }, timeBeforeAppearance);
      
      return () => clearTimeout(timer);
    }
  }, [showWelcomeBack]);
  
  // Position the dog at the bottom right of the viewport
  useEffect(() => {
    const handleResize = () => {
      const x = window.innerWidth * 0.9;
      const y = window.innerHeight * 0.9;
      setDogPosition({ x, y });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleBoneDragEnd = (event: any, info: any) => {
    setBoneDragging(false);
    
    // Calculate the distance between the bone and the dog
    const distance = Math.sqrt(
      Math.pow(info.point.x - dogPosition.x, 2) + 
      Math.pow(info.point.y - dogPosition.y, 2)
    );
    
    console.info('Distance:', Math.abs(info.point.x - dogPosition.x), Math.abs(info.point.y - dogPosition.y));
    
    // If the bone is close enough to the dog, give it to the dog
    if (distance < 150) {
      setDogHasBone(true);
      setShowBone(false);
      setDogMessage('Woof! Thank you for the bone!');
      
      // Mark as fed for Easter egg tracking
      sessionStorage.setItem('hasFedDogBone', 'true');
      
      // Hide message and dog after a few seconds
      setTimeout(() => {
        setDogMessage('');
        
        setTimeout(() => {
          setShowDog(false);
          setDogHasBone(false);
        }, 2000);
      }, 3000);
    }
  };
  
  if (!showDog && !showBone) return null;
  
  return (
    <>
      {/* Dog */}
      {showDog && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 15 }}
          className="fixed z-50"
          style={{ 
            bottom: '20px',
            right: '20px'
          }}
        >
          <div className="relative">
            {/* Dog emoji */}
            <motion.div 
              className="text-4xl cursor-pointer"
              whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
              style={{ filter: dogHasBone ? 'none' : 'grayscale(0.5)' }}
            >
              🐕
            </motion.div>
            
            {/* Speech bubble */}
            {dogMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-full right-0 mb-2 bg-white text-navy-light px-4 py-2 rounded-xl shadow-md"
                style={{ 
                  minWidth: '140px',
                  borderRadius: '16px 16px 4px 16px',
                  whiteSpace: 'nowrap'
                }}
              >
                <p className="text-sm font-medium">{dogMessage}</p>
                <div 
                  className="absolute w-3 h-3 bg-white" 
                  style={{ 
                    right: '10px', 
                    bottom: '-6px',
                    transform: 'rotate(45deg)'
                  }}
                />
              </motion.div>
            )}
            
            {/* Bone in mouth if dog has it */}
            {dogHasBone && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute left-0 bottom-0 text-xl"
              >
                <Bone size={24} className="text-amber-200" />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Draggable Bone */}
      {showBone && !dogHasBone && (
        <motion.div
          drag
          dragControls
          dragMomentum={false}
          dragElastic={0.1}
          onDragStart={() => setBoneDragging(true)}
          onDragEnd={handleBoneDragEnd}
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: [0, 5, -5, 0] }}
          transition={{ rotate: { repeat: Infinity, duration: 2 } }}
          className="fixed z-50 cursor-grab"
          whileDrag={{ cursor: 'grabbing', scale: 1.2 }}
          whileHover={{ scale: 1.1 }}
          style={{ 
            left: `${bonePosition.x}px`, 
            top: `${bonePosition.y}px`,
            boxShadow: boneDragging ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          <div className="relative">
            <Bone size={32} className="text-amber-200" />
            {!boneDragging && (
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium bg-navy text-white px-2 py-1 rounded-full whitespace-nowrap"
              >
                Drag me!
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default PetDog;
