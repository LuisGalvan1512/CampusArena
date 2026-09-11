import { supabase } from './supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('campus_token');
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    let token = this.getAuthToken();

    // Fallback: Check active Supabase session
    if (!token && typeof window !== 'undefined') {
      try {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token || null;
        if (token) {
          localStorage.setItem('campus_token', token);
        }
      } catch (e) {
        // silent catch
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Automatic Refresh with Supabase on 401
      if (response.status === 401 && !endpoint.includes('/auth/logout')) {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (data?.session?.access_token) {
            const newToken = data.session.access_token;
            localStorage.setItem('campus_token', newToken);
            headers['Authorization'] = `Bearer ${newToken}`;

            // Retry request with fresh token
            response = await fetch(url, {
              ...options,
              headers,
            });
          } else {
            localStorage.removeItem('campus_token');
          }
        } catch (refreshErr) {
          localStorage.removeItem('campus_token');
        }
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'No se pudo conectar con el servidor. Verifica que el backend esté activo.',
          details: err?.message,
        },
      };
    }
  }

  get<T = any>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
