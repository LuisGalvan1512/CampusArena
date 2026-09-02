'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiResponse>;
  register: (data: any) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session on startup
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('campus_token');
      if (storedToken) {
        setToken(storedToken);
        const res = await api.get<User>('/auth/me');
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          // Token expired, clear
          localStorage.removeItem('campus_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<ApiResponse> => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const accessToken = res.data.access_token;
      localStorage.setItem('campus_token', accessToken);
      setToken(accessToken);
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (formData: any): Promise<ApiResponse> => {
    const res = await api.post('/auth/register', formData);
    return res;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('campus_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await api.get<User>('/auth/me');
    if (res.success && res.data) {
      setUser(res.data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
