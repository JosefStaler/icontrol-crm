"use client";
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SWRConfig } from 'swr';
import { useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json()),
        refreshInterval: 15000, // 15 segundos para manter dados atualizados
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        errorRetryCount: 5,
        errorRetryInterval: 3000,
        onError: (error) => {
          console.error('SWR Error:', error);
        },
        onSuccess: (data, key) => {
          console.log('SWR Success:', key, data);
        },
      }}
    >
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SWRConfig>
  );
}






