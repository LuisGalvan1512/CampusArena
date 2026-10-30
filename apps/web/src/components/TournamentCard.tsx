'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import { type GameCode, GAME_CATALOG } from '@/lib/games';
import { getEffectiveStatus, useNowTick } from '@/lib/registrationWindow';
import { SpotlightCard } from '@/components/SpotlightCard';
import { ScrollParallaxImage } from '@/components/ScrollParallaxImage';
import { GameDisciplineEmblem, LiveWaveformIcon, AegisTrophyIcon } from '@/components/EsportsIcons';

export interface TournamentItem {
  id: string;
  name: string;
  slug: string;
  game_code: string;
  organization_name: string;
  campus_name: string;
  description_short: string;
  banner_url: string;
  status:
    | 'DRAFT'
    | 'PUBLISHED'
    | 'REGISTRATION_OPEN'
    | 'REGISTRATION_CLOSED'
    | 'IN_PROGRESS'
    | 'FINISHED'
    | 'CANCELLED';
  max_slots: number;
  min_slots: number;
  current_participants: number;
  cost: number | string;
  currency: string;
  prize_pool: string;
  format: string;
  tournament_start_at: string;
  registration_open_at?: string;
  registration_close_at: string;
}

export function TournamentCard({ tournament }: { tournament: TournamentItem }) {
  const game = GAME_CATALOG[tournament.game_code as GameCode];
  const gameName = game?.name || tournament.game_code;

  const slotsPercentage = Math.min(
    100,
    Math.round((tournament.current_participants / Math.max(1, tournament.max_slots)) * 100)
  );

  const nowMs = useNowTick([tournament.registration_open_at, tournament.registration_close_at]);
  const effectiveStatus = getEffectiveStatus(tournament, nowMs);

  const getStatusBadge = (status: TournamentItem['status']) => {
    switch (status) {
      case 'REGISTRATION_OPEN':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.16em] bg-[#09090B]/90 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
            INSCRIPCIONES
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.16em] bg-[#D9232E] text-white border border-white/20 flex items-center gap-1.5">
            <LiveWaveformIcon className="w-3.5 h-3 text-white" />
            EN JUEGO
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.16em] bg-[#09090B]/90 text-[#C5A059] border border-[#C5A059]/40">
            PRÓXIMAMENTE
          </span>
        );
      case 'REGISTRATION_CLOSED':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.16em] bg-[#09090B]/90 text-amber-400 border border-amber-500/40">
            CERRADO
          </span>
        );
      case 'FINISHED':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.16em] bg-[#09090B]/90 text-[#A3A19A] border border-[#F4F2ED]/15">
            FINALIZADO
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.16em] bg-[#09090B]/90 text-[#A3A19A]">
            {status}
          </span>
        );
    }
  };

  const startDate = new Date(tournament.tournament_start_at).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isFree = !tournament.cost || Number(tournament.cost) === 0;

  return (
    <div className="double-bezel group h-full transition-transform duration-300 hover:-translate-y-1">
      <SpotlightCard
        spotlightColor="rgba(217, 35, 46, 0.14)"
        className="double-bezel-inner overflow-hidden flex flex-col h-full transition-all duration-300 group-hover:border-[#F4F2ED]/25 relative"
      >
        {/* Top Architectural Crimson Reveal Bar */}
        <div className="h-[2px] w-full bg-[#18181C] group-hover:bg-[#D9232E] transition-colors duration-300" />

        {/* 1. Key Art Frame with Scroll-Linked Parallax & Sober Contrast */}
        <div className="relative h-56 w-full overflow-hidden bg-[#070709]">
          <ScrollParallaxImage
            src={tournament.banner_url || game?.bannerUrl || '/games/clash_royale_banner.jpg'}
            alt={tournament.name}
            fallbackSrc={game?.bannerUrl || '/games/clash_royale_banner.jpg'}
            scaleRange={[1.03, 1.14]}
            yRange={[-12, 12]}
            containerClassName="w-full h-full"
            className="opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700 saturate-[0.88] contrast-[1.06]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-[#0D0D10]/35 to-black/45 pointer-events-none" />

          {/* Top Tactical Game Emblem & Status Bar */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 gap-2">
            <div className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.16em] flex items-center gap-2 bg-[#09090B]/90 text-[#F4F2ED] border border-[#F4F2ED]/15">
              <GameDisciplineEmblem gameCode={tournament.game_code} className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[140px]">{gameName}</span>
            </div>

            {getStatusBadge(effectiveStatus)}
          </div>

          {/* Bottom Prize & Entry Cost Telemetry */}
          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs z-10 gap-2">
            <div className="flex items-center gap-2 font-mono font-bold text-[#C5A059] bg-[#09090B]/92 px-3 py-1.5 rounded-sm border border-[#C5A059]/35">
              <AegisTrophyIcon className="w-3.5 h-3.5 shrink-0 text-[#C5A059]" animated={false} />
              <span className="truncate max-w-[180px] text-[11px] uppercase tracking-wider">
                {tournament.prize_pool}
              </span>
            </div>

            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 py-1.5 rounded-sm bg-[#09090B]/92 text-[#F4F2ED] border border-[#F4F2ED]/15 tabular-nums">
              {isFree ? 'ENTRADA LIBRE' : `S/. ${Number(tournament.cost).toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* 2. Card Body & Architectural Typography */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 text-[#D9232E] shrink-0" />
                SEDE {tournament.campus_name.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)] text-[var(--text-secondary)]">
                {tournament.format || 'ELIMINACIÓN DIRECTA'}
              </span>
            </div>

            <h3 className="font-display text-2xl font-bold uppercase tracking-[-0.02em] text-[var(--text-primary)] group-hover:text-[#D9232E] transition-colors duration-200 line-clamp-1">
              {tournament.name}
            </h3>

            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {tournament.description_short}
            </p>
          </div>

          {/* 3. Capacity Telemetry Bar & Sharp Action CTA */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-card)] text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#C5A059]" />
                  CAPACIDAD DEL TORNEO
                </span>
                <span className="font-bold text-[var(--text-primary)] tabular-nums">
                  {tournament.current_participants} / {tournament.max_slots} CUPOS
                </span>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-arena)] rounded-none overflow-hidden border border-[var(--border-card)]">
                <div
                  className="h-full bg-[#D9232E] transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(4, slotsPercentage)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-[0.14em]">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-[#D9232E]" />
                <span>{startDate}</span>
              </div>

              <Link
                href={`/tournaments/${tournament.slug}`}
                className="group/btn btn-primary py-2 px-4 text-[11px] font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center gap-2"
              >
                <span>{effectiveStatus === 'REGISTRATION_OPEN' ? 'INSCRIBIRSE' : 'EXPEDIENTE'}</span>
                <ArrowUpRight
                  className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
