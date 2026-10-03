'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TournamentCard, TournamentItem } from '@/components/TournamentCard';
import { TournamentCardSkeleton } from '@/components/Skeleton';
import { 
  Trophy, 
  Swords, 
  Gamepad2, 
  Search, 
  Filter, 
  Flame, 
  Loader2, 
  Sparkles,
  Zap,
  Crosshair,
  CircleDot,
} from 'lucide-react';
import { GAME_LIST, type GameCode } from '@/lib/games';

const GAME_ICON_MAP: Record<string, React.ReactNode> = {
  Swords: <Swords className="w-3.5 h-3.5" />,
  Gamepad2: <Gamepad2 className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Crosshair: <Crosshair className="w-3.5 h-3.5" />,
  CircleDot: <CircleDot className="w-3.5 h-3.5" />,
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<'ALL' | GameCode>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Sync initial game filter if passed in URL query (?game= or ?game_code=)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const gameParam = urlParams.get('game') || urlParams.get('game_code');
      if (gameParam && GAME_LIST.some((g) => g.code === gameParam)) {
        setSelectedGame(gameParam as GameCode);
      }
    }
  }, []);

  const fetchTournaments = async () => {
    setIsLoading(true);
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
    fetchTournaments();
  }, [selectedGame, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTournaments();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. HEADER & SEARCH HERO (Apple / Antigravity Style) */}
      <div className="relative arena-card p-8 sm:p-12 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden shadow-xl">
        {/* Subtle Sapphire Atmospheric Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#1E40AF]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#E63946]/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--bg-arena)] text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8] border border-[var(--border-card)]">
            <Flame className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Circuito Oficial Tecsup</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              Catálogo de Torneos.
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Inscríbete a los torneos oficiales de tu institución, compite en brackets en vivo y suma medallas permanentes a tu historial de competidor estudiantil.
            </p>
          </div>

          {/* Search Bar - Apple Rounded Pill */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar torneo por nombre, juego o sede..."
                className="input-arena pl-11 py-3 text-xs sm:text-sm rounded-full bg-[var(--bg-arena)] border-[var(--border-card)] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/25"
              />
            </div>
            <button
              type="submit"
              className="btn-primary px-6 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer rounded-full shadow-lg shadow-[#E63946]/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>Buscar</span>
            </button>
          </form>
        </div>
      </div>

      {/* 2. FILTERS BAR — APPLE SEGMENTED PILLS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
        
        {/* Game Tabs (Rounded-Full Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide py-1">
          <button
            onClick={() => setSelectedGame('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedGame === 'ALL'
                ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/25 scale-105'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-card)] hover:border-white/20'
            }`}
          >
            Todos los Juegos
          </button>

          {GAME_LIST.map((game) => (
            <button
              key={game.code}
              onClick={() => setSelectedGame(game.code)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                selectedGame === game.code
                  ? 'text-white shadow-md scale-105'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-card)] hover:border-white/20'
              }`}
              style={selectedGame === game.code ? { 
                backgroundColor: game.color,
                boxShadow: `0 4px 14px ${game.color}40`,
              } : {}}
            >
              {game.logoUrl ? (
                <img src={game.logoUrl} alt={game.name} className="w-3.5 h-3.5 object-contain shrink-0 filter drop-shadow" />
              ) : (
                GAME_ICON_MAP[game.iconName]
              )}
              <span>{game.shortName}</span>
            </button>
          ))}
        </div>

        {/* Status Dropdown Filter (Rounded-Full Pill) */}
        <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
          <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Filtro:</span>
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs font-bold rounded-full px-4 py-2 focus:outline-none focus:border-[#2563EB] cursor-pointer shadow-sm"
          >
            <option value="ALL" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Todos los Estados</option>
            <option value="REGISTRATION_OPEN" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Inscripciones Abiertas</option>
            <option value="PUBLISHED" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Próximamente</option>
            <option value="IN_PROGRESS" className="bg-[var(--bg-card)] text-[var(--text-primary)]">En Curso</option>
            <option value="FINISHED" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Finalizados</option>
          </select>
        </div>

      </div>

      {/* 3. TOURNAMENTS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="arena-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-arena)] border border-[var(--border-card)] flex items-center justify-center mx-auto text-[var(--text-secondary)]">
            <Trophy className="w-8 h-8 text-[var(--text-secondary)]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">No se encontraron torneos</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              No hay torneos que coincidan con los filtros seleccionados. Intenta cambiar de juego o reiniciar la búsqueda.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedGame('ALL');
              setSelectedStatus('ALL');
              setSearchQuery('');
            }}
            className="btn-secondary px-4 py-2 text-xs cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}

    </div>
  );
}
