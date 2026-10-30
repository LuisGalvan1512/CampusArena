'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { sounds } from '@/lib/sound';
import { Trophy, Crown, Search } from 'lucide-react';
import { GAME_LIST, type GameCode, GAME_CATALOG } from '@/lib/games';
import { capitalizeWords } from '../profile/page';
import { RankingRowSkeleton } from '@/components/Skeleton';
import { CompetitorName } from '@/components/CompetitorName';
import { LivingBanner } from '@/components/LivingBanner';
import { AegisTrophyIcon, GameDisciplineEmblem } from '@/components/EsportsIcons';

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

export default function RankingPage() {
  const [gameCode, setGameCode] = useState<GameCode | 'ALL'>('ALL');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const cached = api.getCached<{
      leaderboard: LeaderboardEntry[];
      top_podium: LeaderboardEntry[];
    }>('/ranking');
    return cached?.data?.leaderboard || [];
  });
  const [topPodium, setTopPodium] = useState<LeaderboardEntry[]>(() => {
    const cached = api.getCached<{
      leaderboard: LeaderboardEntry[];
      top_podium: LeaderboardEntry[];
    }>('/ranking');
    return cached?.data?.top_podium || [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(() => !api.hasCache('/ranking'));

  const fetchRanking = async (showSkeleton = false) => {
    if (showSkeleton) {
      setIsLoading(true);
    }
    const queryParam = gameCode === 'ALL' ? '' : `?game_code=${gameCode}`;
    const res = await api.get(`/ranking${queryParam}`);
    if (res.success && res.data) {
      setLeaderboard(res.data.leaderboard || []);
      setTopPodium(res.data.top_podium || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const queryParam = gameCode === 'ALL' ? '' : `?game_code=${gameCode}`;
    const cached = api.getCached(`/ranking${queryParam}`);
    fetchRanking(!cached && gameCode !== 'ALL');
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="widescreen-container py-6 sm:py-10 space-y-8">
      {/* 1. LIVING CHAMPIONSHIP BANNER */}
      <LivingBanner
        imageSrc={currentGame?.bannerUrl || '/assets/arena_trophy_pedestal.jpg'}
        alt={currentGame?.name || 'Trofeo Campus Arena'}
        telemetryTag="02 // MEDALLERO Y CUADRO DE HONOR TECSUP"
        minHeightClass="min-h-[320px] sm:min-h-[360px]"
      >
        <div className="p-6 sm:p-10 lg:p-14 space-y-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#070709]/85 text-[10px] font-mono-data font-bold uppercase tracking-[0.22em] text-[#C5A059] border border-[#C5A059]/40">
              <AegisTrophyIcon className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>CLASIFICACIÓN HISTÓRICA DE CAMPEONES</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-[0.94]">
              Medallero Oficial.
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Cuadro de honor universitario auditado por podios obtenidos en torneos oficiales de
              Tecsup: <strong className="text-[#C5A059]">01° Oro</strong>,{' '}
              <strong className="text-slate-300">02° Plata</strong> y{' '}
              <strong className="text-amber-600">03° Bronce</strong>.
            </p>
          </div>

          {/* Sharp Hardware Discipline Filter Deck */}
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              data-no-sound
              onClick={() => {
                sounds.playWoodClick();
                setGameCode('ALL');
              }}
              className={`relative px-4 py-2.5 rounded-sm text-xs font-mono-data uppercase tracking-wider font-bold transition-colors flex items-center gap-2 cursor-pointer z-10 ${
                gameCode === 'ALL'
                  ? 'text-white'
                  : 'bg-[#070709]/90 text-[var(--text-secondary)] hover:text-white border border-white/15'
              }`}
            >
              {gameCode === 'ALL' && (
                <motion.span
                  layoutId="ranking-filter-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-sm bg-[#D9232E] -z-10"
                />
              )}
              <AegisTrophyIcon className="w-3.5 h-3.5" />
              <span>General (7 Disciplinas)</span>
            </button>

            {GAME_LIST.map((game) => {
              const active = gameCode === game.code;
              return (
                <button
                  key={game.code}
                  type="button"
                  data-no-sound
                  onClick={() => {
                    sounds.playWoodClick();
                    setGameCode(game.code);
                  }}
                  className={`relative px-3.5 py-2.5 rounded-sm text-xs font-mono-data uppercase tracking-wider font-bold transition-colors flex items-center gap-2 cursor-pointer z-10 ${
                    active
                      ? 'text-white'
                      : 'bg-[#070709]/90 text-[var(--text-secondary)] hover:text-white border border-white/15'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="ranking-filter-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-sm bg-[#D9232E] -z-10"
                    />
                  )}
                  <GameDisciplineEmblem
                    code={game.code}
                    className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-[#C5A059]'}`}
                  />
                  <span>{game.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </LivingBanner>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="h-64 skeleton-shimmer rounded-sm" />
            <div className="h-76 skeleton-shimmer rounded-sm" />
            <div className="h-64 skeleton-shimmer rounded-sm" />
          </div>
          <div className="space-y-2 pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <RankingRowSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {topPodium.length > 0 && topPodium[0].total_medals === 0 && (
            <div className="p-4 rounded-sm bg-[#C5A059]/10 border border-[#C5A059]/30 text-center space-y-1">
              <p className="text-xs sm:text-sm font-mono-data uppercase tracking-widest font-bold text-[#C5A059] flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4" />
                Temporada Oficial Campus Arena en Curso
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Los trofeos de 1°, 2° y 3° puesto se otorgan automáticamente al definirse las
                finales de los torneos activos.
              </p>
            </div>
          )}

          {/* 2. TOP 3 ARCHITECTURAL MONOLITH PODIUM */}
          {topPodium.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-2">
              {/* 2ND PLACE (SILVER) */}
              <div className="order-2 md:order-1 double-bezel">
                <div className="double-bezel-inner p-6 sm:p-7 space-y-5 relative overflow-hidden">
                  <div className="flex items-start justify-between border-b border-[var(--border-card)] pb-4">
                    <div>
                      <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-slate-300 font-bold block">
                        SUBCAMPEÓN // PLATA
                      </span>
                      <Link
                        href={`/profile/${topPodium[1].user_id || topPodium[1].id}`}
                        className="font-display text-xl font-black text-[var(--text-primary)] hover:text-[#D9232E] transition-colors block mt-1 uppercase"
                      >
                        <CompetitorName
                          userId={topPodium[1].user_id || topPodium[1].id}
                          name={
                            topPodium[1].nickname || capitalizeWords(topPodium[1].player_name)
                          }
                        />
                      </Link>
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                        {capitalizeWords(topPodium[1].player_name)}
                      </p>
                    </div>
                    <span className="monolith-numeral text-5xl select-none">#02</span>
                  </div>

                  <div className="p-3.5 bg-[#070709] rounded-sm border border-[var(--border-card)] grid grid-cols-3 gap-2 text-center font-mono-data">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block">
                        ORO
                      </span>
                      <span className="text-lg font-black text-[#C5A059] tabular-nums">
                        {topPodium[1].gold_medals}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold block">
                        PLATA
                      </span>
                      <span className="text-lg font-black text-slate-300 tabular-nums">
                        {topPodium[1].silver_medals}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-amber-600 font-bold block">
                        BRONCE
                      </span>
                      <span className="text-lg font-black text-amber-600 tabular-nums">
                        {topPodium[1].bronze_medals}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1">
                    <span className="truncate max-w-[170px]">{topPodium[1].career}</span>
                    <span className="font-mono-data text-slate-300 font-bold uppercase">
                      {topPodium[1].total_medals} Podios
                    </span>
                  </div>
                </div>
              </div>

              {/* 1ST PLACE (CHAMPIONSHIP BRASS MONOLITH) */}
              <div className="order-1 md:order-2 double-bezel ring-1 ring-[#C5A059]/60">
                <div className="double-bezel-inner p-7 sm:p-8 bg-gradient-to-b from-[#C5A059]/12 via-[#0D0D10] to-[#0D0D10] space-y-5 relative overflow-hidden">
                  <div className="flex items-start justify-between border-b border-[#C5A059]/30 pb-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#C5A059] text-black font-mono-data text-[9px] font-extrabold uppercase tracking-[0.2em]">
                        <Crown className="w-3 h-3 fill-black" />
                        LÍDER GENERAL TECSUP
                      </div>
                      <Link
                        href={`/profile/${topPodium[0].user_id || topPodium[0].id}`}
                        className="font-display text-2xl sm:text-3xl font-black text-white hover:text-[#C5A059] transition-colors block pt-1 uppercase tracking-tight"
                      >
                        <CompetitorName
                          userId={topPodium[0].user_id || topPodium[0].id}
                          name={
                            topPodium[0].nickname || capitalizeWords(topPodium[0].player_name)
                          }
                        />
                      </Link>
                      <p className="text-xs text-[#C5A059] font-semibold">
                        {capitalizeWords(topPodium[0].player_name)}
                      </p>
                    </div>
                    <span className="font-display text-6xl font-black text-[#C5A059]/25 select-none leading-none">
                      #01
                    </span>
                  </div>

                  <div className="p-4 bg-[#070709] rounded-sm border border-[#C5A059]/35 grid grid-cols-3 gap-2 text-center font-mono-data">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block">
                        ORO
                      </span>
                      <span className="text-xl font-black text-[#C5A059] tabular-nums">
                        {topPodium[0].gold_medals}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold block">
                        PLATA
                      </span>
                      <span className="text-xl font-black text-slate-300 tabular-nums">
                        {topPodium[0].silver_medals}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-amber-600 font-bold block">
                        BRONCE
                      </span>
                      <span className="text-xl font-black text-amber-600 tabular-nums">
                        {topPodium[0].bronze_medals}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1">
                    <span className="truncate max-w-[180px]">{topPodium[0].career}</span>
                    <span className="font-mono-data text-[#C5A059] font-bold uppercase">
                      {topPodium[0].total_medals} Podios Oficiales
                    </span>
                  </div>
                </div>
              </div>

              {/* 3RD PLACE (BRONZE) */}
              <div className="order-3 double-bezel">
                <div className="double-bezel-inner p-6 sm:p-7 space-y-5 relative overflow-hidden">
                  <div className="flex items-start justify-between border-b border-[var(--border-card)] pb-4">
                    <div>
                      <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-amber-600 font-bold block">
                        TERCER PUESTO // BRONCE
                      </span>
                      <Link
                        href={`/profile/${topPodium[2].user_id || topPodium[2].id}`}
                        className="font-display text-xl font-black text-[var(--text-primary)] hover:text-[#D9232E] transition-colors block mt-1 uppercase"
                      >
                        <CompetitorName
                          userId={topPodium[2].user_id || topPodium[2].id}
                          name={
                            topPodium[2].nickname || capitalizeWords(topPodium[2].player_name)
                          }
                        />
                      </Link>
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                        {capitalizeWords(topPodium[2].player_name)}
                      </p>
                    </div>
                    <span className="monolith-numeral text-5xl select-none">#03</span>
                  </div>

                  <div className="p-3.5 bg-[#070709] rounded-sm border border-[var(--border-card)] grid grid-cols-3 gap-2 text-center font-mono-data">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block">
                        ORO
                      </span>
                      <span className="text-lg font-black text-[#C5A059] tabular-nums">
                        {topPodium[2].gold_medals}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold block">
                        PLATA
                      </span>
                      <span className="text-lg font-black text-slate-300 tabular-nums">
                        {topPodium[2].silver_medals}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-amber-600 font-bold block">
                        BRONCE
                      </span>
                      <span className="text-lg font-black text-amber-600 tabular-nums">
                        {topPodium[2].bronze_medals}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1">
                    <span className="truncate max-w-[170px]">{topPodium[2].career}</span>
                    <span className="font-mono-data text-amber-600 font-bold uppercase">
                      {topPodium[2].total_medals} Podios
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. LEADERBOARD TABLE & SEARCH */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-5">
                <div>
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#D9232E] font-bold block">
                    REGISTRO OFICIAL AUDITADO
                  </span>
                  <h2 className="font-display text-2xl font-extrabold text-[var(--text-primary)] uppercase tracking-tight">
                    Tabla General de Competidores
                  </h2>
                </div>

                <div className="relative w-full sm:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por estudiante, nickname o carrera..."
                    className="input-arena pl-9 text-xs py-2.5 w-full"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="sm:hidden text-center pb-2">
                  <span className="text-[10px] font-mono-data text-[var(--text-muted)]">
                    ← Desliza horizontalmente para ver el medallero →
                  </span>
                </div>
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-left text-xs min-w-[740px]">
                    <thead>
                      <tr className="border-b border-[var(--border-card)] bg-[#070709] font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        <th className="py-3.5 px-4"># Rank</th>
                        <th className="py-3.5 px-4">Competidor</th>
                        <th className="py-3.5 px-4">Carrera Profesional / Ciclo</th>
                        <th className="py-3.5 px-4 text-center text-[#C5A059]">01° ORO</th>
                        <th className="py-3.5 px-4 text-center text-slate-300">02° PLATA</th>
                        <th className="py-3.5 px-4 text-center text-amber-600">03° BRONCE</th>
                        <th className="py-3.5 px-4 text-center">Total Podios</th>
                        <th className="py-3.5 px-4 text-right">Torneos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-card)]">
                      {filteredLeaderboard.map((player) => (
                        <tr
                          key={player.id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="py-4 px-4 font-mono-data font-bold text-[var(--text-primary)] tabular-nums">
                            {player.rank === 1 ? (
                              <span className="px-2 py-0.5 rounded-sm bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40">
                                #01
                              </span>
                            ) : player.rank === 2 ? (
                              <span className="px-2 py-0.5 rounded-sm bg-slate-300/15 text-slate-200 border border-slate-300/30">
                                #02
                              </span>
                            ) : player.rank === 3 ? (
                              <span className="px-2 py-0.5 rounded-sm bg-amber-700/20 text-amber-500 border border-amber-700/40">
                                #03
                              </span>
                            ) : (
                              `#${String(player.rank).padStart(2, '0')}`
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {player.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={player.avatar_url}
                                  alt=""
                                  className="w-9 h-9 rounded-sm object-cover border border-[var(--border-card)] shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-sm bg-[#070709] text-[var(--text-primary)] font-mono-data font-bold text-xs flex items-center justify-center border border-[var(--border-card)] shrink-0">
                                  {(player.nickname || player.player_name)[0]?.toUpperCase()}
                                </div>
                              )}
                              <div className="space-y-0.5">
                                <Link
                                  href={`/profile/${player.user_id || player.id}`}
                                  className="font-display font-bold text-[var(--text-primary)] hover:text-[#D9232E] transition-colors block text-sm uppercase"
                                >
                                  <CompetitorName
                                    userId={player.user_id || player.id}
                                    name={
                                      player.nickname || capitalizeWords(player.player_name)
                                    }
                                  />
                                </Link>
                                <p className="text-[11px] text-[var(--text-secondary)]">
                                  <span className="font-medium">
                                    {capitalizeWords(player.player_name)}
                                  </span>
                                  {player.campus && (
                                    <span className="ml-1.5 font-mono-data text-[10px] text-[var(--text-muted)] uppercase">
                                      • {player.campus}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-[var(--text-secondary)]">
                            <p className="truncate max-w-[220px] text-[var(--text-primary)] font-medium">
                              {player.career}
                            </p>
                            <p className="font-mono-data text-[10px] text-[var(--text-muted)] uppercase">
                              {player.cycle}° Ciclo
                            </p>
                          </td>

                          <td className="py-4 px-4 text-center font-mono-data font-black text-[#C5A059] tabular-nums">
                            {player.gold_medals > 0 ? (
                              player.gold_medals
                            ) : (
                              <span className="text-[var(--text-muted)] font-normal">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center font-mono-data font-bold text-slate-300 tabular-nums">
                            {player.silver_medals > 0 ? (
                              player.silver_medals
                            ) : (
                              <span className="text-[var(--text-muted)] font-normal">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center font-mono-data font-bold text-amber-600 tabular-nums">
                            {player.bronze_medals > 0 ? (
                              player.bronze_medals
                            ) : (
                              <span className="text-[var(--text-muted)] font-normal">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center font-mono-data font-bold tabular-nums">
                            {player.total_medals > 0 ? (
                              <span className="px-2.5 py-0.5 rounded-sm bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/35 font-bold">
                                {player.total_medals}
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)] font-normal">0</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right font-mono-data text-[var(--text-secondary)] tabular-nums">
                            {player.tournaments_played}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
