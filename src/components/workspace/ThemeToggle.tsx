import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, useReducedMotion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  const iconTransition = { duration: reduceMotion ? 0 : 0.22 };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="theme-toggle"
          aria-label={label}
          aria-pressed={isDark}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          <span className="theme-toggle-track" aria-hidden="true">
            <motion.span
              className="theme-toggle-thumb"
              initial={false}
              animate={{ x: isDark ? 20 : 0 }}
              transition={reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 32, mass: 0.65 }}
            >
              <motion.span
                className="theme-toggle-glyph"
                initial={false}
                animate={{ opacity: isDark ? 0 : 1, x: isDark ? 9 : 0, y: isDark ? -9 : 0, rotate: isDark ? 45 : 0 }}
                transition={iconTransition}
              >
                <Sun size={14} />
              </motion.span>
              <motion.span
                className="theme-toggle-glyph"
                initial={false}
                animate={{ opacity: isDark ? 1 : 0, x: isDark ? 0 : -9, y: isDark ? 0 : -9, rotate: isDark ? 0 : -30 }}
                transition={iconTransition}
              >
                <Moon size={14} />
              </motion.span>
            </motion.span>
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
