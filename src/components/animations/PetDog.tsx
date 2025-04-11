
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Dog, Bone, SmilePlus } from 'lucide-react';
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
  const [isHappy, setIsHappy] = useState(false);
  const [boneReceived, setBoneReceived] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  
  // Create motion values for bone dragging
  const boneDragX = useMotionValue(0);
  const boneDragY = useMotionValue(0);
  
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
  
  const boneMessages = [
    "Treat please?",
    "I want that bone!",
    "Can I have it? *wags tail*",
    "That treat looks yummy!"
  ];
  
  const happyMessages = [
    "Thank you for the treat!",
    "Yummy! That was delicious!",
    "Best treat ever! *wags tail*",
    "You're the best hooman!"
  ];
  
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const initialX = Math.random() * (rect.width - 50);
      const initialY = rect.height - 100;
      setPosition({ x: initialX, y: initialY });
    }
    
    nameRef.current = document.querySelector('h1');
    
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
    const newY = maxY;
    
    setTarget({ x: newX, y: newY });
    setIsMoving(true);
    setIsSitting(false);
  };
  
  const handleClick = () => {
    if (dogRef.current) {
      setIsMoving(false);
      setIsSitting(true);
      
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);
      
      if (isHappy) {
        const happyMessageIndex = Math.floor(Math.random() * happyMessages.length);
        setMessage(happyMessages[happyMessageIndex]);
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
        }, 2000);
        
        return;
      }
      
      if (newClickCount <= 3 && !showBone && !boneReceived && nameRef.current) {
        const nameRect = nameRef.current.getBoundingClientRect();
        setBonePosition({
          x: nameRect.left + nameRect.width / 2,
          y: nameRect.top + nameRect.height / 2
        });
        setShowBone(true);
        
        boneDragX.set(0);
        boneDragY.set(0);
        
        const boneMessageIndex = Math.floor(Math.random() * boneMessages.length);
        setMessage(boneMessages[boneMessageIndex]);
        setShowMessage(true);
        
        setTimeout(() => {
          if (showBone && !boneReceived) {
            setShowBone(false);
            setShowMessage(false);
          }
        }, 8000);
        
        return;
      }
      
      if (showBone && !boneReceived) {
        const boneMessageIndex = Math.floor(Math.random() * boneMessages.length);
        setMessage(boneMessages[boneMessageIndex]);
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
        }, 2000);
        
        return;
      }
      
      let messageIndex;
      if (newClickCount >= messages.length) {
        messageIndex = Math.random() > 0.5 ? messages.length - 1 : Math.floor(Math.random() * (messages.length - 1));
      } else {
        messageIndex = (newClickCount - 1) % messages.length;
      }
      
      setMessage(messages[messageIndex]);
      setShowMessage(true);
      
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  };
  
  const handleBoneDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (dogRef.current) {
      const dogRect = dogRef.current.getBoundingClientRect();
      const boneCurrentX = bonePosition.x + boneDragX.get();
      const boneCurrentY = bonePosition.y + boneDragY.get();
      
      const distanceX = Math.abs(boneCurrentX - (dogRect.left + dogRect.width / 2));
      const distanceY = Math.abs(boneCurrentY - (dogRect.top + dogRect.height / 2));
      
      if (distanceX < 70 && distanceY < 70) {
        setShowBone(false);
        setBoneReceived(true);
        setIsHappy(true);
        
        const happyMessageIndex = Math.floor(Math.random() * happyMessages.length);
        setMessage(happyMessages[happyMessageIndex]);
        setShowMessage(true);
        
        toast({
          title: "Good job!",
          description: "You gave the dog a treat! Try clicking on my name now!",
        });
        
        setTimeout(() => {
          setIsHappy(false);
          setShowMessage(false);
        }, 5000);
      } else {
        boneDragX.set(0);
        boneDragY.set(0);
      }
    }
  };
  
  useEffect(() => {
    if (!isMoving) return;
    
    const animate = () => {
      setPosition(current => {
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 1) {
          setIsMoving(false);
          setIsSitting(Math.random() > 0.5);
          return current;
        }
        
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
      {showBone && (
        <motion.div
          className="absolute cursor-grab active:cursor-grabbing"
          style={{ 
            left: bonePosition.x,
            top: bonePosition.y,
            zIndex: 50,
            pointerEvents: "auto",
            x: boneDragX,
            y: boneDragY
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          drag
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleBoneDragEnd}
          whileDrag={{ scale: 1.2 }}
          whileHover={{ scale: 1.1 }}
        >
          <Bone size={24} className="text-amber-400 drop-shadow-md transform rotate-45" />
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
          y: isBreathing ? [0, -3, 0] : 0,
          scale: isSitting ? 0.9 : 1,
        }}
        transition={{ 
          y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
          scale: { duration: 0.3 }
        }}
        onClick={handleClick}
      >
        {isHappy ? (
          <div className="relative">
            <Dog 
              size={40} 
              className="text-navy-light drop-shadow-md"
              style={{ transform: position.x > target.x && isMoving ? 'scaleX(-1)' : 'scaleX(1)' }}
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
            style={{ transform: position.x > target.x && isMoving ? 'scaleX(-1)' : 'scaleX(1)' }}
          />
        )}
        
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
