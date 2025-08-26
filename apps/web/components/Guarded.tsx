"use client";
import type { ReactNode } from 'react';
import { useSession } from '@/lib/auth';

export function Guarded({ roles, permissions, children, fallback }: { roles?: string[]; permissions?: string[]; children: ReactNode; fallback?: ReactNode }) {
  const { user, loading } = useSession();
  const userRoles: string[] = user?.roles ?? [];
  const userPerms: string[] = user?.permissions ?? [];

  const roleOk = !roles || roles.some((r) => userRoles.includes(r));
  const permOk = !permissions || permissions.some((p) => userPerms.includes(p));

  if (loading) return null;
  if (!roleOk || !permOk) return <>{fallback ?? null}</>;
  return <>{children}</>;
}


