"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';

export interface DataTableProps<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSortChange?: (sort: string | undefined) => void;
  onFilterChange?: (filter: Record<string, string>) => void;
}

export function DataTable<T extends Record<string, any>>({ data, total, page, pageSize, onPageChange, onSortChange, onFilterChange }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!onSortChange) return;
    if (!sorting.length) {
      onSortChange(undefined);
    } else {
      const s = sorting[0];
      onSortChange(`${s.id}:${s.desc ? 'desc' : 'asc'}`);
    }
  }, [sorting, onSortChange]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const columns = useMemo<ColumnDef<T>[]>(() => {
    if (!data[0]) return [];
    return Object.keys(data[0]).map((key) => ({
      id: key,
      accessorKey: key as any,
      header: key,
      cell: (info) => String(info.getValue() ?? ''),
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function exportCsv() {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const lines = [headers.join(',')].concat(
      data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end flex-wrap">
        {data[0] && Object.keys(data[0]).map((k) => (
          <div key={k} className="flex flex-col text-sm">
            <label className="text-gray-600">{k}</label>
            <input
              className="border px-2 py-1 rounded"
              placeholder={`Filtrar ${k}`}
              value={filters[k] ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, [k]: e.target.value }))}
            />
          </div>
        ))}
        <button className="ml-auto px-3 py-1 border" onClick={exportCsv}>Exportar CSV</button>
      </div>
      <div className="overflow-auto border">
        <table className="min-w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-gray-50">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="p-2 text-left border cursor-pointer select-none"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: ' ▲', desc: ' ▼' }[h.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 items-center">
        <button className="px-3 py-1 border" onClick={() => onPageChange(Math.max(1, page - 1))}>Anterior</button>
        <span>Página {page} / {totalPages}</span>
        <button className="px-3 py-1 border" onClick={() => onPageChange(Math.min(totalPages, page + 1))}>Próxima</button>
      </div>
    </div>
  );
}
