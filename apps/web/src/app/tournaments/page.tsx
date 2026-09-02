'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TournamentCard, TournamentItem } from '@/components/TournamentCard';
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
      
      {/* 1. HEADER & SEARCH HERO */}
      <div className="relative arena-card p-8 sm:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/15 text-xs font-bold text-[#E63946] border border-[#E63946]/30 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            Arena Competitiva Oficial
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Explorador de Torneos
          </h1>

          <p className="text-sm sm:text-base text-[#8E92A4] leading-relaxed">
            Inscríbete a los torneos de tu institución, compite en brackets oficiales en vivo y gana premios en efectivo y medallas legendarias.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A5E73]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre del torneo o sede..."
                className="input-arena pl-10"
              />
            </div>
            <button
              type="submit"
              className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 cursor-pointer"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* 2. FILTERS BAR — 5 GAME TABS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        
        {/* Game Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedGame('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedGame === 'ALL'
                ? 'bg-white text-black shadow-lg'
                : 'bg-[#15161E] text-[#8E92A4] hover:text-white border border-white/5'
            }`}
          >
            Todos los Juegos
          </button>

          {GAME_LIST.map((game) => (
            <button
              key={game.code}
              onClick={() => setSelectedGame(game.code)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedGame === game.code
                  ? 'text-white shadow-lg'
                  : 'bg-[#15161E] text-[#8E92A4] hover:text-white border border-white/5'
              }`}
              style={selectedGame === game.code ? { 
                backgroundColor: game.color,
                boxShadow: `0 4px 15px ${game.shadowColor}`,
              } : {}}
            >
              {GAME_ICON_MAP[game.iconName]}
              {game.shortName}
            </button>
          ))}
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <span className="text-xs text-[#8E92A4] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Estado:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#15161E] border border-white/10 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#E63946]"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="REGISTRATION_OPEN">Inscripciones Abiertas</option>
            <option value="PUBLISHED">Próximamente</option>
            <option value="IN_PROGRESS">En Curso</option>
            <option value="FINISHED">Finalizados</option>
          </select>
        </div>

      </div>

      {/* 3. TOURNAMENTS GRID */}
      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
          <p className="text-xs text-[#8E92A4]">Cargando torneos de la liga...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="arena-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-[#8E92A4]">
            <Trophy className="w-8 h-8 text-[#5A5E73]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No se encontraron torneos</h3>
            <p className="text-xs text-[#8E92A4] max-w-sm mx-auto">
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
