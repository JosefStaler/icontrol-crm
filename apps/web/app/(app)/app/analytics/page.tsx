"use client";
import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { Guarded } from '@/components/Guarded';
import { useSession } from '@/lib/auth';

export default function AnalyticsPage() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const { authenticated, loading } = useSession();
  const { data: preset } = useSWR(authenticated ? '/api/dashboard-settings/retiradas' : null);
  const presetMonth = preset?.settings?.month as string | undefined;
  const presetYear = preset?.settings?.year as string | undefined;
  const effectiveMonth = month || presetMonth || mm;
  const effectiveYear = year || presetYear || String(yyyy);
  const { data, isLoading, mutate } = useSWR(
    authenticated ? `/api/reports/retiradas?month=${encodeURIComponent(effectiveMonth)}&year=${effectiveYear}` : null,
    null,
    {
      refreshInterval: 30000, // 30 segundos para dados do dashboard
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  const rows: any[] = useMemo(() => (Array.isArray(data) ? data : data?.data ?? []), [data]);

  // Técnicos disponíveis a partir dos dados carregados
  const availableTechnicians = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const t = (r['Técnico - Último Atendimento'] ?? r['Ultimo Atendimento'] ?? '').toString().trim();
      if (t) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [rows]);

  // Estado local do filtro multi seleção
  const [techFilter, setTechFilter] = useState<string[]>([]);

  // Inicializa seleção a partir do preset quando carregar
  useEffect(() => {
    if (preset?.settings?.tecnicosGrafico && Array.isArray(preset.settings.tecnicosGrafico)) {
      setTechFilter(preset.settings.tecnicosGrafico as string[]);
    }
  }, [preset]);

  // Demais filtros (projeto importado): Status, Modelo, Tipo-Subtipo
  const availableStatus = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const s = (r['Status iCare'] ?? r['Status'] ?? '').toString().trim();
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [rows]);

  const availableModelos = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const m = (r['Modelo'] ?? '').toString().trim();
      if (m) set.add(m);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [rows]);

  const availableTipos = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const t = (r['Tipo-Subtipo de Serviço'] ?? r['Tipo-Subtipo'] ?? '').toString().trim();
      if (t) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [rows]);

  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [modeloFilter, setModeloFilter] = useState<string[]>([]);
  const [tipoFilter, setTipoFilter] = useState<string[]>([]);
  const [metaPercent, setMetaPercent] = useState<string>('');

  useEffect(() => {
    if (preset?.settings) {
      const s = preset.settings.statusFiltro;
      const m = preset.settings.modelosFiltro;
      const t = preset.settings.tiposFiltro;
      if (Array.isArray(s)) setStatusFilter(s as string[]);
      if (Array.isArray(m)) setModeloFilter(m as string[]);
      if (Array.isArray(t)) setTipoFilter(t as string[]);
    }
  }, [preset]);

  useEffect(() => {
    if (preset?.settings?.metaRetiradasPercent !== undefined) {
      const v = preset.settings.metaRetiradasPercent;
      setMetaPercent(String(typeof v === 'number' ? v : Number(v) || ''));
    }
  }, [preset]);

  const { trigger: savePreset, isMutating } = useSWRMutation(
    '/api/dashboard-settings/retiradas',
    async (url, { arg }: { arg: { month: string; year: string; tecnicosGrafico?: string[]; statusFiltro?: string[]; modelosFiltro?: string[]; tiposFiltro?: string[]; metaRetiradasPercent?: number } }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Falha ao salvar preset');
      return res.json();
    },
  );

  function formatValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toLocaleDateString('pt-BR');
    if (typeof value === 'string') {
      // ISO: 2025-04-13T00:00:00.000Z ou Date-only: 2023-11-24
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

  return (
    <Guarded
      roles={["admin","manager"]}
      fallback={<div className="p-4 border rounded bg-yellow-50 text-yellow-900 text-sm">Você não tem permissão para acessar esta página.</div>}
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Analytics - Retiradas</h1>
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex flex-col text-sm">
          <label className="text-gray-600">Mês</label>
          <select className="border px-2 py-1 rounded" value={effectiveMonth} onChange={(e) => setMonth(e.target.value)}>
            <option>JANEIRO</option>
            <option>FEVEREIRO</option>
            <option>MARÇO</option>
            <option>ABRIL</option>
            <option>MAIO</option>
            <option>JUNHO</option>
            <option>JULHO</option>
            <option>AGOSTO</option>
            <option>SETEMBRO</option>
            <option>OUTUBRO</option>
            <option>NOVEMBRO</option>
            <option>DEZEMBRO</option>
          </select>
        </div>
        <div className="flex flex-col text-sm">
          <label className="text-gray-600">Ano</label>
          <input type="number" className="border px-2 py-1 rounded" value={Number(effectiveYear)} onChange={(e) => setYear(String(Number(e.target.value) || yyyy))} />
        </div>
        <button className="px-3 py-1 border" onClick={() => mutate()}>Atualizar</button>
        <button
          className="px-3 py-1 border"
          onClick={async () => {
            await savePreset({ month, year, tecnicosGrafico: techFilter, statusFiltro: statusFilter, modelosFiltro: modeloFilter, tiposFiltro: tipoFilter, metaRetiradasPercent: Number(metaPercent) || 0 });
            // opcional: feedback
          }}
          disabled={isMutating}
        >Salvar preset</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col gap-2">
          <label className="text-gray-600">Meta Retiradas (%)</label>
          <input
            type="number"
            className="border px-2 py-1 rounded"
            value={metaPercent}
            onChange={(e) => setMetaPercent(e.target.value)}
            min={0}
            max={100}
            step={1}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <label className="text-gray-600">Técnicos - Apenas Gráfico</label>
        <div className="flex flex-wrap gap-2">
          <select
            multiple
            className="border rounded px-2 py-1 min-w-[260px] h-32"
            value={techFilter}
            onChange={(e) => {
              const opts = Array.from(e.target.selectedOptions).map(o => o.value);
              setTechFilter(opts);
            }}
          >
            {availableTechnicians.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button className="px-2 py-1 border" onClick={() => setTechFilter([])}>Limpar seleção</button>
        </div>
        <div className="text-xs text-gray-500">Selecione um ou mais técnicos para exibir os gráficos "Status no iCare - Com Técnico" e "Status Detalhado por Técnico".</div>
      </div>

      {/* Demais filtros simples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col gap-2">
          <label className="text-gray-600">Status</label>
          <select multiple className="border rounded px-2 py-1 min-h-[8rem]" value={statusFilter} onChange={(e) => setStatusFilter(Array.from(e.target.selectedOptions).map(o => o.value))}>
            {availableStatus.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="px-2 py-1 border w-fit" onClick={() => setStatusFilter([])}>Limpar</button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-gray-600">Modelo</label>
          <select multiple className="border rounded px-2 py-1 min-h-[8rem]" value={modeloFilter} onChange={(e) => setModeloFilter(Array.from(e.target.selectedOptions).map(o => o.value))}>
            {availableModelos.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button className="px-2 py-1 border w-fit" onClick={() => setModeloFilter([])}>Limpar</button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-gray-600">Tipo-Subtipo de Serviço</label>
          <select multiple className="border rounded px-2 py-1 min-h-[8rem]" value={tipoFilter} onChange={(e) => setTipoFilter(Array.from(e.target.selectedOptions).map(o => o.value))}>
            {availableTipos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="px-2 py-1 border w-fit" onClick={() => setTipoFilter([])}>Limpar</button>
        </div>
      </div>
        {loading || isLoading ? (
          <div>Carregando...</div>
        ) : (
          <div className="overflow-auto border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {rows[0] && Object.keys(rows[0]).map((k) => (
                    <th key={k} className="p-2 text-left border">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    {Object.keys(rows[0] ?? {}).map((k) => (
                      <td key={k} className="p-2 border">{formatValue(r[k])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Guarded>
  );
}


