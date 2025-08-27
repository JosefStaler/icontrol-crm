"use client";
import useSWR from 'swr';

export function useSession() {
  const { data, isLoading, error } = useSWR('/api/auth/me', null, { 
    refreshInterval: 30000, // 30 segundos
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    onError: (error) => {
      console.error('Session Error:', error);
    },
  });
  
  return { 
    user: data?.user, 
    authenticated: Boolean(data?.authenticated), 
    loading: isLoading,
    error 
  };
}

// Re-export do novo hook para compatibilidade
export { useAuth } from './auth-hook';






