
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import DoggyDiary from "./pages/DoggyDiary";
import { CongratsDialog, checkAllEggsFound } from "./components/EasterEggTracker";

const queryClient = new QueryClient();

const App = () => {
  const [showCongrats, setShowCongrats] = useState(false);
  
  // Check for all eggs found on app mount and set up monitoring
  useEffect(() => {
    // Only show congrats if not already shown (using localStorage instead of sessionStorage)
    if (localStorage.getItem('congratsShown') !== 'true' && checkAllEggsFound()) {
      console.log("All eggs found at app level, showing congratulations!");
      setShowCongrats(true);
      localStorage.setItem('congratsShown', 'true');
    }
    
    // Set up interval to check for all eggs being found
    const intervalId = setInterval(() => {
      if (localStorage.getItem('congratsShown') !== 'true' && checkAllEggsFound()) {
        console.log("All eggs found during interval check, showing congratulations!");
        setShowCongrats(true);
        localStorage.setItem('congratsShown', 'true');
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleCloseCongratsDialog = () => {
    setShowCongrats(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/doggy-diary" element={<DoggyDiary />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Global congratulations dialog for finding all Easter eggs */}
          <CongratsDialog open={showCongrats} onClose={handleCloseCongratsDialog} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
