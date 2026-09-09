'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Trophy, 
  Swords, 
  Flame, 
  CheckCircle2, 
  Loader2, 
  X, 
  Crown, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Tv
} from 'lucide-react';

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
  
  // Referee modal state
  const [selectedMatchup, setSelectedMatchup] = useState<MatchupItem | null>(null);
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

  const handleGenerateBrackets = async (seedingMethod: 'RANDOM' | 'BY_TROPHIES' = 'BY_TROPHIES') => {
    setIsGenerating(true);
    setGenError(null);
    try {
      const res = await api.post(`/tournaments/${tournamentId}/generate-bracket`, {
        seeding_method: seedingMethod,
      });
      if (res.success) {
        onUpdate();
      } else {
        setGenError(res.error?.message || 'Error al generar llaves.');
      }
    } catch (err: any) {
      setGenError(err.message || 'Error de conexión.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!initialBracket || !initialBracket.rounds || initialBracket.rounds.length === 0) {
    return (
      <div className="arena-card p-10 sm:p-14 text-center space-y-5 border border-white/10 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#E63946]/15 border border-[#E63946]/30 text-[#E63946] flex items-center justify-center mx-auto shadow-lg shadow-[#E63946]/10">
          <Swords className="w-8 h-8" />
        </div>
        
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-lg font-black text-white">Llaves de Competición en Espera</h3>
          <p className="text-xs text-[#8E92A4] leading-relaxed">
            El sorteo oficial y la estructura de emparejamientos se generarán con los competidores confirmados una vez cerradas las inscripciones.
          </p>
        </div>

        {genError && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold max-w-md mx-auto">
            {genError}
          </div>
        )}

        {canManage && (
          <div className="pt-4 border-t border-white/5 max-w-md mx-auto space-y-3">
            <span className="text-[11px] font-bold text-[#A8DADC] uppercase tracking-wider block">
              🛡️ Herramientas de Organizador / Administrador
            </span>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => handleGenerateBrackets('BY_TROPHIES')}
                disabled={isGenerating}
                className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generar Llaves (Por Copas)
              </button>
              <button
                onClick={() => handleGenerateBrackets('RANDOM')}
                disabled={isGenerating}
                className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Swords className="w-4 h-4 text-[#E63946]" />
                Sorteo Aleatorio
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleMatchupClick = (matchup: MatchupItem) => {
    // Only allow reporting if matchup is ready or in progress or already has both players
    if (matchup.participant_a_tag && matchup.participant_b_tag && matchup.status !== 'COMPLETED') {
      setSelectedMatchup(matchup);
      setScoreA(2);
      setScoreB(0);
      setSelectedWinnerTag(matchup.participant_a_tag);
      setIsWalkover(false);
      setFeedback(null);
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
      setFeedback(res.data?.message || '¡Resultado guardado!');
      setTimeout(() => {
        setSelectedMatchup(null);
        onUpdate();
      }, 1200);
    } else {
      setFeedback(res.error?.message || 'Error al guardar el resultado.');
    }

    setIsSubmitting(false);
  };

  const renderBracketColumns = (isStage: boolean = false) => (
    <div className="overflow-x-auto pb-6">
      <div 
        className="min-w-full grid gap-6 sm:gap-8 items-center"
        style={{ gridTemplateColumns: `repeat(${initialBracket.rounds.length}, minmax(280px, 1fr))` }}
      >
        {initialBracket.rounds.map((round) => (
          <div key={round.id} className="space-y-4">
            
            {/* Round Title */}
            <div className={`p-3 rounded-xl border text-center ${
              isStage 
                ? 'bg-[#1D3557]/40 border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
                : 'bg-[#15161E] border-white/10'
            }`}>
              <span className="text-xs font-black uppercase tracking-wider text-[#A8DADC]">
                {round.name}
              </span>
            </div>

            {/* Matchups in this Round */}
            <div className="space-y-6 flex flex-col justify-around min-h-[380px]">
              {round.matchups.map((m) => {
                const isCompleted = m.status === 'COMPLETED' || m.status === 'WALKOVER';
                const isReady = m.status === 'READY';
                const isFinal = !m.next_matchup_id;
                const hasBoth = Boolean(m.participant_a_tag && m.participant_b_tag);

                return (
                  <div
                    key={m.id}
                    onClick={() => handleMatchupClick(m)}
                    className={`relative rounded-xl p-3.5 border transition-all select-none ${
                      isFinal
                        ? 'bg-gradient-to-b from-[#1D3557]/40 to-[#0B0C10] border-amber-400/50 shadow-xl shadow-amber-500/10'
                        : isCompleted
                        ? 'bg-[#0B0C10] border-white/10 opacity-90'
                        : isReady
                        ? 'bg-[#15161E] border-[#E63946]/40 hover:border-[#E63946] cursor-pointer shadow-lg shadow-[#E63946]/10 group'
                        : 'bg-[#0B0C10]/60 border-white/5 opacity-60'
                    }`}
                  >
                    {/* Top status indicator */}
                    <div className="flex items-center justify-between mb-2 text-[10px] font-mono">
                      <span className="text-[#8E92A4]">Match #{m.position}</span>
                      
                      {isCompleted ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Finalizado
                        </span>
                      ) : isReady ? (
                        <span className="text-[#E63946] flex items-center gap-1 font-bold animate-pulse">
                          <Flame className="w-3 h-3" />
                          Listo / En Juego
                        </span>
                      ) : (
                        <span className="text-[#5A5E73]">Esperando rival</span>
                      )}
                    </div>

                    {/* Participant A */}
                    <div className={`p-2 rounded-lg flex items-center justify-between transition-colors ${
                      m.winner_tag && m.winner_tag === m.participant_a_tag
                        ? 'bg-emerald-500/15 border border-emerald-500/30'
                        : 'bg-[#0B0C10]'
                    }`}>
                      <div className="space-y-0.5 truncate pr-2">
                        <p className={`text-xs font-bold truncate ${
                          m.winner_tag === m.participant_a_tag ? 'text-emerald-300' : 'text-white'
                        }`}>
                          {m.participant_a_name || 'TBD (Por definir)'}
                        </p>
                        {m.participant_a_tag && (
                          <p className="text-[10px] text-[#8E92A4] font-mono">{m.participant_a_tag}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.winner_tag && m.winner_tag === m.participant_a_tag && (
                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        )}
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-white">
                          {isCompleted ? m.score_a : '-'}
                        </span>
                      </div>
                    </div>

                    {/* VS divider */}
                    <div className="text-center my-1 text-[9px] font-mono text-[#5A5E73]">VS</div>

                    {/* Participant B */}
                    <div className={`p-2 rounded-lg flex items-center justify-between transition-colors ${
                      m.winner_tag && m.winner_tag === m.participant_b_tag
                        ? 'bg-emerald-500/15 border border-emerald-500/30'
                        : 'bg-[#0B0C10]'
                    }`}>
                      <div className="space-y-0.5 truncate pr-2">
                        <p className={`text-xs font-bold truncate ${
                          m.winner_tag === m.participant_b_tag ? 'text-emerald-300' : 'text-white'
                        }`}>
                          {m.participant_b_name || 'TBD (Por definir)'}
                        </p>
                        {m.participant_b_tag && (
                          <p className="text-[10px] text-[#8E92A4] font-mono">{m.participant_b_tag}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.winner_tag && m.winner_tag === m.participant_b_tag && (
                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        )}
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-white">
                          {isCompleted ? m.score_b : '-'}
                        </span>
                      </div>
                    </div>

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
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0B0C10] p-4 sm:p-5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E63946]/20 text-[#E63946] flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Llaves Oficiales de Eliminación Directa</h3>
            <p className="text-xs text-[#8E92A4]">Formato BO3 • Haz clic en un enfrentamiento para ver detalles o registrar marcadores</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStageMode(true)}
            className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer text-[#A8DADC] border-[#457B9D]/30"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Modo Escenario / OBS
          </button>

          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            En Vivo
          </span>
        </div>
      </div>

      {/* NORMAL BRACKET RENDER */}
      {renderBracketColumns(false)}

      {/* FULLSCREEN STAGE / OBS MODE OVERLAY */}
      {isStageMode && (
        <div className="fixed inset-0 z-50 bg-[#07080B] text-white p-6 sm:p-10 flex flex-col justify-between overflow-y-auto animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E63946] to-[#1D3557] flex items-center justify-center font-black">
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
            <span>🔴 En Vivo por Kick & TikTok Live</span>
            <span>Tecsup Sede Lima • Esports Engine</span>
          </div>
        </div>
      )}

      {/* REFEREE SCORE REPORTING MODAL */}
      {selectedMatchup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md arena-card p-6 sm:p-8 bg-[#15161E] border border-white/10 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#E63946]">
                <Swords className="w-4 h-4" />
                <span>Panel de Arbitraje Oficial</span>
              </div>
              <button
                onClick={() => setSelectedMatchup(null)}
                className="text-[#8E92A4] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-base font-black text-white">
                Match #{selectedMatchup.position} — Registro de Marcador
              </h3>
              <p className="text-xs text-[#8E92A4]">
                Ingresa el resultado de la serie Bo3. El ganador avanzará automáticamente a la siguiente ronda.
              </p>
            </div>

            <form onSubmit={handleSubmitResult} className="space-y-5">
              
              {/* Score Input Matrix */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#0B0C10] border border-white/5">
                
                <div className="space-y-2 text-center">
                  <p className="text-xs font-bold text-white truncate">
                    {selectedMatchup.participant_a_name}
                  </p>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={scoreA}
                    onChange={(e) => setScoreA(Number(e.target.value))}
                    className="input-arena text-center text-2xl font-black font-mono py-2"
                  />
                  <label className="flex items-center justify-center gap-1.5 text-xs text-[#8E92A4] cursor-pointer pt-1">
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
                  <p className="text-xs font-bold text-white truncate">
                    {selectedMatchup.participant_b_name}
                  </p>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={scoreB}
                    onChange={(e) => setScoreB(Number(e.target.value))}
                    className="input-arena text-center text-2xl font-black font-mono py-2"
                  />
                  <label className="flex items-center justify-center gap-1.5 text-xs text-[#8E92A4] cursor-pointer pt-1">
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

    </div>
  );
}
