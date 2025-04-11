import { useState, useEffect, useRef, RefObject } from 'react';
import { useToast } from "@/hooks/use-toast";
import { regularMessages, specialMessages, boneMessages, happyMessages } from './messages';
import { PanInfo } from 'framer-motion';

export interface PetDogState {
  position: { x: number; y: number };
  target: { x: number; y: number };
  isMoving: boolean;
  isBreathing: boolean;
  isSitting: boolean;
  message: string;
  showMessage: boolean;
  clickCount: number;
  showBone: boolean;
  bonePosition: { x: number; y: number };
  isHappy: boolean;
  boneReceived: boolean;
  shownMessages: string[];
  uniqueMessagesShown: number;
  isDragging: boolean;
}

export const usePetDog = (containerRef: RefObject<HTMLDivElement>, dogRef: RefObject<HTMLDivElement>) => {
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
  const [shownMessages, setShownMessages] = useState<string[]>([]);
  const [uniqueMessagesShown, setUniqueMessagesShown] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const { toast } = useToast();
  const nameRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const initialX = Math.random() * (rect.width - 50);
      const initialY = rect.height - 100;
      setPosition({ x: initialX, y: initialY });
    }
    
    nameRef.current = document.querySelector('h1 span')?.parentElement || null;
    
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
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);
  
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
  
  const displayMessage = (msg: string, duration: number = 3000) => {
    setMessage(msg);
    setShowMessage(true);
    
    // Add to shown messages list if not already there
    if (!shownMessages.includes(msg)) {
      setShownMessages(prev => [...prev, msg]);
      setUniqueMessagesShown(prev => prev + 1);
    }
    
    // Clear any existing timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    
    // Set new timeout
    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
      messageTimeoutRef.current = null;
    }, duration);
  };
  
  const handleClick = () => {
    if (dogRef.current) {
      setIsMoving(false);
      setIsSitting(true);
      
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);
      
      if (isHappy) {
        const happyMessageIndex = Math.floor(Math.random() * happyMessages.length);
        displayMessage(happyMessages[happyMessageIndex]);
        return;
      }
      
      if (newClickCount <= 3 && !showBone && !boneReceived && nameRef.current) {
        const nameRect = nameRef.current.getBoundingClientRect();
        setBonePosition({
          x: nameRect.left + nameRect.width / 2,
          y: nameRect.top
        });
        setShowBone(true);
        
        const boneMessageIndex = Math.floor(Math.random() * boneMessages.length);
        displayMessage(boneMessages[boneMessageIndex], 5000);
        
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
        displayMessage(boneMessages[boneMessageIndex], 5000);
        return;
      }
      
      // Check for special messages based on click count and number of unique messages shown
      const showSpecialMessage = Math.random() < 0.25;
      
      if (showSpecialMessage) {
        const eligibleSpecialMessages = specialMessages.filter(
          msg => newClickCount >= msg.minClicks && 
                (!msg.requireUniqueMessages || uniqueMessagesShown >= msg.requireUniqueMessages)
        );
        
        if (eligibleSpecialMessages.length > 0) {
          const randomSpecialIndex = Math.floor(Math.random() * eligibleSpecialMessages.length);
          displayMessage(eligibleSpecialMessages[randomSpecialIndex].text);
          return;
        }
      }
      
      // If we've shown all regular messages at least once, we can show any of them
      if (shownMessages.length >= regularMessages.length) {
        const messageIndex = Math.floor(Math.random() * regularMessages.length);
        displayMessage(regularMessages[messageIndex]);
      } else {
        // Otherwise, pick a message we haven't shown yet
        const unshownMessages = regularMessages.filter(msg => !shownMessages.includes(msg));
        if (unshownMessages.length > 0) {
          const messageIndex = Math.floor(Math.random() * unshownMessages.length);
          displayMessage(unshownMessages[messageIndex]);
        } else {
          // Fallback if something went wrong with tracking
          const messageIndex = Math.floor(Math.random() * regularMessages.length);
          displayMessage(regularMessages[messageIndex]);
        }
      }
    }
  };
  
  const handleBoneDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (dogRef.current) {
      const dogRect = dogRef.current.getBoundingClientRect();
      const boneCurrentX = bonePosition.x + info.point.x;
      const boneCurrentY = bonePosition.y + info.point.y;
      
      const distanceX = Math.abs(boneCurrentX - (dogRect.left + dogRect.width / 2));
      const distanceY = Math.abs(boneCurrentY - (dogRect.top + dogRect.height / 2));
      
      if (distanceX < 100 && distanceY < 100) {
        setShowBone(false);
        setBoneReceived(true);
        setIsHappy(true);
        
        const happyMessageIndex = Math.floor(Math.random() * happyMessages.length);
        displayMessage(happyMessages[happyMessageIndex]);
        
        toast({
          title: "Good job!",
          description: "You found an easter egg! But there might be another hidden somewhere...",
        });
        
        setTimeout(() => {
          setIsHappy(false);
          setShowMessage(false);
        }, 3000);
      }
    }
  };
  
  return {
    state: {
      position,
      target,
      isMoving,
      isBreathing,
      isSitting,
      message,
      showMessage,
      clickCount,
      showBone,
      bonePosition,
      isHappy,
      boneReceived,
      shownMessages,
      uniqueMessagesShown,
      isDragging,
    },
    actions: {
      handleClick,
      handleBoneDragEnd,
      setIsDragging
    }
  };
};
