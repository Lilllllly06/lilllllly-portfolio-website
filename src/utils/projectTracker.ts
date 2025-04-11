
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
    this.viewedProjects.add(projectId);
    
    // Save to session storage
    sessionStorage.setItem('viewedProjects', JSON.stringify([...this.viewedProjects]));
    
    // Check if we've viewed 3 different projects
    if (this.viewedProjects.size >= 3 && !this.thanksShown) {
      this.showThankYouMessage();
    }
  }

  private showThankYouMessage(): void {
    toast({
      title: "🐾 Thank you!",
      description: "Thank you for sniffing through my hooman's projects! I had fun showing them to you. Hope you had a pawsome time too! 🐶💻",
      duration: 6000,
    });
    
    this.thanksShown = true;
    sessionStorage.setItem('projectThankYouShown', 'true');
  }

  public getViewedCount(): number {
    return this.viewedProjects.size;
  }

  public hasViewedProject(projectId: string): boolean {
    return this.viewedProjects.has(projectId);
  }
}

export default ProjectTracker.getInstance();
