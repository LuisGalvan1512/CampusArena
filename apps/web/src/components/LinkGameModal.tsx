'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { 
  X, 
  Swords, 
  Gamepad2, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Trophy, 
  Flame, 
  ArrowRight,
  Zap,
  Crosshair,
  CircleDot,
  Wifi,
  PenTool,
  Clock,
  Award,
} from 'lucide-react';
import { GAME_LIST, type GameCode, type GameDefinition } from '@/lib/games';

interface LinkGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  alreadyLinkedGames: string[];
}

interface VerifiedPlayer {
  game_code: string;
  game_name: string;
  player_tag: string;
  in_game_name: string;
  trophies: number;
  level: number;
  arena_or_club: string;
  extra_data?: Record<string, unknown>;
}

const GAME_ICON_MAP: Record<string, React.ReactNode> = {
  Swords: <Swords className="w-5 h-5" />,
  Gamepad2: <Gamepad2 className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Crosshair: <Crosshair className="w-5 h-5" />,
  CircleDot: <CircleDot className="w-5 h-5" />,
};

export function LinkGameModal({
  isOpen,
  onClose,
  onSuccess,
  alreadyLinkedGames,
}: LinkGameModalProps) {
  const [selectedGame, setSelectedGame] = useState<GameCode>('CLASH_ROYALE');
  const [playerTag, setPlayerTag] = useState('');
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [verifiedPlayer, setVerifiedPlayer] = useState<VerifiedPlayer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentGame = GAME_LIST.find(g => g.code === selectedGame)!;
  const isApiGame = currentGame.tagType === 'supercell' || currentGame.tagType === 'steam';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setVerifiedPlayer(null);

    let cleanTag = playerTag.trim();

    setIsVerifying(true);

    const body: Record<string, unknown> = {
      game_code: selectedGame,
      player_tag: cleanTag,
    };

    // Add extra fields for manual games
    if (currentGame.extraFields && currentGame.extraFields.length > 0) {
      const extra: Record<string, string> = {};
      for (const field of currentGame.extraFields) {
        if (extraFields[field.key]) {
          extra[field.key] = extraFields[field.key];
        }
      }
      body.extra_data = extra;
    }

    const res = await api.post('/profile/games/verify', body);

    if (res.success && res.data) {
      setVerifiedPlayer(res.data);
    } else {
      setErrorMessage(res.error?.message || 'No se pudo verificar la cuenta.');
    }

    setIsVerifying(false);
  };

  const handleConfirmLink = async () => {
    if (!verifiedPlayer) return;

    setIsLinking(true);
    setErrorMessage(null);

    const body: Record<string, unknown> = {
      game_code: verifiedPlayer.game_code,
      player_tag: verifiedPlayer.player_tag,
    };

    if (currentGame.extraFields && currentGame.extraFields.length > 0) {
      const extra: Record<string, string> = {};
      for (const field of currentGame.extraFields) {
        if (extraFields[field.key]) {
          extra[field.key] = extraFields[field.key];
        }
      }
      body.extra_data = extra;
    }

    const res = await api.post('/profile/games', body);

    if (res.success) {
      onSuccess();
      handleClose();
    } else {
      setErrorMessage(res.error?.message || 'Error al vincular la cuenta.');
    }

    setIsLinking(false);
  };

  const handleClose = () => {
    setPlayerTag('');
    setExtraFields({});
    setVerifiedPlayer(null);
    setErrorMessage(null);
    onClose();
  };

  const handleSelectGame = (code: GameCode) => {
    setSelectedGame(code);
    setVerifiedPlayer(null);
    setPlayerTag('');
    setExtraFields({});
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg arena-card p-6 sm:p-8 bg-[#15161E] border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[#8E92A4] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Integración Multi-Juego
          </div>
          <h3 className="text-2xl font-black text-white">
            Vincular Cuenta de Juego
          </h3>
          <p className="text-xs text-[#8E92A4]">
            Conecta tu cuenta para inscribirte a torneos y sincronizar tus estadísticas.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-[#E63946]/10 border border-[#E63946]/30 flex items-start gap-2.5 text-xs text-[#E63946]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Game Selector — 5 Games */}
        {!verifiedPlayer && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
              1. Selecciona el Videojuego
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GAME_LIST.map((game) => {
                const isLinked = alreadyLinkedGames.includes(game.code);
                const isSelected = selectedGame === game.code;
                
                return (
                  <button
                    key={game.code}
                    type="button"
                    onClick={() => handleSelectGame(game.code)}
                    disabled={isLinked}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'shadow-lg'
                        : 'bg-[#0B0C10] border-white/10 hover:border-white/20'
                    } ${isLinked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={isSelected ? {
                      backgroundColor: `${game.color}20`,
                      borderColor: game.color,
                      boxShadow: `0 4px 15px ${game.shadowColor}`,
                    } : {}}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5"
                      style={{ backgroundColor: `${game.color}30` }}
                    >
                      <span style={{ color: game.color }}>
                        {GAME_ICON_MAP[game.iconName]}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{game.shortName === 'SSBU' ? 'Smash Bros' : game.shortName === 'L4D2' ? 'L4D2' : game.shortName === 'eFB' ? 'eFootball' : game.name}</p>
                    <p className="text-[10px] text-[#5A5E73] truncate">
                      {game.tagType === 'supercell' || game.tagType === 'steam' ? '🔗 API' : '✏️ Manual'}
                    </p>
                    {isLinked && (
                      <span className="text-[9px] font-bold text-emerald-400 block mt-0.5">Ya vinculado</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Step 2: Tag / Username Input */}
            <form onSubmit={handleVerify} className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                  2. Ingresa tu {currentGame.tagLabel}
                </label>
                <input
                  type="text"
                  required
                  value={playerTag}
                  onChange={(e) => setPlayerTag(
                    currentGame.tagType === 'supercell' ? e.target.value.toUpperCase() : e.target.value
                  )}
                  placeholder={`Ej. ${currentGame.tagPlaceholder}`}
                  className={`input-arena ${currentGame.tagType === 'supercell' ? 'font-mono uppercase tracking-wider' : ''}`}
                />
                <p className="text-[11px] text-[#5A5E73]">
                  {currentGame.tagType === 'supercell' && '💡 Encuentra tu Tag debajo de tu nombre en el perfil del juego.'}
                  {currentGame.tagType === 'steam' && '💡 Encuentra tu Steam ID en tu perfil de Steam o usa tu URL de perfil.'}
                  {currentGame.tagType === 'manual' && '💡 Ingresa el nombre con el que compites en este juego.'}
                </p>
              </div>

              {/* Extra Fields for Manual Games */}
              {currentGame.extraFields && currentGame.extraFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    required={field.required}
                    value={extraFields[field.key] || ''}
                    onChange={(e) => setExtraFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="input-arena"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={isVerifying || !playerTag}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isApiGame ? 'Consultando API oficial...' : 'Registrando cuenta...'}
                  </>
                ) : (
                  <>
                    {isApiGame ? <Search className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isApiGame ? `Verificar ${currentGame.tagLabel}` : 'Registrar Cuenta'}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Verified Player Preview & Confirmation */}
        {verifiedPlayer && (
          <div className="space-y-6 animate-fade-in-up">
            <div 
              className="p-5 rounded-xl bg-[#0B0C10] border space-y-4"
              style={{ borderColor: `${currentGame.color}50` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: currentGame.color === '#4CAF50' ? '#4CAF50' : '#34D399' }}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isApiGame ? `Jugador Encontrado en ${verifiedPlayer.game_name}` : `Cuenta Registrada — ${verifiedPlayer.game_name}`}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-[#A8DADC]">
                  {verifiedPlayer.player_tag}
                </span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div 
                  className={`w-14 h-14 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white font-black text-xl shadow-lg ${currentGame.bgGradient}`}
                >
                  {verifiedPlayer.in_game_name[0]}
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">
                    {verifiedPlayer.in_game_name}
                  </h4>
                  <p className="text-xs text-[#8E92A4]">
                    {verifiedPlayer.arena_or_club}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
                <div className="p-2.5 bg-[#15161E] rounded-lg border border-white/5">
                  <p className="text-base font-bold text-amber-400 flex items-center justify-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    {verifiedPlayer.trophies.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#5A5E73] uppercase mt-0.5">{currentGame.statLabel}</p>
                </div>

                <div className="p-2.5 bg-[#15161E] rounded-lg border border-white/5">
                  <p className="text-base font-bold text-white flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5" style={{ color: currentGame.color }} />
                    {verifiedPlayer.level > 0 ? `Nivel ${verifiedPlayer.level}` : currentGame.badge}
                  </p>
                  <p className="text-[10px] text-[#5A5E73] uppercase mt-0.5">
                    {verifiedPlayer.level > 0 ? 'Nivel de Cuenta' : 'Modalidad'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-center text-[#8E92A4]">
                ¿Confirmas que esta es tu cuenta oficial de juego?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVerifiedPlayer(null)}
                  className="btn-secondary py-2.5 text-xs text-center cursor-pointer"
                >
                  Volver a buscar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLink}
                  disabled={isLinking}
                  className="btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Vinculando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sí, vincular cuenta
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
