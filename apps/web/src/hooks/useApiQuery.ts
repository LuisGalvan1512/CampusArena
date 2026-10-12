'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiResponse } from '@/lib/api';

export interface UseApiQueryOptions<T> {
  cacheTtlMs?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export interface UseApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  refetch: (skipCache?: boolean) => Promise<ApiResponse<T>>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Custom Stale-While-Revalidate (SWR) hook for instant 0ms cached page transitions.
 * - If cached data exists in memory: returns it immediately (isLoading: false).
 * - Fires background request to silently revalidate fresh data.
 * - If no cached data exists: shows initial loading state (isLoading: true).
 */
export function useApiQuery<T = any>(
  endpoint: string | null,
  options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
  const { enabled = true, cacheTtlMs, onSuccess, onError } = options;

  // Read initial cache synchronously (0ms render)
  const initialCache = endpoint ? api.getCached<T>(endpoint) : null;
  const initialData = (initialCache?.success && initialCache.data !== undefined) ? initialCache.data : null;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData && enabled && Boolean(endpoint));
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (skipCache = false): Promise<ApiResponse<T>> => {
      if (!endpoint || !enabled) {
        return { success: false };
      }

      setIsFetching(true);
      try {
        const res = await api.get<T>(endpoint, { skipCache, cacheTtlMs });
        if (!isMountedRef.current) return res;

        if (res.success && res.data !== undefined) {
          setData(res.data);
          setError(null);
          onSuccess?.(res.data);
        } else {
          setError(res.error || null);
          onError?.(res.error);
        }
        return res;
      } catch (err: any) {
        if (!isMountedRef.current) return { success: false, error: err };
        setError(err);
        onError?.(err);
        return { success: false, error: err };
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    },
    [endpoint, enabled, cacheTtlMs, onSuccess, onError]
  );

  useEffect(() => {
    if (!endpoint || !enabled) return;

    // Synchronize state if endpoint changes and cache is present
    const cached = api.getCached<T>(endpoint);
    if (cached?.success && cached.data !== undefined) {
      setData(cached.data);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    // Always revalidate in background
    fetchData(false);
  }, [endpoint, enabled, fetchData]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchData,
    setData,
  };
}
