
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { CongratsDialog, checkAllEggsFound } from "./components/EasterEggTracker";

const Index = lazy(() => import("./pages/Index"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DoggyDiary = lazy(() => import("./pages/DoggyDiary"));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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
      // Only show if all eggs found AND we haven't shown it yet this session
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
    // We don't reset the congratsShownThisSession flag, 
    // ensuring it won't show again this session
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
                Loading
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/doggy-diary" element={<DoggyDiary />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          
          {/* Global congratulations dialog for finding all Easter eggs */}
          <CongratsDialog open={showCongrats} onClose={handleCloseCongratsDialog} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
