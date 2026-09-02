'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Swords, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await login(email, password);

    if (res.success) {
      router.push('/profile');
    } else {
      setErrorMessage(res.error?.message || 'Error al iniciar sesión.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-[#E63946] to-[#1D3557] items-center justify-center shadow-lg shadow-[#E63946]/20 mb-2">
            <Swords className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-[#8E92A4]">
            Ingresa a tu cuenta para competir y gestionar tu perfil
          </p>
        </div>

        {/* Form Card */}
        <div className="arena-card p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-[#E63946]/10 border border-[#E63946]/30 flex items-start gap-3 text-sm text-[#E63946]">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Field: Email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A5E73]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@tecsup.edu.pe"
                  className="input-arena pl-10"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                  Contraseña
                </label>
                <a href="#" className="text-xs text-[#457B9D] hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A5E73]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-arena pl-10"
                />
              </div>
            </div>

            {/* Checkbox: Remember me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0B0C10] border-white/20 text-[#E63946] focus:ring-[#E63946]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-[#8E92A4]">
                Recordar mi sesión en este dispositivo
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                <>
                  Ingresar a la Arena
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Footer of card */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-[#8E92A4]">
            ¿Aún no tienes cuenta?{' '}
            <Link href="/auth/register" className="text-[#E63946] font-bold hover:underline">
              Crear cuenta de competidor
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
