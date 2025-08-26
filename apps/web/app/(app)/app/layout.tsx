import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="border-r p-4 bg-gradient-to-b from-slate-50 to-white sticky top-0 h-screen overflow-auto">
        <div className="font-bold tracking-tight text-slate-800 mb-4">iControl CRM</div>
        <nav className="space-y-1 text-sm">
          <a className="block rounded px-2 py-1 hover:bg-slate-100" href="/app/dashboard">Início</a>
          <a className="block rounded px-2 py-1 hover:bg-slate-100" href="/app/admin/users">Usuários</a>
          <a className="block rounded px-2 py-1 hover:bg-slate-100" href="/app/data/Customers">Clientes</a>
          <div className="mt-3">
            <div className="px-2 py-1 text-xs uppercase tracking-wider text-slate-500">Dashboards</div>
            <div className="ml-2 space-y-1">
              <a className="block rounded px-2 py-1 hover:bg-slate-100" href="/app/dashboards/retiradas">Retiradas</a>
              <button className="block w-full text-left rounded px-2 py-1 text-slate-400 cursor-default">Serviços</button>
              <button className="block w-full text-left rounded px-2 py-1 text-slate-400 cursor-default">Materiais</button>
              <button className="block w-full text-left rounded px-2 py-1 text-slate-400 cursor-default">Indicadores Gerais</button>
            </div>
          </div>
          <a className="block rounded px-2 py-1 hover:bg-slate-100" href="/app/analytics">Analytics</a>
        </nav>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}


