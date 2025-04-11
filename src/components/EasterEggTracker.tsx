
import { useEffect, useState } from "react";
import ProjectTracker from "@/utils/projectTracker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dog, Bone, PawPrint, Medal } from "lucide-react";
import { motion } from "framer-motion";

interface EasterEggState {
  viewedThreeProjects: boolean;
  clickedName: boolean;
  fedDog: boolean;
  foundDiary: boolean;
}

export function useEasterEggs() {
  const [easterEggs, setEasterEggs] = useState<EasterEggState>({
    viewedThreeProjects: false,
    clickedName: false,
    fedDog: false,
    foundDiary: false,
  });
  
  const [showCongrats, setShowCongrats] = useState(false);
  
  // Check if all easter eggs are found
  const allEggsFound = 
    easterEggs.viewedThreeProjects && 
    easterEggs.clickedName && 
    easterEggs.fedDog && 
    easterEggs.foundDiary;
  
  // Mark an egg as found
  const markEggFound = (egg: keyof EasterEggState) => {
    setEasterEggs(prev => {
      const newState = {
        ...prev,
        [egg]: true
      };
      
      // Check if this update resulted in all eggs being found
      if (newState.viewedThreeProjects && 
          newState.clickedName && 
          newState.fedDog && 
          newState.foundDiary) {
        // Only show congratulations if not already shown this session
        const congratsShown = sessionStorage.getItem('congratsShown') !== 'true';
        if (congratsShown) {
          setShowCongrats(true);
          sessionStorage.setItem('congratsShown', 'true');
        }
      }
      
      return newState;
    });
  };
  
  // Check if we need to show congratulations
  useEffect(() => {
    // Check projects from the tracker
    const projectsViewed = ProjectTracker.getViewedCount() >= 3;
    
    // Check if name was clicked from localStorage
    const nameClicked = Number(localStorage.getItem('nameClickCount') || '0') >= 5;
    
    // Check if dog was fed from localStorage
    const dogFed = localStorage.getItem('boneReceived') === 'true';
    
    // Check if diary was found from localStorage
    const diaryFound = localStorage.getItem('diaryFound') === 'true';
    
    // Update state based on stored values
    setEasterEggs({
      viewedThreeProjects: projectsViewed,
      clickedName: nameClicked,
      fedDog: dogFed,
      foundDiary: diaryFound
    });
    
    // Show congratulations if all are found and not already shown
    if (projectsViewed && nameClicked && dogFed && diaryFound) {
      const congratsShown = sessionStorage.getItem('congratsShown') !== 'true';
      if (congratsShown) {
        setShowCongrats(true);
        sessionStorage.setItem('congratsShown', 'true');
      }
    }
  }, []);
  
  // When congratulations is closed
  const handleCloseCongrats = () => {
    setShowCongrats(false);
  };
  
  return {
    easterEggs,
    markEggFound,
    allEggsFound,
    showCongrats,
    setShowCongrats,
    handleCloseCongrats
  };
}

export function CongratsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md border-2 border-navy/20 bg-gradient-to-br from-blue-50 to-purple-50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-navy flex items-center justify-center gap-2">
            <Medal className="h-6 w-6 text-amber-500" />
            <span>Woohoo! You found all the eggs!</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <span className="font-bold">Woof woof! Amazing job, detective hooman!</span> 🎉
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-2 text-navy-light"
            >
              You've discovered <span className="font-bold">all 4 Easter eggs</span>:
              <ul className="mt-2 list-disc list-inside">
                <li className="text-sm">Viewed my hooman's amazing projects</li>
                <li className="text-sm">Made my hooman's name go boop</li>
                <li className="text-sm">Fed me a tasty treat (thank you!)</li>
                <li className="text-sm">Found my super secret diary</li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-sm text-navy-light/80 italic mt-4"
            >
              You've clearly got a good eye for detail - my hooman would definitely want to work with someone like you! 🐾
            </motion.div>
            
            <motion.div 
              className="mt-6 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
            >
              <div className="relative">
                <Dog className="text-4xl text-navy-light" />
                <div className="absolute -right-4 -top-4 text-3xl animate-pulse">❤️</div>
              </div>
            </motion.div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction className="bg-navy hover:bg-navy-dark">
            Thanks, pupper!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
