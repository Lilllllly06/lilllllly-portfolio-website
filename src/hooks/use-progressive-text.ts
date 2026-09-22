import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export default function useProgressiveText(text: string, animate: boolean) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(() =>
    animate && !reduceMotion ? 0 : text.length,
  );
  const [skipped, setSkipped] = useState(false);
  const enabled = animate && !reduceMotion && !skipped;
  useEffect(() => {
    if (!enabled || count >= text.length) return;
    const timer = setTimeout(
      () =>
        setCount((value) =>
          Math.min(
            text.length,
            value +
              Math.max(2, Math.min(18, Math.ceil((text.length - value) / 15))),
          ),
        ),
      20,
    );
    return () => clearTimeout(timer);
  }, [count, text, enabled]);
  return {
    visible: enabled ? text.slice(0, count) : text,
    revealing: enabled && count < text.length,
    finish: () => setSkipped(true),
  };
}
