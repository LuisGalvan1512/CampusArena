'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Trophy, Flame } from 'lucide-react';
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

interface AppleMediaCarouselProps {
  items: CarouselItem[];
  headline?: string;
  subheadline?: string;
  tagline?: string;
}

export function AppleMediaCarousel({
  items,
  headline = 'Descubre las copas activas.',
  subheadline = 'Desliza para explorar los torneos y escenarios oficiales de esta temporada.',
  tagline = 'GALERÍA DE LA ARENA'
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

    // Calculate approximate active item
    const itemWidth = 360;
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
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    sounds.playClick();
    const scrollAmount = direction === 'left' ? -380 : 380;
    containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header with Apple-Style Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          {tagline && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
              <Flame className="w-3.5 h-3.5 text-[#E63946]" />
              <span>{tagline}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            {headline}
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
            {subheadline}
          </p>
        </div>

        {/* Circular Pill Controls (Apple Style) */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto pt-2 sm:pt-0">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Anterior"
            className="w-11 h-11 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-primary)] transition-all hover:bg-[var(--bg-card-hover)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Siguiente"
            className="w-11 h-11 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-primary)] transition-all hover:bg-[var(--bg-card-hover)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track with Snap Scrolling */}
      <div 
        ref={containerRef}
        className="flex items-stretch gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scrollbar-none snap-x snap-mandatory py-4"
        style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
      >
        {items.map((item, index) => {
          return (
            <CarouselCard key={item.id} item={item} index={index} />
          );
        })}
      </div>

      {/* Progress Dots Indicator */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (!containerRef.current) return;
              sounds.playClick();
              containerRef.current.scrollTo({ left: idx * 360, behavior: 'smooth' });
            }}
            aria-label={`Ir al elemento ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === activeIndex 
                ? 'w-8 bg-[#E63946]' 
                : 'w-2 bg-[var(--border-card)] hover:bg-[var(--text-secondary)]'
            }`}
          />
        ))}
      </div>

    </div>
  );
}

const CarouselCard = React.memo(function CarouselCard({ item, index }: { item: CarouselItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  // Scroll-linked parallax effect for the image inside the card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start']
  });

  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    shouldReduceMotion ? [1, 1, 1] : [1.02, 1.08, 1.02]
  );
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-12, 12]
  );

  return (
    <div
      ref={cardRef}
      className="w-[85vw] sm:w-[380px] lg:w-[410px] shrink-0 snap-start arena-card rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-white/20 transition-all duration-500 overflow-hidden flex flex-col justify-between shadow-xl group"
    >
      {/* Cinematic Image Frame with Scroll-Linked Parallax */}
      <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-black/90">
        <motion.img
          src={item.imageUrl}
          alt={item.title}
          style={{
            scale: shouldReduceMotion ? 1 : imageScale,
            y: shouldReduceMotion ? 0 : imageY,
            willChange: shouldReduceMotion ? 'auto' : 'transform',
          }}
          className="w-full h-full object-cover object-center opacity-85 group-hover:opacity-95 transition-opacity duration-500"
          onError={(e) => {
            if (e.currentTarget.getAttribute('data-failed') !== 'true') {
              e.currentTarget.setAttribute('data-failed', 'true');
              e.currentTarget.src = '/games/clash_royale_banner.jpg';
            }
          }}
        />

        {/* Ambient Game Light Aura */}
        <div 
          className="absolute -top-12 -left-12 w-40 h-40 rounded-full blur-2xl opacity-40 pointer-events-none group-hover:opacity-70 transition-opacity duration-500"
          style={{ backgroundColor: item.accentColor }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-black/30" />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 gap-2">
          <span 
            className="px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/20"
            style={{ backgroundColor: `${item.accentColor}E6` }}
          >
            <span>{item.category}</span>
          </span>

          {item.tag && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white border border-white/10 backdrop-blur-md">
              {item.tag}
            </span>
          )}
        </div>

        {/* Prize pill at bottom of image if available */}
        {item.prize && (
          <div className="absolute bottom-3 left-4 text-xs font-bold text-amber-300 bg-black/80 px-3 py-1 rounded-full border border-amber-400/25 backdrop-blur-md shadow-md flex items-center gap-1.5 z-10">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{item.prize}</span>
          </div>
        )}
      </div>

      {/* Card Content & CTA */}
      <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-black text-[var(--text-primary)] group-hover:text-[#E63946] transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="pt-2 border-t border-[var(--border-card)] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">Tecsup Esports</span>
          <Link
            href={item.linkHref}
            className="group/btn btn-primary py-2 px-4 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-md shadow-[#E63946]/20 transition-all hover:scale-105 active:scale-95"
          >
            <span>{item.linkText || 'Ver Detalles'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
});
