
import { toast } from "@/hooks/use-toast";

class ProjectTracker {
  private static instance: ProjectTracker;
  private viewedProjects: Set<string> = new Set();
  private thanksShown = false;

  private constructor() {
    // Try to load from session storage
    const savedProjects = sessionStorage.getItem('viewedProjects');
    if (savedProjects) {
      try {
        const projectArray = JSON.parse(savedProjects);
        this.viewedProjects = new Set(projectArray);
      } catch (e) {
        console.error("Failed to parse viewed projects", e);
      }
    }

    // Check if thanks was shown in this tab session
    const thanksShown = sessionStorage.getItem('projectThankYouShown');
    this.thanksShown = thanksShown === 'true';
  }

  public static getInstance(): ProjectTracker {
    if (!ProjectTracker.instance) {
      ProjectTracker.instance = new ProjectTracker();
    }
    return ProjectTracker.instance;
  }

  public trackProject(projectId: string): void {
    if (!this.viewedProjects.has(projectId)) {
      console.log(`Tracking project: ${projectId}`);
      this.viewedProjects.add(projectId);
      
      // Save to session storage
      sessionStorage.setItem('viewedProjects', JSON.stringify([...this.viewedProjects]));
      
      console.log(`Viewed projects count: ${this.viewedProjects.size}`);
      
      // Also update localStorage for easter egg tracking
      if (this.viewedProjects.size >= 3) {
        localStorage.setItem('viewedThreeProjects', 'true');
      }
      
      // Check if we've viewed 3 different projects and haven't shown the message yet in this session
      if (this.viewedProjects.size >= 3 && !this.thanksShown) {
        console.log("Showing thank you message for viewing 3 projects");
        this.showThankYouMessage();
      }
    }
  }

  private showThankYouMessage(): void {
    // Mark as shown first to prevent showing again in this session
    this.thanksShown = true;
    sessionStorage.setItem('projectThankYouShown', 'true');
    
    // Ensure the toast is visible by setting a short delay
    setTimeout(() => {
      toast({
        title: "🐾 Thank you!",
        description: "Thank you for sniffing through my hooman's projects! I had fun showing them to you. Hope you had a pawsome time too! 🐶💻",
        duration: 6000,
      });
    }, 1000);
  }

  public getViewedCount(): number {
    return this.viewedProjects.size;
  }

  public hasViewedProject(projectId: string): boolean {
    return this.viewedProjects.has(projectId);
  }

  // Reset method for testing purposes
  public resetTracking(): void {
    this.viewedProjects.clear();
    this.thanksShown = false;
    sessionStorage.removeItem('viewedProjects');
    sessionStorage.removeItem('projectThankYouShown');
    console.log("Project tracking reset");
  }
}

export default ProjectTracker.getInstance();
