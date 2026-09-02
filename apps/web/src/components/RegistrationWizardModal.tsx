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
  ExternalLink
} from 'lucide-react';

interface GameProfile {
  id: string;
  game_code: 'CLASH_ROYALE' | 'BRAWL_STARS';
  game_name: string;
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
    game_code: 'CLASH_ROYALE' | 'BRAWL_STARS';
    cost: number | string;
    currency: string;
    prize_pool: string;
    rules_text: string;
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
  const [manualTag, setManualTag] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
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

  const isClash = tournament.game_code === 'CLASH_ROYALE';
  const matchingGameProfile = gameProfiles.find(
    (gp) => gp.game_code === tournament.game_code
  );

  const handleCreateRegistration = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    const res = await api.post(`/tournaments/${tournament.id}/registrations`, {
      game_profile_id: selectedGameProfileId,
      payment_method: paymentMethod,
      rules_version: 'v1.0',
    });

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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg arena-card p-6 sm:p-8 bg-[#15161E] border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[#8E92A4] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Steps */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8E92A4]">
            <span className="font-bold text-[#E63946] uppercase tracking-wider">
              Inscripción Oficial
            </span>
            <span>Paso {step} de 4</span>
          </div>

          <h3 className="text-xl font-black text-white">
            {tournament.name}
          </h3>

          {/* Stepper bar */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  step >= i ? 'bg-[#E63946]' : 'bg-white/10'
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
              <h4 className="text-sm font-bold text-white">1. Confirmar Cuenta de Videojuego</h4>
              <p className="text-xs text-[#8E92A4]">
                Para competir en este torneo de {isClash ? 'Clash Royale' : 'Brawl Stars'}, utilizaremos tu Player Tag oficial vinculado.
              </p>
            </div>

            {matchingGameProfile ? (
              <div className="p-4 bg-[#0B0C10] rounded-xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isClash ? 'bg-[#E63946]/20 text-[#E63946]' : 'bg-[#457B9D]/20 text-[#457B9D]'
                    }`}>
                      {isClash ? <Swords className="w-5 h-5" /> : <Gamepad2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{matchingGameProfile.in_game_name}</p>
                      <p className="text-xs text-[#8E92A4]">Tag / ID: <span className="text-[#A8DADC] font-mono font-bold">{matchingGameProfile.player_tag}</span></p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Autónomo
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-[#0B0C10] rounded-xl border border-white/10 space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white">
                    Ingresa tu Nickname o Player Tag
                  </label>
                  <p className="text-xs text-[#8E92A4]">
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

            <button
              type="button"
              disabled={isCreatingProfile || (!matchingGameProfile && !manualTag.trim())}
              onClick={async () => {
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
              <h4 className="text-sm font-bold text-white">2. Aceptación del Reglamento Oficial</h4>
              <p className="text-xs text-[#8E92A4]">
                Lee y acepta las normas de Fair Play y formato de torneo.
              </p>
            </div>

            <div className="p-4 bg-[#0B0C10] rounded-xl border border-white/5 max-h-40 overflow-y-auto text-xs text-[#8E92A4] font-mono leading-relaxed space-y-2 whitespace-pre-line">
              {tournament.rules_text}
            </div>

            <label className="flex items-start gap-3 p-3 bg-[#0B0C10] rounded-xl border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedRules}
                onChange={(e) => setAcceptedRules(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded bg-[#15161E] border-white/20 text-[#E63946] focus:ring-[#E63946]"
              />
              <span className="text-xs text-[#F1FAEE] leading-relaxed">
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
              <h4 className="text-sm font-bold text-white">3. Pago y Comprobante</h4>
              <p className="text-xs text-[#8E92A4]">
                Monto a pagar: <strong className="text-white">S/ {tournament.cost} PEN</strong>
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('YAPE')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  paymentMethod === 'YAPE'
                    ? 'bg-[#74008E] border-[#74008E] text-white'
                    : 'bg-[#15161E] border-white/10 text-[#8E92A4] hover:border-white/30'
                }`}
              >
                Yape
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('PLIN')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  paymentMethod === 'PLIN'
                    ? 'bg-[#003883] border-[#003883] text-white'
                    : 'bg-[#15161E] border-white/10 text-[#8E92A4] hover:border-white/30'
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
                <p className="font-bold text-[#A8DADC] uppercase tracking-wider">
                  Escanea para pagar con {paymentMethod}
                </p>
                <p className="text-xl font-black text-white font-mono tracking-widest mt-1">
                  994 058 442
                </p>
                <p className="text-xs text-[#8E92A4] mt-2">
                  Titular: <span className="font-bold text-white">
                    {paymentMethod === 'YAPE' ? 'Luis Enrique Galvan Morales' : 'Luis Galvan'}
                  </span>
                </p>
              </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmitEvidence} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
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

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                  Comprobante / Captura del Voucher
                </label>
                <div className="p-4 bg-[#0B0C10] border border-dashed border-white/20 rounded-xl text-center space-y-2">
                  <UploadCloud className="w-6 h-6 text-[#457B9D] mx-auto" />
                  <p className="text-xs text-[#8E92A4]">
                    Arrastra tu captura o ingresa el enlace del voucher
                  </p>
                  <input
                    type="text"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://storage.supabase.co/voucher.png (o dejar en blanco para demo)"
                    className="input-arena text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
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
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-black text-white">
                ¡Solicitud Registrada con Éxito!
              </h4>
              <p className="text-xs text-[#8E92A4] max-w-sm mx-auto leading-relaxed">
                Tu comprobante y cuenta de juego están en revisión por los organizadores del torneo. Recibirás confirmación cuando el cupo esté formalmente validado.
              </p>
            </div>

            <div className="p-4 bg-[#0B0C10] rounded-xl border border-white/5 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8E92A4]">Torneo:</span>
                <span className="font-bold text-white">{tournament.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E92A4]">Jugador:</span>
                <span className="font-bold text-[#A8DADC]">{matchingGameProfile?.in_game_name} ({matchingGameProfile?.player_tag})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E92A4]">Estado:</span>
                <span className="font-bold text-amber-400 uppercase">En Revisión</span>
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
