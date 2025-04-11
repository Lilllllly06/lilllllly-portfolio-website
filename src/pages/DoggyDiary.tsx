
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PawPrint, Bone, Calendar, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useEasterEggs } from "@/components/EasterEggTracker";

const DoggyDiary = () => {
  const { markEggFound } = useEasterEggs();
  const [hasShownToast, setHasShownToast] = useState(false);
  
  useEffect(() => {
    // Set page title
    document.title = "Doggy's Diary | Yuezhen (Lily) Dong";
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Show the secret discovery toast only once per mount
    if (!hasShownToast) {
      toast({
        title: "🐾 Secret Discovery!",
        description: "You seem to have found someone's secret place... please don't tell anyone!",
        duration: 5000,
      });
      setHasShownToast(true);
    }
    
    // Mark diary as found for easter egg tracking (only do this once)
    localStorage.setItem('diaryFound', 'true');
    markEggFound('foundDiary');
    
    // Store that the user has visited a page other than home
    sessionStorage.setItem('hasVisitedOtherPage', 'true');
  }, [markEggFound, hasShownToast]);

  const diaryEntries = [
    {
      date: "August 15, 2024",
      content: "Woof! Today I was born, just like a brand-new React component. My human says this site is built using Vite-React, so I guess I'm the official doggo of this codebase!"
    },
    {
      date: "August 16, 2024",
      content: "I heard my human talking about \"adding fun\" to the site. Tailwind CSS classes flew by my doggy ears. It's like wearing a fancy collar made of carefully crafted utility classes—stylish yet practical!"
    },
    {
      date: "August 20, 2024",
      content: "There's a hidden surprise buried in my human's name now. Sniff sniff, I sense the first Easter egg in the code. Something about a sneaky <span> that calls an animation function? Paw-some!"
    },
    {
      date: "September 1, 2024",
      content: "Spent the day watching my human spin up a 3D dog bowl in Three.js. The code twirled like a squeaky toy—so mesmerizing. Deploying to Vercel made it go live. Now everyone can see me in all my three-dimensional glory!"
    },
    {
      date: "September 5, 2024",
      content: "Wagging my tail like a new commit on GitHub—I can speak now if someone clicks on me. My human used React's useState to toggle my bark and tested it with a million \"woofs.\" Bow-wow debugging at its finest!"
    },
    {
      date: "September 18, 2024",
      content: "My human calls this \"dev dog days.\" They're refining the site's look using Tailwind's custom themes. I just keep drooling on the keyboard… but apparently that's called \"feature creep.\""
    },
    {
      date: "October 2, 2024",
      content: "Sniffing around the code, I discovered the second Easter egg is about me! My wagging tail is now an interactive 3D model—if you hover, I do a doggy spin. The humans on the site giggle when it wags faster. Bork bork, success!"
    },
    {
      date: "November 10, 2024",
      content: "Had a little meltdown because Vite's hot module reloading freaked me out—I barked at the screen every time the site refreshed. My human patted me on the head and said, \"All good, buddy, just watch the logs.\""
    },
    {
      date: "January 20, 2025",
      content: "I see we've got a new third Easter egg hidden among all my human's projects. People who sniff around each page get a special pop-up. My job? Bark and reveal a clue if they find me. Good luck, explorers!"
    },
    {
      date: "February 14, 2025",
      content: "Everything's smoother than fresh peanut butter now. Three.js animations are stable, and the website is all cuddled up with real-time commits to GitHub. Love is in the air—especially code love!"
    },
    {
      date: "March 8, 2025",
      content: "My human just tested the website across different devices. I might be a small dog, but I saw that viewport resizing! Tailwind made everything so responsive, I felt like a dog treat was in store. Yum."
    },
    {
      date: "April 1, 2025",
      content: "Woof, diary! We're live on Vercel, and I'm strutting around like the proud pup I am. This site is my forever home—Easter eggs, fancy 3D dog tricks, and a squeaky-clean React build. Time for a celebratory nap!"
    }
  ];


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-navy to-navy-light p-6 flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                <PawPrint className="inline-block mr-2" />
                Doggy's Secret Diary
              </h1>
              <Bone className="text-white/80" />
            </div>
            
            <div className="p-6 md:p-8">
              <div className="space-y-8">
                {diaryEntries.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center mb-2 text-navy-light font-medium">
                      <Calendar className="w-4 h-4 mr-2" />
                      {entry.date}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{entry.content}</p>
                    
                    {/* Random paw prints around the diary */}
                    {index % 2 === 0 && (
                      <motion.div 
                        className="mt-4 flex justify-end"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        <PawPrint className="w-6 h-6 text-navy-light transform rotate-12" />
                      </motion.div>
                    )}
                    
                    {index % 3 === 0 && (
                      <motion.div 
                        className="absolute -left-4 text-navy-light/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                      >
                        <PawPrint className="w-12 h-12 transform -rotate-12" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                className="mt-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <div className="inline-flex items-center text-navy-light text-sm">
                  <Heart className="w-4 h-4 mr-2" />
                  <span>This diary is for dog's eyes only, please keep our secrets!</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DoggyDiary;
