
import { motion } from 'framer-motion';
import { Dog, Bone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

const PetDog = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [isBreathing, setIsBreathing] = useState(true);
  const [isSitting, setIsSitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showBone, setShowBone] = useState(false);
  const [bonePosition, setBonePosition] = useState({ x: 0, y: 0 });
  
  const { toast } = useToast();
  const dogRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  
  const messages = [
    "Boop!",
    "That tickled!",
    "Hey, who clicked me?",
    "I'm not a button… or am I?",
    "I sense easter eggs nearby 🐣",
    "Wanna see confetti? Just sayin'.",
    "Woof! Good hooman!",
    "Try clicking the name… something happens" // Last message hint
  ];
  
  // Initialize the dog position and find name element
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const initialX = Math.random() * (rect.width - 50);
      const initialY = rect.height - 100;
      setPosition({ x: initialX, y: initialY });
    }
    
    // Find the name element in the DOM
    nameRef.current = document.querySelector('h1');
    
    // Occasionally make the dog move to a random position
    const moveInterval = setInterval(() => {
      if (!isMoving && Math.random() > 0.3) {
        moveToRandomPosition();
      }
    }, 4000);
    
    return () => {
      clearInterval(moveInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  const moveToRandomPosition = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const maxX = rect.width - 50;
    const maxY = rect.height - 50;
    
    const newX = Math.random() * maxX;
    const newY = maxY; // Keep the dog on the bottom of the screen
    
    setTarget({ x: newX, y: newY });
    setIsMoving(true);
    setIsSitting(false);
  };
  
  const handleClick = () => {
    if (dogRef.current) {
      // Stop the dog's current movement
      setIsMoving(false);
      setIsSitting(true);
      
      // Increment click count
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);
      
      // Randomly decide if we should drop a bone (first 3 clicks only)
      if (newClickCount <= 3 && Math.random() > 0.5 && nameRef.current) {
        const nameRect = nameRef.current.getBoundingClientRect();
        // Position bone near the name
        setBonePosition({
          x: nameRect.left + nameRect.width / 2 + (Math.random() * 40 - 20),
          y: nameRect.top + nameRect.height + 10
        });
        setShowBone(true);
        
        // Hide bone after 3 seconds
        setTimeout(() => {
          setShowBone(false);
        }, 3000);
      }
      
      // Display message - use the last message only after seeing all others
      let messageIndex;
      if (newClickCount >= messages.length) {
        // Show the hint message (last one) or a random one from the rest
        messageIndex = Math.random() > 0.5 ? messages.length - 1 : Math.floor(Math.random() * (messages.length - 1));
      } else {
        // Go through messages in order initially
        messageIndex = (newClickCount - 1) % messages.length;
      }
      
      setMessage(messages[messageIndex]);
      setShowMessage(true);
      
      // Hide the message after 2 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  };
  
  // Animation loop for smooth movement
  useEffect(() => {
    if (!isMoving) return;
    
    const animate = () => {
      setPosition(current => {
        // Calculate direction vector
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If we're close enough to the target, stop moving
        if (distance < 1) {
          setIsMoving(false);
          setIsSitting(Math.random() > 0.5); // Randomly decide to sit or stand
          return current;
        }
        
        // Move towards the target with smoother motion and no shaking
        const speed = 1.2;
        const nx = current.x + (dx / distance) * speed;
        const ny = current.y + (dy / distance) * speed;
        
        return { x: nx, y: ny };
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMoving, target]);
  
  // Start breathing animation when not moving
  useEffect(() => {
    if (!isMoving) {
      setIsBreathing(true);
    } else {
      setIsBreathing(false);
    }
  }, [isMoving]);
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Bone element */}
      {showBone && (
        <motion.div
          className="absolute"
          style={{ 
            left: bonePosition.x,
            top: bonePosition.y,
            zIndex: 50,
            pointerEvents: "none",
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Bone size={20} className="text-amber-400 drop-shadow-md transform rotate-45" />
        </motion.div>
      )}
      
      <motion.div
        ref={dogRef}
        className="absolute pointer-events-auto cursor-pointer"
        style={{ 
          left: position.x, 
          bottom: 10,
          zIndex: 50
        }}
        animate={{ 
          // Remove the back-and-forth shaking effect, use smoother subtle movements
          y: isBreathing ? [0, -3, 0] : 0,
          scale: isSitting ? 0.9 : 1,
        }}
        transition={{ 
          y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
          scale: { duration: 0.3 }
        }}
        onClick={handleClick}
      >
        <Dog 
          size={40} 
          className={`${isMoving ? 'text-navy' : 'text-navy-light'} drop-shadow-md`}
          style={{ transform: position.x > target.x && isMoving ? 'scaleX(-1)' : 'scaleX(1)' }}
        />
        
        {/* Speech bubble */}
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
      </motion.div>
    </div>
  );
};

export default PetDog;
