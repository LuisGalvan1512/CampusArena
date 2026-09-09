'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldCheck, AlertCircle, Terminal, RefreshCw } from 'lucide-react';

interface DebugInfo {
  url: string;
  search: string;
  hash: string;
  codeFound: boolean;
  codeLength: number;
  errorParam: string | null;
  errorDesc: string | null;
  supabaseSessionStatus: string;
  localStorageToken: boolean;
  exchangeError: string | null;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  // 1. Redirección instantánea si ya está autenticado en Zustand
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[AUTH_DEBUG] Usuario ya autenticado en Zustand:', user.email);
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

      const url = window.location.href;
      const search = window.location.search;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(search);
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDesc = searchParams.get('error_description');
      const tokenInStorage = !!localStorage.getItem('campus_token');

      console.log('================ [AUTH CALLBACK DIAGNÓSTICO] ================');
      console.log('📍 URL completa:', url);
      console.log('🔎 Query Search (?):', search || '(vacío)');
      console.log('🏷️ Hash (#):', hash || '(vacío)');
      console.log('🔑 Parámetro "code":', code ? `Presente (${code.substring(0, 10)}...)` : 'NO RECIBIDO');
      console.log('⚠️ Parámetro "error":', errorParam || 'Ninguno');
      console.log('📝 "error_description":', errorDesc || 'Ninguno');
      console.log('💾 Token previo en localStorage:', tokenInStorage);

      const currentDebug: DebugInfo = {
        url,
        search,
        hash,
        codeFound: !!code,
        codeLength: code ? code.length : 0,
        errorParam,
        errorDesc,
        supabaseSessionStatus: 'Consultando...',
        localStorageToken: tokenInStorage,
        exchangeError: null,
      };

      if (isMounted) setDebugInfo({ ...currentDebug });

      // Si Google o Supabase devolvieron un error explícito en la URL
      if (errorParam || errorDesc) {
        const fullErr = errorDesc ? `${errorParam}: ${errorDesc}` : (errorParam || 'Error desconocido');
        console.error('❌ Error recibido en la URL:', fullErr);
        if (isMounted) {
          setErrorMessage(`Error reportado por el proveedor: ${fullErr}`);
          setDebugInfo((prev) => prev ? { ...prev, exchangeError: fullErr } : null);
        }
        return;
      }

      try {
        // A. Revisar si los tokens llegaron en el Hash fragment (#access_token=...&refresh_token=...)
        if (hash && hash.includes('access_token')) {
          console.log('[AUTH_DEBUG] Tokens detectados en el Hash fragment. Estableciendo sesión directa...');
          const hashClean = hash.startsWith('#') ? hash.substring(1) : hash;
          const hashParams = new URLSearchParams(hashClean);
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');

          if (access_token && refresh_token) {
            const { data: setData, error: setError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (setError) {
              console.warn('[AUTH_DEBUG] setSession arrojó:', setError.message);
              currentDebug.exchangeError = setError.message;
            } else if (setData?.session) {
              console.log('✅ [AUTH_DEBUG] ¡Sesión establecida con éxito desde el Hash fragment para:', setData.session.user.email);
              currentDebug.supabaseSessionStatus = `Sesión activa desde Hash (${setData.session.user.email})`;
              if (isMounted) setDebugInfo({ ...currentDebug });
              await finishLogin(setData.session);
              return;
            }
          }
        }

        // B. Si hay código PKCE en la URL, canjearlo explícitamente
        if (code) {
          console.log('[AUTH_DEBUG] Intentando canjear código PKCE con Supabase...');
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.warn('[AUTH_DEBUG] exchangeCodeForSession arrojó:', exchangeError.message);
            currentDebug.exchangeError = exchangeError.message;
          } else if (exchangeData?.session) {
            console.log('✅ [AUTH_DEBUG] Código canjeado con éxito. Sesión obtenida para:', exchangeData.session.user.email);
            currentDebug.supabaseSessionStatus = 'Sesión canjeada con éxito';
            if (isMounted) setDebugInfo({ ...currentDebug });
            await finishLogin(exchangeData.session);
            return;
          }
        }

        // C. Verificar sesión en getSession()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('[AUTH_DEBUG] Error en getSession():', sessionError.message);
        }

        if (session) {
          console.log('✅ [AUTH_DEBUG] Sesión activa encontrada en Supabase para:', session.user.email);
          currentDebug.supabaseSessionStatus = `Activa (${session.user.email})`;
          if (isMounted) setDebugInfo({ ...currentDebug });
          await finishLogin(session);
          return;
        } else {
          console.log('ℹ️ [AUTH_DEBUG] getSession() retornó null (sin sesión en almacenamiento)');
          currentDebug.supabaseSessionStatus = 'Nula (sin sesión almacenada)';
          if (isMounted) setDebugInfo({ ...currentDebug });
        }

        // C. Escuchar onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log(`[AUTH_DEBUG] Evento onAuthStateChange: "${event}"`, newSession?.user?.email || 'Sin sesión');
            if (newSession && isMounted) {
              subscription.unsubscribe();
              currentDebug.supabaseSessionStatus = `Evento ${event} (${newSession.user.email})`;
              setDebugInfo({ ...currentDebug });
              await finishLogin(newSession);
            }
          }
        );

        // D. Timeout de seguridad (10 segundos)
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          if (isMounted && !isAuthenticated) {
            console.error('⏰ [AUTH_DEBUG] Timeout alcanzado: no se recibió código ni sesión activa.');
            setErrorMessage(
              'El tiempo de espera para autenticar se agotó. La URL no contiene un código válido ni una sesión activa.'
            );
          }
        }, 10000);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('[AUTH_DEBUG] Excepción general:', err);
        if (isMounted) {
          setErrorMessage(err?.message || 'Error inesperado al validar la autenticación.');
        }
      }
    };

    const finishLogin = async (session: any) => {
      const email = session?.user?.email?.toLowerCase() || '';
      console.log('[AUTH_DEBUG] Finalizando login para:', email);

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
        console.warn('[AUTH_DEBUG] refreshUser advertencia:', e);
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
      <div className="arena-card p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
        
        {errorMessage ? (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E63946]/10 border border-[#E63946]/30 flex items-center justify-center text-[#E63946]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Error de Acceso</h2>
            <p className="text-sm text-[#8E92A4]">{errorMessage}</p>

            {/* Panel de Diagnóstico Visible */}
            {debugInfo && (
              <div className="p-4 bg-[#0B0C10] rounded-xl border border-white/10 text-left space-y-2 font-mono text-[11px] text-[#A8DADC]">
                <div className="flex items-center gap-1.5 text-xs text-white font-bold pb-1 border-b border-white/10">
                  <Terminal className="w-4 h-4 text-[#E63946]" />
                  <span>Diagnóstico de lo que recibió la pantalla:</span>
                </div>
                <div><strong className="text-white">Query params:</strong> {debugInfo.search || '(vacío - ningún parámetro)'}</div>
                <div><strong className="text-white">Hash fragment:</strong> {debugInfo.hash || '(vacío)'}</div>
                <div><strong className="text-white">Código auth recibido:</strong> {debugInfo.codeFound ? `Sí (${debugInfo.codeLength} caracteres)` : '❌ NO RECIBIÓ NINGÚN CÓDIGO'}</div>
                <div><strong className="text-white">Estado Supabase:</strong> {debugInfo.supabaseSessionStatus}</div>
                {debugInfo.exchangeError && (
                  <div className="text-[#E63946]"><strong className="text-white">Error canje:</strong> {debugInfo.exchangeError}</div>
                )}
                {debugInfo.errorParam && (
                  <div className="text-[#E63946]"><strong className="text-white">Error en URL:</strong> {debugInfo.errorParam}: {debugInfo.errorDesc}</div>
                )}
              </div>
            )}

            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-3 px-4 rounded-xl bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Volver a Intentar Iniciar Sesión</span>
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

            {/* Diagnóstico en tiempo real */}
            {debugInfo && (
              <div className="p-3 bg-[#0B0C10] rounded-xl border border-white/10 text-left font-mono text-[10px] text-[#8E92A4] space-y-1">
                <div>Código URL: {debugInfo.codeFound ? 'Detectado' : 'Buscando...'}</div>
                <div>Estado sesión: {debugInfo.supabaseSessionStatus}</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
