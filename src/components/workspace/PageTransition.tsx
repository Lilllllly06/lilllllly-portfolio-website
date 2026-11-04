import { motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

export default function PageTransition() {
  const { pathname, hash } = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      className="route-transition"
      initial={reduceMotion ? false : { opacity: 0.3, y: hash ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Outlet />
    </motion.div>
  );
}
