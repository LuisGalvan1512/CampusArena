'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Swords, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Gamepad2, 
  Trophy, 
  Award,
  CheckCircle2, 
  UserCheck,
  Zap,
  GraduationCap
} from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Welcome Onboarding Modal State for New Users
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [newUserData, setNewUserData] = useState<any>(null);

  // Handle Google OAuth Initiate
  const handleGoogleLogin = async (emailToUse: string, firstName?: string, lastName?: string) => {
    setErrorMessage(null);
    setIsLoading(true);

    const emailTrimmed = emailToUse.toLowerCase().trim();

    if (!emailTrimmed.endsWith('@tecsup.edu.pe')) {
      setErrorMessage('Acceso denegado: Solo se admiten correos institucionales con la terminación @tecsup.edu.pe.');
      setIsLoading(false);
      return;
    }

    // Auto-derive friendly name if not provided
    let derivedFirst = firstName;
    let derivedLast = lastName;
    if (!derivedFirst) {
      const parts = emailTrimmed.split('@')[0].split('.');
      derivedFirst = parts[0]?.charAt(0).toUpperCase() + parts[0]?.slice(1) || 'Estudiante';
      derivedLast = parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1) || 'Tecsup';
    }

    const res = await loginWithGoogle({
      email: emailTrimmed,
      first_name: derivedFirst,
      last_name: derivedLast,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${emailTrimmed}`,
    });

    if (res.success && res.data) {
      if (res.data.is_new_user) {
        // Show celebratory Welcome Modal
        setNewUserData(res.data.user);
        setShowWelcomeModal(true);
      } else {
        // Returning user - direct redirect
        redirectPostLogin(res.data.user);
      }
    } else {
      setErrorMessage(res.error?.message || 'Error al autenticar con la cuenta institucional de Tecsup.');
    }

    setIsLoading(false);
  };

  const redirectPostLogin = (userObj: any) => {
    if (userObj?.role === 'ADMIN' || userObj?.email === 'luis.galvan@tecsup.edu.pe') {
      router.push('/admin/organizers');
    } else {
      router.push('/tournaments');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E63946]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#457B9D]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#E63946] via-[#1D3557] to-[#457B9D] p-1 shadow-2xl shadow-[#E63946]/30 mb-2">
            <div className="w-full h-full bg-[#0B0C10] rounded-[14px] flex items-center justify-center">
              <Swords className="w-8 h-8 text-[#E63946]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider bg-[#E63946]/10 text-[#E63946] border-[#E63946]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Acceso Institucional Exclusivo
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight pt-2">
              Campus Arena Tecsup
            </h1>
            <p className="text-sm text-[#8E92A4] max-w-md mx-auto">
              Plataforma oficial de torneos universitarios. Inicia sesión directamente con tu cuenta institucional de Google Workspace.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="arena-card p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#E63946]/10 border border-[#E63946]/30 flex items-start gap-3 text-xs font-semibold text-[#E63946] animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-6">
            
            {/* Restriction Notice */}
            <div className="p-4 rounded-xl bg-[#15161E] border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#8E92A4]">Dominio Permitido:</span>
              </div>
              <span className="font-mono font-bold text-white bg-black/40 px-2.5 py-1 rounded border border-white/10">
                @tecsup.edu.pe
              </span>
            </div>

            {/* Primary Action: Google Login as Admin Luis Galvan */}
            <div className="space-y-3">
              <button
                onClick={() => handleGoogleLogin('luis.galvan@tecsup.edu.pe', 'Luis', 'Galvan')}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-extrabold text-sm flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-white/10 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-900" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                    <span className="text-xs bg-zinc-200 px-2 py-0.5 rounded text-zinc-700 font-semibold ml-auto">
                      luis.galvan@tecsup.edu.pe
                    </span>
                  </>
                )}
              </button>

              {/* Custom Student Email Option */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full text-center text-xs text-[#8E92A4] hover:text-[#A8DADC] py-2 cursor-pointer transition-colors"
                >
                  ¿Ingresar con otro correo @tecsup.edu.pe institucional? &rarr;
                </button>
              ) : (
                <div className="p-4 bg-[#0B0C10] rounded-xl border border-white/10 space-y-3 animate-in fade-in">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E92A4]">
                    Ingresar Correo Institucional de Estudiante
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="nombre.apellido@tecsup.edu.pe"
                      className="input-arena text-xs flex-1"
                    />
                    <button
                      onClick={() => handleGoogleLogin(customEmail)}
                      disabled={isLoading || !customEmail}
                      className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      Ingresar
                    </button>
                  </div>
                  <p className="text-[10px] text-[#5A5E73]">
                    * Si eres nuevo alumno, se creará tu perfil de competidor y recibirás la bienvenida oficial a tu bandeja de entrada.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-[#5A5E73]">
              Al acceder confirmas que eres alumno o docente activo de Tecsup y aceptas las políticas de juego limpio de Campus Arena.
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* CELEBRATORY WELCOME ONBOARDING MODAL FOR NEW STUDENTS */}
      {/* ========================================================= */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="arena-card max-w-xl w-full p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl border border-[#E63946]/40 scale-100 animate-in zoom-in-95 duration-200">
            
            {/* Top Glowing Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E63946] via-[#F4A261] to-[#2A9D8F]" />
            
            {/* Modal Header */}
            <div className="text-center space-y-3 pt-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#E63946] to-[#F4A261] p-0.5 shadow-2xl shadow-[#E63946]/40">
                <div className="w-full h-full bg-[#0B0C10] rounded-[22px] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-amber-400 animate-bounce" />
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ¡Cuenta Institucional Activada!
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ¡Bienvenido a Campus Arena, {newUserData?.first_name || 'Estudiante'}! 🎉
                </h2>
                <p className="text-xs sm:text-sm text-[#8E92A4]">
                  Tu cuenta institucional <strong className="text-white font-mono">{newUserData?.email}</strong> ya forma parte del ecosistema oficial de esports de Tecsup.
                </p>
              </div>
            </div>

            {/* 3 Quick Step Onboarding Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A8DADC] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Tus Próximos Pasos para Competir:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Step 1 */}
                <div className="p-3.5 rounded-xl bg-[#15161E] border border-white/10 space-y-1.5 hover:border-white/20 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-[#E63946]/20 text-[#E63946] flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <Gamepad2 className="w-3.5 h-3.5 text-[#E63946]" />
                    Vincular Tag
                  </h4>
                  <p className="text-[11px] text-[#8E92A4] leading-relaxed">
                    Registra tu Player Tag de Clash Royale o Brawl Stars en tu perfil.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-xl bg-[#15161E] border border-white/10 space-y-1.5 hover:border-white/20 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Inscribirte
                  </h4>
                  <p className="text-[11px] text-[#8E92A4] leading-relaxed">
                    Elige los torneos universitarios activos y asegura tu lugar en el bracket.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-xl bg-[#15161E] border border-white/10 space-y-1.5 hover:border-white/20 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Ganar Diplomas
                  </h4>
                  <p className="text-[11px] text-[#8E92A4] leading-relaxed">
                    Compite por premios, sube en el ranking y obtén diplomas oficiales.
                  </p>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => router.push('/profile')}
                className="btn-primary flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#E63946]/30"
              >
                <UserCheck className="w-4 h-4" />
                Configurar mi Perfil de Gamer
              </button>
              <button
                onClick={() => router.push('/tournaments')}
                className="btn-secondary flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                Explorar Torneos Activos
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
