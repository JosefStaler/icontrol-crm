"use client";
import React from 'react';

type RetiradasDashboardProps = {
  rows: any[];
  monthName: string;
  year: number;
  tecnicoFilter?: string[];
  metaPercentTarget?: number;
};

export function RetiradasDashboard(props: RetiradasDashboardProps) {
  const { rows, monthName, year } = props;
  const total = Array.isArray(rows) ? rows.length : 0;

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">Resumo de Retiradas</div>
        <div className="text-sm text-gray-600">{monthName} / {String(year)}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600">Total de Registros</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600">Colunas</div>
          <div className="text-2xl font-bold">{rows && rows[0] ? Object.keys(rows[0]).length : 0}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600">Linhas não vazias</div>
          <div className="text-2xl font-bold">{Array.isArray(rows) ? rows.filter(Boolean).length : 0}</div>
        </div>
      </div>
    </div>
  );
}


