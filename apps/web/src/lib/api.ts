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

interface CacheEntry<T> {
  data: ApiResponse<T>;
  timestamp: number;
}

export interface ApiRequestOptions extends RequestInit {
  skipCache?: boolean;
  cacheTtlMs?: number;
}

class ApiClient {
  private cache = new Map<string, CacheEntry<any>>();
  private inflight = new Map<string, Promise<ApiResponse<any>>>();

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('campus_token');
  }

  /**
   * Invalidates memory cache upon write operations.
   */
  public clearCache() {
    this.cache.clear();
  }

  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    const cacheKey = `${endpoint}`;
    const ttl = options.cacheTtlMs ?? 15000; // 15 seconds default

    // 1. Read from In-Memory Cache for GET requests (0ms instant response)
    if (isGet && !options.skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }

      // Deduplicate simultaneous inflight requests
      if (this.inflight.has(cacheKey)) {
        return this.inflight.get(cacheKey)!;
      }
    }

    const execRequest = async (): Promise<ApiResponse<T>> => {
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

        const data: ApiResponse<T> = await response.json();

        // Save to cache on successful GET
        if (isGet && data.success && !options.skipCache) {
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
        }

        // Auto-invalidate cache on state changes (POST/PUT/PATCH/DELETE)
        if (!isGet && data.success) {
          this.clearCache();
        }

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
      } finally {
        if (isGet) {
          this.inflight.delete(cacheKey);
        }
      }
    };

    if (isGet && !options.skipCache) {
      const promise = execRequest();
      this.inflight.set(cacheKey, promise);
      return promise;
    }

    return execRequest();
  }

  get<T = any>(endpoint: string, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
