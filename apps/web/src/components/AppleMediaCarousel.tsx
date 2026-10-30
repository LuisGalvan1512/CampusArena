'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpRight, Trophy } from 'lucide-react';
import { sounds } from '@/lib/sound';

export interface CarouselItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  accentColor: string;
  badge?: string;
  tag?: string;
  prize?: string;
  linkHref: string;
  linkText?: string;
}

const DEFAULT_SHOWCASE_ITEMS: CarouselItem[] = [
  {
    id: 'stadium-tunnel',
    title: 'Escenario Principal — Finales Presenciales',
    category: 'INFRAESTRUCTURA',
    description:
      'Auditorio y laboratorios interconectados en Lima, Arequipa y Trujillo para finales universitarias en vivo.',
    imageUrl: '/assets/banner_stadium_tunnel.jpg',
    accentColor: '#D9232E',
    badge: '01 // ESTADIO TECSUP',
    tag: 'LAN PRESENCIAL',
    prize: 'Trofeo Aegis + Pozo Efectivo',
    linkHref: '/tournaments',
    linkText: 'Explorar Copas',
  },
  {
    id: 'broadcast-room',
    title: 'Cabina de Producción & OBS Browser Source',
    category: 'BROADCAST',
    description:
      'Transmisión multicámara en 60 FPS hacia Kick, YouTube y TikTok Live con llaves sincronizadas al instante.',
    imageUrl: '/assets/banner_command_center.jpg',
    accentColor: '#C5A059',
    badge: '02 // CONTROL ROOM',
    tag: '1920x1080 60FPS',
    prize: 'Señal Oficial en Directo',
    linkHref: '/live',
    linkText: 'Ir a Cabina',
  },
  {
    id: 'pro-gear',
    title: 'Estaciones de Competición & Periféricos',
    category: 'EQUIPAMIENTO',
    description:
      'Red de baja latencia (< 5ms LAN) y reglamento competitivo estricto sin cuentas smurf externas.',
    imageUrl: '/assets/banner_pro_gear.jpg',
    accentColor: '#D9232E',
    badge: '03 // HARDWARE PRO',
    tag: 'VERIFICADO @TECSUP',
    prize: '7 Disciplinas Oficiales',
    linkHref: '/ranking',
    linkText: 'Ver Medallero',
  },
  {
    id: 'trophy-pedestal',
    title: 'Cuadro de Honor y Medallero Histórico',
    category: 'LEGADO',
    description:
      'Cada campeonato suma medallas de Oro, Plata y Bronce verificables en tu pasaporte competitivo estudiantil.',
    imageUrl: '/assets/arena_trophy_pedestal.jpg',
    accentColor: '#C5A059',
    badge: '04 // HALL OF FAME',
    tag: 'TEMPORADA 2026',
    prize: 'Medallero Institucional',
    linkHref: '/ranking',
    linkText: 'Ver Campeones',
  },
];

interface AppleMediaCarouselProps {
  items?: CarouselItem[];
  headline?: string;
  subheadline?: string;
  tagline?: string;
}

export function AppleMediaCarousel({
  items = DEFAULT_SHOWCASE_ITEMS,
  headline = 'GALERÍA DE OPERACIONES Y ESCENARIOS.',
  subheadline = 'Recorre la infraestructura física y digital que impulsa las ligas universitarias de Tecsup.',
}: AppleMediaCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);

    const itemWidth = 420;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveIndex(Math.min(items.length - 1, Math.max(0, index)));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    sounds.playMetalSlide();
    const scrollAmount = direction === 'left' ? -440 : 440;
    containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-8">
      {/* Header with Sharp Hardware Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 widescreen-container">
        <div className="space-y-2">
          <div className="font-mono-data text-[11px] font-bold uppercase tracking-[0.22em] text-[#D9232E]">
            04 // PANORAMA AUDIOVISUAL
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight uppercase">
            {headline}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
            {subheadline}
          </p>
        </div>

        {/* Chamfered Hardware Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto pt-2 sm:pt-0">
          <button
            type="button"
            data-no-sound
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Anterior"
            className="w-11 h-11 rounded-sm bg-[#0D0D10] border border-[var(--border-card)] hover:border-[#D9232E] flex items-center justify-center text-[var(--text-primary)] transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            data-no-sound
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Siguiente"
            className="w-11 h-11 rounded-sm bg-[#0D0D10] border border-[var(--border-card)] hover:border-[#D9232E] flex items-center justify-center text-[var(--text-primary)] transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track with Snap Scrolling */}
      <div
        ref={containerRef}
        className="flex items-stretch gap-6 overflow-x-auto widescreen-container scrollbar-none snap-x snap-mandatory py-2"
        style={{ touchAction: 'pan-x pan-y' }}
      >
        {items.map((item, index) => (
          <CarouselCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* Sharp Rectangular Progress Indicator */}
      <div className="flex items-center justify-center gap-2 pt-1">
        {items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            data-no-sound
            onClick={() => {
              if (!containerRef.current) return;
              sounds.playMetalSlide();
              containerRef.current.scrollTo({ left: idx * 420, behavior: 'smooth' });
            }}
            aria-label={`Ir al elemento ${idx + 1}`}
            className={`h-1.5 rounded-sm transition-all duration-300 cursor-pointer ${
              idx === activeIndex
                ? 'w-10 bg-[#D9232E]'
                : 'w-2.5 bg-[var(--border-card)] hover:bg-[var(--text-secondary)]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const CarouselCard = React.memo(function CarouselCard({
  item,
}: {
  item: CarouselItem;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    shouldReduceMotion ? [1, 1, 1] : [1.02, 1.09, 1.02]
  );
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-12, 12]
  );

  return (
    <div
      ref={cardRef}
      className="w-[85vw] sm:w-[400px] lg:w-[440px] shrink-0 snap-start double-bezel group transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="double-bezel-inner overflow-hidden flex flex-col justify-between h-full">
        {/* Cinematic Image Frame */}
        <div className="relative h-64 w-full overflow-hidden bg-[#070709] border-b border-[var(--border-card)]">
          <motion.img
            src={item.imageUrl}
            alt={item.title}
            style={{
              scale: shouldReduceMotion ? 1 : imageScale,
              y: shouldReduceMotion ? 0 : imageY,
              willChange: shouldReduceMotion ? 'auto' : 'transform',
            }}
            className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity duration-500 contrast-[1.06]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-transparent to-black/40" />

          {/* Sharp Hardware Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 gap-2">
            <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data uppercase tracking-widest font-bold text-white bg-[#D9232E] border border-white/20">
              {item.category}
            </span>

            {item.tag && (
              <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-[#070709]/90 text-[var(--text-secondary)] border border-white/15">
                {item.tag}
              </span>
            )}
          </div>

          {item.prize && (
            <div className="absolute bottom-3 left-4 text-[11px] font-mono-data font-bold text-[#C5A059] bg-[#070709]/90 px-2.5 py-1 rounded-sm border border-[#C5A059]/35 flex items-center gap-1.5 z-10">
              <Trophy className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{item.prize}</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between bg-[#0D0D10]">
          <div className="space-y-2">
            <h3 className="font-display text-xl font-extrabold text-[var(--text-primary)] group-hover:text-[#D9232E] transition-colors uppercase tracking-tight line-clamp-1">
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between">
            <span className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-muted)]">
              {item.badge || 'Tecsup Esports'}
            </span>
            <Link
              href={item.linkHref}
              className="btn-primary py-2 px-4 text-[11px] inline-flex items-center gap-2"
            >
              <span>{item.linkText || 'Inspeccionar'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});
