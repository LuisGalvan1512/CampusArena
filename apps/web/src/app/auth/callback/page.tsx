'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Redirección instantánea si ya está autenticado en Zustand
  useEffect(() => {
    if (isAuthenticated && user) {
      const email = user.email?.toLowerCase() || '';
      if (email === 'luis.galvan@tecsup.edu.pe' || user.role === 'ADMIN') {
        router.replace('/admin/organizers');
      } else {
        router.replace('/tournaments');
      }
    }
  }, [isAuthenticated, user, router]);

  // 2. Procesamiento de parámetros y canje de sesión
  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      if (typeof window === 'undefined') return;

      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDesc = searchParams.get('error_description');

      // Si Google o Supabase devolvieron un error explícito en la URL
      if (errorParam || errorDesc) {
        const fullErr = errorDesc ? `${errorParam}: ${errorDesc}` : (errorParam || 'Error desconocido');
        if (isMounted) {
          setErrorMessage(`Error reportado por el proveedor: ${fullErr}`);
        }
        return;
      }

      try {
        // A. Revisar si los tokens llegaron en el Hash fragment (#access_token=...&refresh_token=...)
        if (hash && hash.includes('access_token')) {
          const hashClean = hash.startsWith('#') ? hash.substring(1) : hash;
          const hashParams = new URLSearchParams(hashClean);
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');

          if (access_token && refresh_token) {
            const { data: setData, error: setError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (!setError && setData?.session) {
              await finishLogin(setData.session);
              return;
            }
          }
        }

        // B. Si hay código PKCE en la URL, canjearlo explícitamente
        if (code) {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && exchangeData?.session) {
            await finishLogin(exchangeData.session);
            return;
          }
        }

        // C. Verificar sesión activa en Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await finishLogin(session);
          return;
        }

        // D. Escuchar onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (newSession && isMounted) {
              subscription.unsubscribe();
              await finishLogin(newSession);
            }
          }
        );

        // E. Timeout de seguridad (8 segundos)
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          if (isMounted && !isAuthenticated) {
            setErrorMessage(
              'El tiempo de espera para autenticar se agotó. Por favor, intenta iniciar sesión nuevamente.'
            );
          }
        }, 8000);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err?.message || 'Error inesperado al validar la autenticación.');
        }
      }
    };

    const finishLogin = async (session: any) => {
      const email = session?.user?.email?.toLowerCase() || '';

      if (!email.endsWith('@tecsup.edu.pe')) {
        await supabase.auth.signOut();
        if (isMounted) {
          setErrorMessage(
            'Acceso denegado: Solo se permiten cuentas institucionales de Tecsup (@tecsup.edu.pe).'
          );
        }
        return;
      }

      if (session.access_token) {
        localStorage.setItem('campus_token', session.access_token);
      }

      try {
        await refreshUser();
      } catch (e) {
        console.warn('Advertencia en refreshUser:', e);
      }

      if (isMounted) {
        if (email === 'luis.galvan@tecsup.edu.pe') {
          router.replace('/admin/organizers');
        } else {
          router.replace('/tournaments');
        }
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router, refreshUser, isAuthenticated]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="arena-card p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
        
        {errorMessage ? (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E63946]/10 border border-[#E63946]/30 flex items-center justify-center text-[#E63946]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Error de Acceso</h2>
            <p className="text-sm text-[#8E92A4]">{errorMessage}</p>

            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-3 px-4 rounded-xl bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Volver al Inicio de Sesión</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#E63946] to-[#457B9D] p-1 shadow-xl">
              <div className="w-full h-full bg-[#0B0C10] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#E63946]" />
              </div>
            </div>
            <h2 className="text-xl font-black text-white">
              Validando Credenciales Tecsup...
            </h2>
            <p className="text-sm text-[#8E92A4]">
              Accediendo y sincronizando tu perfil de la Arena...
            </p>
            <div className="flex justify-center pt-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#E63946]" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
