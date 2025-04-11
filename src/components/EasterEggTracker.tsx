
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PawPrint, Trophy } from "lucide-react";
import { motion } from "framer-motion";

/**
 * This component tracks if the user has found all four Easter eggs:
 * 1. Viewed three projects (tracked via ProjectTracker)
 * 2. Fed the dog the bone (tracked via sessionStorage)
 * 3. Opened the doggy diary (tracked via sessionStorage)
 * 4. Clicked on the name at least 5 times (tracked via Hero component)
 */
const EasterEggTracker = () => {
  const [showCongrats, setShowCongrats] = useState(false);
  const [allEggsFound, setAllEggsFound] = useState(false);
  
  useEffect(() => {
    // Check if the congratulations has already been shown in this session
    const hasShownCongrats = sessionStorage.getItem('hasShownEasterEggCongrats');
    if (hasShownCongrats) return;
    
    // Set up a timer to check every second for newly found Easter eggs
    const timer = setInterval(() => {
      checkAllEasterEggs();
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const checkAllEasterEggs = () => {
    // Check if all Easter eggs have been found
    const viewedProjects = sessionStorage.getItem('viewedProjects');
    const hasViewedThreeProjects = viewedProjects && JSON.parse(viewedProjects).length >= 3;
    
    const hasFedDogBone = sessionStorage.getItem('hasFedDogBone') === 'true';
    const hasVisitedDoggyDiary = sessionStorage.getItem('hasVisitedDoggyDiary') === 'true';
    const hasClickedNameFiveTimes = sessionStorage.getItem('nameClickCount') >= 5;
    
    // If all Easter eggs have been found, show the congratulations dialog
    if (hasViewedThreeProjects && hasFedDogBone && hasVisitedDoggyDiary && hasClickedNameFiveTimes) {
      if (!allEggsFound) {
        setAllEggsFound(true);
        setShowCongrats(true);
        sessionStorage.setItem('hasShownEasterEggCongrats', 'true');
      }
    }
  };

  const handleClose = () => {
    setShowCongrats(false);
    
    // Show a toast after closing the dialog
    toast({
      title: "🏆 Congratulations again!",
      description: "You are now an official explorer of this portfolio site! Woof woof!",
      duration: 5000,
    });
  };

  return (
    <AlertDialog open={showCongrats} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md border-2 border-navy/20 bg-gradient-to-br from-blue-50 to-purple-50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-navy flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span>Woof! You found them all!</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              Congratulations, you clever explorer! 🐾
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-2 text-navy-light"
            >
              You've found <span className="font-bold">all four Easter eggs</span> in my hooman's portfolio!
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-sm text-navy-light/80"
            >
              <ul className="mt-2 text-left list-disc pl-6">
                <li>✓ Viewed three awesome projects</li>
                <li>✓ Fed me a delicious bone (thank you!)</li>
                <li>✓ Found my secret diary</li>
                <li>✓ Played with my hooman's name</li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="mt-6 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
            >
              <div className="relative">
                <div className="text-4xl">🏆</div>
                <div className="absolute -right-4 -top-4 text-3xl animate-pulse">🐾</div>
              </div>
            </motion.div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction className="bg-navy hover:bg-navy-dark">
            Woof! Thank you!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EasterEggTracker;
