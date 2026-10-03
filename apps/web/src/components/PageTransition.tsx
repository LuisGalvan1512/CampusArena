'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={{ 
        opacity: 0, 
        y: shouldReduceMotion ? 0 : 8 
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.22,
          ease: [0.23, 1, 0.32, 1], // Emil Kowalski strong ease-out
        },
      }}
    >
      {children}
    </motion.div>
  );
}
