
import { motion } from "framer-motion";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PawPrint, Bone, Calendar, Heart } from "lucide-react";

const DoggyDiary = () => {
  useEffect(() => {
    // Set page title
    document.title = "Doggy's Diary | Yuezhen (Lily) Dong";
    
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  const diaryEntries = [
    {
      date: "August 15, 2024",
      content: "Today I was born—woof! I'm so excited to be part of this website!"
    },
    {
      date: "August 16, 2024",
      content: "My human keeps muttering about \"adding fun\" to this place… wagging my tail just thinking about it!"
    },
    {
      date: "August 20, 2024",
      content: "Sniff sniff… there's a secret hidden in my human's name now—apparently it's called an easter egg. Woof?"
    },
    {
      date: "September 5, 2024",
      content: "I barked at a bit of code, and now I can speak whenever someone clicks on me. Bow-wow, hi website visitors!"
    },
    {
      date: "September 18, 2024",
      content: "I spent the whole day napping on the homepage—kind of hoping someone might give my belly a rub."
    },
    {
      date: "October 11, 2024",
      content: "My human gave me my own easter egg… hidden right under my waggy tail. Heehee!"
    },
    {
      date: "November 2, 2024",
      content: "Site traffic has me zooming in circles. So many new people, so many new smells!"
    },
    {
      date: "January 20, 2025",
      content: "Eeeek—there's a new secret hidden for folks who explore all my human's projects… I wonder if they'll find it."
    },
    {
      date: "March 15, 2025",
      content: "I watched the code lines dance… My human sure is proud of me for being such a good doggo."
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
