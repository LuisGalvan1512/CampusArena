'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  Trophy, 
  Swords, 
  Flame, 
  CheckCircle2, 
  Loader2, 
  X, 
  Crown, 
  Maximize2, 
  Minimize2,
  Calendar,
  Layers,
  GitFork,
  ArrowRight,
  Eye,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { fireCelebration } from '@/lib/confetti';
import { sounds } from '@/lib/sound';
import { MatchupModal } from '@/components/MatchupModal';

interface MatchupItem {
  id: string;
  round_id: string;
  position: number;
  participant_a_name: string | null;
  participant_a_tag: string | null;
  participant_b_name: string | null;
  participant_b_tag: string | null;
  winner_name: string | null;
  winner_tag: string | null;
  status: 'PENDING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'WALKOVER' | 'CANCELLED';
  score_a: number;
  score_b: number;
  next_matchup_id: string | null;
}

interface RoundItem {
  id: string;
  round_number: number;
  name: string;
  matchups: MatchupItem[];
}

interface BracketData {
  id: string;
  status: string;
  bracket_size: number;
  rounds: RoundItem[];
}

interface BracketViewProps {
  tournamentId: string;
  initialBracket: BracketData | null;
  onUpdate: () => void;
}

export function BracketView({ tournamentId, initialBracket, onUpdate }: BracketViewProps) {
  const { user, isAuthenticated, isAdmin, isOrganizer } = useAuth();
  const canManage = isAuthenticated && (isAdmin || isOrganizer || user?.role === 'ADMIN' || user?.role === 'ORGANIZER');
  
  // Mobile / Desktop View Mode: 'ROUNDS' (Ergonomic mobile-first) | 'TREE' (Full laser tree)
  const [viewMode, setViewMode] = useState<'ROUNDS' | 'TREE'>('ROUNDS');
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(0);

  // Auto-detect screen size on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 768) {
        setViewMode('TREE');
      } else {
        setViewMode('ROUNDS');
      }
    }
  }, []);

  // Referee modal state
  const [selectedMatchup, setSelectedMatchup] = useState<MatchupItem | null>(null);
  const [matchupForModal, setMatchupForModal] = useState<{ matchup: MatchupItem; roundName: string } | null>(null);
  const [scoreA, setScoreA] = useState(2);
  const [scoreB, setScoreB] = useState(0);
  const [selectedWinnerTag, setSelectedWinnerTag] = useState<string>('');
  const [isWalkover, setIsWalkover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Generating bracket state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  
  // Stage / OBS Mode state
  const [isStageMode, setIsStageMode] = useState(false);

  // Interactive SVG connector lines state
  const normalInnerRef = React.useRef<HTMLDivElement>(null);
  const stageInnerRef = React.useRef<HTMLDivElement>(null);
  const [connectorLines, setConnectorLines] = useState<Array<{
    fromId: string;
    toId: string;
    d: string;
    hasWinner: boolean;
    isWinnerPath: boolean;
  }>>([]);
  const [hoveredMatchupId, setHoveredMatchupId] = useState<string | null>(null);

  const calculateBracketLines = React.useCallback(() => {
    const inner = isStageMode ? stageInnerRef.current : normalInnerRef.current;
    if (!inner || !initialBracket?.rounds) return;

    const innerRect = inner.getBoundingClientRect();
    const newLines: Array<{
      fromId: string;
      toId: string;
      d: string;
      hasWinner: boolean;
      isWinnerPath: boolean;
    }> = [];

    const prefix = isStageMode ? 'stage-' : '';

    for (const r of initialBracket.rounds) {
      for (const m of r.matchups) {
        if (!m.next_matchup_id) continue;
        const elFrom = document.getElementById(`${prefix}matchup-card-${m.id}`);
        const elTo = document.getElementById(`${prefix}matchup-card-${m.next_matchup_id}`);

        if (!elFrom || !elTo) continue;

        const rectFrom = elFrom.getBoundingClientRect();
        const rectTo = elTo.getBoundingClientRect();

        const x1 = rectFrom.right - innerRect.left;
        const y1 = rectFrom.top + rectFrom.height / 2 - innerRect.top;

        const x2 = rectTo.left - innerRect.left;
        const y2 = rectTo.top + rectTo.height / 2 - innerRect.top;

        const dx = Math.max(x2 - x1, 20);
        const cp1x = x1 + dx * 0.45;
        const cp2x = x2 - dx * 0.45;
        const d = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;

        const hasWinner = Boolean(m.winner_tag);

        newLines.push({
          fromId: m.id,
          toId: m.next_matchup_id,
          d,
          hasWinner,
          isWinnerPath: hasWinner,
        });
      }
    }

    setConnectorLines(newLines);
  }, [initialBracket, isStageMode]);

  useEffect(() => {
    if (viewMode === 'TREE' || isStageMode) {
      const timer = setTimeout(() => {
        calculateBracketLines();
      }, 150);

      const handleResize = () => calculateBracketLines();
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [calculateBracketLines, viewMode, isStageMode]);

  // ⚡ Supabase Realtime Channel Subscription
  useEffect(() => {
    if (!tournamentId) return;

    const channel = supabase
      .channel(`bracket-sync-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'competition',
          table: 'matchups',
        },
        () => {
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matchups',
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      onUpdate();
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [tournamentId, onUpdate]);

  const handleGenerateBrackets = async (seedingMethod: 'RANDOM' | 'BY_TROPHIES' = 'BY_TROPHIES') => {
    setIsGenerating(true);
    setGenError(null);
    try {
      const res = await api.post(`/tournaments/${tournamentId}/generate-bracket`, {
        seeding_method: seedingMethod,
      });
      if (res.success) {
        fireCelebration();
        toast.success('¡Llaves y emparejamientos generados exitosamente!');
        onUpdate();
      } else {
        const msg = res.error?.message || 'Error al generar llaves.';
        setGenError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || 'Error de conexión.';
      setGenError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!initialBracket || !initialBracket.rounds || initialBracket.rounds.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] p-10 sm:p-14 text-center space-y-5 border border-[var(--border-card)] rounded-3xl shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-[#E63946]/15 border border-[#E63946]/30 text-[#E63946] flex items-center justify-center mx-auto shadow-lg shadow-[#E63946]/10">
          <Swords className="w-8 h-8" />
        </div>
        
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-lg font-black text-[var(--text-primary)]">Llaves de Competición en Espera</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            El sorteo oficial y la estructura de emparejamientos se generarán con los competidores confirmados una vez cerradas las inscripciones.
          </p>
        </div>

        {genError && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold max-w-md mx-auto">
            {genError}
          </div>
        )}

        {canManage && (
          <div className="pt-4 border-t border-[var(--border-card)] max-w-md mx-auto space-y-3">
            <span className="text-[11px] font-bold text-sky-500 dark:text-[#A8DADC] uppercase tracking-wider block">
              🛡️ Herramientas de Organizador / Administrador
            </span>
            <div className="flex justify-center">
              <button
                onClick={() => handleGenerateBrackets('RANDOM')}
                disabled={isGenerating}
                className="btn-primary py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#E63946]/20"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                Realizar Sorteo Aleatorio de Llaves
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleMatchupClick = (matchup: MatchupItem, roundName: string) => {
    if (matchup.participant_a_name || matchup.participant_b_name) {
      sounds.playClick();
      setMatchupForModal({ matchup, roundName });
    }
  };

  const handleOpenReferee = (e: React.MouseEvent, matchup: MatchupItem) => {
    e.stopPropagation();
    sounds.playClick();
    setSelectedMatchup(matchup);
    setScoreA(2);
    setScoreB(0);
    setSelectedWinnerTag(matchup.participant_a_tag || '');
    setIsWalkover(false);
    setFeedback(null);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchup) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await api.post(`/matchups/${selectedMatchup.id}/result`, {
      score_a: Number(scoreA),
      score_b: Number(scoreB),
      winner_tag: selectedWinnerTag,
      is_walkover: isWalkover,
    });

    if (res.success) {
      fireCelebration();
      toast.success(res.data?.message || '¡Resultado oficial guardado!');
      setFeedback(res.data?.message || '¡Resultado guardado!');
      setTimeout(() => {
        setSelectedMatchup(null);
        onUpdate();
      }, 1000);
    } else {
      const errMsg = res.error?.message || 'Error al guardar el resultado.';
      toast.error(errMsg);
      setFeedback(errMsg);
    }

    setIsSubmitting(false);
  };

  const currentRound = initialBracket.rounds[selectedRoundIndex] || initialBracket.rounds[0];

  // ==========================================
  // RENDER 1: ERGONOMIC MOBILE ROUNDS VIEW
  // ==========================================
  const renderRoundsView = () => {
    return (
      <div className="space-y-6">
        
        {/* Horizontal Round Selector Pills (Touch-friendly & fast) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {initialBracket.rounds.map((round, idx) => {
            const isSelected = selectedRoundIndex === idx;
            const completedCount = round.matchups.filter(m => m.status === 'COMPLETED' || m.status === 'WALKOVER').length;
            const totalCount = round.matchups.length;
            const isFinished = completedCount === totalCount && totalCount > 0;

            return (
              <button
                key={round.id}
                type="button"
                onClick={() => {
                  setSelectedRoundIndex(idx);
                  sounds.playClick();
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-lg shadow-[#E63946]/25 scale-102'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[#E63946]/40 hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{round.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-[var(--bg-arena)] text-[var(--text-secondary)]'
                }`}>
                  {completedCount}/{totalCount}
                </span>
                {isFinished && (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Round Header Strip */}
        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-card)] flex items-center justify-between shadow-sm">
          <div>
            <h4 className="text-sm font-black text-[var(--text-primary)]">{currentRound.name}</h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {currentRound.matchups.length} {currentRound.matchups.length === 1 ? 'enfrentamiento decisivo' : 'enfrentamientos programados'}
            </p>
          </div>

          <span className="text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--bg-arena)] px-3 py-1 rounded-xl border border-[var(--border-card)]">
            Ronda {selectedRoundIndex + 1} de {initialBracket.rounds.length}
          </span>
        </div>

        {/* Vertical Stack of Matchup Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentRound.matchups.map((m) => {
            const isCompleted = m.status === 'COMPLETED' || m.status === 'WALKOVER';
            const isReady = m.status === 'READY';
            const isFinal = !m.next_matchup_id;
            const hasBoth = Boolean(m.participant_a_tag && m.participant_b_tag);

            return (
              <div
                key={m.id}
                onClick={() => handleMatchupClick(m, currentRound.name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm ${
                  isFinal
                    ? 'bg-gradient-to-b from-[#1D3557]/15 via-[var(--bg-card)] to-[var(--bg-card)] border-amber-400/50 hover:border-amber-400 shadow-amber-500/10'
                    : isCompleted
                    ? 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-white/30'
                    : isReady
                    ? 'bg-[var(--bg-card)] border-[#E63946]/50 hover:border-[#E63946] ring-1 ring-[#E63946]/20'
                    : 'bg-[var(--bg-card)]/70 border-[var(--border-card)]/50 opacity-80'
                }`}
              >
                {/* Match Status Header */}
                <div className="flex items-center justify-between mb-3 text-[10px] font-mono">
                  <span className="text-[var(--text-secondary)] font-bold">Match #{m.position}</span>
                  
                  {isCompleted ? (
                    <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Finalizado
                    </span>
                  ) : isReady ? (
                    <span className="text-[#E63946] flex items-center gap-1 font-bold animate-pulse bg-[#E63946]/10 px-2 py-0.5 rounded-full border border-[#E63946]/20">
                      <Flame className="w-3 h-3" />
                      Listo / En Juego
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">Esperando rival</span>
                  )}
                </div>

                {/* Participant A */}
                <div className={`p-3 rounded-xl flex items-center justify-between transition-colors ${
                  m.winner_tag && m.winner_tag === m.participant_a_tag
                    ? 'bg-emerald-500/15 border border-emerald-500/30'
                    : 'bg-[var(--bg-arena)] border border-[var(--border-card)]'
                }`}>
                  <div className="min-w-0 pr-2">
                    <p className={`text-xs font-bold truncate ${
                      m.winner_tag === m.participant_a_tag ? 'text-emerald-500 dark:text-emerald-300 font-black' : 'text-[var(--text-primary)]'
                    }`}>
                      {m.participant_a_name || 'Por definir (TBD)'}
                    </p>
                    {m.participant_a_tag && (
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">{m.participant_a_tag}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {m.winner_tag && m.winner_tag === m.participant_a_tag && (
                      <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-amber-400" />
                    )}
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)]">
                      {isCompleted ? m.score_a : '-'}
                    </span>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="text-center my-1.5 text-[9px] font-mono text-[var(--text-muted)] font-bold">
                  VS
                </div>

                {/* Participant B */}
                <div className={`p-3 rounded-xl flex items-center justify-between transition-colors ${
                  m.winner_tag && m.winner_tag === m.participant_b_tag
                    ? 'bg-emerald-500/15 border border-emerald-500/30'
                    : 'bg-[var(--bg-arena)] border border-[var(--border-card)]'
                }`}>
                  <div className="min-w-0 pr-2">
                    <p className={`text-xs font-bold truncate ${
                      m.winner_tag === m.participant_b_tag ? 'text-emerald-500 dark:text-emerald-300 font-black' : 'text-[var(--text-primary)]'
                    }`}>
                      {m.participant_b_name || 'Por definir (TBD)'}
                    </p>
                    {m.participant_b_tag && (
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">{m.participant_b_tag}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {m.winner_tag && m.winner_tag === m.participant_b_tag && (
                      <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-amber-400" />
                    )}
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)]">
                      {isCompleted ? m.score_b : '-'}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions & Referee */}
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#8E92A4] flex items-center gap-1 group-hover:text-white transition-colors">
                    <Eye className="w-3 h-3" />
                    <span>Ver Cara a Cara</span>
                  </span>

                  {canManage && hasBoth && !isCompleted && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenReferee(e, m)}
                      className="btn-primary py-1 px-3 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Swords className="w-3 h-3" />
                      <span>Marcador</span>
                    </button>
                  )}
                </div>

                {/* Champion highlight if Grand Final */}
                {isFinal && isCompleted && (
                  <div className="mt-3 p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-center flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
                    <Trophy className="w-4 h-4" />
                    <span>¡Campeón: {m.winner_name}!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    );
  };

  // ==========================================
  // RENDER 2: CINEMATIC DESKTOP LASER TREE VIEW
  // ==========================================
  const renderBracketColumns = (isStage: boolean = false) => {
    const prefix = isStage ? 'stage-' : '';
    const innerRef = isStage ? stageInnerRef : normalInnerRef;
    const minColWidth = 320;
    const totalMinWidth = Math.max(initialBracket.rounds.length * minColWidth, 900);

    return (
      <div className="overflow-x-auto pb-6">
        <div 
          ref={innerRef}
          className="relative min-w-max py-2"
          style={{ minWidth: `${totalMinWidth}px` }}
        >
          {/* SVG BRACKET CONNECTOR LINES WITH LASER PULSE */}
          <svg 
            className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0"
            aria-hidden="true"
          >
            <defs>
              <filter id={`laser-glow-${prefix || 'normal'}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id={`laser-active-${prefix || 'normal'}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E63946" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id={`laser-winner-${prefix || 'normal'}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>

            {connectorLines.map((line, idx) => {
              const isHovered = hoveredMatchupId === line.fromId || hoveredMatchupId === line.toId;
              const isWinnerPath = line.hasWinner;

              return (
                <g key={`bracket-conn-${line.fromId}-${line.toId}-${idx}`}>
                  {isHovered && (
                    <path
                      d={line.d}
                      fill="none"
                      stroke={`url(#laser-active-${prefix || 'normal'})`}
                      strokeWidth="6"
                      strokeOpacity="0.45"
                      filter={`url(#laser-glow-${prefix || 'normal'})`}
                    />
                  )}
                  <path
                    d={line.d}
                    fill="none"
                    stroke={
                      isHovered
                        ? `url(#laser-active-${prefix || 'normal'})`
                        : isWinnerPath
                        ? `url(#laser-winner-${prefix || 'normal'})`
                        : 'rgba(255, 255, 255, 0.1)'
                    }
                    strokeWidth={isHovered ? 2.5 : isWinnerPath ? 2 : 1.5}
                    strokeOpacity={isHovered ? 1 : isWinnerPath ? 0.8 : 0.35}
                  />
                  {isHovered && (
                    <circle r="4" fill="#06B6D4" filter={`url(#laser-glow-${prefix || 'normal'})`}>
                      <animateMotion dur="0.9s" repeatCount="indefinite" path={line.d} />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Grid of Rounds */}
          <div 
            className="min-w-full grid gap-8 sm:gap-14 items-stretch relative z-10"
            style={{ gridTemplateColumns: `repeat(${initialBracket.rounds.length}, minmax(280px, 1fr))` }}
          >
            {initialBracket.rounds.map((round) => (
              <div key={round.id} className="space-y-4">
                
                {/* Round Title */}
                <div className={`p-3 rounded-xl border text-center transition-all ${
                  isStage 
                    ? 'bg-[#1D3557]/20 border-cyan-500/40 shadow-lg shadow-cyan-500/10' 
                    : 'bg-[var(--bg-card)] border-[var(--border-card)] shadow-sm'
                }`}>
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                    {round.name}
                  </span>
                </div>

                {/* Matchups in this Round */}
                <div className="space-y-6 flex flex-col justify-around min-h-[420px]">
                  {round.matchups.map((m) => {
                    const isCompleted = m.status === 'COMPLETED' || m.status === 'WALKOVER';
                    const isReady = m.status === 'READY';
                    const isFinal = !m.next_matchup_id;
                    const hasBoth = Boolean(m.participant_a_tag && m.participant_b_tag);
                    const isCardHovered = hoveredMatchupId === m.id;

                    return (
                      <div
                        key={m.id}
                        id={`${prefix}matchup-card-${m.id}`}
                        onClick={() => handleMatchupClick(m, round.name)}
                        onMouseEnter={() => {
                          setHoveredMatchupId(m.id);
                          sounds.playClick();
                        }}
                        onMouseLeave={() => setHoveredMatchupId(null)}
                        className={`relative rounded-2xl p-4 border transition-all duration-200 select-none shadow-sm hover:scale-[1.02] cursor-pointer group ${
                          isFinal
                            ? 'bg-gradient-to-b from-[#1D3557]/15 to-[var(--bg-card)] border-amber-400/60 shadow-xl shadow-amber-500/10 hover:border-amber-400'
                            : isCardHovered
                            ? 'bg-[var(--bg-card)] border-cyan-400/80 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400/40'
                            : isCompleted
                            ? 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[#E63946]/50'
                            : isReady
                            ? 'bg-[var(--bg-card)] border-[#E63946]/50 hover:border-[#E63946] shadow-lg shadow-[#E63946]/10 ring-1 ring-[#E63946]/20'
                            : 'bg-[var(--bg-card)]/70 border-[var(--border-card)]/50 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {/* Top status indicator */}
                        <div className="flex items-center justify-between mb-2 text-[10px] font-mono">
                          <span className="text-[var(--text-secondary)]">Match #{m.position}</span>
                          
                          {isCompleted ? (
                            <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Finalizado
                            </span>
                          ) : isReady ? (
                            <span className="text-[#E63946] flex items-center gap-1 font-bold animate-pulse">
                              <Flame className="w-3 h-3" />
                              Listo / En Juego
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">Esperando rival</span>
                          )}
                        </div>

                        {/* Participant A */}
                        <div className={`p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                          m.winner_tag && m.winner_tag === m.participant_a_tag
                            ? 'bg-emerald-500/15 border border-emerald-500/30'
                            : 'bg-[var(--bg-arena)] border border-[var(--border-card)]'
                        }`}>
                          <div className="space-y-0.5 truncate pr-2">
                            <p className={`text-xs font-bold truncate ${
                              m.winner_tag === m.participant_a_tag ? 'text-emerald-500 dark:text-emerald-300 font-black' : 'text-[var(--text-primary)]'
                            }`}>
                              {m.participant_a_name || 'TBD (Por definir)'}
                            </p>
                            {m.participant_a_tag && (
                              <p className="text-[10px] text-[var(--text-muted)] font-mono">{m.participant_a_tag}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {m.winner_tag && m.winner_tag === m.participant_a_tag && (
                              <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-400" />
                            )}
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)]">
                              {isCompleted ? m.score_a : '-'}
                            </span>
                          </div>
                        </div>

                        {/* VS divider */}
                        <div className="text-center my-1 text-[9px] font-mono text-[var(--text-muted)] font-bold">VS</div>

                        {/* Participant B */}
                        <div className={`p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                          m.winner_tag && m.winner_tag === m.participant_b_tag
                            ? 'bg-emerald-500/15 border border-emerald-500/30'
                            : 'bg-[var(--bg-arena)] border border-[var(--border-card)]'
                        }`}>
                          <div className="space-y-0.5 truncate pr-2">
                            <p className={`text-xs font-bold truncate ${
                              m.winner_tag === m.participant_b_tag ? 'text-emerald-500 dark:text-emerald-300 font-black' : 'text-[var(--text-primary)]'
                            }`}>
                              {m.participant_b_name || 'TBD (Por definir)'}
                            </p>
                            {m.participant_b_tag && (
                              <p className="text-[10px] text-[var(--text-muted)] font-mono">{m.participant_b_tag}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {m.winner_tag && m.winner_tag === m.participant_b_tag && (
                              <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-400" />
                            )}
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)]">
                              {isCompleted ? m.score_b : '-'}
                            </span>
                          </div>
                        </div>

                        {/* Referee button for admins/organizers */}
                        {canManage && hasBoth && !isCompleted && (
                          <div className="mt-2.5 pt-2 border-t border-[var(--border-card)] flex items-center justify-between">
                            <span className="text-[10px] text-[var(--text-secondary)] font-bold">Arbitraje</span>
                            <button
                              type="button"
                              onClick={(e) => handleOpenReferee(e, m)}
                              className="btn-primary py-1 px-2.5 text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <Swords className="w-3 h-3" />
                              <span>Marcador</span>
                            </button>
                          </div>
                        )}

                        {/* Final Crown Badge on Grand Final */}
                        {isFinal && isCompleted && (
                          <div className="mt-2.5 p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-center flex items-center justify-center gap-1 text-[11px] font-bold text-amber-400">
                            <Trophy className="w-3.5 h-3.5" />
                            <span>¡Campeón: {m.winner_name}!</span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header Info & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 sm:p-5 rounded-3xl border border-[var(--border-card)] shadow-sm">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E63946]/15 text-[#E63946] flex items-center justify-center shrink-0 border border-[#E63946]/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--text-primary)]">Llaves Oficiales de Eliminación Directa</h3>
            <p className="text-xs text-[var(--text-secondary)]">Formato BO3 • Toca cualquier emparejamiento para ver el cara a cara</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Mode Switcher: Rounds vs Tree */}
          <div className="bg-[var(--bg-arena)] p-1 rounded-2xl border border-[var(--border-card)] flex items-center">
            <button
              type="button"
              onClick={() => {
                setViewMode('ROUNDS');
                sounds.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'ROUNDS'
                  ? 'bg-[#E63946] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Vista optimizada para móviles por rondas"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Por Rondas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('TREE');
                sounds.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TREE'
                  ? 'bg-[#E63946] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Vista completa de árbol con conectores láser"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Árbol de Llaves</span>
            </button>
          </div>

          {/* Fullscreen Stage OBS */}
          <button
            onClick={() => setIsStageMode(true)}
            className="btn-secondary px-3 py-2 text-xs flex items-center gap-1.5 cursor-pointer text-[#A8DADC] border-white/10 hover:border-white/30 shrink-0"
            title="Pantalla completa para transmisión o proyector"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Modo Escenario / OBS</span>
          </button>

          {/* Realtime Live Pulse */}
          <span className="hidden lg:inline-flex px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 items-center gap-2 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Realtime Sincronizado</span>
          </span>

        </div>
      </div>

      {/* VIEW RENDER: ROUNDS VS FULL TREE */}
      {viewMode === 'ROUNDS' ? renderRoundsView() : renderBracketColumns(false)}

      {/* FULLSCREEN STAGE / OBS MODE OVERLAY */}
      {isStageMode && (
        <div className="fixed inset-0 z-50 bg-[#07080B] text-white p-6 sm:p-10 flex flex-col justify-between overflow-y-auto animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E63946] to-[#1D3557] flex items-center justify-center font-black">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  CAMPUS <span className="text-[#E63946]">ARENA</span> • LLAVES EN VIVO
                </h1>
                <p className="text-xs text-[#A8DADC]">
                  Transmisión Oficial Tecsup Esports • Modalidad Presencial & Online
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsStageMode(false)}
              className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer bg-white/10 hover:bg-white/20"
            >
              <Minimize2 className="w-4 h-4" />
              Salir de Pantalla Completa
            </button>
          </div>

          <div className="my-auto py-8">
            {renderBracketColumns(true)}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#8E92A4]">
            <span>🔴 En Vivo por Twitch & Kick</span>
            <span>Tecsup Sede Lima • Esports Engine</span>
          </div>
        </div>
      )}

      {/* REFEREE SCORE REPORTING MODAL */}
      {selectedMatchup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[var(--bg-card)] p-6 sm:p-8 border border-[var(--border-card)] rounded-3xl shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#E63946]">
                <Swords className="w-4 h-4" />
                <span>Panel de Arbitraje Oficial</span>
              </div>
              <button
                onClick={() => setSelectedMatchup(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-base font-black text-[var(--text-primary)]">
                Match #{selectedMatchup.position} — Registro de Marcador
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Ingresa el resultado de la serie Bo3. El ganador avanzará automáticamente a la siguiente ronda.
              </p>
            </div>

            <form onSubmit={handleSubmitResult} className="space-y-5">
              
              {/* Score Input Matrix */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--bg-arena)] border border-[var(--border-card)]">
                
                <div className="space-y-2 text-center">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {selectedMatchup.participant_a_name}
                  </p>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={scoreA}
                    onChange={(e) => setScoreA(Number(e.target.value))}
                    className="input-arena text-center text-2xl font-black font-mono py-2 bg-[var(--bg-card)]"
                  />
                  <label className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer pt-1">
                    <input
                      type="radio"
                      name="winner"
                      checked={selectedWinnerTag === selectedMatchup.participant_a_tag}
                      onChange={() => setSelectedWinnerTag(selectedMatchup.participant_a_tag!)}
                      className="accent-[#E63946]"
                    />
                    <span>Ganador</span>
                  </label>
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {selectedMatchup.participant_b_name}
                  </p>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={scoreB}
                    onChange={(e) => setScoreB(Number(e.target.value))}
                    className="input-arena text-center text-2xl font-black font-mono py-2 bg-[var(--bg-card)]"
                  />
                  <label className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer pt-1">
                    <input
                      type="radio"
                      name="winner"
                      checked={selectedWinnerTag === selectedMatchup.participant_b_tag}
                      onChange={() => setSelectedWinnerTag(selectedMatchup.participant_b_tag!)}
                      className="accent-[#E63946]"
                    />
                    <span>Ganador</span>
                  </label>
                </div>

              </div>

              {/* Walkover Checkbox */}
              <label className="flex items-center gap-2 text-xs text-[#8E92A4] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isWalkover}
                  onChange={(e) => setIsWalkover(e.target.checked)}
                  className="rounded accent-[#E63946]"
                />
                <span>Victoria por Walkover (W.O. / No presentación del rival)</span>
              </label>

              {/* Feedback */}
              {feedback && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
                  {feedback}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatchup(null)}
                  className="btn-secondary py-2.5 text-xs text-center cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Guardar Resultado
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CINEMATIC MATCHUP VS MODAL */}
      <MatchupModal
        isOpen={Boolean(matchupForModal)}
        onClose={() => setMatchupForModal(null)}
        tournamentName="Torneo Campus Arena"
        roundName={matchupForModal?.roundName}
        status={matchupForModal?.matchup.status === 'COMPLETED' ? 'FINISHED' : matchupForModal?.matchup.status === 'READY' ? 'IN_PROGRESS' : 'SCHEDULED'}
        player1={matchupForModal ? {
          name: matchupForModal.matchup.participant_a_name || 'Por Definir',
          tag: matchupForModal.matchup.participant_a_tag || undefined,
          score: matchupForModal.matchup.status === 'COMPLETED' ? matchupForModal.matchup.score_a : undefined,
          is_winner: matchupForModal.matchup.winner_tag === matchupForModal.matchup.participant_a_tag,
        } : null}
        player2={matchupForModal ? {
          name: matchupForModal.matchup.participant_b_name || 'Por Definir',
          tag: matchupForModal.matchup.participant_b_tag || undefined,
          score: matchupForModal.matchup.status === 'COMPLETED' ? matchupForModal.matchup.score_b : undefined,
          is_winner: matchupForModal.matchup.winner_tag === matchupForModal.matchup.participant_b_tag,
        } : null}
      />

    </div>
  );
}
