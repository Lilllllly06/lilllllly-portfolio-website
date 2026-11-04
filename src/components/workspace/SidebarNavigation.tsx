import { useId } from "react";
import { NavLink } from "react-router-dom";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface SidebarNavigationProps {
  items: readonly { to: string; label: string; icon: LucideIcon }[];
  pathname: string;
  onNavigate: () => void;
}

export default function SidebarNavigation({ items, pathname, onNavigate }: SidebarNavigationProps) {
  const scope = useId();
  const reduceMotion = useReducedMotion();

  return (
    <LayoutGroup id={scope}>
      <nav className="workspace-nav" aria-label="Main navigation">
        {items.map(({ to, label, icon: Icon }) => {
          const selected = pathname === to || (to === "/projects" && pathname.startsWith("/project/"));
          return (
            <NavLink
              key={to}
              to={to}
              end
              onClick={onNavigate}
              className={`nav-item ${selected ? "active" : ""}`}
            >
              {selected && (
                <motion.span
                  className="nav-active-surface"
                  aria-hidden="true"
                  layoutId={reduceMotion ? undefined : "active-navigation"}
                  initial={false}
                  transition={reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 36, mass: 0.7 }}
                />
              )}
              <Icon size={18} strokeWidth={1.7} />
              <span>{label}</span>
              {to === "/manual" && <span className="nav-suffix">CV</span>}
            </NavLink>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
