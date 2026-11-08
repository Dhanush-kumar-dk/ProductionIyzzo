import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * High-performance cubic-bezier easing curve (mimics iOS / Linear buttery smooth deceleration)
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.998,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1], // easeOutQuint
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.998,
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Top Progress Bar: ultra-sleek 2px gradient line indicator across the top of the viewport on route change
 */
export function TopProgressBar() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    // Automatically reset scroll position to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 320);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px] overflow-hidden bg-transparent">
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "0%" }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.32, ease: "easeInOut" }}
        className="w-full h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
      />
    </div>
  );
}

/**
 * PageTransition wrapper for each route
 */
export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full min-h-screen ${className}`}
    >
      {children}
    </motion.div>
  );
}
