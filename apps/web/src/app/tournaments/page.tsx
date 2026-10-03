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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. HEADER & SEARCH HERO */}
      <div className="arena-card p-6 sm:p-10 bg-[var(--bg-card)] border border-[var(--border-card)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-arena)] text-xs font-semibold text-[var(--text-secondary)] border border-[var(--border-card)]">
            <Flame className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Circuito Oficial de Torneos</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Catálogo de Torneos Tecsup
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Inscríbete a los torneos de tu institución, compite en brackets oficiales en vivo y suma medallas permanentes a tu historial de competidor.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex gap-2.5 max-w-lg">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre del torneo o sede..."
                className="input-arena pl-10 text-xs sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer rounded-lg"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* 2. FILTERS BAR — GAME TABS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-[var(--border-card)]">
        
        {/* Game Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedGame('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedGame === 'ALL'
                ? 'bg-[#E63946] text-white shadow-sm'
                : 'bg-white/[0.03] text-[var(--text-secondary)] hover:text-white border border-[var(--border-card)]'
            }`}
          >
            Todos los Juegos
          </button>

          {GAME_LIST.map((game) => (
            <button
              key={game.code}
              onClick={() => setSelectedGame(game.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedGame === game.code
                  ? 'text-white shadow-sm'
                  : 'bg-white/[0.03] text-[var(--text-secondary)] hover:text-white border border-[var(--border-card)]'
              }`}
              style={selectedGame === game.code ? { 
                backgroundColor: game.color,
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

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Estado:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#E63946]"
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
