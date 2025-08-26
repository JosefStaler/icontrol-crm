"use client";
import { useEffect, useMemo, useState } from 'react';
import { buildZodFromConfig } from '@/lib/validators';
import { useSession } from '@/lib/auth';

function inferIdKey(row: Record<string, any> | null | undefined, columns?: Array<{ key: string; editable?: boolean }>): string {
  if (columns && columns.length) {
    const nonEditable = columns.find((c) => c.editable === false)?.key;
    if (nonEditable) return nonEditable;
  }
  if (!row) return 'Id';
  if ('CustomerID' in row) return 'CustomerID';
  if ('CustomerId' in row) return 'CustomerId';
  if ('customerId' in row) return 'customerId';
  if ('Id' in row) return 'Id';
  if ('ID' in row) return 'ID';
  const keys = Object.keys(row);
  return keys[0] ?? 'Id';
}

export function EntityInlineEditor({
  entity,
  row,
  columns,
  onSaved,
  onCancel,
}: {
  entity: string;
  row: Record<string, any> | null;
  columns?: Array<{ key: string; type: string; zod?: string; editable?: boolean }>;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [error, setError] = useState<string>('');
  const idKey = useMemo(() => inferIdKey(row, columns as any), [row, columns]);
  const idValue = row ? row[idKey] : undefined;
  const { user } = useSession();
  const canUpdate = useMemo(() => {
    const roles: string[] = user?.roles ?? [];
    const perms: string[] = user?.permissions ?? [];
    return roles.includes('admin') || roles.includes('manager') || perms.includes(`${entity}:update`);
  }, [user, entity]);

  const schema = useMemo(() => (columns ? buildZodFromConfig(columns) : null), [columns]);

  useEffect(() => {
    setForm(row ?? {});
  }, [row]);

  if (!row) return null;

  async function save() {
    setError('');
    if (idValue === undefined || idValue === null || idValue === '') {
      setError('Registro sem ID. Não é possível salvar.');
      return;
    }
    const data: Record<string, any> = {};
    for (const [k, v] of Object.entries(form)) {
      if (k === idKey) continue;
      if (columns?.find((c) => c.key === k)?.editable === false) continue;
      if (['string', 'number', 'boolean'].includes(typeof v)) data[k] = v;
    }
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        setError('Validação falhou. Verifique os campos.');
        return;
      }
    }
    const res = await fetch(`/api/entities/${entity}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: idValue, data }),
      credentials: 'include',
    });
    if (res.ok) {
      onSaved();
    } else {
      const text = await res.text();
      try {
        const j = JSON.parse(text);
        setError(String(j?.error ?? j?.details ?? 'Falha ao salvar.'));
      } catch {
        setError(text || 'Falha ao salvar.');
      }
    }
  }

  return (
    <div className="p-4 border rounded space-y-2">
      <div className="font-medium">Editar registro {String(idValue)}</div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="grid md:grid-cols-2 gap-3">
        {Object.entries(form).map(([k, v]) => (
          <div key={k} className="flex flex-col text-sm">
            <label className="text-gray-600 mb-1">{k}</label>
            {typeof v === 'boolean' ? (
              <input
                type="checkbox"
                checked={Boolean(form[k])}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.checked }))}
                disabled={k === idKey || columns?.find((c) => c.key === k)?.editable === false}
              />
            ) : (
              <input
                className="border px-2 py-1 rounded"
                value={String(form[k] ?? '')}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [k]: typeof v === 'number' ? Number(e.target.value) : e.target.value }))
                }
                disabled={k === idKey || columns?.find((c) => c.key === k)?.editable === false}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1 border" onClick={onCancel}>Cancelar</button>
        <button className="px-3 py-1 border bg-black text-white disabled:opacity-50" onClick={save} disabled={!canUpdate}>Salvar</button>
      </div>
      {!canUpdate && <div className="text-xs text-gray-500">Sem permissão para atualizar.</div>}
    </div>
  );
}
