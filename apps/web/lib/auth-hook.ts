"use client";
import useSWR from 'swr';
import { useCallback } from 'react';

export function useAuth() {
  const { data, isLoading, error, mutate } = useSWR('/api/auth/me', null, { 
    refreshInterval: 30000, // 30 segundos
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    onError: (error) => {
      console.error('Auth Error:', error);
    },
  });
  
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Força revalidação da sessão
      await mutate();
    }
  }, [mutate]);

  return { 
    user: data?.user, 
    authenticated: Boolean(data?.authenticated), 
    loading: isLoading,
    error,
    logout,
    mutate
  };
}
