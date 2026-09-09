'use client';

import React, { useEffect } from 'react';
import { create } from 'zustand';
import { api, ApiResponse } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'ORGANIZER' | 'ADMIN';
  avatar_url?: string | null;
  email_verified: boolean;
  status: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: any }>;
  login: (email: string, password: string) => Promise<ApiResponse>;
  register: (email: string, password: string, metadata?: any) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isOrganizer: false,

  initAuth: async () => {
    const syncSessionUser = async (session: any) => {
      if (!session?.access_token) {
        localStorage.removeItem('campus_token');
        set({ token: null, user: null, isAuthenticated: false, isAdmin: false, isOrganizer: false });
        return;
      }

      localStorage.setItem('campus_token', session.access_token);
      const email = session.user?.email?.toLowerCase() || '';
      const meta = session.user?.user_metadata || {};
      const parts = email.split('@')[0].split('.');
      const firstName =
        meta.given_name ||
        meta.first_name ||
        (parts[0]?.charAt(0).toUpperCase() + parts[0]?.slice(1)) ||
        'Estudiante';
      const lastName =
        meta.family_name ||
        meta.last_name ||
        (parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1)) ||
        'Tecsup';
      const avatar =
        meta.avatar_url ||
        meta.picture ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`;
      const role: User['role'] = email === 'luis.galvan@tecsup.edu.pe' ? 'ADMIN' : 'STUDENT';

      // 1. Establecer usuario de inmediato para que la UI no parpadee ni pierda sesión
      set({
        token: session.access_token,
        isAuthenticated: true,
        isAdmin: role === 'ADMIN',
        isOrganizer: (role as string) === 'ORGANIZER' || role === 'ADMIN',
        user: {
          id: session.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          role: role,
          avatar_url: avatar,
          email_verified: true,
          status: 'ACTIVE',
          roles: [role],
        },
      });

      // 2. Traer perfil completo desde PostgreSQL
      try {
        const res = await api.get<User>('/auth/me');
        if (res.success && res.data) {
          const u = res.data;
          const uRole = u.role || role;
          set({
            user: u,
            isAuthenticated: true,
            isAdmin: uRole === 'ADMIN',
            isOrganizer: uRole === 'ORGANIZER' || uRole === 'ADMIN',
          });
        }
      } catch (e) {
        console.warn('Sincronización secundaria backend:', e);
      }
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await syncSessionUser(session);
    } catch (e) {
      console.error('Error inicializando auth:', e);
    } finally {
      set({ isLoading: false });
    }

    // Suscripción reactiva a cambios de sesión en Supabase
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await syncSessionUser(session);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('campus_token');
        set({ token: null, user: null, isAuthenticated: false, isAdmin: false, isOrganizer: false });
      }
    });
  },

  loginWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
          queryParams: {
            hd: 'tecsup.edu.pe',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        return { success: false, error: { message: error.message } };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: { message: err?.message } };
    }
  },

  login: async (email: string, password: string) => {
    try {
      const emailNormalized = email.toLowerCase().trim();
      if (!emailNormalized.endsWith('@tecsup.edu.pe')) {
        return {
          success: false,
          error: {
            code: 'INVALID_DOMAIN',
            message: 'Solo se admiten correos institucionales de Tecsup (@tecsup.edu.pe).',
          },
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailNormalized,
        password,
      });

      if (error) {
        return {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: error.message,
          },
        };
      }

      if (data.session?.access_token) {
        localStorage.setItem('campus_token', data.session.access_token);
        set({ token: data.session.access_token });
        await get().refreshUser();
      }

      return { success: true, data: data.user };
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'LOGIN_ERROR', message: err?.message },
      };
    }
  },

  register: async (email: string, password: string, metadata?: any) => {
    try {
      const emailNormalized = email.toLowerCase().trim();
      if (!emailNormalized.endsWith('@tecsup.edu.pe')) {
        return {
          success: false,
          error: {
            code: 'INVALID_DOMAIN',
            message: 'Solo se admiten correos institucionales de Tecsup (@tecsup.edu.pe).',
          },
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailNormalized,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        return {
          success: false,
          error: {
            code: 'SIGNUP_ERROR',
            message: error.message,
          },
        };
      }

      if (data.session?.access_token) {
        localStorage.setItem('campus_token', data.session.access_token);
        set({ token: data.session.access_token });
        await get().refreshUser();
      }

      return { success: true, data: data.user };
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'SIGNUP_ERROR', message: err?.message },
      };
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      await api.post('/auth/logout');
    } catch (e) {
      // silent
    } finally {
      localStorage.removeItem('campus_token');
      set({ token: null, user: null, isAuthenticated: false, isAdmin: false, isOrganizer: false });
    }
  },

  refreshUser: async () => {
    const res = await api.get<User>('/auth/me');
    if (res.success && res.data) {
      const u = res.data;
      const role = u.role || 'STUDENT';
      set({
        user: u,
        isAuthenticated: true,
        isAdmin: role === 'ADMIN',
        isOrganizer: role === 'ORGANIZER' || role === 'ADMIN',
      });
    }
  },
}));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuth((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return <>{children}</>;
}
