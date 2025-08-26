"use client";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());

export function useSession() {
  const { data, isLoading } = useSWR('/api/auth/me', fetcher, { refreshInterval: 60_000 });
  return { user: data?.user, authenticated: Boolean(data?.authenticated), loading: isLoading };
}





