import { toast } from "@/hooks/use-toast";

class ProjectTracker {
  private static instance: ProjectTracker;
  private viewedProjects: Set<string> = new Set();
  private thanksShown = false;

  private constructor() {
    try {
      // Load from sessionStorage for tracking viewed projects within a session
      const savedProjects = sessionStorage.getItem("viewedProjects");
      if (savedProjects) {
        try {
          const projectArray = JSON.parse(savedProjects);
          this.viewedProjects = new Set(projectArray);
        } catch (e) {
          console.error("Failed to parse viewed projects", e);
        }
      }

      // Use sessionStorage for toast shown status to show once per session
      const thanksShown = sessionStorage.getItem("projectThankYouShown");
      this.thanksShown = thanksShown === "true";
    } catch {
      // Optional interactions must not prevent the portfolio from loading.
    }
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

      // Save to sessionStorage
      try {
        sessionStorage.setItem(
          "viewedProjects",
          JSON.stringify([...this.viewedProjects]),
        );
      } catch {
        /* Keep tracking in memory. */
      }

      console.log(`Viewed projects count: ${this.viewedProjects.size}`);

      // Check if we've viewed 3 different projects and haven't shown the message yet
      if (this.viewedProjects.size >= 3 && !this.thanksShown) {
        console.log("Showing thank you message for viewing 3 projects");
        this.showThankYouMessage();
      }
    }
  }

  private showThankYouMessage(): void {
    // Mark as shown using sessionStorage (resets per session)
    this.thanksShown = true;
    try {
      sessionStorage.setItem("projectThankYouShown", "true");
    } catch {
      /* Persistence is optional. */
    }

    // Ensure the toast is visible by setting a short delay
    setTimeout(() => {
      toast({
        title: "Thanks for looking closer.",
        description: "Three projects explored. Curiosity suits you.",
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
    try {
      sessionStorage.removeItem("viewedProjects");
      sessionStorage.removeItem("projectThankYouShown");
    } catch {
      /* Persistence is optional. */
    }
    console.log("Project tracking reset");
  }
}

export default ProjectTracker.getInstance();
