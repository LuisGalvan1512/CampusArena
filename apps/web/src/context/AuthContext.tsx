'use client';

import React, { useEffect } from 'react';
import { create } from 'zustand';
import { api, ApiResponse } from '@/lib/api';

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
  login: (email: string, password: string) => Promise<ApiResponse>;
  loginWithGoogle: (payload: { credential?: string; email?: string; first_name?: string; last_name?: string; avatar_url?: string }) => Promise<ApiResponse>;
  verifyOtp: (email: string, code: string) => Promise<ApiResponse>;
  resendOtp: (email: string) => Promise<ApiResponse>;
  register: (data: any) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initAuth: () => Promise<void>;
}

// 1. Creamos el "Store" global con Zustand
export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isOrganizer: false,

  initAuth: async () => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('campus_token') : null;
    if (storedToken) {
      set({ token: storedToken });
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
      } else {
        localStorage.removeItem('campus_token');
        set({ token: null, user: null, isAuthenticated: false, isAdmin: false, isOrganizer: false });
      }
    }
    set({ isLoading: false });
  },

  loginWithGoogle: async (payload: { credential?: string; email?: string; first_name?: string; last_name?: string; avatar_url?: string }) => {
    const res = await api.post<any>('/auth/google', payload);
    if (res.success && res.data?.access_token) {
      const accessToken = res.data.access_token;
      localStorage.setItem('campus_token', accessToken);
      const u = res.data.user;
      const role = u?.role || 'STUDENT';
      set({ 
        token: accessToken, 
        user: u, 
        isAuthenticated: true,
        isAdmin: role === 'ADMIN',
        isOrganizer: role === 'ORGANIZER' || role === 'ADMIN',
      });
    }
    return res;
  },

  verifyOtp: async (email: string, code: string) => {
    const res = await api.post('/auth/verify-otp', { email, code });
    if (res.success && res.data) {
      const accessToken = res.data.access_token;
      localStorage.setItem('campus_token', accessToken);
      const u = res.data.user;
      const role = u.role || 'STUDENT';
      set({ 
        token: accessToken, 
        user: u, 
        isAuthenticated: true,
        isAdmin: role === 'ADMIN',
        isOrganizer: role === 'ORGANIZER' || role === 'ADMIN',
      });
    }
    return res;
  },

  resendOtp: async (email: string) => {
    return api.post('/auth/resend-otp', { email });
  },

  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const accessToken = res.data.access_token;
      localStorage.setItem('campus_token', accessToken);
      const u = res.data.user;
      const role = u.role || 'STUDENT';
      set({ 
        token: accessToken, 
        user: u, 
        isAuthenticated: true,
        isAdmin: role === 'ADMIN',
        isOrganizer: role === 'ORGANIZER' || role === 'ADMIN',
      });
    }
    return res;
  },

  register: async (formData: any) => {
    return api.post('/auth/register', formData);
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('campus_token');
    set({ token: null, user: null, isAuthenticated: false, isAdmin: false, isOrganizer: false });
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
  }
}));

// 2. Mantenemos este Provider solo por retrocompatibilidad con layout.tsx
// Su única función ahora es arrancar initAuth cuando la app se carga por primera vez.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuth(state => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return <>{children}</>;
}
