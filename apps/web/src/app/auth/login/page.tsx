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
  Mail,
  Lock
} from 'lucide-react';

export default function LoginPage() {
  const { user, isAuthenticated, loginWithGoogle, login, register } = useAuth();
  const router = useRouter();

  // Redirigir inmediatamente si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN' || user.email === 'luis.galvan@tecsup.edu.pe') {
        router.replace('/admin/organizers');
      } else {
        router.replace('/tournaments');
      }
    }
  }, [isAuthenticated, user, router]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'google' | 'email'>('google');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Handle Google OAuth Initiate via Supabase
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setErrorMessage(res.error.message || 'Error al conectar con Google.');
        setIsLoading(false);
      }
      // Google will redirect to Google accounts page and back to /auth/callback
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error inesperado al iniciar sesión.');
      setIsLoading(false);
    }
  };

  // Handle Email / Password via Supabase
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const emailTrimmed = email.toLowerCase().trim();

    if (!emailTrimmed.endsWith('@tecsup.edu.pe')) {
      setErrorMessage('Acceso restringido: Solo se admiten correos institucionales terminados en @tecsup.edu.pe.');
      setIsLoading(false);
      return;
    }

    if (isRegistering) {
      const res = await register(emailTrimmed, password, {
        given_name: firstName.trim() || undefined,
        family_name: lastName.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error?.message || 'Error al crear la cuenta.');
        setIsLoading(false);
        return;
      }
    } else {
      const res = await login(emailTrimmed, password);
      if (!res.success) {
        setErrorMessage(res.error?.message || 'Credenciales inválidas.');
        setIsLoading(false);
        return;
      }
    }

    // Redirect
    if (emailTrimmed === 'luis.galvan@tecsup.edu.pe') {
      router.push('/admin/organizers');
    } else {
      router.push('/tournaments');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-xl bg-[#111622] border border-white/10 p-2 shadow-sm mb-1">
            <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-white/[0.04] text-[var(--text-secondary)] border-[var(--border-card)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Acceso Institucional
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight pt-1">
              Campus Arena Tecsup
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              Inicia sesión con tu cuenta institucional para participar en torneos y registrar tus estadísticas.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="arena-card p-6 sm:p-8 space-y-5 relative bg-[var(--bg-card)] border border-[var(--border-card)]">
          
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#E63946]/10 border border-[#E63946]/30 flex items-start gap-3 text-xs font-semibold text-[#E63946] animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('google')}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-md border border-[var(--border-card)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Google Workspace
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-[#E63946] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Correo / Contraseña
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Restriction Notice */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-arena)] border border-[var(--border-card)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[var(--text-secondary)]">Dominio Permitido:</span>
              </div>
              <span className="font-mono font-bold text-[var(--text-primary)] bg-[var(--bg-card)] px-2.5 py-1 rounded border border-[var(--border-card)]">
                @tecsup.edu.pe
              </span>
            </div>

            {activeTab === 'google' ? (
              /* Google OAuth via Supabase */
              <div className="space-y-4">
                <button
                  onClick={handleGoogleAuth}
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
                      <span>Iniciar Sesión con Google</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-[var(--text-secondary)]">
                  Se abrirá la ventana oficial de Google. Elige tu cuenta institucional de Tecsup.
                </p>
              </div>
            ) : (
              /* Email / Password Form */
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isRegistering && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[var(--text-secondary)] mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ej. Luis"
                        className="input-arena text-xs w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[var(--text-secondary)] mb-1">Apellido</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ej. Galvan"
                        className="input-arena text-xs w-full"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[var(--text-secondary)] mb-1">
                    Correo Institucional (@tecsup.edu.pe)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu.nombre@tecsup.edu.pe"
                      className="input-arena text-xs w-full pl-9"
                    />
                    <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[var(--text-secondary)] mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-arena text-xs w-full pl-9"
                    />
                    <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isRegistering ? (
                    'Registrarme en la Arena'
                  ) : (
                    'Ingresar a la Plataforma'
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {isRegistering
                      ? '¿Ya tienes cuenta? Inicia sesión aquí'
                      : '¿Nuevo alumno? Regístrate aquí'}
                  </button>
                </div>
              </form>
            )}

          </div>

          <div className="pt-4 border-t border-[var(--border-card)] text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              Al acceder confirmas que eres alumno o docente activo de Tecsup y aceptas las políticas de juego limpio de Campus Arena.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
