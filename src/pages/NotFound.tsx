import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="workspace-page">
      <header className="page-heading">
        <p className="micro-label">404 / Not found</p>
        <h1>This page is not in the archive.</h1>
        <p>The link may have moved, or the address may be incomplete.</p>
        <Link to="/" className="text-action">
          <ArrowLeft size={16} />
          Return to Lily's workspace
        </Link>
      </header>
    </div>
  );
}
