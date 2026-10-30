'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { sounds } from '@/lib/sound';
import { useAuth } from '@/context/AuthContext';
import { TournamentCard, TournamentItem } from '@/components/TournamentCard';
import { TournamentCardSkeleton } from '@/components/Skeleton';
import { LivingBanner } from '@/components/LivingBanner';
import {
  GameDisciplineEmblem,
  AegisTrophyIcon,
  CommandConsoleIcon,
  LiveWaveformIcon,
} from '@/components/EsportsIcons';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  ArrowUpRight,
  MapPin,
  Users,
} from 'lucide-react';
import { GAME_LIST, GAME_CATALOG, type GameCode } from '@/lib/games';

export default function TournamentsPage() {
  const { user, isAuthenticated, isAdmin, isOrganizer } = useAuth();
  const canManage =
    isAuthenticated &&
    (isAdmin || isOrganizer || user?.role === 'ADMIN' || user?.role === 'ORGANIZER');

  const [tournaments, setTournaments] = useState<TournamentItem[]>(() => {
    const cached = api.getCached<{ items: TournamentItem[] }>('/tournaments');
    return cached?.data?.items || [];
  });
  const [isLoading, setIsLoading] = useState(() => !api.hasCache('/tournaments'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<'ALL' | GameCode>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [displayMode, setDisplayMode] = useState<'GRID' | 'TABLE'>('GRID');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const gameParam = urlParams.get('game') || urlParams.get('game_code');
      if (gameParam && GAME_LIST.some((g) => g.code === gameParam)) {
        setSelectedGame(gameParam as GameCode);
      }
    }
  }, []);

  const fetchTournaments = async (showLoadingSkeleton = false) => {
    if (showLoadingSkeleton) {
      setIsLoading(true);
    }
    const params = new URLSearchParams();

    if (selectedGame !== 'ALL') {
      params.append('game_code', selectedGame);
    }
    if (selectedStatus !== 'ALL') {
      params.append('status', selectedStatus);
    }
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/tournaments${queryString}`);

    if (res.success && res.data?.items) {
      setTournaments(res.data.items);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const hasFilters =
      selectedGame !== 'ALL' || selectedStatus !== 'ALL' || searchQuery.trim() !== '';
    const cached = api.getCached(
      `/tournaments${selectedGame !== 'ALL' ? `?game_code=${selectedGame}` : ''}`
    );
    fetchTournaments(!cached && hasFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGame, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playWoodClick();
    fetchTournaments();
  };

  return (
    <div className="widescreen-container py-6 sm:py-10 space-y-10 pb-24">
      {/* 1. LIVING MONUMENTAL HEADER HERO */}
      <LivingBanner
        imageSrc="/assets/arena_hero_stage.jpg"
        alt="Catálogo Oficial de Torneos Campus Arena"
        heightClassName="min-h-[380px] sm:min-h-[440px] flex flex-col justify-between"
        overlayVariant="editorial"
        telemetryTag="ARCHIVO OFICIAL DE COMPETICIÓN"
      >
        <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-between h-full space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-sm bg-[#09090B]/90 border border-[#F4F2ED]/15 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
              <span className="w-1.5 h-1.5 bg-[#D9232E]" />
              <span>01 // CALENDARIO OFICIAL TECSUP</span>
            </div>

            {canManage && (
              <Link
                href="/dashboard/organizer"
                className="btn-primary py-2.5 px-5 text-[11px] font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center gap-2"
              >
                <CommandConsoleIcon className="w-4 h-4" />
                <span>CREAR / GESTIONAR TORNEOS</span>
              </Link>
            )}
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="font-display text-[clamp(2.8rem,6.5vw,6.2rem)] font-bold text-[#F4F2ED] tracking-[-0.035em] leading-[0.9] uppercase">
              CATÁLOGO DE <span className="text-[#D9232E]">TORNEOS.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#A3A19A] leading-relaxed max-w-2xl font-editorial">
              Inspecciona las copas abiertas por sede y disciplina, revisa el pozo de premios y
              confirma la inscripción de tu escuadra en tiempo real.
            </p>
          </div>

          {/* Search & Quick Telemetry Bar */}
          <div className="pt-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 w-full max-w-2xl">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3A19A]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar torneo por título, disciplina o sede..."
                  className="input-arena pl-11 py-3 text-xs sm:text-sm bg-[#09090B]/95 border-[#F4F2ED]/15"
                />
              </div>
              <button
                type="submit"
                className="btn-primary px-7 py-3 text-xs font-mono font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>EJECUTAR BÚSQUEDA</span>
              </button>
            </form>

            <div className="hidden xl:flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#A3A19A]">
              <span>TOTAL EN LISTA: {tournaments.length}</span>
              <span className="text-[#D9232E]">/</span>
              <span>SEDES: LIMA • AQP • NORTE</span>
            </div>
          </div>
        </div>
      </LivingBanner>

      {/* 2. ARCHITECTURAL DISCIPLINE & STATUS FILTER DECK */}
      <div className="double-bezel">
        <div className="double-bezel-inner p-4 sm:p-5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          {/* Discipline Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 no-scrollbar">
            <button
              type="button"
              data-no-sound
              onClick={() => {
                sounds.playWoodClick();
                setSelectedGame('ALL');
              }}
              className={`relative px-4 py-2.5 rounded-sm font-mono text-[11px] font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer whitespace-nowrap border ${
                selectedGame === 'ALL'
                  ? 'bg-[#D9232E] text-white border-[#D9232E]'
                  : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-card)]'
              }`}
            >
              TODAS LAS DISCIPLINAS
            </button>

            {GAME_LIST.map((game) => {
              const active = selectedGame === game.code;
              return (
                <button
                  key={game.code}
                  type="button"
                  data-no-sound
                  onClick={() => {
                    sounds.playWoodClick();
                    setSelectedGame(game.code);
                  }}
                  className={`relative px-3.5 py-2.5 rounded-sm font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                    active
                      ? 'bg-[#18181F] text-[#F4F2ED] border-[#D9232E]'
                      : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-card)]'
                  }`}
                >
                  <GameDisciplineEmblem
                    gameCode={game.code}
                    className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-[#D9232E]' : 'text-[var(--text-muted)]'}`}
                  />
                  <span>{game.name}</span>
                  {active && (
                    <motion.span
                      layoutId="tournaments-filter-laser"
                      className="absolute bottom-0 inset-x-0 h-[2px] bg-[#D9232E]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Status Select + Grid/Table View Mode */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 shrink-0 border-t xl:border-t-0 pt-3 xl:pt-0 border-[var(--border-card)]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#D9232E]" />
                <span>ESTADO:</span>
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filtrar torneos por estado"
                className="bg-[var(--bg-arena)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono text-[11px] font-bold uppercase tracking-wider rounded-sm px-3.5 py-2 focus:outline-none focus:border-[#D9232E] cursor-pointer"
              >
                <option value="ALL">TODOS LOS ESTADOS</option>
                <option value="REGISTRATION_OPEN">INSCRIPCIONES ABIERTAS</option>
                <option value="PUBLISHED">PRÓXIMAMENTE</option>
                <option value="IN_PROGRESS">EN JUEGO / EN VIVO</option>
                <option value="FINISHED">FINALIZADOS</option>
              </select>
            </div>

            <div className="flex items-center border border-[var(--border-card)] rounded-sm overflow-hidden bg-[var(--bg-arena)]">
              <button
                type="button"
                onClick={() => {
                  sounds.playWoodClick();
                  setDisplayMode('GRID');
                }}
                aria-label="Vista en cuadrícula"
                className={`px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
                  displayMode === 'GRID'
                    ? 'bg-[#D9232E] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">MONOLITOS</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playWoodClick();
                  setDisplayMode('TABLE');
                }}
                aria-label="Vista en tabla táctica"
                className={`px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
                  displayMode === 'TABLE'
                    ? 'bg-[#D9232E] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">TABLA TÁCTICA</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TOURNAMENTS DISPLAY (GRID OR TACTICAL TABLE) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="double-bezel">
          <div className="double-bezel-inner p-16 text-center space-y-5">
            <AegisTrophyIcon className="w-12 h-12 text-[#D9232E] mx-auto" />
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] uppercase">
                SIN TORNEOS BAJO ESTE FILTRO
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                No hay torneos activos con los criterios seleccionados. Restablece los filtros para
                explorar toda la cartelera oficial.
              </p>
            </div>
            {(selectedGame !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedGame('ALL');
                  setSelectedStatus('ALL');
                  setSearchQuery('');
                }}
                className="btn-secondary px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.16em] inline-block cursor-pointer"
              >
                RESTABLECER FILTROS
              </button>
            )}
          </div>
        </div>
      ) : displayMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      ) : (
        /* TACTICAL HIGH-DENSITY LEDGER VIEW */
        <div className="double-bezel">
          <div className="double-bezel-inner overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-card)] bg-[var(--bg-arena)] font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  <th className="py-4 px-5">DISCIPLINA / TORNEO</th>
                  <th className="py-4 px-4">SEDE</th>
                  <th className="py-4 px-4">POZO DE PREMIOS</th>
                  <th className="py-4 px-4">CUPOS</th>
                  <th className="py-4 px-4">ENTRADA</th>
                  <th className="py-4 px-4">ESTADO</th>
                  <th className="py-4 px-5 text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-card)] text-xs">
                {tournaments.map((t) => {
                  const game = GAME_CATALOG[t.game_code as GameCode];
                  const isFree = !t.cost || Number(t.cost) === 0;
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)] flex items-center justify-center shrink-0">
                            <GameDisciplineEmblem
                              gameCode={t.game_code}
                              className="w-5 h-5 text-[#D9232E]"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/tournaments/${t.slug}`}
                              className="font-display text-base font-bold text-[var(--text-primary)] group-hover:text-[#D9232E] uppercase tracking-tight block"
                            >
                              {t.name}
                            </Link>
                            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                              {game?.name || t.game_code} • {t.format || 'BO3'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] uppercase text-[var(--text-secondary)]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#D9232E]" />
                          {t.campus_name}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] font-bold text-[#C5A059] uppercase">
                        {t.prize_pool}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] tabular-nums text-[var(--text-primary)]">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          {t.current_participants} / {t.max_slots}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] font-bold tabular-nums text-[var(--text-primary)]">
                        {isFree ? 'LIBRE' : `S/. ${Number(t.cost).toFixed(2)}`}
                      </td>
                      <td className="py-4 px-4 font-mono text-[10px] uppercase">
                        {t.status === 'IN_PROGRESS' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D9232E] text-white font-bold rounded-sm">
                            <LiveWaveformIcon className="w-3 h-3 text-white" /> EN VIVO
                          </span>
                        ) : t.status === 'REGISTRATION_OPEN' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 font-bold rounded-sm">
                            ABIERTO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-arena)] text-[var(--text-muted)] border border-[var(--border-card)] rounded-sm">
                            {t.status}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/tournaments/${t.slug}`}
                          className="btn-primary py-2 px-4 text-[10px] font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center gap-1.5"
                        >
                          <span>ABRIR</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
