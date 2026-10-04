'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  Trophy, 
  Swords, 
  Gamepad2, 
  Crown, 
  Search, 
  Zap,
  Crosshair,
  CircleDot,
  Award,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { GAME_LIST, type GameCode, GAME_CATALOG } from '@/lib/games';
import { capitalizeWords } from '../profile/page';
import { RankingRowSkeleton } from '@/components/Skeleton';
import { ScrollParallaxImage } from '@/components/ScrollParallaxImage';
import { CompetitorName } from '@/components/CompetitorName';

interface LeaderboardEntry {
  id: string;
  user_id?: string;
  rank: number;
  nickname?: string;
  player_name: string;
  campus?: string;
  career: string;
  cycle: number;
  avatar_url?: string | null;
  gold_medals: number;
  silver_medals: number;
  bronze_medals: number;
  total_medals: number;
  tournaments_played: number;
  points: number;
}

const GAME_ICON_MAP_SM: Record<string, React.ReactNode> = {
  Swords: <Swords className="w-4 h-4" />,
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Crosshair: <Crosshair className="w-4 h-4" />,
  CircleDot: <CircleDot className="w-4 h-4" />,
};

export default function RankingPage() {
  const [gameCode, setGameCode] = useState<GameCode | 'ALL'>('ALL');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [topPodium, setTopPodium] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRanking = async () => {
    setIsLoading(true);
    const queryParam = gameCode === 'ALL' ? '' : `?game_code=${gameCode}`;
    const res = await api.get(`/ranking${queryParam}`);
    if (res.success && res.data) {
      setLeaderboard(res.data.leaderboard || []);
      setTopPodium(res.data.top_podium || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRanking();
  }, [gameCode]);

  const currentGame = gameCode !== 'ALL' ? GAME_CATALOG[gameCode] : null;

  const filteredLeaderboard = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return leaderboard;
    return leaderboard.filter(
      (p) =>
        p.player_name.toLowerCase().includes(q) ||
        (p.nickname && p.nickname.toLowerCase().includes(q)) ||
        p.career.toLowerCase().includes(q)
    );
  }, [leaderboard, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. HEADER HERO */}
      <div className="relative arena-card p-8 sm:p-12 overflow-hidden bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-xl">
        {/* Sapphire Atmospheric Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#1D3557]/30 blur-3xl pointer-events-none" />

        {currentGame?.bannerUrl && (
          <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
            <ScrollParallaxImage 
              src={currentGame.bannerUrl} 
              alt={currentGame.name}
              scaleRange={[1.0, 1.12]}
              yRange={[-20, 20]}
              containerClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-card)]/80 to-transparent" />
          </div>
        )}
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--bg-arena)] text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8] border border-[var(--border-card)]">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Medallero y Cuadro de Honor Oficial</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              Ranking de Campeones.
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Clasificación de estudiantes de Tecsup medida exclusivamente por trofeos de torneos oficiales: 🥇 1° Lugar (Campeón), 🥈 2° Lugar (Subcampeón) y 🥉 3° Lugar.
            </p>
          </div>

          {/* Game Selector Tabs */}
          <div className="pt-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setGameCode('ALL')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                gameCode === 'ALL'
                  ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/30 scale-105'
                  : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-card)]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>General (Todas)</span>
            </button>

            {GAME_LIST.map((game) => (
              <button
                key={game.code}
                onClick={() => setGameCode(game.code)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  gameCode === game.code
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-card)]'
                }`}
                style={gameCode === game.code ? {
                  backgroundColor: game.color,
                  boxShadow: `0 4px 15px ${game.shadowColor}`,
                } : {}}
              >
                {game.logoUrl ? (
                  <img src={game.logoUrl} alt={game.name} className="w-4 h-4 object-contain shrink-0 filter drop-shadow" />
                ) : (
                  GAME_ICON_MAP_SM[game.iconName]
                )}
                <span>{game.shortName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="h-64 skeleton-shimmer rounded-2xl" />
            <div className="h-76 skeleton-shimmer rounded-2xl" />
            <div className="h-64 skeleton-shimmer rounded-2xl" />
          </div>
          <div className="space-y-2 pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <RankingRowSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Season Notice */}
          {topPodium.length > 0 && topPodium[0].total_medals === 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
              <p className="text-xs sm:text-sm font-bold text-amber-400 flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4" />
                Temporada Inaugural Campus Arena en Curso
              </p>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                Los trofeos de 1°, 2° y 3° puesto se otorgarán oficialmente al definirse las finales presenciales de los torneos activos de Tecsup.
              </p>
            </div>
          )}

          {/* 2. TOP 3 PODIUM OF HONOR */}
          {topPodium.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              
              {/* 2ND PLACE (SILVER) */}
              <div className="order-2 md:order-1 arena-card p-6 bg-[var(--bg-card)] border border-slate-400/30 text-center space-y-4 relative group hover:scale-[1.01] transition-transform shadow-md rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-slate-300/20 text-slate-200 flex items-center justify-center mx-auto border border-slate-300/30 font-black text-xl">
                  🥈
                </div>
                <div className="space-y-1">
                  <Link
                    href={`/profile/${topPodium[1].user_id || topPodium[1].id}`}
                    className="text-lg font-black text-[var(--text-primary)] hover:text-[#E63946] transition-colors block"
                    title="Ver perfil y medallero"
                  >
                    <CompetitorName 
                      userId={topPodium[1].user_id || topPodium[1].id} 
                      name={topPodium[1].nickname || capitalizeWords(topPodium[1].player_name)} 
                    />
                  </Link>
                  <p className="text-xs text-[#A8DADC] font-semibold">{capitalizeWords(topPodium[1].player_name)}</p>
                </div>

                <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold block">🥇 Oro</span>
                    <span className="text-base font-black text-amber-400">{topPodium[1].gold_medals}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 font-bold block">🥈 Plata</span>
                    <span className="text-base font-black text-slate-300">{topPodium[1].silver_medals}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 font-bold block">🥉 Bronce</span>
                    <span className="text-base font-black text-amber-600">{topPodium[1].bronze_medals}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1">
                  <span className="truncate max-w-[150px]">{topPodium[1].career}</span>
                  <span className="text-slate-300 font-bold">{topPodium[1].total_medals} Podios</span>
                </div>
              </div>

              {/* 1ST PLACE (GOLD - CENTER HIGHLIGHT) */}
              <div className="order-1 md:order-2 arena-card p-6 sm:p-8 bg-gradient-to-b from-[#1D3557]/20 via-[var(--bg-card)] to-[var(--bg-card)] border-2 border-amber-400/60 text-center space-y-4 relative group hover:scale-[1.02] transition-transform shadow-2xl shadow-amber-500/10 rounded-2xl">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-amber-500 text-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Crown className="w-3.5 h-3.5 fill-black" />
                  1° Puesto Tecsup
                </div>

                <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-400 font-black text-2xl shadow-xl shadow-amber-500/30 mt-2">
                  🥇
                </div>

                <div className="space-y-1">
                  <Link
                    href={`/profile/${topPodium[0].user_id || topPodium[0].id}`}
                    className="text-xl sm:text-2xl font-black text-[var(--text-primary)] hover:text-amber-400 transition-colors block tracking-tight"
                    title="Ver perfil y medallero"
                  >
                    <CompetitorName 
                      userId={topPodium[0].user_id || topPodium[0].id} 
                      name={topPodium[0].nickname || capitalizeWords(topPodium[0].player_name)} 
                    />
                  </Link>
                  <p className="text-xs text-[#A8DADC] font-semibold">{capitalizeWords(topPodium[0].player_name)}</p>
                </div>

                <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-amber-500/20 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold block">🥇 Oro</span>
                    <span className="text-lg font-black text-amber-400">{topPodium[0].gold_medals}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 font-bold block">🥈 Plata</span>
                    <span className="text-lg font-black text-slate-300">{topPodium[0].silver_medals}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 font-bold block">🥉 Bronce</span>
                    <span className="text-lg font-black text-amber-600">{topPodium[0].bronze_medals}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1">
                  <span className="truncate max-w-[170px]">{topPodium[0].career}</span>
                  <span className="text-amber-400 font-bold">{topPodium[0].total_medals} Podios</span>
                </div>
              </div>

              {/* 3RD PLACE (BRONZE) */}
              <div className="order-3 arena-card p-6 bg-[var(--bg-card)] border border-amber-700/30 text-center space-y-4 relative group hover:scale-[1.01] transition-transform shadow-md rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-amber-700/20 text-amber-600 flex items-center justify-center mx-auto border border-amber-700/30 font-black text-xl">
                  🥉
                </div>
                <div className="space-y-1">
                  <Link
                    href={`/profile/${topPodium[2].user_id || topPodium[2].id}`}
                    className="text-lg font-black text-[var(--text-primary)] hover:text-[#E63946] transition-colors block"
                    title="Ver perfil y medallero"
                  >
                    <CompetitorName 
                      userId={topPodium[2].user_id || topPodium[2].id} 
                      name={topPodium[2].nickname || capitalizeWords(topPodium[2].player_name)} 
                    />
                  </Link>
                  <p className="text-xs text-[#A8DADC] font-semibold">{capitalizeWords(topPodium[2].player_name)}</p>
                </div>

                <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold block">🥇 Oro</span>
                    <span className="text-base font-black text-amber-400">{topPodium[2].gold_medals}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 font-bold block">🥈 Plata</span>
                    <span className="text-base font-black text-slate-300">{topPodium[2].silver_medals}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 font-bold block">🥉 Bronce</span>
                    <span className="text-base font-black text-amber-600">{topPodium[2].bronze_medals}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1">
                  <span className="truncate max-w-[150px]">{topPodium[2].career}</span>
                  <span className="text-amber-600 font-bold">{topPodium[2].total_medals} Podios</span>
                </div>
              </div>

            </div>
          )}

          {/* 3. LEADERBOARD TABLE & SEARCH */}
          <div className="arena-card p-6 sm:p-8 space-y-6 border border-[var(--border-card)] rounded-3xl">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)]">Tabla General de Competidores</h2>
                <p className="text-xs text-[var(--text-secondary)]">Clasificación oficial por trofeos de torneos Tecsup</p>
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
                  placeholder="Buscar por estudiante o carrera..."
                  className="input-arena pl-9 text-xs py-2 w-full"
                />
              </div>
            </div>

            {/* Table */}
            <div className="relative">
              {/* Mobile scroll hint */}
              <div className="sm:hidden text-center pb-2">
                <span className="text-[10px] text-[var(--text-muted)] font-medium">← Desliza horizontalmente para ver el medallero →</span>
              </div>
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--border-card)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      <th className="py-3 px-3"># Rank</th>
                      <th className="py-3 px-3">Competidor</th>
                      <th className="py-3 px-3">Carrera / Ciclo</th>
                      <th className="py-3 px-3 text-center">🥇 1° Lugar</th>
                      <th className="py-3 px-3 text-center">🥈 2° Lugar</th>
                      <th className="py-3 px-3 text-center">🥉 3° Lugar</th>
                      <th className="py-3 px-3 text-center">Total Podios</th>
                      <th className="py-3 px-3 text-right">Torneos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-card)]">
                    {filteredLeaderboard.map((player) => (
                      <tr 
                        key={player.id} 
                        className="hover:bg-[var(--bg-card-hover)] transition-colors group"
                      >
                        <td className="py-3.5 px-3 font-mono font-bold text-[var(--text-primary)]">
                          {player.rank === 1 ? '🥇 1' : player.rank === 2 ? '🥈 2' : player.rank === 3 ? '🥉 3' : `#${player.rank}`}
                        </td>
                        
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            {player.avatar_url ? (
                              <img src={player.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-[var(--border-card)] shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center border border-[var(--border-card)] shrink-0">
                                {(player.nickname || player.player_name)[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <Link
                                href={`/profile/${player.user_id || player.id}`}
                                className="font-black text-[var(--text-primary)] hover:text-[#E63946] transition-colors block text-sm"
                                title="Ver perfil y medallero"
                              >
                                <CompetitorName 
                                  userId={player.user_id || player.id} 
                                  name={player.nickname || capitalizeWords(player.player_name)} 
                                />
                              </Link>
                              <p className="text-[11px] text-[var(--text-muted)]">
                                <span className="text-[#A8DADC] font-semibold">{capitalizeWords(player.player_name)}</span>
                                {player.campus && <span className="ml-1 text-[10px] text-[#5A5E73]">({player.campus})</span>}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-[var(--text-secondary)]">
                          <p className="truncate max-w-[200px] text-[var(--text-primary)] font-medium">{player.career}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{player.cycle}° Ciclo</p>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-black text-amber-400">
                          {player.gold_medals > 0 ? player.gold_medals : <span className="text-[var(--text-muted)] font-normal">-</span>}
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-300">
                          {player.silver_medals > 0 ? player.silver_medals : <span className="text-[var(--text-muted)] font-normal">-</span>}
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-600">
                          {player.bronze_medals > 0 ? player.bronze_medals : <span className="text-[var(--text-muted)] font-normal">-</span>}
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-bold">
                          {player.total_medals > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                              {player.total_medals}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)] font-normal">0</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-[var(--text-secondary)]">
                          {player.tournaments_played}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
