
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import DoggyDiary from "./pages/DoggyDiary";
import { CongratsDialog, checkAllEggsFound } from "./components/EasterEggTracker";

// Create a scroll restoration component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Store the current scroll position for the previous route before we navigate away
    const previousPath = sessionStorage.getItem('currentPath') || '/';
    const currentScrollPosition = window.scrollY;
    
    // Only save the position if we've actually scrolled
    if (currentScrollPosition > 0) {
      sessionStorage.setItem(`scroll_${previousPath}`, currentScrollPosition.toString());
    }
    
    // Update the current path
    sessionStorage.setItem('currentPath', pathname);
    
    // Always reset scroll to top immediately
    window.scrollTo(0, 0);
    
    // Special handling for pages other than DoggyDiary - restore their scroll position
    // DoggyDiary will always start at the top
    if (pathname !== '/doggy-diary' && pathname !== '/doggy-diary/') {
      const savedPosition = sessionStorage.getItem(`scroll_${pathname}`);
      
      if (savedPosition) {
        const scrollTimeout = setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPosition),
            behavior: 'auto'
          });
        }, 100);
        
        return () => clearTimeout(scrollTimeout);
      }
    }
  }, [pathname]);
  
  return null;
};

const queryClient = new QueryClient();

const App = () => {
  const [showCongrats, setShowCongrats] = useState(false);
  const congratsShownThisSession = useRef(false);
  
  // Check for all eggs found on app mount and set up monitoring
  useEffect(() => {
    // Check immediately without relying on localStorage for previous showings
    if (checkAllEggsFound() && !congratsShownThisSession.current) {
      console.log("All eggs found at app level, showing congratulations!");
      setShowCongrats(true);
      congratsShownThisSession.current = true;
    }
    
    // Set up interval to check for all eggs being found
    const intervalId = setInterval(() => {
      if (checkAllEggsFound() && !congratsShownThisSession.current) {
        console.log("All eggs found during interval check, showing congratulations!");
        setShowCongrats(true);
        congratsShownThisSession.current = true;
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
          <ScrollToTop />
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
