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
  Layers,
  GitFork,
  Eye,
  ZoomIn,
  ZoomOut,
  Columns2,
  Tv,
  LayoutGrid,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { fireCelebration } from '@/lib/confetti';
import { sounds } from '@/lib/sound';
import { MatchupModal } from '@/components/MatchupModal';
import { BracketTreeIcon, LiveWaveformIcon, AegisTrophyIcon } from '@/components/EsportsIcons';

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
  isFullWidth?: boolean;
  onToggleFullWidth?: () => void;
}

export function BracketView({
  tournamentId,
  initialBracket,
  onUpdate,
  isFullWidth,
  onToggleFullWidth,
}: BracketViewProps) {
  const { user, isAuthenticated, isAdmin, isOrganizer } = useAuth();
  const canManage =
    isAuthenticated &&
    (isAdmin || isOrganizer || user?.role === 'ADMIN' || user?.role === 'ORGANIZER');

  const [viewMode, setViewMode] = useState<'ROUNDS' | 'TREE'>('ROUNDS');
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(0);

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
  const [matchupForModal, setMatchupForModal] = useState<{
    matchup: MatchupItem;
    roundName: string;
  } | null>(null);
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
  const [treeZoom, setTreeZoom] = useState<number>(100);
  const [stageZoom] = useState<number>(100);
  const [cardDensity, setCardDensity] = useState<'compact' | 'detailed'>('compact');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('obs') === 'true' || params.get('stage') === 'true') {
        setIsStageMode(true);
      }
    }
  }, []);

  const copyObsUrl = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?obs=true`;
      navigator.clipboard.writeText(url);
      toast.success(
        '¡Enlace de OBS copiado! Pégalo como Browser Source en OBS Studio (1920x1080).'
      );
    }
  };

  const toggleNativeFullscreen = () => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch (_) {}
  };

  const enterStageMode = () => {
    setIsStageMode(true);
    try {
      if (
        typeof document !== 'undefined' &&
        document.documentElement.requestFullscreen &&
        !document.fullscreenElement
      ) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (_) {}
  };

  const exitStageMode = () => {
    setIsStageMode(false);
    try {
      if (typeof document !== 'undefined' && document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (_) {}
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStageMode) {
        exitStageMode();
      }
    };
    const handleFsChange = () => {
      if (typeof document !== 'undefined' && !document.fullscreenElement && isStageMode) {
        setIsStageMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, [isStageMode]);

  const normalInnerRef = React.useRef<HTMLDivElement>(null);
  const stageInnerRef = React.useRef<HTMLDivElement>(null);
  const [connectorLines, setConnectorLines] = useState<
    Array<{
      fromId: string;
      toId: string;
      d: string;
      hasWinner: boolean;
      isWinnerPath: boolean;
    }>
  >([]);
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
  }, [initialBracket, isStageMode, treeZoom, stageZoom, cardDensity]);

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
  }, [calculateBracketLines, viewMode, isStageMode, treeZoom, stageZoom, cardDensity]);

  // Supabase Realtime Channel Subscription
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
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [tournamentId, onUpdate]);

  const handleGenerateBrackets = async (seedingMethod: 'RANDOM' | 'BY_TROPHIES' = 'RANDOM') => {
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
      <div className="double-bezel">
        <div className="double-bezel-inner p-10 sm:p-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-sm bg-[#D9232E]/15 border border-[#D9232E]/40 text-[#D9232E] flex items-center justify-center mx-auto">
            <BracketTreeIcon className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#C5A059]">
              MOTOR DE LLAVES EN ESPERA
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] uppercase">
              CUADRO DE EMPAREJAMIENTOS PENDIENTE DE SORTEO
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              El sorteo oficial y la estructura del árbol de eliminación directa se activarán con
              los participantes confirmados al cierre del registro.
            </p>
          </div>

          {genError && (
            <div className="p-3.5 rounded-sm bg-[#D9232E]/15 border border-[#D9232E]/40 text-[#D9232E] text-xs font-mono font-bold max-w-md mx-auto">
              {genError}
            </div>
          )}

          {canManage && (
            <div className="pt-6 border-t border-[var(--border-card)] max-w-xl mx-auto space-y-4">
              <span className="font-mono text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D9232E]" />
                CONSOLA DE SORTEO PARA ORGANIZADOR / ÁRBITRO
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleGenerateBrackets('RANDOM')}
                  disabled={isGenerating}
                  className="btn-primary py-3 px-6 text-xs font-mono font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Swords className="w-4 h-4" />
                  )}
                  <span>SORTEO ALEATORIO (RANDOM SEED)</span>
                </button>

                <button
                  onClick={() => handleGenerateBrackets('BY_TROPHIES')}
                  disabled={isGenerating}
                  className="btn-secondary py-3 px-6 text-xs font-mono font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <AegisTrophyIcon className="w-4 h-4 text-[#C5A059]" animated={false} />
                  <span>SEEDING POR NIVEL / TROFEOS</span>
                </button>
              </div>
            </div>
          )}
        </div>
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

  const applyQuickScorePreset = (a: number, b: number) => {
    if (!selectedMatchup) return;
    sounds.playWoodClick();
    setScoreA(a);
    setScoreB(b);
    if (a > b && selectedMatchup.participant_a_tag) {
      setSelectedWinnerTag(selectedMatchup.participant_a_tag);
    } else if (b > a && selectedMatchup.participant_b_tag) {
      setSelectedWinnerTag(selectedMatchup.participant_b_tag);
    }
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
      toast.success(res.data?.message || '¡Resultado guardado!');
      setFeedback(res.data?.message || '¡Resultado guardado!');
      setTimeout(() => {
        setSelectedMatchup(null);
        onUpdate();
      }, 900);
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {initialBracket.rounds.map((round, idx) => {
            const isSelected = selectedRoundIndex === idx;
            const completedCount = round.matchups.filter(
              (m) => m.status === 'COMPLETED' || m.status === 'WALKOVER'
            ).length;
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
                className={`px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-[0.14em] transition-all shrink-0 flex items-center gap-2.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#D9232E] text-white border-[#D9232E]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[#F4F2ED]/30 hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{round.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-sm text-[10px] font-mono ${
                    isSelected
                      ? 'bg-black/30 text-white'
                      : 'bg-[var(--bg-arena)] text-[var(--text-secondary)]'
                  }`}
                >
                  {completedCount}/{totalCount}
                </span>
                {isFinished && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-400'}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-[var(--bg-card)] p-4 rounded-sm border border-[var(--border-card)] flex items-center justify-between">
          <div>
            <h4 className="font-display text-lg font-bold uppercase text-[var(--text-primary)]">
              {currentRound.name}
            </h4>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              {currentRound.matchups.length}{' '}
              {currentRound.matchups.length === 1
                ? 'SERIE DECISIVA'
                : 'ENFRENTAMIENTOS PROGRAMADOS'}
            </p>
          </div>

          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C5A059] bg-[var(--bg-arena)] px-3 py-1.5 rounded-sm border border-[var(--border-card)]">
            FASE {selectedRoundIndex + 1} / {initialBracket.rounds.length}
          </span>
        </div>

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
                className={`p-5 rounded-sm border transition-all cursor-pointer group ${
                  isFinal
                    ? 'bg-[#121216] border-[#C5A059]/70 hover:border-[#C5A059]'
                    : isCompleted
                      ? 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[#F4F2ED]/30'
                      : isReady
                        ? 'bg-[var(--bg-card)] border-[#D9232E]/70 hover:border-[#D9232E]'
                        : 'bg-[var(--bg-card)]/70 border-[var(--border-card)] opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-[0.16em]">
                  <span className="text-[var(--text-muted)] font-bold">SERIE #{m.position}</span>

                  {isCompleted ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/25">
                      <CheckCircle2 className="w-3 h-3" />
                      CONCLUIDO
                    </span>
                  ) : isReady ? (
                    <span className="text-white flex items-center gap-1.5 font-bold bg-[#D9232E] px-2 py-0.5 rounded-sm">
                      <LiveWaveformIcon className="w-3 h-3 text-white" />
                      EN DISPUTA
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">PENDIENTE DE RIVAL</span>
                  )}
                </div>

                {/* Participant A */}
                <div
                  className={`p-3 rounded-sm flex items-center justify-between transition-colors ${
                    m.winner_tag && m.winner_tag === m.participant_a_tag
                      ? 'bg-emerald-500/15 border border-emerald-500/35'
                      : 'bg-[var(--bg-arena)] border border-[var(--border-card)]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p
                      className={`text-xs font-bold truncate ${
                        m.winner_tag === m.participant_a_tag
                          ? 'text-emerald-300 font-black'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {m.participant_a_name || 'Por definir (TBD)'}
                    </p>
                    {m.participant_a_tag && (
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">
                        {m.participant_a_tag}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {m.winner_tag && m.winner_tag === m.participant_a_tag && (
                      <Crown className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                    )}
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-sm bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] tabular-nums">
                      {isCompleted ? m.score_a : '-'}
                    </span>
                  </div>
                </div>

                <div className="text-center my-1.5 text-[9px] font-mono text-[var(--text-muted)] font-bold tracking-[0.2em]">
                  VS
                </div>

                {/* Participant B */}
                <div
                  className={`p-3 rounded-sm flex items-center justify-between transition-colors ${
                    m.winner_tag && m.winner_tag === m.participant_b_tag
                      ? 'bg-emerald-500/15 border border-emerald-500/35'
                      : 'bg-[var(--bg-arena)] border border-[var(--border-card)]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p
                      className={`text-xs font-bold truncate ${
                        m.winner_tag === m.participant_b_tag
                          ? 'text-emerald-300 font-black'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {m.participant_b_name || 'Por definir (TBD)'}
                    </p>
                    {m.participant_b_tag && (
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">
                        {m.participant_b_tag}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {m.winner_tag && m.winner_tag === m.participant_b_tag && (
                      <Crown className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                    )}
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-sm bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] tabular-nums">
                      {isCompleted ? m.score_b : '-'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[var(--border-card)] flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-muted)] flex items-center gap-1.5 group-hover:text-[var(--text-primary)] transition-colors">
                    <Eye className="w-3 h-3 text-[#D9232E]" />
                    <span>CARA A CARA</span>
                  </span>

                  {canManage && hasBoth && !isCompleted && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenReferee(e, m)}
                      className="btn-primary py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Swords className="w-3 h-3" />
                      <span>REPORTAR SCORE</span>
                    </button>
                  )}
                </div>

                {isFinal && isCompleted && (
                  <div className="mt-3 p-2 rounded-sm bg-[#C5A059]/15 border border-[#C5A059]/40 text-center flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase text-[#C5A059]">
                    <Trophy className="w-4 h-4" />
                    <span>CAMPEÓN OFICIAL: {m.winner_name}</span>
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
  // STREAMLINED COMPACT MATCH CARD (SOBER BROADCAST NODE)
  // ==========================================
  const renderCompactCard = (m: MatchupItem, roundName: string, isStage: boolean) => {
    const prefix = isStage ? 'stage-' : '';
    const isCompleted = m.status === 'COMPLETED' || m.status === 'WALKOVER';
    const isReady = m.status === 'READY';
    const isFinal = !m.next_matchup_id;
    const isCardHovered = hoveredMatchupId === m.id;
    const hasBoth = Boolean(m.participant_a_tag && m.participant_b_tag);

    const isWinnerA = isCompleted && m.winner_tag && m.winner_tag === m.participant_a_tag;
    const isWinnerB = isCompleted && m.winner_tag && m.winner_tag === m.participant_b_tag;

    return (
      <div
        key={m.id}
        id={`${prefix}matchup-card-${m.id}`}
        onClick={() => handleMatchupClick(m, roundName)}
        onMouseEnter={() => {
          setHoveredMatchupId(m.id);
          sounds.playClick();
        }}
        onMouseLeave={() => setHoveredMatchupId(null)}
        className={`group relative rounded-sm border transition-all duration-150 select-none cursor-pointer overflow-visible ${
          isFinal
            ? 'bg-[#121216] border-[#C5A059] shadow-[0_10px_28px_rgba(197,160,89,0.18)]'
            : isCardHovered
              ? 'bg-[#16161C] border-[#D9232E] scale-[1.015]'
              : isCompleted
                ? 'bg-[#0D0D10] border-[#F4F2ED]/12 hover:border-[#F4F2ED]/30'
                : isReady
                  ? 'bg-[#121216] border-[#D9232E]/80 hover:border-[#D9232E]'
                  : 'bg-[#0A0A0D]/90 border-[#F4F2ED]/08 opacity-80 hover:opacity-100'
        }`}
      >
        {/* Left Architectural Status Bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 z-10 ${
            isFinal && isCompleted
              ? 'bg-[#C5A059]'
              : isCompleted
                ? 'bg-emerald-500'
                : isReady
                  ? 'bg-[#D9232E] animate-pulse'
                  : 'bg-[#27272A]'
          }`}
        />

        {/* Top-Right Micro Telemetry Tag */}
        <div className="absolute -top-2 right-2 z-20 flex items-center gap-1 pointer-events-none">
          {isFinal && isCompleted ? (
            <span className="px-1.5 py-0.2 rounded-sm text-[8px] font-mono font-black uppercase tracking-wider bg-[#C5A059] text-black flex items-center gap-0.5">
              <Trophy className="w-2 h-2" />
              FINAL
            </span>
          ) : isCompleted ? (
            <span className="px-1.5 py-0.2 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider bg-[#09090B] text-emerald-400 border border-emerald-500/35 flex items-center gap-0.5">
              <CheckCircle2 className="w-2 h-2" />
              M#{m.position}
            </span>
          ) : isReady ? (
            <span className="px-1.5 py-0.2 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider bg-[#D9232E] text-white flex items-center gap-1">
              <span className="w-1 h-1 bg-white animate-ping" />
              LIVE • M#{m.position}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider bg-[#09090B] text-[#A3A19A] border border-[#F4F2ED]/10">
              M#{m.position}
            </span>
          )}
        </div>

        {/* Row 1: Participant A */}
        <div
          className={`h-[26px] px-2.5 pl-3 flex items-center justify-between transition-colors ${
            isWinnerA
              ? 'bg-emerald-500/15 text-emerald-200'
              : isCompleted && m.winner_tag
                ? 'text-[#F4F2ED]/40'
                : 'text-[#F4F2ED]'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 pr-1.5">
            <span
              className={`text-[9px] font-mono shrink-0 px-1 py-0.2 rounded-sm ${
                isWinnerA
                  ? 'bg-emerald-400/25 text-emerald-300 font-black'
                  : 'bg-white/5 text-[#A3A19A] font-bold'
              }`}
            >
              1
            </span>
            <span
              className={`text-xs truncate tracking-tight ${
                isWinnerA
                  ? 'font-bold text-emerald-300'
                  : isCompleted && m.winner_tag
                    ? 'font-medium text-[#F4F2ED]/40'
                    : 'font-bold text-[#F4F2ED]'
              }`}
            >
              {m.participant_a_name || 'Por definir'}
            </span>
            {isWinnerA && (
              <Crown className="w-3 h-3 text-[#C5A059] fill-[#C5A059] shrink-0 inline-block" />
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`text-xs font-mono font-black w-6 h-5 rounded-sm flex items-center justify-center tabular-nums ${
                isWinnerA
                  ? 'bg-emerald-500 text-black font-black'
                  : isCompleted
                    ? 'bg-white/5 text-white/40'
                    : isReady
                      ? 'bg-[#D9232E]/20 text-[#D9232E] border border-[#D9232E]/40'
                      : 'bg-white/5 text-white/25'
              }`}
            >
              {isCompleted ? m.score_a : isReady ? m.score_a || 0 : '-'}
            </span>
          </div>
        </div>

        <div className="border-t border-[#F4F2ED]/08" />

        {/* Row 2: Participant B */}
        <div
          className={`h-[26px] px-2.5 pl-3 flex items-center justify-between transition-colors ${
            isWinnerB
              ? 'bg-emerald-500/15 text-emerald-200'
              : isCompleted && m.winner_tag
                ? 'text-[#F4F2ED]/40'
                : 'text-[#F4F2ED]'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 pr-1.5">
            <span
              className={`text-[9px] font-mono shrink-0 px-1 py-0.2 rounded-sm ${
                isWinnerB
                  ? 'bg-emerald-400/25 text-emerald-300 font-black'
                  : 'bg-white/5 text-[#A3A19A] font-bold'
              }`}
            >
              2
            </span>
            <span
              className={`text-xs truncate tracking-tight ${
                isWinnerB
                  ? 'font-bold text-emerald-300'
                  : isCompleted && m.winner_tag
                    ? 'font-medium text-[#F4F2ED]/40'
                    : 'font-bold text-[#F4F2ED]'
              }`}
            >
              {m.participant_b_name || 'Por definir'}
            </span>
            {isWinnerB && (
              <Crown className="w-3 h-3 text-[#C5A059] fill-[#C5A059] shrink-0 inline-block" />
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`text-xs font-mono font-black w-6 h-5 rounded-sm flex items-center justify-center tabular-nums ${
                isWinnerB
                  ? 'bg-emerald-500 text-black font-black'
                  : isCompleted
                    ? 'bg-white/5 text-white/40'
                    : isReady
                      ? 'bg-[#D9232E]/20 text-[#D9232E] border border-[#D9232E]/40'
                      : 'bg-white/5 text-white/25'
              }`}
            >
              {isCompleted ? m.score_b : isReady ? m.score_b || 0 : '-'}
            </span>
          </div>
        </div>

        {canManage && hasBoth && !isCompleted && (
          <button
            type="button"
            onClick={(e) => handleOpenReferee(e, m)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-sm bg-[#D9232E] text-white text-[9px] font-mono font-bold uppercase shadow-md cursor-pointer"
            title="Abrir marcador arbitral"
          >
            SCORE
          </button>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER 2: ARCHITECTURAL BROADCAST TREE VIEW
  // ==========================================
  const renderBracketColumns = (isStage: boolean = false) => {
    const innerRef = isStage ? stageInnerRef : normalInnerRef;
    const isCompact = isStage || cardDensity === 'compact';

    if (isStage) {
      return (
        <div className="w-full h-full flex flex-col justify-between overflow-hidden">
          <div ref={innerRef} className="relative w-full h-full flex flex-col justify-between">
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0"
              aria-hidden="true"
            >
              <defs>
                <filter id="laser-glow-stage" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="laser-active-stage" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D9232E" />
                  <stop offset="100%" stopColor="#C5A059" />
                </linearGradient>
                <linearGradient id="laser-winner-stage" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#C5A059" />
                </linearGradient>
              </defs>

              {connectorLines.map((line, idx) => {
                const isHovered =
                  hoveredMatchupId === line.fromId || hoveredMatchupId === line.toId;
                const isWinnerPath = line.hasWinner;

                return (
                  <g key={`bracket-conn-${line.fromId}-${line.toId}-${idx}`}>
                    {isHovered && (
                      <path
                        d={line.d}
                        fill="none"
                        stroke="url(#laser-active-stage)"
                        strokeWidth="5"
                        strokeOpacity="0.4"
                        filter="url(#laser-glow-stage)"
                      />
                    )}
                    <path
                      d={line.d}
                      fill="none"
                      stroke={
                        isHovered
                          ? 'url(#laser-active-stage)'
                          : isWinnerPath
                            ? 'url(#laser-winner-stage)'
                            : 'rgba(244, 242, 237, 0.14)'
                      }
                      strokeWidth={isHovered ? 2.5 : isWinnerPath ? 2 : 1.5}
                      strokeOpacity={isHovered ? 1 : isWinnerPath ? 0.85 : 0.4}
                    />
                    {isHovered && (
                      <circle r="3.5" fill="#C5A059" filter="url(#laser-glow-stage)">
                        <animateMotion dur="0.9s" repeatCount="indefinite" path={line.d} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            <div
              className="w-full h-full grid gap-3 md:gap-5 xl:gap-8 items-stretch relative z-10"
              style={{
                gridTemplateColumns: `repeat(${initialBracket.rounds.length}, minmax(0, 1fr))`,
              }}
            >
              {initialBracket.rounds.map((round, rIdx) => {
                const totalRounds = initialBracket.rounds.length;
                const isFinalRound = rIdx === totalRounds - 1;
                const isOctavosOrLarger = round.matchups.length >= 8;
                const pairs: MatchupItem[][] = [];
                if (isOctavosOrLarger) {
                  for (let i = 0; i < round.matchups.length; i += 2) {
                    pairs.push(round.matchups.slice(i, i + 2));
                  }
                }

                return (
                  <div key={round.id} className="flex flex-col h-full min-h-0">
                    <div className="py-1.5 px-3 rounded-sm border border-[#F4F2ED]/15 bg-[#121216] text-center shrink-0 mb-2">
                      <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                        {round.name}
                      </span>
                    </div>

                    <div
                      className={`flex-1 min-h-0 flex flex-col ${
                        isFinalRound ? 'justify-center' : 'justify-around'
                      } py-0.5`}
                    >
                      {isOctavosOrLarger
                        ? pairs.map((pair, pIdx) => (
                            <div key={`pair-${round.id}-${pIdx}`} className="flex flex-col gap-1.5">
                              {pair.map((m) => renderCompactCard(m, round.name, true))}
                            </div>
                          ))
                        : round.matchups.map((m) => renderCompactCard(m, round.name, true))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    const baseColWidth = isCompact ? 290 : 340;
    const colWidth = Math.round(baseColWidth * (treeZoom / 100));
    const gapWidth = Math.round((isCompact ? 38 : 46) * (treeZoom / 100));
    const totalMinWidth = Math.max(initialBracket.rounds.length * (colWidth + gapWidth), 860);

    return (
      <div className="overflow-x-auto pb-6 scrollbar-thin">
        <div
          ref={innerRef}
          className="relative min-w-max py-2"
          style={{ minWidth: `${totalMinWidth}px` }}
        >
          <svg
            className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0"
            aria-hidden="true"
          >
            <defs>
              <filter id="laser-glow-normal" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="laser-active-normal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D9232E" />
                <stop offset="100%" stopColor="#C5A059" />
              </linearGradient>
              <linearGradient id="laser-winner-normal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#C5A059" />
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
                      stroke="url(#laser-active-normal)"
                      strokeWidth="5"
                      strokeOpacity="0.4"
                      filter="url(#laser-glow-normal)"
                    />
                  )}
                  <path
                    d={line.d}
                    fill="none"
                    stroke={
                      isHovered
                        ? 'url(#laser-active-normal)'
                        : isWinnerPath
                          ? 'url(#laser-winner-normal)'
                          : 'rgba(244, 242, 237, 0.14)'
                    }
                    strokeWidth={isHovered ? 2.5 : isWinnerPath ? 2 : 1.5}
                    strokeOpacity={isHovered ? 1 : isWinnerPath ? 0.85 : 0.4}
                  />
                  {isHovered && (
                    <circle r="3.5" fill="#C5A059" filter="url(#laser-glow-normal)">
                      <animateMotion dur="0.9s" repeatCount="indefinite" path={line.d} />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          <div
            className="min-w-full grid items-stretch relative z-10"
            style={{
              gridTemplateColumns: `repeat(${initialBracket.rounds.length}, minmax(${colWidth}px, 1fr))`,
              gap: `${gapWidth}px`,
            }}
          >
            {initialBracket.rounds.map((round, rIdx) => (
              <div key={round.id} className="space-y-4">
                <div className="p-3 rounded-sm border text-center bg-[var(--bg-card)] border-[var(--border-card)] flex items-center justify-between px-4">
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    0{rIdx + 1}
                  </span>
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    {round.name}
                  </span>
                  <span className="font-mono text-[10px] text-[#C5A059]">
                    {round.matchups.length}M
                  </span>
                </div>

                <div className="space-y-4 flex flex-col justify-around min-h-[420px]">
                  {round.matchups.map((m) => {
                    if (isCompact) {
                      return renderCompactCard(m, round.name, false);
                    }

                    const isCompleted = m.status === 'COMPLETED' || m.status === 'WALKOVER';
                    const isReady = m.status === 'READY';
                    const isFinal = !m.next_matchup_id;
                    const hasBoth = Boolean(m.participant_a_tag && m.participant_b_tag);
                    const isCardHovered = hoveredMatchupId === m.id;

                    return (
                      <div
                        key={m.id}
                        id={`matchup-card-${m.id}`}
                        onClick={() => handleMatchupClick(m, round.name)}
                        onMouseEnter={() => {
                          setHoveredMatchupId(m.id);
                          sounds.playClick();
                        }}
                        onMouseLeave={() => setHoveredMatchupId(null)}
                        className={`relative p-4 rounded-sm border transition-all duration-200 select-none cursor-pointer group ${
                          isFinal
                            ? 'bg-[#121216] border-[#C5A059]/80 hover:border-[#C5A059]'
                            : isCardHovered
                              ? 'bg-[var(--bg-card-hover)] border-[#D9232E]'
                              : isCompleted
                                ? 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[#F4F2ED]/35'
                                : isReady
                                  ? 'bg-[var(--bg-card)] border-[#D9232E]/70 hover:border-[#D9232E]'
                                  : 'bg-[var(--bg-card)]/70 border-[var(--border-card)] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2.5 font-mono text-[10px] uppercase tracking-wider">
                          <span className="text-[var(--text-muted)] font-bold">
                            SERIE #{m.position}
                          </span>

                          {isCompleted ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              CONCLUIDO
                            </span>
                          ) : isReady ? (
                            <span className="text-[#D9232E] flex items-center gap-1 font-bold animate-pulse">
                              <Flame className="w-3 h-3" />
                              EN DISPUTA
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">TBD</span>
                          )}
                        </div>

                        {/* Participant A */}
                        <div
                          className={`p-2.5 rounded-sm flex items-center justify-between transition-colors ${
                            m.winner_tag && m.winner_tag === m.participant_a_tag
                              ? 'bg-emerald-500/15 border border-emerald-500/35'
                              : 'bg-[var(--bg-arena)] border border-[var(--border-card)]'
                          }`}
                        >
                          <div className="space-y-0.5 truncate pr-2">
                            <p
                              className={`truncate text-xs font-bold ${
                                m.winner_tag === m.participant_a_tag
                                  ? 'text-emerald-300 font-black'
                                  : 'text-[var(--text-primary)]'
                              }`}
                            >
                              {m.participant_a_name || 'TBD (Por definir)'}
                            </p>
                            {m.participant_a_tag && (
                              <p className="text-[var(--text-muted)] font-mono text-[10px]">
                                {m.participant_a_tag}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {m.winner_tag && m.winner_tag === m.participant_a_tag && (
                              <Crown className="w-3.5 h-3.5 text-[#C5A059] fill-[#C5A059]" />
                            )}
                            <span className="font-mono font-black rounded-sm bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs px-2 py-0.5 tabular-nums">
                              {isCompleted ? m.score_a : '-'}
                            </span>
                          </div>
                        </div>

                        <div className="text-center font-mono text-[var(--text-muted)] font-bold my-1 text-[9px]">
                          VS
                        </div>

                        {/* Participant B */}
                        <div
                          className={`p-2.5 rounded-sm flex items-center justify-between transition-colors ${
                            m.winner_tag && m.winner_tag === m.participant_b_tag
                              ? 'bg-emerald-500/15 border border-emerald-500/35'
                              : 'bg-[var(--bg-arena)] border border-[var(--border-card)]'
                          }`}
                        >
                          <div className="space-y-0.5 truncate pr-2">
                            <p
                              className={`truncate text-xs font-bold ${
                                m.winner_tag === m.participant_b_tag
                                  ? 'text-emerald-300 font-black'
                                  : 'text-[var(--text-primary)]'
                              }`}
                            >
                              {m.participant_b_name || 'TBD (Por definir)'}
                            </p>
                            {m.participant_b_tag && (
                              <p className="text-[var(--text-muted)] font-mono text-[10px]">
                                {m.participant_b_tag}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {m.winner_tag && m.winner_tag === m.participant_b_tag && (
                              <Crown className="w-3.5 h-3.5 text-[#C5A059] fill-[#C5A059]" />
                            )}
                            <span className="font-mono font-black rounded-sm bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs px-2 py-0.5 tabular-nums">
                              {isCompleted ? m.score_b : '-'}
                            </span>
                          </div>
                        </div>

                        {canManage && hasBoth && !isCompleted && (
                          <div className="mt-2.5 pt-2 border-t border-[var(--border-card)] flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">
                              ARBITRAJE
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleOpenReferee(e, m)}
                              className="btn-primary py-1 px-2.5 text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
                            >
                              <Swords className="w-3 h-3" />
                              <span>SCORE</span>
                            </button>
                          </div>
                        )}

                        {isFinal && isCompleted && (
                          <div className="mt-2.5 p-1.5 rounded-sm bg-[#C5A059]/20 border border-[#C5A059]/40 text-center flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold uppercase text-[#C5A059]">
                            <Trophy className="w-3.5 h-3.5" />
                            <span>CAMPEÓN: {m.winner_name}</span>
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
      {/* Header Control Bar */}
      <div className="double-bezel">
        <div className="double-bezel-inner flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-sm bg-[#D9232E]/15 text-[#D9232E] flex items-center justify-center shrink-0 border border-[#D9232E]/30">
              <BracketTreeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold uppercase text-[var(--text-primary)] tracking-tight">
                CUADRO OFICIAL DE LLAVES
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                SINCRONIZACIÓN EN VIVO • SELECCIONA CUALQUIER SERIE PARA INSPECCIÓN O ARBITRAJE
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Mode Switcher: Rounds vs Tree */}
            <div className="bg-[var(--bg-arena)] p-1 rounded-sm border border-[var(--border-card)] flex items-center">
              <button
                type="button"
                onClick={() => {
                  setViewMode('ROUNDS');
                  sounds.playClick();
                }}
                className={`px-3 py-1.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'ROUNDS'
                    ? 'bg-[#D9232E] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>POR FASES</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('TREE');
                  sounds.playClick();
                }}
                className={`px-3 py-1.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'TREE'
                    ? 'bg-[#D9232E] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>ÁRBOL COMPLETO</span>
              </button>
            </div>

            {/* Density Switcher */}
            {viewMode === 'TREE' && (
              <button
                type="button"
                onClick={() => {
                  setCardDensity((d) => (d === 'compact' ? 'detailed' : 'compact'));
                  sounds.playClick();
                }}
                className={`px-3 py-2 rounded-sm font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                  cardDensity === 'compact'
                    ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/35'
                    : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] border-[var(--border-card)]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {cardDensity === 'compact' ? 'COMPACTO' : 'DETALLADO'}
                </span>
              </button>
            )}

            {/* Zoom Controls */}
            {viewMode === 'TREE' && (
              <div className="bg-[var(--bg-arena)] p-1 rounded-sm border border-[var(--border-card)] flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTreeZoom((z) => Math.max(z - 15, 75))}
                  disabled={treeZoom <= 75}
                  className="p-1.5 rounded-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                  title="Alejar"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTreeZoom(100)}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer tabular-nums"
                >
                  {treeZoom}%
                </button>
                <button
                  type="button"
                  onClick={() => setTreeZoom((z) => Math.min(z + 15, 135))}
                  disabled={treeZoom >= 135}
                  className="p-1.5 rounded-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                  title="Acercar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {onToggleFullWidth && (
              <button
                type="button"
                onClick={onToggleFullWidth}
                className="btn-secondary px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Columns2 className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="hidden sm:inline">
                  {isFullWidth ? 'VISTA DIVIDIDA' : '100% ANCHO'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={enterStageMode}
              className="btn-primary px-3.5 py-2 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>MODO ESCENARIO / OBS</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW RENDER */}
      {viewMode === 'ROUNDS' ? renderRoundsView() : renderBracketColumns(false)}

      {/* FULLSCREEN STAGE / OBS MODE OVERLAY */}
      {isStageMode && (
        <div className="fixed inset-0 z-50 bg-[#070709] text-[#F4F2ED] flex flex-col h-screen max-h-screen overflow-hidden select-none animate-in fade-in">
          <div className="relative z-10 flex items-center justify-between px-6 py-2.5 border-b border-[#F4F2ED]/12 shrink-0 bg-[#09090C]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-sm bg-[#D9232E] flex items-center justify-center font-black">
                <BracketTreeIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-base font-bold text-[#F4F2ED] tracking-tight uppercase">
                  CAMPUS <span className="text-[#D9232E]">ARENA</span>
                </h1>
                <span className="text-[9px] px-2 py-0.5 rounded-sm bg-[#D9232E] text-white uppercase font-mono font-bold flex items-center gap-1.5">
                  <LiveWaveformIcon className="w-3 h-3 text-white" />
                  OBS BROADCAST FEED
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyObsUrl}
                className="px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase border border-[#C5A059]/40 bg-[#C5A059]/15 text-[#C5A059] flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">COPIAR URL OBS</span>
              </button>

              <button
                type="button"
                onClick={toggleNativeFullscreen}
                className="p-1.5 rounded-sm border border-[#F4F2ED]/15 bg-white/5 hover:bg-white/10 text-white cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={exitStageMode}
                className="btn-secondary px-3 py-1.5 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>SALIR (ESC)</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 flex-1 min-h-0 w-full p-4 md:p-6 overflow-hidden flex flex-col justify-center">
            {renderBracketColumns(true)}
          </div>

          <div className="relative z-10 flex items-center justify-between px-6 py-1.5 border-t border-[#F4F2ED]/10 text-[10px] font-mono uppercase tracking-[0.18em] text-[#A3A19A] bg-[#09090C] shrink-0">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
              <span>SEÑAL SINCRONIZADA EN TIEMPO REAL • 1920x1080 STAGE FIT</span>
            </span>
            <span className="hidden sm:inline">PRESIONA ESC PARA SALIR • TECSUP ESPORTS CIRCUIT</span>
          </div>
        </div>
      )}

      {/* REFEREE SCORE REPORTING MODAL WITH 1-CLICK PRESETS */}
      {selectedMatchup && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative w-full max-w-lg double-bezel">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#D9232E]">
                  <Swords className="w-4 h-4" />
                  <span>CONSOLA DE ARBITRAJE // SERIE #{selectedMatchup.position}</span>
                </div>
                <button
                  onClick={() => setSelectedMatchup(null)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-2xl font-bold uppercase text-[var(--text-primary)]">
                  ACTA OFICIAL DE RESULTADO
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Registra el marcador final o usa los botones rápidos de serie. El ganador avanza
                  automáticamente en la llave.
                </p>
              </div>

              {/* 1-Click Series Score Presets */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] block">
                  MARCADORES RÁPIDOS (BO3 / BO5):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { a: 2, b: 0, label: '2 - 0' },
                    { a: 2, b: 1, label: '2 - 1' },
                    { a: 1, b: 2, label: '1 - 2' },
                    { a: 0, b: 2, label: '0 - 2' },
                    { a: 3, b: 0, label: '3 - 0' },
                    { a: 3, b: 2, label: '3 - 2' },
                  ].map((preset) => {
                    const active = scoreA === preset.a && scoreB === preset.b;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyQuickScorePreset(preset.a, preset.b)}
                        className={`py-2 rounded-sm font-mono text-xs font-bold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#D9232E] text-white border-[#D9232E]'
                            : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] border-[var(--border-card)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmitResult} className="space-y-5">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)]">
                  <div className="space-y-2.5 text-center">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {selectedMatchup.participant_a_name}
                    </p>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={scoreA}
                      onChange={(e) => setScoreA(Number(e.target.value))}
                      className="input-arena text-center text-3xl font-black font-mono py-2.5 bg-[var(--bg-card)] tabular-nums"
                    />
                    <label className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] cursor-pointer pt-1">
                      <input
                        type="radio"
                        name="winner"
                        checked={selectedWinnerTag === selectedMatchup.participant_a_tag}
                        onChange={() => setSelectedWinnerTag(selectedMatchup.participant_a_tag!)}
                        className="accent-[#D9232E]"
                      />
                      <span>GANADOR A</span>
                    </label>
                  </div>

                  <div className="space-y-2.5 text-center">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {selectedMatchup.participant_b_name}
                    </p>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={scoreB}
                      onChange={(e) => setScoreB(Number(e.target.value))}
                      className="input-arena text-center text-3xl font-black font-mono py-2.5 bg-[var(--bg-card)] tabular-nums"
                    />
                    <label className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] cursor-pointer pt-1">
                      <input
                        type="radio"
                        name="winner"
                        checked={selectedWinnerTag === selectedMatchup.participant_b_tag}
                        onChange={() => setSelectedWinnerTag(selectedMatchup.participant_b_tag!)}
                        className="accent-[#D9232E]"
                      />
                      <span>GANADOR B</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isWalkover}
                    onChange={(e) => setIsWalkover(e.target.checked)}
                    className="rounded-sm accent-[#D9232E]"
                  />
                  <span>Victoria por Walkover (W.O. / Inasistencia reglamentaria)</span>
                </label>

                {feedback && (
                  <div className="p-3 rounded-sm bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-mono font-bold text-center">
                    {feedback}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMatchup(null)}
                    className="btn-secondary py-3 text-xs font-mono font-bold uppercase tracking-wider text-center cursor-pointer"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary py-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>CONFIRMAR ACTA</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CINEMATIC MATCHUP VS MODAL */}
      <MatchupModal
        isOpen={Boolean(matchupForModal)}
        onClose={() => setMatchupForModal(null)}
        tournamentName="Torneo Campus Arena"
        roundName={matchupForModal?.roundName}
        status={
          matchupForModal?.matchup.status === 'COMPLETED'
            ? 'FINISHED'
            : matchupForModal?.matchup.status === 'READY'
              ? 'IN_PROGRESS'
              : 'SCHEDULED'
        }
        player1={
          matchupForModal
            ? {
                name: matchupForModal.matchup.participant_a_name || 'Por Definir',
                tag: matchupForModal.matchup.participant_a_tag || undefined,
                score:
                  matchupForModal.matchup.status === 'COMPLETED'
                    ? matchupForModal.matchup.score_a
                    : undefined,
                is_winner:
                  matchupForModal.matchup.winner_tag === matchupForModal.matchup.participant_a_tag,
              }
            : null
        }
        player2={
          matchupForModal
            ? {
                name: matchupForModal.matchup.participant_b_name || 'Por Definir',
                tag: matchupForModal.matchup.participant_b_tag || undefined,
                score:
                  matchupForModal.matchup.status === 'COMPLETED'
                    ? matchupForModal.matchup.score_b
                    : undefined,
                is_winner:
                  matchupForModal.matchup.winner_tag === matchupForModal.matchup.participant_b_tag,
              }
            : null
        }
      />
    </div>
  );
}
