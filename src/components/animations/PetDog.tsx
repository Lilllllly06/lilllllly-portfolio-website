
import { useRef } from 'react';
import { motion } from 'framer-motion';
import DogFigure from './pet-dog/DogFigure';
import DogMessage from './pet-dog/DogMessage';
import DogBone from './pet-dog/DogBone';
import { usePetDog } from './pet-dog/usePetDog';

const PetDog = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dogRef = useRef<HTMLDivElement>(null);
  
  const { state, actions } = usePetDog(containerRef, dogRef);
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {state.showBone && (
        <DogBone 
          position={state.bonePosition}
          onDragStart={() => actions.setIsDragging(true)}
          onDragEnd={actions.handleBoneDragEnd}
        />
      )}
      
      <div ref={dogRef}>
        <DogFigure 
          isHappy={state.isHappy}
          isMoving={state.isMoving}
          isBreathing={state.isBreathing}
          isSitting={state.isSitting}
          position={state.position}
          target={state.target}
          onClick={actions.handleClick}
        />
        
        <DogMessage 
          message={state.message}
          showMessage={state.showMessage}
        />
      </div>
    </div>
  );
};

export default PetDog;
