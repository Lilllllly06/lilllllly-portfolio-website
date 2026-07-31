
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Dog, Bone, SmilePlus, PawPrint } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface PetDogProps {
  showWelcomeBack?: boolean;
}

const PetDog = ({ showWelcomeBack = false }: PetDogProps) => {
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
  // Check if the bone was fed in this tab/session
  const [boneReceivedInSession, setBoneReceivedInSession] = useState(false);
  const [shownMessages, setShownMessages] = useState<string[]>([]);
  const [uniqueMessagesShown, setUniqueMessagesShown] = useState(0);
  const [isFirstClick, setIsFirstClick] = useState(true);
  
  const [isDragging, setIsDragging] = useState(false);
  
  const boneDragX = useMotionValue(0);
  const boneDragY = useMotionValue(0);
  
  const { toast } = useToast();
  const dogRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const nameRef = useRef<HTMLElement | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const messages = [
    "Boop!",
    "That tickled!",
    "Hey, who clicked me?",
    "I'm not a button… or am I?",
    "I sense easter eggs nearby 🐣",
    "Wanna see confetti? Just sayin'.",
    "Woof! Good hooman!",
    "I could nap here forever.",
    "Let's just stare into the void together.",
    "Comfy spot. I claim it.",
    "Feeling pawsome today.",
    "Need a break from work?",
    "I'm here if you need me.",
    "Be honest. Do I look fluffy today?",
    "I barked at my reflection earlier.",
    "Do not disturb. Chasing butterflies mentally.",
    "I totally understand recursion. Trust me.",
    "Tiny site guardian on duty.",
    "No rush. I'm just vibing.",
    "Good pause. Solid pause.",
    "One tab at a time.",
    "Quietly rooting for you.",
    "This corner has good energy.",
    "Hydration checkpoint.",
    "Soft launch mood.",
    "Clean little corner of the internet.",
    "I like your curiosity.",
    "Taking notes. Mostly mental notes.",
    "Small dog. Big observation skills."
  ];
  
  const specialMessages = [
    { text: "You're my favorite human now.", minClicks: 5 },
    { text: "I shall follow you forever 🐾", minClicks: 10 },
    { text: "You have good taste in pets.", minClicks: 3 },
    { text: "This isn't just a dog... it's interactive art.", minClicks: 4 },
    { text: "Lily coded me into existence.", minClicks: 7 },
    { text: "I was born in a repo. Raised on clicks.", minClicks: 8 },
    { text: "You just activated dog mode 1/7.", minClicks: 6 },
    { text: "Bet the dev spent hours making me do this.", minClicks: 9 }
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

  const getSafeDogX = (width: number) => {
    const dogWidth = 50;
    const edgePadding = Math.min(120, Math.max(24, width * 0.28));
    const minX = edgePadding;
    const maxX = Math.max(minX, width - dogWidth - edgePadding);

    return minX + Math.random() * (maxX - minX);
  };
  
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const initialX = getSafeDogX(rect.width);
      const initialY = rect.height - 100;
      setPosition({ x: initialX, y: initialY });
    }
    
    nameRef.current = document.querySelector('h1 span')?.parentElement || null;
    
    const moveInterval = setInterval(() => {
      if (!isMoving && Math.random() > 0.3) {
        moveToRandomPosition();
      }
    }, 4000);
    
    // Check if bone was already received in the current session
    const sessionBoneReceived = sessionStorage.getItem('sessionBoneReceived') === 'true';
    setBoneReceivedInSession(sessionBoneReceived);
    
    return () => {
      clearInterval(moveInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showWelcomeBack) {
      setIsMoving(false);
      setIsSitting(true);
      displayMessage("Hey hooman, you're back! I missed you 🐾", 5000);
    }
  }, [showWelcomeBack]);
  
  const moveToRandomPosition = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const maxY = rect.height - 50;
    
    const newX = getSafeDogX(rect.width);
    const newY = maxY;
    
    setTarget({ x: newX, y: newY });
    setIsMoving(true);
    setIsSitting(false);
  };
  
  const displayMessage = (msg: string, duration: number = 3000) => {
    setMessage(msg);
    setShowMessage(true);
    
    if (!shownMessages.includes(msg)) {
      setShownMessages(prev => [...prev, msg]);
      setUniqueMessagesShown(prev => prev + 1);
    }
    
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    
    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
      messageTimeoutRef.current = null;
    }, duration);
  };
  
  const handleClick = () => {
    if (dogRef.current) {
      setIsMoving(false);
      setIsSitting(true);
      
      // Show the bone on the first click in this session
      if (isFirstClick && nameRef.current) {
        setIsFirstClick(false);
        
        // Only show the bone if it hasn't been received in this session
        if (!boneReceivedInSession) {
          // Show the bone near the name
          const nameRect = nameRef.current.getBoundingClientRect();
          setBonePosition({
            x: nameRect.left + nameRect.width / 2,
            y: nameRect.top
          });
          setShowBone(true);
          
          // Reset bone drag position
          boneDragX.set(0);
          boneDragY.set(0);
          
          // Display a message asking for the bone
          const boneMessageIndex = Math.floor(Math.random() * boneMessages.length);
          displayMessage(boneMessages[boneMessageIndex]);
          
          // Hide the bone after some time if not dragged to dog
          setTimeout(() => {
            if (showBone && !boneReceivedInSession) {
              setShowBone(false);
              setShowMessage(false);
            }
          }, 10000);
          
          return;
        }
      }
      
      // For subsequent clicks
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);
      
      if (newClickCount === 10) {
        displayMessage("Try clicking the name… something happens");
        return;
      }
      
      if (isHappy) {
        const happyMessageIndex = Math.floor(Math.random() * happyMessages.length);
        displayMessage(happyMessages[happyMessageIndex]);
        return;
      }
      
      if (newClickCount % 4 === 0 && !showBone && !boneReceivedInSession && nameRef.current) {
        const nameRect = nameRef.current.getBoundingClientRect();
        setBonePosition({
          x: nameRect.left + nameRect.width / 2,
          y: nameRect.top
        });
        setShowBone(true);
        
        boneDragX.set(0);
        boneDragY.set(0);
        
        const boneMessageIndex = Math.floor(Math.random() * boneMessages.length);
        displayMessage(boneMessages[boneMessageIndex]);
        
        setTimeout(() => {
          if (showBone && !boneReceivedInSession) {
            setShowBone(false);
            setShowMessage(false);
          }
        }, 10000);
        
        return;
      }
      
      if (showBone && !boneReceivedInSession) {
        const boneMessageIndex = Math.floor(Math.random() * boneMessages.length);
        displayMessage(boneMessages[boneMessageIndex]);
        return;
      }
      
      const showSpecialMessage = Math.random() < 0.25;
      
      if (showSpecialMessage) {
        const eligibleSpecialMessages = specialMessages.filter(
          msg => newClickCount >= msg.minClicks
        );
        
        if (eligibleSpecialMessages.length > 0) {
          const randomSpecialIndex = Math.floor(Math.random() * eligibleSpecialMessages.length);
          displayMessage(eligibleSpecialMessages[randomSpecialIndex].text);
          return;
        }
      }
      
      if (shownMessages.length >= messages.length) {
        const messageIndex = Math.floor(Math.random() * messages.length);
        displayMessage(messages[messageIndex]);
      } else {
        const unshownMessages = messages.filter(msg => !shownMessages.includes(msg));
        if (unshownMessages.length > 0) {
          const messageIndex = Math.floor(Math.random() * unshownMessages.length);
          displayMessage(unshownMessages[messageIndex]);
        } else {
          const messageIndex = Math.floor(Math.random() * messages.length);
          displayMessage(messages[messageIndex]);
        }
      }
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
      
      console.log("Bone coordinates:", boneCurrentX, boneCurrentY);
      console.log("Dog coordinates:", dogRect.left + dogRect.width / 2, dogRect.top + dogRect.height / 2);
      console.log("Distance:", distanceX, distanceY);
      
      if (distanceX < 100 && distanceY < 100) {
        setShowBone(false);
        // Mark as received in this session
        setBoneReceivedInSession(true);
        // Store in sessionStorage for this tab session
        sessionStorage.setItem('sessionBoneReceived', 'true');
        // Also update localStorage for cross-session persistence (for easter egg tracking)
        localStorage.setItem('boneReceived', 'true');
        setIsHappy(true);
        
        const happyMessageIndex = Math.floor(Math.random() * happyMessages.length);
        displayMessage(happyMessages[happyMessageIndex]);
        
        // Only show the toast if this is the first time in this session
        if (sessionStorage.getItem('boneToastShown') !== 'true') {
          toast({
            title: "Good job!",
            description: "You found an easter egg! But there might be another hidden somewhere...",
          });
          sessionStorage.setItem('boneToastShown', 'true');
        }
        
        setTimeout(() => {
          setIsHappy(false);
          setShowMessage(false);
        }, 3000);
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
        className="absolute bottom-2.5 cursor-pointer pointer-events-auto"
        style={{ 
          left: position.x, 
          zIndex: 10
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

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <motion.div
            className="relative w-max max-w-[min(14rem,calc(100vw-2rem))] rounded-md bg-white px-3 py-2 text-center text-sm text-navy shadow-md"
            style={{ zIndex: 60 }}
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{
              opacity: showMessage ? 1 : 0,
              y: showMessage ? 0 : 8,
              scale: showMessage ? 1 : 0.94
            }}
            transition={{ duration: 0.2 }}
          >
            <span className="font-medium">{message}</span>
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PetDog;
