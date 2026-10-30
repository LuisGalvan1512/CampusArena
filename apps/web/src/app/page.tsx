'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAuth } from '@/context/AuthContext';
import { TournamentCard, TournamentItem } from '@/components/TournamentCard';
import { TournamentCardSkeleton } from '@/components/Skeleton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ScrollParallaxImage } from '@/components/ScrollParallaxImage';
import { LivingBanner } from '@/components/LivingBanner';
import {
  GameDisciplineEmblem,
  LiveWaveformIcon,
  AegisTrophyIcon,
  BracketTreeIcon,
  CommandConsoleIcon,
  CornerCrosshair,
} from '@/components/EsportsIcons';
import { GAME_LIST } from '@/lib/games';
import { sounds } from '@/lib/sound';
import {
  MapPin,
  ArrowUpRight,
  CheckCircle2,
  Building2,
  Tv,
  ShieldCheck,
  Crown,
} from 'lucide-react';

// Deferred loading of the interactive media carousel
const AppleMediaCarousel = dynamic(
  () => import('@/components/AppleMediaCarousel').then((m) => m.AppleMediaCarousel),
  { ssr: false }
);

const CAMPUS_DATA = [
  {
    id: 'Lima',
    name: 'Sede Lima — Santa Anita',
    region: 'LIMA METROPOLITANA',
    code: 'LIM-01',
    latency: '11ms',
    photo: '/tecsup/campus_lima.png',
    labs: 'Laboratorios High-Spec & Arena Presencial',
    desc: 'Sede central del circuito presencial de Dota 2, Left 4 Dead 2 y finales nacionales inter-carreras.',
  },
  {
    id: 'Arequipa',
    name: 'Sede Sur — Arequipa',
    region: 'REGIÓN SUR (J.L. BUSTAMANTE)',
    code: 'AQP-02',
    latency: '18ms',
    photo: '/tecsup/campus_arequipa.jpg',
    labs: 'Arena Sur & Clasificatorias Regionales',
    desc: 'Potencia competitiva en Clash Royale, Brawl Stars y Super Smash Bros Ultimate con clasificatorias propias.',
  },
  {
    id: 'Trujillo',
    name: 'Sede Norte — Trujillo',
    region: 'REGIÓN NORTE (EL GOLF)',
    code: 'TRU-03',
    latency: '19ms',
    photo: '/tecsup/campus_trujillo.png',
    labs: 'División Norte & Liga Universitaria',
    desc: 'Escuadras de alto rendimiento en Fortnite, eFootball y torneos relámpago inter-ciclos.',
  },
];

export default function HomePage() {
  const { user, isAuthenticated, isAdmin, isOrganizer } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string>('ALL');
  const [activeDisciplineIndex, setActiveDisciplineIndex] = useState<number>(0);
  const [activeCampusIndex, setActiveCampusIndex] = useState<number>(0);

  const canManage =
    isAuthenticated &&
    (isAdmin || isOrganizer || user?.role === 'ADMIN' || user?.role === 'ORGANIZER');

  const { data: rawTournamentsData, isLoading } = useApiQuery<{ items?: TournamentItem[] }>(
    '/tournaments?limit=12'
  );

  const tournaments: TournamentItem[] = Array.isArray(rawTournamentsData)
    ? rawTournamentsData
    : rawTournamentsData?.items ?? [];

  const filteredTournaments =
    selectedGame === 'ALL'
      ? tournaments
      : tournaments.filter((t) => t.game_code === selectedGame);

  const openTournamentsCount = tournaments.filter(
    (t) => t.status === 'REGISTRATION_OPEN'
  ).length;
  const liveTournamentsCount = tournaments.filter(
    (t) => t.status === 'IN_PROGRESS'
  ).length;

  const activeDiscipline = GAME_LIST[activeDisciplineIndex] || GAME_LIST[0];
  const activeCampus = CAMPUS_DATA[activeCampusIndex] || CAMPUS_DATA[0];

  return (
    <div className="space-y-24 sm:space-y-32 pb-28">
      {/* ====================================================================
          1. MONUMENTAL WIDESCREEN LIVING HERO STAGE
          ==================================================================== */}
      <section className="widescreen-container pt-4 sm:pt-6">
        <LivingBanner
          imageSrc="/assets/banner_stadium_tunnel.jpg"
          videoSrc="/steam/admin_card_bg.webm"
          alt="Campus Arena Stadium Entrance"
          heightClassName="min-h-[640px] sm:min-h-[760px] lg:min-h-[820px] flex flex-col justify-between"
          overlayVariant="stadium"
          telemetryTag="CIRCUITO OFICIAL // TEMPORADA 2026"
        >
          {/* Top Bar inside Hero Stage */}
          <div className="p-6 sm:p-10 lg:px-14 flex flex-wrap items-center justify-between gap-4 border-b border-[#F4F2ED]/10 bg-[#070709]/45 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#D9232E] animate-pulse" />
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#F4F2ED]">
                TECSUP ESPORTS CHAMPIONSHIP CIRCUIT
              </span>
            </div>

            {/* Role Quick Mode Bar if Authenticated */}
            {canManage ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/organizer"
                  className="px-3 py-1.5 rounded-sm bg-[#D9232E] text-white font-mono text-[10px] font-bold uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-[#E63946] transition-colors"
                >
                  <CommandConsoleIcon className="w-3.5 h-3.5" />
                  <span>Abrir Consola de Organizador</span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/organizers"
                    className="px-3 py-1.5 rounded-sm bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 font-mono text-[10px] font-bold uppercase tracking-[0.16em] flex items-center gap-1.5 hover:bg-[#C5A059]/30 transition-colors"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Root Admin</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#A3A19A]">
                <span>SEDE LIMA</span>
                <span className="text-[#D9232E]">/</span>
                <span>SEDE AREQUIPA</span>
                <span className="text-[#D9232E]">/</span>
                <span>SEDE NORTE</span>
              </div>
            )}
          </div>

          {/* Center Monumental Typography Stack */}
          <div className="px-6 sm:px-10 lg:px-14 py-12 sm:py-16 max-w-6xl space-y-8 my-auto">
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-sm bg-[#09090B]/90 border border-[#F4F2ED]/15">
              <img
                src="/brand/tecsup_emblem.png"
                alt="Tecsup"
                className="w-4 h-4 object-contain"
              />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                PLATAFORMA OFICIAL DE COMPETICIÓN UNIVERSITARIA
              </span>
            </div>

            <h1 className="font-display text-[clamp(3.1rem,7.8vw,7.8rem)] font-bold text-[#F4F2ED] tracking-[-0.035em] leading-[0.9] uppercase">
              DOMINA LA ARENA.{' '}
              <span className="block text-[#D9232E] mt-1">
                REPRESENTA A TU SEDE.
              </span>
            </h1>

            <p className="font-editorial text-base sm:text-xl text-[#A3A19A] max-w-2xl leading-relaxed font-normal">
              Torneos oficiales con brackets en tiempo real, arbitraje verificado, transmisión
              multicanal y clasificación histórica para estudiantes y egresados con credencial{' '}
              <span className="font-mono text-[#F4F2ED] border-b border-[#D9232E]">
                @tecsup.edu.pe
              </span>
              .
            </p>

            {/* Primary & Secondary Architectural CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/tournaments"
                onClick={() => sounds.playLaunchWoosh()}
                className="group btn-primary py-4 px-8 text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.18em] inline-flex items-center gap-4"
              >
                <span>EXPLORAR CARTELERA DE TORNEOS</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <Link
                href="/ranking"
                onClick={() => sounds.playWoodClick()}
                className="btn-secondary py-4 px-7 text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center gap-3 bg-[#09090B]/85"
              >
                <AegisTrophyIcon className="w-4 h-4 text-[#C5A059]" animated={false} />
                <span>CLASIFICACIÓN HISTÓRICA</span>
              </Link>

              <Link
                href="/live"
                onClick={() => sounds.playWoodClick()}
                className="py-4 px-6 rounded-sm bg-[#09090B]/85 border border-[#D9232E]/40 hover:border-[#D9232E] text-xs font-mono font-bold uppercase tracking-[0.16em] text-[#F4F2ED] inline-flex items-center gap-2.5 transition-colors"
              >
                <LiveWaveformIcon className="w-4 h-3.5 text-[#D9232E]" />
                <span>SEÑAL EN VIVO</span>
              </Link>
            </div>
          </div>

          {/* Bottom Broadcast Telemetry Bar inside Hero */}
          <div className="px-6 sm:px-10 lg:px-14 py-4 border-t border-[#F4F2ED]/10 bg-[#070709]/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#A3A19A]">
              <span className="flex items-center gap-2 text-[#F4F2ED] font-bold">
                <BracketTreeIcon className="w-4 h-4 text-[#D9232E]" />
                MOTOR DE LLAVES EN TIEMPO REAL
              </span>
              <span className="hidden md:inline text-[#F4F2ED]/20">|</span>
              <span className="hidden md:inline">VALIDACIÓN AUTOMÁTICA YAPE / PLIN</span>
              <span className="hidden lg:inline text-[#F4F2ED]/20">|</span>
              <span className="hidden lg:inline text-[#C5A059]">7 DISCIPLINAS OFICIALES</span>
            </div>

            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A3A19A] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400" />
              <span>SERVIDOR OPERATIVO // {tournaments.length} TORNEOS REGISTRADOS</span>
            </div>
          </div>
        </LivingBanner>

        {/* ====================================================================
            MONUMENTAL TELEMETRY STRIP (4 ARCHITECTURAL MONOLITHS)
            ==================================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
          {[
            {
              idx: '01',
              label: 'TORNEOS PUBLICADOS',
              value: tournaments.length,
              sub: `${openTournamentsCount} CON INSCRIPCIÓN ABIERTA`,
              accent: 'text-[var(--text-primary)]',
            },
            {
              idx: '02',
              label: 'PARTIDAS EN DISPUTA',
              value: liveTournamentsCount,
              sub: 'SINCRONIZACIÓN SUPABASE REALTIME',
              accent: 'text-[#D9232E]',
            },
            {
              idx: '03',
              label: 'CAMPUS INTERCONECTADOS',
              value: 3,
              sub: 'LIMA • AREQUIPA • TRUJILLO',
              accent: 'text-[#C5A059]',
            },
            {
              idx: '04',
              label: 'DISCIPLINAS ACTIVAS',
              value: GAME_LIST.length,
              sub: 'PC • MOBILE • CONSOLA PRESENCIAL',
              accent: 'text-emerald-400',
            },
          ].map((stat) => (
            <div key={stat.idx} className="double-bezel">
              <div className="double-bezel-inner p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between min-h-[150px]">
                <span className="monolith-numeral text-6xl sm:text-7xl font-bold absolute top-3 right-4">
                  {stat.idx}
                </span>
                <div className="space-y-1 relative z-10">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] block">
                    {stat.label}
                  </span>
                  <div className={`font-display text-4xl sm:text-5xl font-bold tabular-nums ${stat.accent}`}>
                    <AnimatedCounter value={stat.value} />
                  </div>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-secondary)] pt-4 border-t border-[var(--border-card)] mt-4 relative z-10">
                  {stat.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          2. MONUMENTAL INTERACTIVE 7-DISCIPLINE DOSSIER
          ==================================================================== */}
      <section className="widescreen-container space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--border-card)] pb-6">
          <div className="space-y-2">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#D9232E] flex items-center gap-2">
              <span>01 // ECOSISTEMA COMPETITIVO</span>
            </div>
            <h2 className="font-display text-[clamp(2.2rem,4.8vw,4.5rem)] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-[0.95] uppercase">
              SIETE DISCIPLINAS OFICIALES.
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] max-w-md font-editorial">
            Selecciona una disciplina para inspeccionar su formato reglamentario, modalidad de
            competencia y torneos activos en tu sede.
          </p>
        </div>

        {/* Architectural Discipline Selector Bar */}
        <div
          role="tablist"
          aria-label="Disciplinas competitivas de Campus Arena"
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2"
        >
          {GAME_LIST.map((game, idx) => {
            const isSelected = idx === activeDisciplineIndex;
            return (
              <button
                key={game.code}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  sounds.playMetalSlide();
                  setActiveDisciplineIndex(idx);
                }}
                className={`relative p-4 rounded-sm border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#141419] border-[#D9232E] text-[#F4F2ED]'
                    : 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[#F4F2ED]/25 hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <GameDisciplineEmblem
                    gameCode={game.code}
                    className={`w-5 h-5 ${isSelected ? 'text-[#D9232E]' : 'text-[var(--text-muted)]'}`}
                  />
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    0{idx + 1}
                  </span>
                </div>
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-tight truncate">
                    {game.name}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)] mt-0.5 truncate">
                    {game.badge}
                  </p>
                </div>
                {isSelected && (
                  <motion.div
                    layoutId="home-discipline-bar"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute bottom-0 inset-x-0 h-[2px] bg-[#D9232E]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Discipline Widescreen Showcase Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDiscipline.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="double-bezel"
          >
            <div className="double-bezel-inner relative overflow-hidden min-h-[380px] sm:min-h-[440px] grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Editorial Technical Sheet */}
              <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between space-y-8 relative z-10 bg-gradient-to-r from-[#0D0D10] via-[#0D0D10] to-transparent">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-sm bg-[#D9232E] text-white font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
                      {activeDiscipline.badge}
                    </span>
                    <span className="px-3 py-1 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)] font-mono text-[10px] text-[#C5A059] uppercase tracking-[0.16em]">
                      ID // {activeDiscipline.tagLabel.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={activeDiscipline.logoUrl}
                      alt={activeDiscipline.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = activeDiscipline.remoteLogoUrl;
                      }}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                    />
                    <h3 className="font-display text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-[-0.03em] uppercase">
                      {activeDiscipline.name}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
                    {activeDiscipline.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] block">
                      FORMATO REGLAMENTARIO
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--text-primary)] uppercase">
                      ELIMINACIÓN DIRECTA • BO3 / FINAL BO5
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playWoodClick();
                        setSelectedGame(activeDiscipline.code);
                        document
                          .getElementById('active-tournaments')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="btn-primary py-3 px-6 text-xs font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center gap-2.5 cursor-pointer"
                    >
                      <span>FILTRAR TORNEOS DE {activeDiscipline.shortName}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Living Key Art Banner */}
              <div className="lg:col-span-6 relative min-h-[260px] lg:min-h-full overflow-hidden bg-[#070709]">
                <motion.img
                  src={activeDiscipline.bannerUrl}
                  alt={activeDiscipline.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = activeDiscipline.remoteBannerUrl;
                  }}
                  animate={{ scale: [1.02, 1.08, 1.02] }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-full object-cover object-center opacity-85 contrast-[1.08]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D10] via-[#0D0D10]/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-transparent to-black/30" />
                <span className="monolith-numeral text-[9rem] font-bold absolute bottom-2 right-6">
                  {activeDiscipline.shortName}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ====================================================================
          3. ACTIVE TOURNAMENTS CATALOG SECTION
          ==================================================================== */}
      <section id="active-tournaments" className="widescreen-container space-y-10 scroll-mt-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--border-card)] pb-6">
          <div className="space-y-2">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#D9232E]">
              02 // CONVOCATORIAS OFICIALES
            </div>
            <h2 className="font-display text-[clamp(2.2rem,4.8vw,4.5rem)] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-[0.95] uppercase">
              TORNEOS EN CURSO Y ABIERTOS.
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {[
              { code: 'ALL', label: 'TODOS' },
              ...GAME_LIST.map((g) => ({ code: g.code, label: g.shortName, fullName: g.name })),
            ].map((tab) => {
              const isActive = selectedGame === tab.code;
              return (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => {
                    sounds.playWoodClick();
                    setSelectedGame(tab.code);
                  }}
                  className={`px-3.5 py-2 rounded-sm font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition-all cursor-pointer whitespace-nowrap border ${
                    isActive
                      ? 'bg-[#D9232E] text-white border-[#D9232E]'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[#F4F2ED]/25 hover:text-[var(--text-primary)]'
                  }`}
                >
                  {'fullName' in tab && tab.fullName ? tab.fullName : tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tournament Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <TournamentCardSkeleton key={idx} />
            ))}
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="double-bezel">
            <div className="double-bezel-inner p-16 text-center space-y-5">
              <AegisTrophyIcon className="w-12 h-12 text-[#C5A059] mx-auto" />
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] uppercase">
                  SIN TORNEOS EN ESTA DISCIPLINA
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Actualmente no hay torneos publicados bajo este filtro. Explora todas las
                  disciplinas o abre la Consola de Organizador para publicar una nueva fecha.
                </p>
              </div>
              {selectedGame !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedGame('ALL')}
                  className="btn-secondary px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.16em] cursor-pointer"
                >
                  VER TODAS LAS DISCIPLINAS
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.slice(0, 6).map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Link
            href="/tournaments"
            className="btn-secondary py-3.5 px-8 text-xs font-mono font-bold uppercase tracking-[0.18em] inline-flex items-center gap-3"
          >
            <span>VER ARCHIVO COMPLETO DE TORNEOS ({tournaments.length})</span>
            <ArrowUpRight className="w-4 h-4 text-[#D9232E]" />
          </Link>
        </div>
      </section>

      {/* ====================================================================
          4. ARCHITECTURAL INFRASTRUCTURE & BROADCAST GRID
          ==================================================================== */}
      <section className="widescreen-container space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--border-card)] pb-6">
          <div className="space-y-2">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#C5A059]">
              03 // ARQUITECTURA DE OPERACIONES
            </div>
            <h2 className="font-display text-[clamp(2.2rem,4.8vw,4.5rem)] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-[0.95] uppercase">
              INGENIERÍA DE TORNEOS NIVEL PRO.
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] max-w-md font-editorial">
            Desde la creación de llaves y validación de comprobantes Yape/Plin hasta la transmisión
            en OBS Studio para pantallas gigantes en campus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1 (7 Cols): Broadcast & Bracket Operations Room */}
          <div className="lg:col-span-7 double-bezel">
            <div className="double-bezel-inner h-full flex flex-col justify-between overflow-hidden">
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#070709]">
                <ScrollParallaxImage
                  src="/assets/banner_command_center.jpg"
                  alt="Sala de Control y Arbitraje Campus Arena"
                  scaleRange={[1.02, 1.12]}
                  yRange={[-15, 15]}
                  containerClassName="w-full h-full"
                  className="opacity-85 contrast-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-[#0D0D10]/30 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-sm bg-[#09090B]/90 border border-[#F4F2ED]/15 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9232E] flex items-center gap-2">
                  <BracketTreeIcon className="w-3.5 h-3.5" />
                  <span>MODO ESCENARIO & OBS BROWSER SOURCE</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] uppercase tracking-tight">
                  CONSOLA DE ARBITRAJE Y BRACKETS EN TIEMPO REAL
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Los organizadores generan llaves automáticas, registran marcadores BO1/BO3/BO5 al
                  instante y proyectan el bracket limpio en 1920x1080 directamente en OBS Studio o
                  pantallas del auditorio.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href="/tournaments"
                    className="btn-primary py-2.5 px-5 text-[11px] font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center gap-2"
                  >
                    <span>INSPECCIONAR LLAVES ACTIVAS</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  {canManage && (
                    <Link
                      href="/dashboard/organizer"
                      className="btn-secondary py-2.5 px-5 text-[11px] font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D9232E]" />
                      <span>IR A CONSOLA DE ORGANIZADOR</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 (5 Cols): Trophy Pedestal & Yape/Plin Verification */}
          <div className="lg:col-span-5 double-bezel">
            <div className="double-bezel-inner h-full flex flex-col justify-between overflow-hidden">
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#070709]">
                <ScrollParallaxImage
                  src="/assets/arena_trophy_pedestal.jpg"
                  alt="Trofeo Oficial Campus Arena"
                  scaleRange={[1.02, 1.12]}
                  yRange={[-15, 15]}
                  containerClassName="w-full h-full"
                  className="opacity-85 contrast-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-[#0D0D10]/30 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-sm bg-[#09090B]/90 border border-[#C5A059]/35 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C5A059]">
                  CHECKOUT YAPE / PLIN + WHATSAPP
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] uppercase tracking-tight">
                  INSCRIPCIÓN EN 60 SEGUNDOS Y POZOS GARANTIZADOS
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Sin comisiones bancarias ni pasarelas lentas. Escanea el QR oficial de Yape o
                  Plin, sube tu comprobante en el asistente y notifica al comité organizador en un
                  clic.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                  <span className="px-2.5 py-1 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> 0% COMISIÓN
                  </span>
                  <span className="px-2.5 py-1 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)] text-[var(--text-secondary)]">
                    AUDITORÍA DE VOUCHER
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 (5 Cols): Competitor Dossier & Institutional Security */}
          <div className="lg:col-span-5 double-bezel">
            <div className="double-bezel-inner h-full flex flex-col justify-between overflow-hidden">
              <div className="relative h-60 w-full overflow-hidden bg-[#070709]">
                <ScrollParallaxImage
                  src="/assets/banner_pro_gear.jpg"
                  alt="Equipamiento Competitivo Tecsup"
                  scaleRange={[1.02, 1.12]}
                  yRange={[-12, 12]}
                  containerClassName="w-full h-full"
                  className="opacity-85 contrast-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-[#0D0D10]/30 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-sm bg-[#09090B]/90 border border-[#F4F2ED]/15 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#F4F2ED]">
                  IDENTIDAD // @TECSUP.EDU.PE
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] uppercase tracking-tight">
                  DOSSIER DE COMPETIDOR Y VERIFICACIÓN SIN SMURFS
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Cada participante compite con su identidad institucional de Tecsup, acumulando
                  medallas de oro, plata y bronce en su carnet digital verificable.
                </p>
                <div className="pt-2">
                  <Link
                    href="/profile"
                    className="btn-secondary py-2.5 px-5 text-[11px] font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center gap-2"
                  >
                    <span>PERSONALIZAR MI DOSSIER</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D9232E]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 (7 Cols): Interactive 3-Campus Command Selector */}
          <div className="lg:col-span-7 double-bezel">
            <div className="double-bezel-inner h-full p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9232E] flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    RED INTER-SEDES NACIONAL
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] uppercase mt-1">
                    TRES CAMPUS. UNA SOLA TABLA.
                  </h3>
                </div>

                {/* Campus Switcher Tabs */}
                <div className="flex items-center gap-1.5">
                  {CAMPUS_DATA.map((c, idx) => {
                    const active = idx === activeCampusIndex;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          sounds.playWoodClick();
                          setActiveCampusIndex(idx);
                        }}
                        className={`px-3 py-1.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer border ${
                          active
                            ? 'bg-[#D9232E] text-white border-[#D9232E]'
                            : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] border-[var(--border-card)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {c.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCampus.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center"
                >
                  <div className="sm:col-span-6 relative h-52 rounded-sm overflow-hidden border border-[var(--border-card)]">
                    <img
                      src={activeCampus.photo}
                      alt={activeCampus.name}
                      className="w-full h-full object-cover contrast-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-white">
                      <span className="px-2 py-0.5 bg-[#D9232E] font-bold">{activeCampus.code}</span>
                      <span className="px-2 py-0.5 bg-black/80 border border-white/15">
                        PING // {activeCampus.latency}
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-6 space-y-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C5A059]">
                      {activeCampus.region}
                    </div>
                    <h4 className="font-display text-2xl font-bold text-[var(--text-primary)] uppercase">
                      {activeCampus.name}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {activeCampus.desc}
                    </p>
                    <div className="pt-2 font-mono text-[10px] text-emerald-400 uppercase tracking-[0.14em] flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#D9232E]" />
                      <span>{activeCampus.labs}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. INTERACTIVE MEDIA CAROUSEL
          ==================================================================== */}
      <AppleMediaCarousel />

      {/* ====================================================================
          6. MONUMENTAL BROADCAST FINALE CTA
          ==================================================================== */}
      <section className="widescreen-container">
        <div className="double-bezel">
          <div className="double-bezel-inner relative overflow-hidden p-10 sm:p-16 lg:p-20 bg-[#0A0A0D]">
            <div className="absolute top-3 left-3">
              <CornerCrosshair />
            </div>
            <div className="absolute top-3 right-3">
              <CornerCrosshair />
            </div>
            <div className="absolute bottom-3 left-3">
              <CornerCrosshair />
            </div>
            <div className="absolute bottom-3 right-3">
              <CornerCrosshair />
            </div>

            <span className="monolith-numeral text-[8rem] sm:text-[13rem] font-bold absolute -bottom-8 right-6">
              TECSUP
            </span>

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#D9232E] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#D9232E]" />
                <span>CONVOCATORIA ABIERTA // TEMPORADA 2026</span>
              </div>

              <h2 className="font-display text-[clamp(2.4rem,5.5vw,5.2rem)] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-[0.94] uppercase">
                ¿LISTO PARA INSCRIBIR A TU ESCUADRA EN LA HISTORIA DE TECSUP?
              </h2>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Únete con tu cuenta institucional, arma tu equipo o compite en solitario y escala en
                el medallero oficial de las tres sedes.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/tournaments"
                  onClick={() => sounds.playLaunchWoosh()}
                  className="btn-primary py-4 px-8 text-xs font-mono font-bold uppercase tracking-[0.18em] inline-flex items-center gap-3"
                >
                  <span>INSCRIBIRME EN UN TORNEO</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/live"
                  className="btn-secondary py-4 px-7 text-xs font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center gap-2.5"
                >
                  <Tv className="w-4 h-4 text-[#D9232E]" />
                  <span>VER TRANSMISIÓN EN VIVO</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
