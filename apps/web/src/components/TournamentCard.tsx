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
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Inscripciones Abiertas
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 flex items-center gap-1">
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
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-[#8E92A4] border border-white/10">
            Concluido
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-[#8E92A4]">
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
    <div className="arena-card overflow-hidden flex flex-col group h-full transition-all hover:border-opacity-30" style={{ '--hover-color': gameColor } as React.CSSProperties}>
      
      {/* Banner Image / Gradient */}
      <div className="relative h-44 w-full overflow-hidden bg-[#0B0C10]">
        <img
          src={tournament.banner_url}
          alt={tournament.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15161E] via-[#15161E]/40 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div 
            className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md text-white"
            style={{ backgroundColor: `${gameColor}E6` }}
          >
            {gameIcon}
            <span>{gameName}</span>
          </div>

          {getStatusBadge(tournament.status)}
        </div>

        {/* Prize Overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Trophy className="w-4 h-4 shrink-0" />
            <span className="truncate">{tournament.prize_pool}</span>
          </div>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Organization / Campus */}
          <div className="flex items-center gap-2 text-xs text-[#8E92A4]">
            <MapPin className="w-3.5 h-3.5 text-[#457B9D]" />
            <span>{tournament.organization_name} • {tournament.campus_name}</span>
          </div>

          <h3 className="text-lg font-extrabold text-white group-hover:text-[#E63946] transition-colors line-clamp-1">
            {tournament.name}
          </h3>

          <p className="text-xs text-[#8E92A4] line-clamp-2 leading-relaxed">
            {tournament.description_short}
          </p>
        </div>

        {/* Slots & Dates Progress */}
        <div className="space-y-3 pt-2 border-t border-white/5 text-xs">
          
          {/* Slots progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#8E92A4]">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-[#A8DADC]" />
                Cupos Registrados
              </span>
              <span className="font-bold text-white">
                {tournament.current_participants} / {tournament.max_slots}
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${slotsPercentage}%`,
                  background: `linear-gradient(90deg, ${gameColor}, ${gameColor}99)`,
                }}
              />
            </div>
          </div>

          {/* Date & Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[#8E92A4]">
              <Calendar className="w-3.5 h-3.5" style={{ color: gameColor }} />
              <span className="text-[11px] font-medium">{startDate}</span>
            </div>

            <Link
              href={`/tournaments/${tournament.slug}`}
              className="btn-primary px-3.5 py-1.5 text-xs inline-flex items-center gap-1 group-hover:shadow-lg"
            >
              Ver Torneo
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
