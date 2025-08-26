"use client";
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { RetiradasDashboard } from '@/components/retiradas-dashboard-full';
import { useSession } from '@/lib/auth';

const fetcher = (u: string) => fetch(u, { credentials: 'include' }).then((r) => r.json());

export default function DashboardRetiradas() {
  const { authenticated } = useSession();
  const { data: settingsData } = useSWR(authenticated ? `/api/dashboard-settings/retiradas` : null, fetcher);
  const settings = settingsData?.settings || {};
  const month = settings.month || '';
  const year = settings.year || '';
  const tecnicosGrafico: string[] = Array.isArray(settings.tecnicosGrafico) ? settings.tecnicosGrafico : [];
  const today = new Date();
  const fallbackMonth = String(today.getMonth() + 1);
  const fallbackYear = String(today.getFullYear());
  const effectiveMonth = month || fallbackMonth;
  const effectiveYear = year || fallbackYear;
  const { data } = useSWR(
    authenticated ? `/api/reports/retiradas?month=${encodeURIComponent(effectiveMonth)}&year=${effectiveYear}` : null,
    fetcher,
  );
  const rows: any[] = useMemo(() => (Array.isArray(data) ? data : data?.data ?? []), [data]);

  const displayMonthName = useMemo(() => {
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const m = String(effectiveMonth);
    if (/^\d+$/.test(m)) {
      const idx = Math.max(1, Math.min(12, Number(m))) - 1;
      return months[idx];
    }
    const upper = m.trim().toUpperCase();
    const map: Record<string,string> = {
      'JANEIRO':'Janeiro','FEVEREIRO':'Fevereiro','MARÇO':'Março','MARCO':'Março','ABRIL':'Abril','MAIO':'Maio','JUNHO':'Junho','JULHO':'Julho','AGOSTO':'Agosto','SETEMBRO':'Setembro','OUTUBRO':'Outubro','NOVEMBRO':'Novembro','DEZEMBRO':'Dezembro'
    };
    return map[upper] ?? m;
  }, [effectiveMonth]);

  function exportToCSV() {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0] ?? {});
    const escape = (val: string) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const csvLines = [
      headers.map((h) => escape(h)).join(';'),
      ...rows.map((r) => headers.map((h) => escape(formatValue(r[h]))).join(';')),
    ];
    const csvContent = '\ufeff' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-retiradas-${displayMonthName}-${String(effectiveYear)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function formatValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toLocaleDateString('pt-BR');
    if (typeof value === 'string') {
      const isIso = /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value);
      if (isIso) {
        const iso = value.includes('T') ? value : `${value}T00:00:00`;
        const d = new Date(iso);
        if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
      }
    }
    if (typeof value === 'bigint') {
      const n = Number(value);
      return Number.isSafeInteger(n) ? String(n) : String(value);
    }
    return String(value);
  }

  const [page, setPage] = useState(1);
  const pageSize = 25;
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = Math.min((page - 1) * pageSize, Math.max(0, (totalPages - 1) * pageSize));
  const end = Math.min(start + pageSize, total);
  const pageRows = rows.slice(start, end);

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-4 mb-6">
        <h1 className="text-2xl font-semibold">Retiradas de Equipamentos — {displayMonthName}/{String(effectiveYear)}</h1>
      </div>
      <RetiradasDashboard rows={rows} monthName={String(effectiveMonth)} year={Number(effectiveYear)} tecnicoFilter={tecnicosGrafico} metaPercentTarget={Number(settings?.metaRetiradasPercent) || undefined} />
      {settingsData === undefined ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-48 bg-gray-200 rounded" />
          <div className="h-6 w-64 bg-gray-200 rounded" />
        </div>
      ) : null}
      {data === undefined ? (
        <div className="overflow-auto border p-4 animate-pulse">
          <div className="h-5 w-1/2 bg-gray-200 mb-2" />
          <div className="h-5 w-2/3 bg-gray-200 mb-2" />
          <div className="h-5 w-1/3 bg-gray-200" />
        </div>
      ) : (
        <div className="overflow-auto border">
          <div className="px-3 py-2 mt-4 flex items-center justify-between gap-3">
            <div className="text-base font-semibold">Relatório de Retiradas de Equipamentos</div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">Período: {displayMonthName} / {String(effectiveYear)}</div>
              <button onClick={exportToCSV} className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-sm font-medium hover:bg-gray-50">
                Exportar CSV
              </button>
            </div>
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {rows[0] && Object.keys(rows[0]).map((k) => (
                  <th key={k} className="p-2 text-left border">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => (
                <tr key={start + i}>
                  {Object.keys(rows[0] ?? {}).map((k) => (
                    <td key={k} className="p-2 border">{formatValue(r[k])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-3 py-2 border-t text-sm">
            <div>
              Mostrando {total === 0 ? 0 : start + 1}–{end} de {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center rounded-md border px-2 py-1 disabled:opacity-50"
              >
                Anterior
              </button>
              <span>
                Página {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center rounded-md border px-2 py-1 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


