'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { sounds } from '@/lib/sound';

const ROUTE_LABELS: Record<string, string> = {
  '/': '00 // ARENA PRINCIPAL',
  '/tournaments': '01 // CATÁLOGO DE TORNEOS',
  '/ranking': '02 // RANKING INSTITUCIONAL',
  '/live': '03 // TRANSMISIÓN EN VIVO',
  '/community': '04 // COMUNIDAD COMPETITIVA',
  '/profile': '05 // DOSSIER DE COMPETIDOR',
  '/dashboard/organizer': '06 // CONSOLA DE ORGANIZADOR',
  '/admin/organizers': '07 // PANEL DE CONTROL ROOT',
  '/auth/login': 'AUTH // ACCESO INSTITUCIONAL',
  '/auth/register': 'AUTH // REGISTRO DE COMPETIDOR',
};

function getRouteLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  if (pathname.startsWith('/tournaments/')) {
    const slug = pathname.replace('/tournaments/', '').toUpperCase().slice(0, 24);
    return `TORNEO // ${slug}`;
  }
  if (pathname.startsWith('/profile/')) {
    return 'DOSSIER // PERFIL PÚBLICO';
  }
  return `SYS // ${pathname.toUpperCase()}`;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [showHudFlash, setShowHudFlash] = useState(false);
  const prevPathRef = useRef<string>(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      sounds.playWhoosh();
      setShowHudFlash(true);
      const timer = setTimeout(() => setShowHudFlash(false), 750);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const routeLabel = getRouteLabel(pathname);

  return (
    <div className="relative">
      {/* Top Broadcast Shutter Line & Telemetry Flash on Route Change */}
      <AnimatePresence mode="wait">
        {showHudFlash && !shouldReduceMotion && (
          <motion.div
            key={`shutter-${pathname}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-x-0 top-0 z-[90]"
          >
            {/* Top Laser Progress Sweep */}
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="h-[2px] w-full bg-gradient-to-r from-[#D9232E] via-[#C5A059] to-[#D9232E]"
            />

            {/* Subtle Top Curtain Wipe */}
            <motion.div
              initial={{ scaleY: 1, originY: 0 }}
              animate={{ scaleY: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="h-16 w-full bg-gradient-to-b from-[#D9232E]/15 to-transparent"
            />

            {/* Tactical Route Switch Telemetry Badge */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="fixed bottom-6 left-6 z-[95] hidden sm:flex items-center gap-3 px-3.5 py-2 bg-[#09090B]/95 border border-[#F4F2ED]/15 rounded-sm shadow-2xl"
            >
              <span className="w-2 h-2 bg-[#D9232E] animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#F4F2ED]">
                {routeLabel}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Route Content Entrance */}
      <motion.div
        key={pathname}
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : {
                opacity: 0,
                y: 16,
                scale: 0.994,
                filter: 'blur(4px)',
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: {
            duration: 0.34,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
