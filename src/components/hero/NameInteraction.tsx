
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import CuteParticlesBurst from '../animations/CuteParticlesBurst';

interface NameInteractionProps {
  clickCount: number;
  setClickCount: (count: number) => void;
}

interface MessageState {
  showFirstMessage: boolean;
  showSecondMessage: boolean;
  showThirdMessage: boolean;
  showFourthMessage: boolean;
  showFifthMessage: boolean;
}

const NameInteraction = ({ clickCount, setClickCount }: NameInteractionProps) => {
  const [messageState, setMessageState] = useState<MessageState>({
    showFirstMessage: false,
    showSecondMessage: false,
    showThirdMessage: false,
    showFourthMessage: false,
    showFifthMessage: false
  });
  const [showParticles, setShowParticles] = useState(false);
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 });
  const nameRef = useRef<HTMLHeadingElement>(null);

  const handleNameClick = (e: React.MouseEvent) => {
    // Increment click counter
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    
    // Check for special messages with updated click thresholds
    if (newClickCount === 5) {
      setMessageState(prev => ({ ...prev, showFirstMessage: true }));
      setTimeout(() => setMessageState(prev => ({ ...prev, showFirstMessage: false })), 3000);
    } else if (newClickCount === 10) {
      setMessageState(prev => ({ ...prev, showSecondMessage: true }));
      setTimeout(() => setMessageState(prev => ({ ...prev, showSecondMessage: false })), 3000);
    } else if (newClickCount === 25) {
      setMessageState(prev => ({ ...prev, showThirdMessage: true }));
      setTimeout(() => setMessageState(prev => ({ ...prev, showThirdMessage: false })), 3000);
    } else if (newClickCount === 45) {
      setMessageState(prev => ({ ...prev, showFourthMessage: true }));
      setTimeout(() => setMessageState(prev => ({ ...prev, showFourthMessage: false })), 3000);
    } else if (newClickCount === 50) {
      setMessageState(prev => ({ ...prev, showFifthMessage: true }));
      setTimeout(() => setMessageState(prev => ({ ...prev, showFifthMessage: false })), 3000);
    }
    
    // Calculate click position for animation origin
    const rect = nameRef.current?.getBoundingClientRect();
    if (rect) {
      // Center of the name element
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setParticleOrigin({ 
        x: centerX,
        y: centerY
      });
      setShowParticles(true);
    }
  };

  const handleAnimationComplete = () => {
    setShowParticles(false);
  };

  return (
    <div className="relative">
      <h1 
        ref={nameRef}
        className="text-4xl md:text-6xl font-bold text-navy mb-6 cursor-pointer hover:text-navy-dark transition-colors duration-300" 
        onClick={handleNameClick}
      >
        <span>
          Yuezhen (Lily) Dong
        </span>
      </h1>
      
      {/* First message bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 0 }}
        animate={{ 
          opacity: messageState.showFirstMessage ? 1 : 0, 
          scale: messageState.showFirstMessage ? 1 : 0.8, 
          y: messageState.showFirstMessage ? 0 : 10 
        }}
        className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
        style={{ 
          zIndex: 60,
          borderRadius: '16px 16px 16px 4px',
          whiteSpace: 'nowrap'
        }}
      >
        <div className="font-medium">hiiii ˶ᵔ ᵕ ᵔ˶</div>
        <div 
          className="absolute w-3 h-3 bg-navy-light" 
          style={{ 
            left: '50%', 
            top: '-6px',
            transform: 'translateX(-50%) rotate(45deg)'
          }}
        />
      </motion.div>
      
      {/* Second message bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 0 }}
        animate={{ 
          opacity: messageState.showSecondMessage ? 1 : 0, 
          scale: messageState.showSecondMessage ? 1 : 0.8, 
          y: messageState.showSecondMessage ? 0 : 10 
        }}
        className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
        style={{ 
          zIndex: 60,
          borderRadius: '16px 16px 16px 4px',
          whiteSpace: 'nowrap'
        }}
      >
        <div className="font-medium">404 not found ⸝⸝๑﹏๑⸝⸝</div>
        <div 
          className="absolute w-3 h-3 bg-navy-light" 
          style={{ 
            left: '50%', 
            top: '-6px',
            transform: 'translateX(-50%) rotate(45deg)'
          }}
        />
      </motion.div>

      {/* Third message bubble (25 clicks) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 0 }}
        animate={{ 
          opacity: messageState.showThirdMessage ? 1 : 0, 
          scale: messageState.showThirdMessage ? 1 : 0.8, 
          y: messageState.showThirdMessage ? 0 : 10 
        }}
        className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
        style={{ 
          zIndex: 60,
          borderRadius: '16px 16px 16px 4px',
          whiteSpace: 'nowrap'
        }}
      >
        <div className="font-medium">no more clicking ,,⩌&apos;︿&apos;⩌,,</div>
        <div 
          className="absolute w-3 h-3 bg-navy-light" 
          style={{ 
            left: '50%', 
            top: '-6px',
            transform: 'translateX(-50%) rotate(45deg)'
          }}
        />
      </motion.div>

      {/* Fourth message bubble (45 clicks) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 0 }}
        animate={{ 
          opacity: messageState.showFourthMessage ? 1 : 0, 
          scale: messageState.showFourthMessage ? 1 : 0.8, 
          y: messageState.showFourthMessage ? 0 : 10 
        }}
        className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
        style={{ 
          zIndex: 60,
          borderRadius: '16px 16px 16px 4px',
          whiteSpace: 'nowrap'
        }}
      >
        <div className="font-medium">( ˶°ㅁ°)!!</div>
        <div 
          className="absolute w-3 h-3 bg-navy-light" 
          style={{ 
            left: '50%', 
            top: '-6px',
            transform: 'translateX(-50%) rotate(45deg)'
          }}
        />
      </motion.div>

      {/* Fifth message bubble (50 clicks) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 0 }}
        animate={{ 
          opacity: messageState.showFifthMessage ? 1 : 0, 
          scale: messageState.showFifthMessage ? 1 : 0.8, 
          y: messageState.showFifthMessage ? 0 : 10 
        }}
        className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-navy-light text-white px-4 py-2 rounded-xl shadow-md"
        style={{ 
          zIndex: 60,
          borderRadius: '16px 16px 16px 4px',
          whiteSpace: 'nowrap'
        }}
      >
        <div className="font-medium">that was fun... byebye ˶˃ ᵕ ˂˶</div>
        <div 
          className="absolute w-3 h-3 bg-navy-light" 
          style={{ 
            left: '50%', 
            top: '-6px',
            transform: 'translateX(-50%) rotate(45deg)'
          }}
        />
      </motion.div>
      
      <CuteParticlesBurst 
        isActive={showParticles} 
        originX={particleOrigin.x}
        originY={particleOrigin.y}
        onComplete={handleAnimationComplete} 
      />
    </div>
  );
};

export default NameInteraction;
