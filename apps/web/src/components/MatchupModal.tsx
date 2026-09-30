'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Swords, 
  Trophy, 
  Flame, 
  Shield, 
  ExternalLink,
  Crown,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { sounds } from '@/lib/sound';

export interface CompetitorData {
  id?: string;
  name: string;
  tag?: string;
  avatar_url?: string;
  score?: number;
  is_winner?: boolean;
  campus?: string;
  game_name?: string;
  win_rate?: string;
}

interface MatchupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentName?: string;
  roundName?: string;
  player1: CompetitorData | null;
  player2: CompetitorData | null;
  status?: string;
  matchScore?: string;
}

export function MatchupModal({
  isOpen,
  onClose,
  tournamentName = 'Torneo de Campus Arena',
  roundName = 'Ronda Clasificatoria',
  player1,
  player2,
  status = 'SCHEDULED',
  matchScore,
}: MatchupModalProps) {
  useEffect(() => {
    if (isOpen) {
      sounds.playWhoosh();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isLive = status === 'IN_PROGRESS';
  const isFinished = status === 'FINISHED';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl arena-card bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 left-1/4 w-72 h-72 bg-[#E63946]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-[#457B9D]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4 relative z-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E63946] flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" />
                {roundName} • {tournamentName}
              </span>
              <h3 className="text-lg font-black text-[var(--text-primary)]">
                Ficha de Enfrentamiento Oficial
              </h3>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-xl hover:bg-[var(--bg-arena)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center relative z-10">
            {isLive ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-500 font-black text-xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                EN CURSO — TRANSMISIÓN EN VIVO
              </span>
            ) : isFinished ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PARTIDA FINALIZADA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-arena)] border border-[var(--border-card)] text-[var(--text-secondary)] font-bold text-xs">
                CRUCE OFICIAL PROGRAMADO
              </span>
            )}
          </div>

          {/* Versus Showdown Grid */}
          <div className="grid grid-cols-11 items-center gap-2 py-4 relative z-10">
            
            {/* Competitor 1 (Blue/Strategy) */}
            <div className={`col-span-5 p-5 rounded-2xl border transition-all text-center space-y-3 ${
              player1?.is_winner 
                ? 'bg-gradient-to-b from-amber-500/15 to-[var(--bg-arena)] border-amber-500/50 shadow-lg shadow-amber-500/10' 
                : 'bg-[var(--bg-arena)] border-[var(--border-card)]'
            }`}>
              {player1?.is_winner && (
                <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-500">
                  <Crown className="w-4 h-4" />
                  <span>GANADOR</span>
                </div>
              )}
              <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#1D3557] to-[#457B9D] flex items-center justify-center text-white font-black text-2xl shadow-xl overflow-hidden border-2 border-white/20">
                {player1?.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={player1.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{player1?.name ? player1.name.charAt(0).toUpperCase() : '?'}</span>
                )}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
                  {player1?.name || 'Por Definir'}
                </h4>
                {player1?.tag && (
                  <p className="font-mono text-xs text-sky-500 font-bold truncate">
                    {player1.tag}
                  </p>
                )}
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {player1?.campus || 'Tecsup Central'}
                </p>
              </div>
              {player1?.score !== undefined && (
                <div className="inline-block px-3 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-black text-xl text-[var(--text-primary)]">
                  {player1.score}
                </div>
              )}
            </div>

            {/* Center VS Emblem */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#E63946] to-[#D62839] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-xl shadow-red-500/30 border-2 border-white/20">
                VS
              </div>
            </div>

            {/* Competitor 2 (Red/Fire) */}
            <div className={`col-span-5 p-5 rounded-2xl border transition-all text-center space-y-3 ${
              player2?.is_winner 
                ? 'bg-gradient-to-b from-amber-500/15 to-[var(--bg-arena)] border-amber-500/50 shadow-lg shadow-amber-500/10' 
                : 'bg-[var(--bg-arena)] border-[var(--border-card)]'
            }`}>
              {player2?.is_winner && (
                <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-500">
                  <Crown className="w-4 h-4" />
                  <span>GANADOR</span>
                </div>
              )}
              <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#E63946] to-[#FF6B35] flex items-center justify-center text-white font-black text-2xl shadow-xl overflow-hidden border-2 border-white/20">
                {player2?.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={player2.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{player2?.name ? player2.name.charAt(0).toUpperCase() : '?'}</span>
                )}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
                  {player2?.name || 'Por Definir'}
                </h4>
                {player2?.tag && (
                  <p className="font-mono text-xs text-sky-500 font-bold truncate">
                    {player2.tag}
                  </p>
                )}
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {player2?.campus || 'Tecsup Central'}
                </p>
              </div>
              {player2?.score !== undefined && (
                <div className="inline-block px-3 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-black text-xl text-[var(--text-primary)]">
                  {player2.score}
                </div>
              )}
            </div>

          </div>

          {/* Match Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--border-card)] relative z-10">
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Arbitraje Oficial • Reglas de Fair Play Tecsup
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/live"
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                className="btn-primary py-2 px-4 text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
              >
                <span>Ver Transmisión en Vivo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
