import { lazy, Suspense, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Dog,
  FileText,
  Folder,
  Github,
  Linkedin,
  Mail,
  Medal,
  Menu,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { profile } from "@/data/profile";
import { useConversation } from "./conversation-context";
import { useResume } from "./resume-context";
import ResumeBoundary from "./ResumeBoundary";
import ThemeToggle from "./ThemeToggle";

const ResumeViewer = lazy(() => import("./ResumeViewer"));

const navigation = [
  { to: "/", label: "Ask Lily", icon: MessageCircle },
  { to: "/projects", label: "Projects", icon: Folder },
  { to: "/about", label: "Experience", icon: BriefcaseBusiness },
  { to: "/recognition", label: "Recognition", icon: Medal },
  { to: "/manual", label: "The manual", icon: BookOpen },
];

export default function WorkspaceLayout() {
  const { documentId, openResume, closeResume } = useResume();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    conversations,
    activeConversationId,
    reset,
    openConversation,
    deleteConversation,
    storageWarning,
  } = useConversation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const close = () => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const newConversation = () => {
    reset();
    navigate("/");
    close();
  };
  const home = () => {
    reset();
    close();
  };
  const title = pathname.startsWith("/project/")
    ? "Project file"
    : navigation.find((n) => n.to === pathname)?.label || "Not found";
  const sidebar = (
    <>
      <Link
        to="/"
        onClick={home}
        className="workspace-brand"
        aria-label="Yuezhen (Lily) Dong, home"
      >
        <span className="brand-symbol" aria-hidden="true">
          <Dog size={32} color="#3f5f99" strokeWidth={1.5}>
            <path className="brand-wink" d="M14.8 14.5q1.2-1.2 2.4 0" />
          </Dog>
        </span>
        <span>Lily Dong</span>
      </Link>
      <button className="new-conversation" onClick={newConversation}>
        <Plus size={17} /> New conversation
      </button>
      <p className="micro-label nav-label">Explore</p>
      <nav className="workspace-nav" aria-label="Main navigation">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={close}
            className={({ isActive }) =>
              `nav-item ${isActive || (to === "/projects" && pathname.startsWith("/project/")) ? "active" : ""}`
            }
          >
            <Icon size={18} strokeWidth={1.7} />
            <span>{label}</span>
            {to === "/manual" && <span className="nav-suffix">CV</span>}
          </NavLink>
        ))}
      </nav>
      {conversations.length > 0 && (
        <div className="recent-conversations">
          <p className="micro-label nav-label">Conversations</p>
          <p className="history-storage-note">Saved in this tab</p>
          <nav aria-label="Conversation history">
            {conversations.map((chat) => (
              <div
                className={`history-row ${chat.id === activeConversationId ? "active" : ""}`}
                key={chat.id}
              >
                <Link
                  to={`/?chat=${encodeURIComponent(chat.id)}`}
                  onClick={() => {
                    openConversation(chat.id);
                    close();
                  }}
                  title={chat.title}
                  aria-current={
                    chat.id === activeConversationId ? "page" : undefined
                  }
                >
                  <MessageCircle size={14} />
                  <span>{chat.title}</span>
                </Link>
                <button
                  className="icon-button history-delete"
                  title="Delete conversation"
                  aria-label={`Delete conversation: ${chat.title}`}
                  onClick={() => setDeleteId(chat.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </nav>
        </div>
      )}
      {storageWarning && (
        <p className="history-warning" role="status">
          {storageWarning}
        </p>
      )}
      <div className="sidebar-bottom">
        <a href={`mailto:${profile.email}`} className="sidebar-contact">
          <span className="mini-avatar">YD</span>
          <span>
            <strong>Let's connect</strong>
            <small>Say hello.</small>
          </span>
          <ArrowUpRight size={15} />
        </a>
        <div className="social-links">
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <Github size={17} />
          </a>
          <a
            href={profile.linkedInUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <Linkedin size={17} />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email Lily"
            title="Email Lily"
          >
            <Mail size={17} />
          </a>
          <span>Made by Lily.</span>
        </div>
      </div>
    </>
  );

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <div className={`agent-workspace ${documentId ? "resume-open" : ""}`}>
        <a className="workspace-skip" href="#main-content">
          Skip to content
        </a>
        <aside className="workspace-sidebar">{sidebar}</aside>
        <div className="workspace-stage">
          <header className="workspace-topbar">
            <div>
              <SheetTrigger asChild>
                <button
                  className="icon-button mobile-menu"
                  aria-label="Open navigation"
                >
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <Link to="/" onClick={home} className="topbar-owner">
                Lily's portfolio
              </Link>
              {pathname !== "/" && (
                <>
                  <span className="breadcrumb-slash">/</span>
                  <span className="topbar-page">{title}</span>
                </>
              )}
            </div>
            <div className="topbar-actions">
              <ThemeToggle />
              <button
                className="topbar-resume"
                onClick={() => openResume()}
                aria-haspopup="dialog"
              >
                <FileText size={15} />
                <span>Resume</span>
              </button>
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            <Suspense
              fallback={
                <div className="workspace-page" role="status">
                  Opening the file...
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>
        {documentId && (
          <ResumeBoundary documentId={documentId} close={closeResume}>
            <Suspense
              fallback={
                <aside className="resume-panel resume-loading" role="status">
                  Opening resume...
                  <button className="text-action" onClick={closeResume}>
                    Cancel
                  </button>
                </aside>
              }
            >
              <ResumeViewer key={documentId} />
            </Suspense>
          </ResumeBoundary>
        )}
        <SheetContent
          side="left"
          className="mobile-nav-drawer"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {sidebar}
        </SheetContent>
        <AlertDialog
          open={Boolean(deleteId)}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes its messages and draft from this tab. It cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep conversation</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!deleteId) return;
                  deleteConversation(deleteId);
                  if (activeConversationId === deleteId) navigate("/");
                  setDeleteId(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Sheet>
  );
}
