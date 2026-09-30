'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
  Swords, 
  Gamepad2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  QrCode, 
  UploadCloud, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Trophy,
  ExternalLink,
  Users
} from 'lucide-react';

import { uploadPaymentVoucher } from '@/lib/storage';
import { GAME_CATALOG, GameCode } from '@/lib/games';

interface GameProfile {
  id: string;
  game_code: string;
  game_name?: string;
  player_tag: string;
  in_game_name: string;
  trophies: number;
}

interface RegistrationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: {
    id: string;
    name: string;
    game_code: string;
    cost: number | string;
    currency: string;
    prize_pool: string;
    rules_text: string;
    team_size?: number;
  };
  onSuccess: () => void;
}

export function RegistrationWizardModal({
  isOpen,
  onClose,
  tournament,
  onSuccess,
}: RegistrationWizardModalProps) {
  const { user } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [gameProfiles, setGameProfiles] = useState<GameProfile[]>([]);
  const [selectedGameProfileId, setSelectedGameProfileId] = useState<string>('');
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'YAPE' | 'PLIN' | 'TRANSFER'>('YAPE');
  const [operationReference, setOperationReference] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [manualTag, setManualTag] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Dynamic Team / Squad registration state
  const teamSize = Number(tournament.team_size) || (tournament.game_code === 'DOTA_2' ? 5 : tournament.game_code === 'LEFT_4_DEAD_2' ? 4 : 1);
  const isTeamTournament = teamSize > 1;
  const defaultTeammateCount = Math.max(1, teamSize - 1);
  const [teamName, setTeamName] = useState('');
  const [teamEmblem, setTeamEmblem] = useState('🐉');
  const [rosterMembers, setRosterMembers] = useState<{ name: string; email: string; player_tag: string; role: string }[]>([]);

  useEffect(() => {
    if (isOpen && isTeamTournament) {
      const initial = Array.from({ length: defaultTeammateCount }, (_, i) => ({
        name: '',
        email: '',
        player_tag: '',
        role: `Compañero ${i + 1}`,
      }));
      setRosterMembers(initial);
    }
  }, [isOpen, defaultTeammateCount, isTeamTournament]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  // Load user's linked game profiles
  useEffect(() => {
    if (isOpen) {
      const fetchProfiles = async () => {
        const res = await api.get('/profile/me');
        if (res.success && res.data?.game_profiles) {
          setGameProfiles(res.data.game_profiles);
          const matching = res.data.game_profiles.find(
            (gp: GameProfile) => gp.game_code === tournament.game_code
          );
          if (matching) {
            setSelectedGameProfileId(matching.id);
          }
        }
      };
      fetchProfiles();
    }
  }, [isOpen, tournament.game_code]);

  if (!isOpen) return null;

  const gameDef = GAME_CATALOG[tournament.game_code as GameCode];
  const gameName = gameDef?.name || (tournament.game_code === 'CLASH_ROYALE' ? 'Clash Royale' : 'Brawl Stars');
  const matchingGameProfile = gameProfiles.find(
    (gp) => gp.game_code === tournament.game_code
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (PNG, JPG o WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La imagen no debe superar los 5MB.');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setErrorMessage(null);

    setIsUploadingFile(true);
    const res = await uploadPaymentVoucher(file, user?.id || 'guest');
    setIsUploadingFile(false);

    if (res.url) {
      setEvidenceUrl(res.url);
    } else {
      setErrorMessage(res.error || 'No se pudo subir la imagen.');
    }
  };

  const handleCreateRegistration = async () => {
    setErrorMessage(null);

    if (isTeamTournament) {
      if (!teamName.trim()) {
        setErrorMessage('Debes ingresar el nombre oficial de tu escuadra o equipo.');
        return;
      }
      const invalid = rosterMembers.find(
        (m) => m.email.trim() && !m.email.trim().toLowerCase().endsWith('@tecsup.edu.pe')
      );
      if (invalid) {
        setErrorMessage(`El correo "${invalid.email}" de tu compañero debe ser institucional (@tecsup.edu.pe).`);
        return;
      }
    }

    setIsLoading(true);

    const payload: any = {
      game_profile_id: selectedGameProfileId,
      payment_method: paymentMethod,
      rules_version: 'v1.0',
    };

    if (isTeamTournament) {
      payload.team_name = teamName.trim();
      payload.roster_members = {
        team_emblem: teamEmblem,
        captain: {
          name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Capitán',
          email: user?.email,
          player_tag: matchingGameProfile?.player_tag || manualTag,
          avatar_url: user?.avatar_url || null,
          role: 'Capitán',
        },
        members: rosterMembers.filter((m) => m.name.trim() || m.email.trim()),
      };
    }

    const res = await api.post(`/tournaments/${tournament.id}/registrations`, payload);

    if (res.success && res.data) {
      setRegistrationResult(res.data);
      if (res.data.is_free) {
        setStep(4);
        onSuccess();
      } else {
        setStep(3);
      }
    } else {
      setErrorMessage(res.error?.message || 'Error al iniciar la inscripción.');
    }

    setIsLoading(false);
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationResult?.registration_id) return;

    setErrorMessage(null);
    setIsLoading(true);

    const voucherUrl = evidenceUrl.trim() || `https://storage.supabase.co/vouchers/voucher_${Date.now()}.png`;

    const res = await api.post(`/registrations/${registrationResult.registration_id}/evidence`, {
      evidence_url: voucherUrl,
      operation_reference: operationReference.trim() || `OPER-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    if (res.success) {
      setStep(4);
      onSuccess();
    } else {
      setErrorMessage(res.error?.message || 'Error al enviar el comprobante.');
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setStep(1);
    setErrorMessage(null);
    setRegistrationResult(null);
    setAcceptedRules(false);
    setOperationReference('');
    setEvidenceUrl('');
    setTeamName('');
    setRosterMembers([
      { name: '', email: '', player_tag: '', role: 'Jugador 2' },
      { name: '', email: '', player_tag: '', role: 'Jugador 3' },
      { name: '', email: '', player_tag: '', role: 'Jugador 4' },
      { name: '', email: '', player_tag: '', role: 'Jugador 5' },
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg arena-card p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-arena)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Steps */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-bold text-[#E63946] uppercase tracking-wider">
              Inscripción Oficial
            </span>
            <span>Paso {step} de 4</span>
          </div>

          <h3 className="text-xl font-black text-[var(--text-primary)]">
            {tournament.name}
          </h3>

          {/* Stepper bar */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  step >= i ? 'bg-[#E63946]' : 'bg-[var(--border-card)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-[#E63946]/10 border border-[#E63946]/30 flex items-start gap-2.5 text-xs text-[#E63946]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: VALIDATE GAME PROFILE */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">1. Confirmar Cuenta de Videojuego</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Para competir en este torneo de {gameName}, utilizaremos tu cuenta o Tag oficial vinculado.
              </p>
            </div>

            {matchingGameProfile ? (
              <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#E63946]/20 text-[#E63946]">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">{matchingGameProfile.in_game_name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">Tag / ID: <span className="text-[#E63946] font-mono font-bold">{matchingGameProfile.player_tag}</span></p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                    Vinculado
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Ingresa tu Nickname o Player Tag
                  </label>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Registraremos temporalmente tu ID para que puedas competir en el torneo de inmediato.
                  </p>
                </div>
                <input
                  type="text"
                  value={manualTag}
                  onChange={(e) => setManualTag(e.target.value)}
                  placeholder="Ej. LuisDestroyer99"
                  className="input-arena w-full"
                />
              </div>
            )}

            {/* TEAM SQUAD SETUP (Dynamic size: 2v2, 3v3, 4v4, 5v5) */}
            {isTeamTournament && (
              <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                      {teamSize === 2 ? 'Registro de Dúo (2v2)' : teamSize === 3 ? 'Registro de Trío (3v3)' : teamSize === 4 ? 'Registro de Escuadra (4v4)' : `Registro de Equipo (${teamSize}v${teamSize})`}
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                    👑 Tú eres el Capitán
                  </span>
                </div>

                {/* Auto-populated Captain Card */}
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Capitán Oficial (Tus Datos de Perfil)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {matchingGameProfile?.player_tag || manualTag || 'Tag Vinculado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30 overflow-hidden shrink-0">
                      {user?.avatar_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{user?.first_name?.charAt(0) || 'C'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-[11px] text-[#8E92A4] truncate font-mono">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Team Name and Emblem Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Nombre del Equipo e Icono Representativo *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[var(--bg-arena)] p-1 rounded-xl border border-[var(--border-card)] shrink-0">
                      {['🐉', '⚡', '🐺', '🛡️', '👑', '🦅', '⚔️'].map((emb) => (
                        <button
                          key={emb}
                          type="button"
                          onClick={() => setTeamEmblem(emb)}
                          className={`w-6 h-6 rounded-md text-xs flex items-center justify-center transition-all cursor-pointer ${
                            teamEmblem === emb ? 'bg-indigo-500/30 border border-indigo-500 shadow-sm scale-110' : 'hover:bg-[var(--bg-card)] opacity-70 hover:opacity-100'
                          }`}
                        >
                          {emb}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Ej. Tecsup Dragons"
                      className="input-arena flex-1 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Remaining Teammates inputs */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-[#8E92A4]">
                      Compañeros restantes ({defaultTeammateCount} requeridos • Correos @tecsup.edu.pe)
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRosterMembers([
                          ...rosterMembers,
                          { name: '', email: '', player_tag: '', role: `Suplente ${rosterMembers.length - defaultTeammateCount + 1}` }
                        ]);
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition-colors"
                    >
                      + Añadir Suplente
                    </button>
                  </div>
                  {rosterMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder={`Nombre ${member.role || `Compañero ${idx + 1}`}`}
                          value={member.name}
                          onChange={(e) => {
                            const updated = [...rosterMembers];
                            updated[idx].name = e.target.value;
                            setRosterMembers(updated);
                          }}
                          className="input-arena text-xs py-2"
                        />
                        <input
                          type="email"
                          placeholder={`correo${idx + 1}@tecsup.edu.pe`}
                          value={member.email}
                          onChange={(e) => {
                            const updated = [...rosterMembers];
                            updated[idx].email = e.target.value;
                            setRosterMembers(updated);
                          }}
                          className="input-arena text-xs py-2"
                        />
                      </div>
                      {idx >= defaultTeammateCount && (
                        <button
                          type="button"
                          onClick={() => {
                            setRosterMembers(rosterMembers.filter((_, i) => i !== idx));
                          }}
                          className="text-[#8E92A4] hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          title="Eliminar suplente"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isCreatingProfile || (!matchingGameProfile && !manualTag.trim())}
              onClick={async () => {
                if (isTeamTournament) {
                  if (!teamName.trim()) {
                    setErrorMessage('Debes ingresar el nombre oficial de tu equipo o clan.');
                    return;
                  }
                  const invalid = rosterMembers.find(
                    (m) => m.email.trim() && !m.email.trim().toLowerCase().endsWith('@tecsup.edu.pe')
                  );
                  if (invalid) {
                    setErrorMessage(`El correo "${invalid.email}" de tu compañero debe ser institucional (@tecsup.edu.pe).`);
                    return;
                  }
                }

                if (matchingGameProfile) {
                  setStep(2);
                } else {
                  // Create dummy profile dynamically
                  setIsCreatingProfile(true);
                  setErrorMessage(null);
                  const res = await api.post('/profile/games', {
                    game_code: tournament.game_code,
                    player_tag: manualTag.trim(),
                  });
                  if (res.success && res.data) {
                    setSelectedGameProfileId(res.data.game_profile?.id || res.data.id);
                    setStep(2);
                  } else {
                    setErrorMessage('Error al registrar tu nickname. Intenta de nuevo.');
                  }
                  setIsCreatingProfile(false);
                }
              }}
              className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isCreatingProfile ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Continuar al Reglamento <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: RULES ACCEPTANCE */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">2. Aceptación del Reglamento Oficial</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Lee y acepta las normas de Fair Play y formato de torneo.
              </p>
            </div>

            <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] max-h-40 overflow-y-auto text-xs text-[var(--text-secondary)] font-mono leading-relaxed space-y-2 whitespace-pre-line">
              {tournament.rules_text}
            </div>

            <label className="flex items-start gap-3 p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedRules}
                onChange={(e) => setAcceptedRules(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded bg-[var(--bg-card)] border-[var(--border-card)] text-[#E63946] focus:ring-[#E63946]"
              />
              <span className="text-xs text-[var(--text-primary)] leading-relaxed">
                He leído y acepto cumplir el <strong>Reglamento Oficial de Competición</strong> y las sanciones por conducta antideportiva.
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary py-2.5 text-xs text-center cursor-pointer"
              >
                Atrás
              </button>
              <button
                type="button"
                disabled={!acceptedRules || isLoading}
                onClick={handleCreateRegistration}
                className="btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {Number(tournament.cost) === 0 ? 'Confirmar Inscripción' : 'Ir al Pago'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & VOUCHER UPLOAD */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">3. Pago y Comprobante</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Monto a pagar: <strong className="text-[var(--text-primary)]">S/ {tournament.cost} PEN</strong>
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('YAPE')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  paymentMethod === 'YAPE'
                    ? 'bg-[#74008E] border-[#74008E] text-white shadow-md'
                    : 'bg-[var(--bg-arena)] border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                }`}
              >
                Yape
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('PLIN')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  paymentMethod === 'PLIN'
                    ? 'bg-[#003883] border-[#003883] text-white shadow-md'
                    : 'bg-[var(--bg-arena)] border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                }`}
              >
                Plin
              </button>
            </div>

            {/* QR / Payment Instructions */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-4 transition-colors ${
              paymentMethod === 'YAPE' ? 'bg-[#74008E]/10 border-[#74008E]/30' : 'bg-[#003883]/10 border-[#003883]/30'
            }`}>
              <div className="w-32 h-32 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-lg border-2 border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={paymentMethod === 'YAPE' ? '/yape-qr.jpg' : '/plin-qr.jpg'} 
                  alt={`QR Oficial de ${paymentMethod}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 text-xs text-center sm:text-left flex-1">
                <p className="font-bold text-[#E63946] uppercase tracking-wider">
                  Escanea para pagar con {paymentMethod}
                </p>
                <p className="text-xl font-black text-[var(--text-primary)] font-mono tracking-widest mt-1">
                  994 058 442
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  Titular: <span className="font-bold text-[var(--text-primary)]">
                    {paymentMethod === 'YAPE' ? 'Luis Enrique Galvan Morales' : 'Luis Galvan'}
                  </span>
                </p>
              </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmitEvidence} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Número de Operación (Opcional)
                </label>
                <input
                  type="text"
                  value={operationReference}
                  onChange={(e) => setOperationReference(e.target.value)}
                  placeholder="Ej. OPER-492019"
                  className="input-arena"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Comprobante / Captura del Voucher (Yape o Plin)
                </label>
                
                {previewUrl ? (
                  <div className="relative p-3 bg-[var(--bg-arena)] border border-emerald-500/40 rounded-xl space-y-3">
                    <div className="relative w-full h-44 rounded-lg overflow-hidden bg-black/60 border border-[var(--border-card)] flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={previewUrl} 
                        alt="Comprobante de pago" 
                        className="w-full h-full object-contain"
                      />
                      {isUploadingFile && (
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                          <Loader2 className="w-6 h-6 animate-spin text-[#E63946]" />
                          <span className="text-xs font-bold">Subiendo a Supabase Storage...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        Captura lista para revisión
                      </span>
                      <label className="text-[#E63946] hover:underline cursor-pointer font-medium">
                        Cambiar captura
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 bg-[var(--bg-arena)] border-2 border-dashed border-[var(--border-card)] hover:border-[#E63946]/50 rounded-xl text-center space-y-2 cursor-pointer transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] group-hover:bg-[#E63946]/10 flex items-center justify-center transition-colors">
                      <UploadCloud className="w-5 h-5 text-[#457B9D] group-hover:text-[#E63946] transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Haz clic o arrastra tu captura de Yape / Plin
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        PNG, JPG o WEBP (máximo 5MB)
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[var(--bg-card)] group-hover:bg-[#E63946] group-hover:text-white rounded-lg text-[10px] font-bold text-[var(--text-secondary)] transition-colors">
                      Seleccionar archivo
                    </span>
                  </label>
                )}

                {!evidenceUrl.startsWith('data:') && (
                  <input
                    type="text"
                    value={evidenceUrl}
                    onChange={(e) => {
                      setEvidenceUrl(e.target.value);
                      if (e.target.value.startsWith('http')) {
                        setPreviewUrl(e.target.value);
                      }
                    }}
                    placeholder="O pega el enlace público de la imagen si prefieres..."
                    className="input-arena text-[11px] py-1.5 w-full text-[var(--text-secondary)] bg-transparent border-[var(--border-card)]"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || isUploadingFile || (!evidenceUrl && !previewUrl)}
                className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Enviando comprobante...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Enviar Comprobante para Revisión
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-6 text-center py-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-black text-[var(--text-primary)]">
                ¡Solicitud Registrada con Éxito!
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                Tu comprobante y cuenta de juego están en revisión por los organizadores del torneo. Recibirás confirmación cuando el cupo esté formalmente validado.
              </p>
            </div>

            <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Torneo:</span>
                <span className="font-bold text-[var(--text-primary)]">{tournament.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Jugador:</span>
                <span className="font-bold text-[#E63946]">{matchingGameProfile?.in_game_name} ({matchingGameProfile?.player_tag})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Estado:</span>
                <span className="font-bold text-amber-500 dark:text-amber-400 uppercase">En Revisión</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/profile"
                onClick={handleClose}
                className="btn-secondary py-2.5 text-xs text-center"
              >
                Ver Mis Inscripciones
              </Link>
              <button
                type="button"
                onClick={handleClose}
                className="btn-primary py-2.5 text-xs cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
