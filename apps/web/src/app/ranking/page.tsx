'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Trophy, 
  Swords, 
  Gamepad2, 
  Crown, 
  Flame, 
  Search, 
  Sparkles, 
  GraduationCap, 
  Medal, 
  ShieldCheck, 
  Loader2,
  TrendingUp,
  Award,
  Zap,
  Crosshair,
  CircleDot,
} from 'lucide-react';
import { GAME_LIST, type GameCode, GAME_CATALOG } from '@/lib/games';

interface LeaderboardEntry {
  id: string;
  rank: number;
  player_name: string;
  in_game_name: string;
  player_tag: string;
  game_code: string;
  trophies: number;
  level: number;
  career: string;
  cycle: number;
  tournaments_won: number;
  winrate: number;
  is_online: boolean;
}

const GAME_ICON_MAP_SM: Record<string, React.ReactNode> = {
  Swords: <Swords className="w-4 h-4" />,
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Crosshair: <Crosshair className="w-4 h-4" />,
  CircleDot: <CircleDot className="w-4 h-4" />,
};

export default function RankingPage() {
  const [gameCode, setGameCode] = useState<GameCode>('CLASH_ROYALE');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [topPodium, setTopPodium] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRanking = async () => {
    setIsLoading(true);
    const res = await api.get(`/ranking?game_code=${gameCode}`);
    if (res.success && res.data) {
      setLeaderboard(res.data.leaderboard);
      setTopPodium(res.data.top_podium);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRanking();
  }, [gameCode]);

  const currentGame = GAME_CATALOG[gameCode];

  const filteredLeaderboard = leaderboard.filter(
    (p) =>
      p.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.in_game_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.career.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. HEADER HERO */}
      <div className="relative arena-card p-8 sm:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-xs font-bold text-amber-400 border border-amber-500/30 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            Tabla de Posiciones Oficial
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ranking Institucional Tecsup
          </h1>

          <p className="text-sm sm:text-base text-[#8E92A4] leading-relaxed">
            Los mejores competidores de la universidad clasificados por sus copas oficiales sincronizadas con Supercell y torneos ganados en la Arena.
          </p>

          {/* Game Selector Tabs — 5 Juegos */}
          <div className="pt-3 flex items-center gap-2 flex-wrap">
            {GAME_LIST.map((game) => (
              <button
                key={game.code}
                onClick={() => setGameCode(game.code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  gameCode === game.code
                    ? 'text-white shadow-lg'
                    : 'bg-[#15161E] text-[#8E92A4] hover:text-white border border-white/10'
                }`}
                style={gameCode === game.code ? {
                  backgroundColor: game.color,
                  boxShadow: `0 4px 15px ${game.shadowColor}`,
                } : {}}
              >
                {GAME_ICON_MAP_SM[game.iconName]}
                {game.shortName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-xs text-[#8E92A4]">Calculando posiciones del ranking...</p>
        </div>
      ) : (
        <>
          {/* 2. TOP 3 PODIUM OF HONOR */}
          {topPodium.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-6">
              
              {/* 2ND PLACE (SILVER) */}
              <div className="order-2 md:order-1 arena-card p-6 bg-[#15161E] border border-slate-400/30 text-center space-y-4 relative group hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-full bg-slate-300/20 text-slate-200 flex items-center justify-center mx-auto border border-slate-300/30 font-black text-lg">
                  2°
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">{topPodium[1].player_name}</h3>
                  <p className="text-xs text-[#A8DADC] font-semibold">{topPodium[1].in_game_name}</p>
                  <p className="text-[11px] text-[#8E92A4] font-mono">{topPodium[1].player_tag}</p>
                </div>
                <div className="p-3 bg-[#0B0C10] rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#8E92A4] block">COPAS OFICIALES</span>
                  <span className="text-xl font-black text-slate-200 flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4 text-slate-300" />
                    {topPodium[1].trophies.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#8E92A4] pt-1">
                  <span>{topPodium[1].career}</span>
                  <span className="text-emerald-400 font-bold">{topPodium[1].winrate}% Winrate</span>
                </div>
              </div>

              {/* 1ST PLACE (GOLD - CENTER HIGHLIGHT) */}
              <div className="order-1 md:order-2 arena-card p-8 bg-gradient-to-b from-[#1D3557]/60 via-[#15161E] to-[#15161E] border-2 border-amber-400/50 text-center space-y-5 relative group hover:scale-[1.03] transition-transform shadow-2xl shadow-amber-500/10">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Crown className="w-4 h-4 fill-black" />
                  Top 1 Tecsup
                </div>

                <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-400 font-black text-2xl shadow-xl shadow-amber-500/30 mt-2">
                  1°
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">{topPodium[0].player_name}</h3>
                  <p className="text-sm text-amber-400 font-bold">{topPodium[0].in_game_name}</p>
                  <p className="text-xs text-[#8E92A4] font-mono">{topPodium[0].player_tag}</p>
                </div>

                <div className="p-4 bg-[#0B0C10] rounded-xl border border-amber-500/20 space-y-1">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">COPAS MÁXIMAS</span>
                  <span className="text-3xl font-black text-amber-400 flex items-center justify-center gap-1.5">
                    <Trophy className="w-6 h-6 text-amber-400 fill-amber-400" />
                    {topPodium[0].trophies.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8E92A4] pt-1">
                  <span>{topPodium[0].career}</span>
                  <span className="text-emerald-400 font-black">{topPodium[0].winrate}% Winrate</span>
                </div>
              </div>

              {/* 3RD PLACE (BRONZE) */}
              <div className="order-3 arena-card p-6 bg-[#15161E] border border-amber-700/30 text-center space-y-4 relative group hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-full bg-amber-700/20 text-amber-600 flex items-center justify-center mx-auto border border-amber-700/30 font-black text-lg">
                  3°
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">{topPodium[2].player_name}</h3>
                  <p className="text-xs text-[#A8DADC] font-semibold">{topPodium[2].in_game_name}</p>
                  <p className="text-[11px] text-[#8E92A4] font-mono">{topPodium[2].player_tag}</p>
                </div>
                <div className="p-3 bg-[#0B0C10] rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#8E92A4] block">COPAS OFICIALES</span>
                  <span className="text-xl font-black text-amber-600 flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    {topPodium[2].trophies.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#8E92A4] pt-1">
                  <span>{topPodium[2].career}</span>
                  <span className="text-emerald-400 font-bold">{topPodium[2].winrate}% Winrate</span>
                </div>
              </div>

            </div>
          )}

          {/* 3. LEADERBOARD TABLE & SEARCH */}
          <div className="arena-card p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">Tabla General de Competidores</h2>
                <p className="text-xs text-[#8E92A4]">Clasificación completa de estudiantes de Tecsup</p>
              </div>

              {/* Search filter */}
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A5E73]">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por jugador o carrera..."
                  className="input-arena pl-9 text-xs py-2"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#8E92A4]">
                    <th className="py-3 px-3"># Rank</th>
                    <th className="py-3 px-3">Competidor</th>
                    <th className="py-3 px-3">Carrera / Ciclo</th>
                    <th className="py-3 px-3 text-right">Copas Oficiales</th>
                    <th className="py-3 px-3 text-right">Torneos Ganados</th>
                    <th className="py-3 px-3 text-right">Winrate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeaderboard.map((player) => (
                    <tr 
                      key={player.id} 
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-white">
                        {player.rank === 1 ? '🥇 1' : player.rank === 2 ? '🥈 2' : player.rank === 3 ? '🥉 3' : `#${player.rank}`}
                      </td>
                      
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white group-hover:text-[#E63946] transition-colors">
                            {player.in_game_name}
                          </p>
                          <p className="text-[11px] text-[#8E92A4]">
                            {player.player_name} • <span className="font-mono text-[#A8DADC]">{player.player_tag}</span>
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-[#8E92A4]">
                        <p className="truncate max-w-[200px] text-white">{player.career}</p>
                        <p className="text-[11px] text-[#5A5E73]">{player.cycle}° Ciclo</p>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-black text-amber-400 text-sm">
                        {player.trophies.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-white">
                        {player.tournaments_won > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-400">
                            <Trophy className="w-3 h-3" />
                            {player.tournaments_won}
                          </span>
                        ) : (
                          <span className="text-[#5A5E73]">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {player.winrate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
