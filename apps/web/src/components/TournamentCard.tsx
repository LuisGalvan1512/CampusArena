'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Swords, 
  Gamepad2, 
  Users, 
  Calendar, 
  MapPin, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Crosshair,
  CircleDot,
} from 'lucide-react';
import { type GameCode, GAME_CATALOG } from '@/lib/games';

export interface TournamentItem {
  id: string;
  name: string;
  slug: string;
  game_code: string;
  organization_name: string;
  campus_name: string;
  description_short: string;
  banner_url: string;
  status: 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  max_slots: number;
  min_slots: number;
  current_participants: number;
  cost: number | string;
  currency: string;
  prize_pool: string;
  format: string;
  tournament_start_at: string;
  registration_close_at: string;
}

const GAME_ICON_MAP: Record<string, React.ReactNode> = {
  Swords: <Swords className="w-3.5 h-3.5" />,
  Gamepad2: <Gamepad2 className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Crosshair: <Crosshair className="w-3.5 h-3.5" />,
  CircleDot: <CircleDot className="w-3.5 h-3.5" />,
};

import { SpotlightCard } from '@/components/SpotlightCard';
import { ScrollParallaxImage } from '@/components/ScrollParallaxImage';

export function TournamentCard({ tournament }: { tournament: TournamentItem }) {
  const game = GAME_CATALOG[tournament.game_code as GameCode];
  const gameColor = game?.color || '#E63946';
  const gameName = game?.name || tournament.game_code;
  const gameIcon = game ? GAME_ICON_MAP[game.iconName] : <Swords className="w-3.5 h-3.5" />;
  
  const slotsPercentage = Math.min(
    100,
    Math.round((tournament.current_participants / tournament.max_slots) * 100)
  );

  const getStatusBadge = (status: TournamentItem['status']) => {
    switch (status) {
      case 'REGISTRATION_OPEN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Inscripciones Abiertas
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 flex items-center gap-1 shadow-sm">
            <Flame className="w-3 h-3 text-[#E63946]" />
            En Juego
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#457B9D]/20 text-[#A8DADC] border border-[#457B9D]/30">
            Próximamente
          </span>
        );
      case 'FINISHED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-[var(--text-muted)] border border-slate-500/20">
            Concluido
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-[var(--text-secondary)]">
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

  return (
    <SpotlightCard 
      spotlightColor={`${gameColor}26`}
      className="arena-card overflow-hidden flex flex-col group h-full hover:border-white/20 hover:shadow-xl transition-all duration-300 rounded-3xl"
    >
      
      {/* Banner Image with Scroll-Linked Parallax */}
      <div className="relative h-48 w-full overflow-hidden bg-black/90">
        <ScrollParallaxImage
          src={tournament.banner_url || game?.bannerUrl || '/games/clash_royale_banner.jpg'}
          alt={tournament.name}
          fallbackSrc={game?.bannerUrl || '/games/clash_royale_banner.jpg'}
          scaleRange={[1.02, 1.12]}
          yRange={[-12, 12]}
          containerClassName="w-full h-full"
          className="opacity-80 group-hover:opacity-95 transition-opacity duration-500"
        />
        {/* Subtle game color glow bleed in top-left */}
        <div 
          className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none transition-opacity duration-500 group-hover:opacity-70"
          style={{ backgroundColor: gameColor }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/40 to-black/30 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 gap-2">
          <div 
            className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md text-white border border-white/20 ring-1 ring-black/20"
            style={{ backgroundColor: `${gameColor}E6` }}
          >
            {game?.logoUrl ? (
              <img src={game.logoUrl} alt={gameName} className="w-4 h-4 object-contain shrink-0 filter drop-shadow" />
            ) : (
              gameIcon
            )}
            <span className="truncate max-w-[120px]">{gameName}</span>
          </div>

          {getStatusBadge(tournament.status)}
        </div>

        {/* Prize Overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 bg-black/75 px-2.5 py-1 rounded-lg backdrop-blur-md border border-amber-400/20 shadow-[0_2px_12px_rgba(245,158,11,0.15)]">
            <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="truncate">{tournament.prize_pool}</span>
          </div>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Organization / Campus */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <MapPin className="w-3.5 h-3.5 text-[#457B9D] shrink-0" />
            <span className="truncate">{tournament.organization_name} • {tournament.campus_name}</span>
          </div>

          <h3 className="text-lg font-extrabold text-[var(--text-primary)] group-hover:text-[#E63946] transition-colors duration-200 line-clamp-1">
            {tournament.name}
          </h3>

          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
            {tournament.description_short}
          </p>
        </div>

        {/* Slots & Dates Progress */}
        <div className="space-y-3 pt-3 border-t border-[var(--border-card)] text-xs">
          
          {/* Slots progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-sky-600 dark:text-[#A8DADC]" />
                Cupos Registrados
              </span>
              <span className="font-bold text-[var(--text-primary)]">
                {tournament.current_participants} / {tournament.max_slots}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[var(--bg-arena)] dark:bg-black/50 rounded-full overflow-hidden border border-[var(--border-card)]">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${slotsPercentage}%`,
                  background: `linear-gradient(90deg, ${gameColor}, ${gameColor}99)`,
                }}
              />
            </div>
          </div>

          {/* Date & Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: gameColor }} />
              <span className="text-[11px] font-medium">{startDate}</span>
            </div>

            <Link
              href={`/tournaments/${tournament.slug}`}
              className="group/btn btn-primary px-4 py-2 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-md shadow-[#E63946]/20 active:scale-95 transition-all duration-150"
            >
              <span>Ver Torneo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>

        </div>

      </div>

    </SpotlightCard>
  );
}
