
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
    // Save current scroll position for the current route before changing
    const currentScrollPosition = window.scrollY;
    sessionStorage.setItem(`scroll_${window.location.pathname}`, currentScrollPosition.toString());
    
    // Check if there's a saved position for the new route
    const savedPosition = sessionStorage.getItem(`scroll_${pathname}`);
    
    // Use setTimeout to ensure the DOM has been completely updated and rendered
    setTimeout(() => {
      window.scrollTo({
        top: savedPosition ? parseInt(savedPosition) : 0,
        behavior: 'auto'  // Use 'auto' instead of 'smooth' for immediate positioning
      });
    }, 100);  // Small delay to ensure DOM is ready
    
    return () => {
      // Save position again when unmounting, to ensure latest scroll is captured
      const finalPosition = window.scrollY;
      sessionStorage.setItem(`scroll_${pathname}`, finalPosition.toString());
    };
  }, [pathname]);
  
  return null;
};

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
