'use client';

import React, { useEffect } from 'react';
import { create } from 'zustand';
import { api, ApiResponse } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  status: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiResponse>;
  register: (data: any) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initAuth: () => Promise<void>;
}

// 1. Creamos el "Store" global con Zustand
export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  initAuth: async () => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('campus_token') : null;
    if (storedToken) {
      set({ token: storedToken });
      const res = await api.get<User>('/auth/me');
      if (res.success && res.data) {
        set({ user: res.data, isAuthenticated: true });
      } else {
        localStorage.removeItem('campus_token');
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
    set({ isLoading: false });
  },

  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const accessToken = res.data.access_token;
      localStorage.setItem('campus_token', accessToken);
      set({ 
        token: accessToken, 
        user: res.data.user, 
        isAuthenticated: true 
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
    set({ token: null, user: null, isAuthenticated: false });
  },

  refreshUser: async () => {
    const res = await api.get<User>('/auth/me');
    if (res.success && res.data) {
      set({ user: res.data, isAuthenticated: true });
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
