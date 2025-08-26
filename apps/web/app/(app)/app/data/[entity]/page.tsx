"use client";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { DataTable } from '@/components/DataTable';
import { useState, useMemo, useCallback } from 'react';
import { EntityInlineEditor } from '@/components/EntityInlineEditor';
import { getEntityConfig } from '@/lib/entities';
import { useSession } from '@/lib/auth';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());

export default function EntityPage() {
  const params = useParams();
  const router = useRouter();
  const entity = String(params?.entity ?? '');
  const config = getEntityConfig(entity);
  const search = useSearchParams();
  const page = Number(search.get('page') ?? '1');
  const sort = search.get('sort') ?? undefined;
  const filter = search.get('filter') ?? undefined;
  const { data, mutate } = useSWR(`/api/entities/${entity}?page=${page}&pageSize=20${sort ? `&sort=${sort}` : ''}${filter ? `&filter=${encodeURIComponent(filter)}` : ''}`, fetcher);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  const [editing, setEditing] = useState<any | null>(null);
  const { user } = useSession();
  const canUpdate = useMemo(() => {
    if (!user) return false;
    const roles: string[] = user.roles ?? [];
    const allowed = (config?.permissions?.update ?? []) as string[];
    return allowed.some((r) => roles.includes(r));
  }, [user, config]);

  const pushIfChanged = useCallback((sp: URLSearchParams) => {
    const next = sp.toString();
    const current = search.toString();
    if (next !== current) router.push(`?${next}`);
  }, [router, search]);

  const setPage = useCallback((p: number) => {
    const sp = new URLSearchParams(search.toString());
    sp.set('page', String(p));
    pushIfChanged(sp);
  }, [search, pushIfChanged]);

  const setSort = useCallback((s?: string) => {
    const sp = new URLSearchParams(search.toString());
    if (s) sp.set('sort', s);
    else sp.delete('sort');
    pushIfChanged(sp);
  }, [search, pushIfChanged]);

  const setFilter = useCallback((obj: Record<string, string>) => {
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) if (v) clean[k] = v;
    const s = Object.keys(clean).length ? JSON.stringify(clean) : undefined;
    const sp = new URLSearchParams(search.toString());
    if (s) sp.set('filter', s);
    else sp.delete('filter');
    pushIfChanged(sp);
  }, [search, pushIfChanged]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{entity}</h1>
      <DataTable
        data={rows}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onSortChange={setSort}
        onFilterChange={setFilter}
      />
      {rows.length > 0 && canUpdate && (
        <div className="grid gap-2">
          {rows.map((r: any, idx: number) => (
            <button key={idx} className="text-left underline" onClick={() => setEditing(r)}>
              Editar registro {String(Object.values(r)[0])}
            </button>
          ))}
        </div>
      )}
      <EntityInlineEditor
        entity={entity}
        row={editing}
        columns={config?.columns}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          mutate();
        }}
      />
    </div>
  );
}
