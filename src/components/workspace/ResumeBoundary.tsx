import { Component, type ReactNode } from "react";
import { resumeDocuments, type ResumeDocumentId } from "@/lib/resume";

export default class ResumeBoundary extends Component<
  { children: ReactNode; documentId: ResumeDocumentId; close: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <aside
        className="resume-panel resume-load-error"
        aria-label="Resume viewer"
      >
        <p>The resume viewer is unavailable.</p>
        <a
          href={resumeDocuments[this.props.documentId].url}
          target="_blank"
          rel="noreferrer"
        >
          Open PDF in new tab
        </a>
        <button className="text-action" onClick={this.props.close}>
          Close viewer
        </button>
      </aside>
    );
  }
}
