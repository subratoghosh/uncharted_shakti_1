'use client';

import React, { createContext, useContext, useRef, useCallback } from 'react';

interface PageCacheContextType {
  getCache: <T>(key: string) => T | undefined;
  setCache: <T>(key: string, data: T, ttlMs?: number) => void;
  invalidateCache: (keyPrefix: string) => void;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const PageCacheContext = createContext<PageCacheContextType | null>(null);

export const PageCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());

  const getCache = useCallback(<T,>(key: string): T | undefined => {
    const entry = cacheRef.current.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      cacheRef.current.delete(key);
      return undefined;
    }
    return entry.data as T;
  }, []);

  const setCache = useCallback(<T,>(key: string, data: T, ttlMs: number = 1000 * 60 * 15) => {
    cacheRef.current.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }, []);

  const invalidateCache = useCallback((keyPrefix: string) => {
    Array.from(cacheRef.current.keys()).forEach((key) => {
      if (key.startsWith(keyPrefix)) {
        cacheRef.current.delete(key);
      }
    });
  }, []);

  return (
    <PageCacheContext.Provider value={{ getCache, setCache, invalidateCache }}>
      {children}
    </PageCacheContext.Provider>
  );
};

export function usePageCache() {
  const ctx = useContext(PageCacheContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    return {
      getCache: <T,>(_key: string): T | undefined => undefined,
      setCache: <T,>(_key: string, _data: T) => {},
      invalidateCache: (_keyPrefix: string) => {},
    };
  }
  return ctx;
}
