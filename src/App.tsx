
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import DoggyDiary from "./pages/DoggyDiary";

const queryClient = new QueryClient();

// ScrollToTop component to manage scroll positions
function ScrollMemory() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Save current scroll position for this page
    const saveScrollPosition = () => {
      const scrollY = window.scrollY;
      sessionStorage.setItem(`scrollPos-${pathname}`, scrollY.toString());
    };
    
    // Save position when navigating away
    window.addEventListener('beforeunload', saveScrollPosition);
    
    // When navigating within the app
    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [pathname]);
  
  useEffect(() => {
    // Restore scroll position when navigating to a page
    const savedPosition = sessionStorage.getItem(`scrollPos-${pathname}`);
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
    } else {
      window.scrollTo(0, 0); // Default to top for new pages
    }
  }, [pathname]);
  
  return null;
}

const Routes2 = () => (
  <>
    <ScrollMemory />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/doggy-diary" element={<DoggyDiary />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes2 />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
