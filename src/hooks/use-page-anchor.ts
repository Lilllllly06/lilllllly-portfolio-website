import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function usePageAnchor() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      try {
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView({ block: "start" });
      } catch {
        /* Ignore malformed hashes. */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, pathname]);
}
