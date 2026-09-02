'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Swords, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Trophy,
  Flame
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    terms_accepted: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side quick validation
    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!formData.terms_accepted) {
      setErrorMessage('Debes aceptar los términos y condiciones.');
      return;
    }

    setIsLoading(true);

    const res = await register(formData);

    if (res.success) {
      setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } else {
      setErrorMessage(res.error?.message || 'Error al crear la cuenta.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: BRANDING & ESPORTS HERO SHOWCASE */}
        <div className="lg:col-span-5 space-y-6 hidden lg:block pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 text-xs font-bold text-[#E63946] border border-[#E63946]/20">
            <Flame className="w-3.5 h-3.5" />
            Registro de Competidores
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
            Únete a la liga de esports de tu institución
          </h1>
          
          <p className="text-[#8E92A4] text-base leading-relaxed">
            Representa a tu sede universitaria o técnica, participa en llaves oficiales en vivo y construye un historial competitivo profesional.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-sm text-[#F1FAEE]">
              <div className="w-8 h-8 rounded-lg bg-[#E63946]/10 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-[#E63946]" />
              </div>
              <span>Clasificación a torneos intersedes y regionales</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-[#F1FAEE]">
              <div className="w-8 h-8 rounded-lg bg-[#457B9D]/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#457B9D]" />
              </div>
              <span>Vinculación de Player Tags con APIs de Supercell</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-[#F1FAEE]">
              <div className="w-8 h-8 rounded-lg bg-[#A8DADC]/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#A8DADC]" />
              </div>
              <span>Historial y estadísticas 100% verificadas</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTER FORM CARD */}
        <div className="lg:col-span-7">
          <div className="arena-card p-8 sm:p-10 shadow-2xl">
            
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Crear Cuenta de Competidor
              </h2>
              <p className="text-sm text-[#8E92A4]">
                Completa tus datos para empezar a competir en Campus Arena
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-lg bg-[#E63946]/10 border border-[#E63946]/30 flex items-start gap-3 text-sm text-[#E63946]">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-6 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-sm text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                    Nombres
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A5E73]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Luis"
                      className="input-arena pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                    Apellidos
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A5E73]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Galvan"
                      className="input-arena pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                  Correo Electrónico (Institucional o Personal)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A5E73]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="luis.galvan@tecsup.edu.pe"
                    className="input-arena pl-10"
                  />
                </div>
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A5E73]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mín. 8 caracteres"
                      className="input-arena pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A5E73]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      name="confirm_password"
                      required
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="Repite tu contraseña"
                      className="input-arena pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 rounded bg-[#0B0C10] border-white/20 text-[#E63946] focus:ring-[#E63946]"
                  />
                  <span className="text-xs text-[#8E92A4] leading-relaxed">
                    Acepto el <span className="text-white underline">Reglamento de Fair Play</span> y los <span className="text-white underline">Términos y Condiciones</span> de Campus Arena.
                  </span>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando cuenta en la Arena...
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    Crear Cuenta de Competidor
                  </>
                )}
              </button>

            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-[#8E92A4]">
              ¿Ya tienes una cuenta registrada?{' '}
              <Link href="/auth/login" className="text-[#E63946] font-bold hover:underline">
                Iniciar Sesión
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
