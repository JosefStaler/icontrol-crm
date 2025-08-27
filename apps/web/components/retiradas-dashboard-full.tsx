"use client";
import React, { useMemo } from 'react';
import { StatCard } from './ui/stat-card';
import { StatCardWithTextarea } from './ui/stat-card-with-textarea';
import { ClipboardList, CheckCircle, AlertTriangle, FileSpreadsheet, XCircle } from 'lucide-react';
import { Charts } from './retiradas/charts';

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string') {
    const iso = value.includes('T') ? value : `${value}T00:00:00`;
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

export function RetiradasDashboard({ rows, monthName, year, tecnicoFilter = [], metaPercentTarget }: { rows: any[]; monthName: string; year: number; tecnicoFilter?: string[]; metaPercentTarget?: number }): JSX.Element {
  const debug = false;
  const canonicalMonths = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
  let referenceMonthName = monthName;
  if (/^\d+$/.test(String(monthName))) {
    const n = Math.max(1, Math.min(12, Number(monthName)));
    referenceMonthName = canonicalMonths[n - 1];
  }
  const referenceYear = year;

  const referenceMonth = useMemo(() => {
    const map = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
    const idx = map.indexOf(referenceMonthName?.toUpperCase?.() ?? '');
    return idx >= 0 ? idx : new Date().getMonth();
  }, [referenceMonthName]);

  const filteredServices = rows || [];

  const referenceMonthServices = useMemo(() => filteredServices.filter((s: any) => {
    const d = parseDate(s['Data Criação'] ?? s['Data Criacao']);
    return d && d.getMonth() === referenceMonth && d.getFullYear() === referenceYear;
  }), [filteredServices, referenceMonth, referenceYear]);

  const referenceMonthServicesExcludingCancelled = useMemo(
    () => referenceMonthServices.filter((s: any) => !String(s['Status iCare'] ?? s['Status'] ?? '').includes('Cancelado')),
    [referenceMonthServices]
  );

  const referenceMonthExecutedServices = useMemo(() => filteredServices.filter((s: any) => {
    const d = parseDate(s['Data Execução'] ?? s['Data Execucao']);
    return d && d.getMonth() === referenceMonth && d.getFullYear() === referenceYear;
  }), [filteredServices, referenceMonth, referenceYear]);

  const isSucesso = (status?: string) => !!status && (status.includes('Sucesso-Reuso') || status.includes('Sucesso-Reversa'));
  const isFinalizado = (status?: string) => !!status && (status.includes('Finalizado') || isSucesso(status));

  const allSucessosTotal = useMemo(() => referenceMonthExecutedServices.filter((s: any) => isSucesso(s['Status iCare'] ?? s['Status'])).length, [referenceMonthExecutedServices]);

  const referenceMonthTotal = referenceMonthServices.length;
  const referenceMonthTotalExcludingCancelled = referenceMonthServicesExcludingCancelled.length;
  const sucessoPercentage = referenceMonthTotalExcludingCancelled > 0
    ? Math.round((allSucessosTotal / referenceMonthTotalExcludingCancelled) * 100)
    : 0;
  const metaPercent = typeof metaPercentTarget === 'number' && !Number.isNaN(metaPercentTarget) ? metaPercentTarget : undefined;
  const faltaParaMetaTotal = metaPercent !== undefined && referenceMonthTotalExcludingCancelled > 0
    ? Math.max(0, Math.ceil((metaPercent / 100) * referenceMonthTotalExcludingCancelled) - allSucessosTotal)
    : undefined;

  const canceladasTotal = filteredServices.filter((s: any) => (s['Status iCare'] ?? s['Status'])?.includes('Cancelado')).length;
  const canceladasTotalTrend = referenceMonthTotal > 0 ? Math.round((canceladasTotal / referenceMonthTotal) * 100) : 0;

  const insucessoTotal = filteredServices.filter((s: any) => (s['Status iCare'] ?? s['Status'])?.includes('Insucesso')).length;
  const insucessoTotalTrend = referenceMonthTotal > 0 ? Math.round((insucessoTotal / referenceMonthTotal) * 100) : 0;

  const backlogCount = filteredServices.filter((s: any) => {
    const st = s['Status iCare'] ?? s['Status'];
    return !!st && (st.includes('Backlog'));
  }).length;

  const sucessoModemFibraTotal = useMemo(() => referenceMonthExecutedServices.filter((s: any) => String(s['Modelo'] ?? '') === 'MODEM FIBRA' && isSucesso(s['Status iCare'] ?? s['Status'])).length, [referenceMonthExecutedServices]);
  const referenciaFibraTotal = referenceMonthServicesExcludingCancelled.filter((s: any) => String(s['Modelo'] ?? '') === 'MODEM FIBRA').length;
  const referenciaFibraTotalAll = referenceMonthServices.filter((s: any) => String(s['Modelo'] ?? '') === 'MODEM FIBRA').length;
  const sucessoModemFibraTrend = referenciaFibraTotal > 0 ? Math.round((sucessoModemFibraTotal / referenciaFibraTotal) * 100) : 0;
  const faltaParaMetaFibra = metaPercent !== undefined && referenciaFibraTotal > 0
    ? Math.max(0, Math.ceil((metaPercent / 100) * referenciaFibraTotal) - sucessoModemFibraTotal)
    : undefined;

  const sucessoOutrosTotal = useMemo(() => referenceMonthExecutedServices.filter((s: any) => String(s['Modelo'] ?? '') !== 'MODEM FIBRA' && isSucesso(s['Status iCare'] ?? s['Status'])).length, [referenceMonthExecutedServices]);
  const referenciaOutrosTotal = referenceMonthServicesExcludingCancelled.filter((s: any) => String(s['Modelo'] ?? '') !== 'MODEM FIBRA').length;
  const referenciaOutrosTotalAll = referenceMonthServices.filter((s: any) => String(s['Modelo'] ?? '') !== 'MODEM FIBRA').length;
  const sucessoOutrosTrend = referenciaOutrosTotal > 0 ? Math.round((sucessoOutrosTotal / referenciaOutrosTotal) * 100) : 0;
  const faltaParaMetaOutros = metaPercent !== undefined && referenciaOutrosTotal > 0
    ? Math.max(0, Math.ceil((metaPercent / 100) * referenciaOutrosTotal) - sucessoOutrosTotal)
    : undefined;

  const backlogFibraCount = filteredServices.filter((s: any) => (String(s['Modelo'] ?? '') === 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Backlog')).length;
  const backlogPaytvCount = filteredServices.filter((s: any) => (String(s['Modelo'] ?? '') !== 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Backlog')).length;
  const insucessoFibra = filteredServices.filter((s: any) => (String(s['Modelo'] ?? '') === 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Insucesso')).length;
  const canceladasFibra = referenceMonthServices.filter((s: any) => (String(s['Modelo'] ?? '') === 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Cancelado')).length;
  const insucessoPaytv = filteredServices.filter((s: any) => (String(s['Modelo'] ?? '') !== 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Insucesso')).length;
  const canceladasPaytv = referenceMonthServices.filter((s: any) => (String(s['Modelo'] ?? '') !== 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Cancelado')).length;

  const statusICareData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const st = (s as any)['Status iCare'] ?? (s as any)['Status'] ?? 'Outros';
      const group = st.includes('Sucesso') ? 'Sucesso'
        : st.includes('Backlog') ? 'Backlog'
        : st.includes('Insucesso') ? 'Insucesso'
        : st.includes('Cancelado') ? 'Cancelado'
        : st;
      map.set(group, (map.get(group) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredServices]);

  const statusICareOriginalData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const st = (s as any)['Status iCare'] ?? (s as any)['Status'] ?? 'Outros';
      map.set(st, (map.get(st) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredServices]);

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(referenceYear, i, 1).toLocaleDateString('pt-BR', { month: 'short' }));
    return months.map((m, i) => ({
      month: m,
      finalizados: filteredServices.filter((s: any) => isFinalizado((s as any)['Status iCare'] ?? (s as any)['Status']) && parseDate((s as any)['Data Criação'] ?? (s as any)['Data Criacao'])?.getMonth() === i).length,
      pendentes: filteredServices.filter((s: any) => ((s as any)['Status iCare'] ?? (s as any)['Status'])?.includes('Pendente') && parseDate((s as any)['Data Criação'] ?? (s as any)['Data Criacao'])?.getMonth() === i).length,
      emAndamento: filteredServices.filter((s: any) => ((s as any)['Status iCare'] ?? (s as any)['Status'])?.includes('Andamento') && parseDate((s as any)['Data Criação'] ?? (s as any)['Data Criacao'])?.getMonth() === i).length,
      cycleTime: 0,
    }));
  }, [filteredServices, referenceYear]);

  const tipoServicoData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const k = (s as any)['Tipo-Subtipo de Serviço'] ?? (s as any)['Tipo-Subtipo'] ?? 'Outros';
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [filteredServices]);

  const modeloData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const k = (s as any)['Modelo'] ?? 'Outros';
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [filteredServices]);

  const statusByModelData = useMemo(() => {
    const toGroupStatus = (st: string): string =>
      st.includes('Sucesso') ? 'Sucesso'
      : st.includes('Backlog') ? 'Backlog'
      : st.includes('Insucesso') ? 'Insucesso'
      : 'Outros';

    const normalizeModel = (m: string): string => {
      const v = String(m || '').toUpperCase();
      if (v.includes('MODEM FIBRA')) return 'MODEM FIBRA';
      if (v.includes('DVR ANDROID 4K')) return 'DVR ANDROID 4K';
      if (v === 'HD' || v.includes('HD PLUS')) return 'HD PLUS';
      if (v.includes('HD SLIM') || v.includes('SLIM') || v.includes('SH10') || v.includes('ZAPPER')) return 'ZAPPER';
      if (v === 'LINHA' || v === 'S14') return 'LINHA';
      return 'OUTROS';
    };

    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const modelRaw = String((s as any)['Modelo'] ?? '');
      const model = normalizeModel(modelRaw);
      if (model === 'OUTROS') continue;
      const statusGroup = toGroupStatus(String((s as any)['Status iCare'] ?? (s as any)['Status'] ?? ''));
      if (statusGroup === 'Outros') continue;
      const key = `${model} - ${statusGroup}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredServices]);

  const combinedBacklogEvolutionData = useMemo(() => {
    const daysInMonth = new Date(referenceYear, referenceMonth + 1, 0).getDate();
    const now = new Date();
    const isCurrentMonth =
      now.getFullYear() === referenceYear && now.getMonth() === referenceMonth;
    const lastDay = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;
    const out: Array<{ day: string; backlog: number; retiradas: number; backlogWithPrevious: number; sucessoWithPrevious: number; date: string; }> = [];
    for (let d = 1; d <= lastDay; d++) {
      const measurementDate = new Date(referenceYear, referenceMonth, d);
      const isSameDay = (dt: Date | null) => dt && dt.getDate() === d && dt.getMonth() === referenceMonth && dt.getFullYear() === referenceYear;
      const backlog = filteredServices.filter((s: any) => ((s as any)['Status iCare'] ?? (s as any)['Status'])?.includes('Backlog') && (parseDate((s as any)['Data Criação'] ?? (s as any)['Data Criacao']) ?? new Date(0)) <= measurementDate).length;
      const retiradas = filteredServices.filter((s: any) => isSameDay(parseDate((s as any)['Data Execução'] ?? (s as any)['Data Execucao'])) && isSucesso((s as any)['Status iCare'] ?? (s as any)['Status'])).length;
      const backlogWithPrevious = filteredServices.filter((s: any) => ((s as any)['Status iCare'] ?? (s as any)['Status'])?.includes('Backlog') && ((s as any)['Técnico - Último Atendimento'] ?? (s as any)['Ultimo Atendimento']) && (parseDate((s as any)['Data Criação'] ?? (s as any)['Data Criacao']) ?? new Date(0)) <= measurementDate).length;
      const sucessoWithPrevious = filteredServices.filter((s: any) => isSameDay(parseDate((s as any)['Data Execução'] ?? (s as any)['Data Execucao'])) && isSucesso((s as any)['Status iCare'] ?? (s as any)['Status']) && ((s as any)['Técnico - Último Atendimento'] ?? (s as any)['Ultimo Atendimento'])).length;
      out.push({ day: String(d).padStart(2, '0'), backlog, retiradas, backlogWithPrevious, sucessoWithPrevious, date: measurementDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) });
    }
    return out;
  }, [filteredServices, referenceMonth, referenceYear]);

  const statusAtividadeData: Array<{ name: string; value: number }> = [];
  const statusICareWithTecnicoData: Array<{ name: string; value: number }> = useMemo(() => {
    if (!tecnicoFilter || tecnicoFilter.length === 0) return [];
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const tecnico = String((s as any)['Técnico - Último Atendimento'] ?? (s as any)['Ultimo Atendimento'] ?? '').trim();
      if (!tecnico || !tecnicoFilter.includes(tecnico)) continue;
      const st = (s as any)['Status iCare'] ?? (s as any)['Status'] ?? 'Outros';
      const group = st.includes('Sucesso') ? 'Sucesso'
        : st.includes('Backlog') ? 'Backlog'
        : st.includes('Insucesso') ? 'Insucesso'
        : st.includes('Cancelado') ? 'Cancelado'
        : 'Outros';
      map.set(group, (map.get(group) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredServices, tecnicoFilter]);

  const statusICareDetailedByTecnicoData: Array<{ name: string; value: number }> = useMemo(() => {
    if (!tecnicoFilter || tecnicoFilter.length === 0) return [];
    const map = new Map<string, number>();
    const toGroup = (st: string): string =>
      st.includes('Sucesso') ? 'Sucesso'
      : st.includes('Backlog') ? 'Backlog'
      : st.includes('Insucesso') ? 'Insucesso'
      : st.includes('Cancelado') ? 'Cancelado'
      : 'Outros';
    for (const s of filteredServices) {
      const tecnico = String((s as any)['Técnico - Último Atendimento'] ?? (s as any)['Ultimo Atendimento'] ?? '').trim();
      if (!tecnico || !tecnicoFilter.includes(tecnico)) continue;
      const st = String((s as any)['Status iCare'] ?? (s as any)['Status'] ?? 'Outros');
      const group = toGroup(st);
      if (group === 'Cancelado') continue;
      const key = `${tecnico} - ${group}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const orderIndex = (g: string) => (g === 'Backlog' ? 0 : g === 'Sucesso' ? 1 : 2);
    const extractGroup = (name: string) => {
      const parts = name.split(' - ');
      return parts[parts.length - 1] || '';
    };
    const extractTech = (name: string) => {
      const parts = name.split(' - ');
      parts.pop();
      return parts.join(' - ');
    };
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const ga = extractGroup(a.name);
        const gb = extractGroup(b.name);
        const oi = orderIndex(ga) - orderIndex(gb);
        if (oi !== 0) return oi;
        return extractTech(a.name).localeCompare(extractTech(b.name), 'pt-BR');
      });
  }, [filteredServices, tecnicoFilter]);

  return (
    <div className="space-y-6">
             <div className={`grid grid-cols-3 gap-4 auto-rows-fr${debug ? ' outline outline-1 outline-red-300' : ''}`}>
         <StatCardWithTextarea 
           size="sm" 
           className={`h-full min-w-0 w-full${debug ? ' outline outline-1 outline-blue-300' : ''}`} 
           title="Estatísticas de Retiradas - GERAL" 
           subtitle="Retiradas Entrantes no Período" 
           value={referenceMonthServices.length} 
           icon={<ClipboardList className="h-5 w-5" />} 
           variant="accent"
           textareaTitle="Observações"
           textareaValue={`- Quantidade de retiradas entrantes independente de Status;

- O Percentual da meta não considera itens cancelados.`}
         />
         <StatCardWithTextarea 
           size="sm" 
           className={`h-full min-w-0 w-full${debug ? ' outline outline-1 outline-blue-300' : ''}`} 
           title="Estatísticas de Retiradas - FIBRA" 
           subtitle="Retiradas Entrantes no Período" 
           value={referenciaFibraTotalAll} 
           icon={<ClipboardList className="h-5 w-5" />} 
           variant="accent"
           textareaTitle="Observações"
           textareaValue={`- Quantidade de retiradas entrantes independente de Status;

- O Percentual da meta não considera itens cancelados.`}
         />
         <StatCardWithTextarea 
           size="sm" 
           className={`h-full min-w-0 w-full${debug ? ' outline outline-1 outline-blue-300' : ''}`} 
           title="Estatísticas de Retiradas - PAYTV" 
           subtitle="Retiradas Entrantes no Período" 
           value={referenciaOutrosTotalAll} 
           icon={<ClipboardList className="h-5 w-5" />} 
           variant="accent"
           textareaTitle="Observações"
           textareaValue={`- Quantidade de retiradas entrantes independente de Status;

- O Percentual da meta não considera itens cancelados.`}
         />
       </div>

      <div className={`grid grid-cols-3 gap-4${debug ? ' outline outline-1 outline-green-300' : ''}`}>
        <div className={`space-y-4 min-w-0 flex flex-col w-full${debug ? ' outline outline-1 outline-blue-200' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Backlog de Retiradas TOTAL" value={backlogCount} icon={<FileSpreadsheet className="h-5 w-5" />} trend={{ isPositive: true, description: "Total de Retiradas em Backlog", hideValue: true }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Realizadas TOTAL" value={allSucessosTotal} icon={<CheckCircle className="h-5 w-5" />} variant="success" trend={{ value: sucessoPercentage, isPositive: true, description: metaPercent !== undefined && faltaParaMetaTotal !== undefined ? `Faltam ${faltaParaMetaTotal} para meta de ${metaPercent}%` : "Entrantes menos cancelados" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Insucesso TOTAL" value={insucessoTotal} icon={<XCircle className="h-5 w-5" />} variant="danger" trend={{ value: insucessoTotalTrend, isPositive: false, description: "Em relação às retiradas entrantes" }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Canceladas TOTAL" value={canceladasTotal} icon={<AlertTriangle className="h-5 w-5" />} variant="amber" trend={{ value: canceladasTotalTrend, isPositive: false, description: "Total de itens cancelados" }} />
          </div>
        </div>

        <div className={`space-y-4 min-w-0 flex flex-col w-full${debug ? ' outline outline-1 outline-blue-200' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Backlog de Retiradas FIBRA" value={backlogFibraCount} icon={<FileSpreadsheet className="h-5 w-5" />} trend={{ isPositive: true, description: "Retiradas de Modems em Backlog", hideValue: true }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Realizadas FIBRA" value={sucessoModemFibraTotal} icon={<CheckCircle className="h-5 w-5" />} variant="success" trend={{ value: sucessoModemFibraTrend, isPositive: true, description: metaPercent !== undefined && faltaParaMetaFibra !== undefined ? `Faltam ${faltaParaMetaFibra} para meta de ${metaPercent}%` : "Entrantes menos cancelados" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Insucesso FIBRA" value={insucessoFibra} icon={<XCircle className="h-5 w-5" />} variant="danger" trend={{ value: referenciaFibraTotal > 0 ? Math.round((insucessoFibra / referenciaFibraTotal) * 100) : 0, isPositive: false, description: "Em relação às retiradas entrantes" }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Canceladas FIBRA" value={canceladasFibra} icon={<AlertTriangle className="h-5 w-5" />} variant="amber" trend={{ value: referenciaFibraTotalAll > 0 ? Math.round((canceladasFibra / referenciaFibraTotalAll) * 100) : 0, isPositive: false, description: "Em relação às retiradas entrantes" }} />
          </div>
        </div>

        <div className={`space-y-4 min-w-0 flex flex-col w-full${debug ? ' outline outline-1 outline-blue-200' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Backlog de Retiradas PAYTV" value={backlogPaytvCount} icon={<FileSpreadsheet className="h-5 w-5" />} trend={{ isPositive: true, description: "Retiradas de Receptores em Backlog", hideValue: true }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Realizadas PAYTV" value={sucessoOutrosTotal} icon={<CheckCircle className="h-5 w-5" />} variant="success" trend={{ value: sucessoOutrosTrend, isPositive: true, description: metaPercent !== undefined && faltaParaMetaOutros !== undefined ? `Faltam ${faltaParaMetaOutros} para meta de ${metaPercent}%` : "Entrantes menos cancelados" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Insucesso PAYTV" value={insucessoPaytv} icon={<XCircle className="h-5 w-5" />} variant="danger" trend={{ value: referenciaOutrosTotal > 0 ? Math.round((insucessoPaytv / referenciaOutrosTotal) * 100) : 0, isPositive: false, description: "Em relação às retiradas entrantes" }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Canceladas PAYTV" value={canceladasPaytv} icon={<AlertTriangle className="h-5 w-5" />} variant="amber" trend={{ value: referenciaOutrosTotalAll > 0 ? Math.round((canceladasPaytv / referenciaOutrosTotalAll) * 100) : 0, isPositive: false, description: "Em relação às retiradas entrantes" }} />
          </div>
        </div>
      </div>

      <Charts
        statusICareData={statusICareData}
        statusICareOriginalData={statusICareOriginalData}
        statusAtividadeData={statusAtividadeData}
        monthlyData={monthlyData}
        tipoServicoData={tipoServicoData}
        modeloData={modeloData}
        statusByModelData={statusByModelData}
        combinedBacklogEvolutionData={combinedBacklogEvolutionData}
        referenceMonthName={referenceMonthName}
        referenceYear={referenceYear}
        statusICareWithTecnicoData={statusICareWithTecnicoData}
        statusICareDetailedByTecnicoData={statusICareDetailedByTecnicoData}
        tecnicoFilter={tecnicoFilter}
      />
    </div>
  );
}


