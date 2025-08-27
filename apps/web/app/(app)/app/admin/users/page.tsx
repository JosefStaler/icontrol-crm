"use client";
import useSWR from 'swr';
import { useState } from 'react';

export default function UsersAdminPage() {
  const { data, mutate } = useSWR('/api/users', null, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });
  const users = data?.data ?? [];

  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', roles: 'user', active: true });
  const [editUser, setEditUser] = useState<any | null>(null);

  async function createUser() {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: createForm.email,
        password: createForm.password || undefined,
        roles: createForm.roles.split(',').map((s) => s.trim()).filter(Boolean),
        active: createForm.active,
      }),
    });
    setOpenCreate(false);
    setCreateForm({ email: '', password: '', roles: 'user', active: true });
    mutate();
  }

  async function updateUser() {
    if (!editUser) return;
    await fetch(`/api/users/${editUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: editUser.email, roles: editUser.roles, active: editUser.active }),
    });
    setEditUser(null);
    mutate();
  }

  async function deleteUser(id: string) {
    await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' });
    mutate();
  }

  async function forceReset(id: string) {
    await fetch(`/api/users/${id}/force-reset`, { method: 'POST', credentials: 'include' });
    mutate();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <button className="px-3 py-1 border" onClick={() => setOpenCreate(true)}>Novo usuário</button>
      </div>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left border">ID</th>
            <th className="p-2 text-left border">Email</th>
            <th className="p-2 text-left border">Roles</th>
            <th className="p-2 text-left border">Ativo</th>
            <th className="p-2 text-left border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.id}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{(u.roles || []).join(',')}</td>
              <td className="p-2 border">{String(u.active)}</td>
              <td className="p-2 border space-x-2">
                <button className="underline" onClick={() => setEditUser({ ...u })}>Editar</button>
                <button className="underline" onClick={() => forceReset(String(u.id))}>Forçar reset</button>
                <button className="underline text-red-600" onClick={() => deleteUser(String(u.id))}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {openCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-md space-y-2">
            <h2 className="text-lg font-medium">Novo usuário</h2>
            <input className="border px-2 py-1 rounded w-full" placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
            <input className="border px-2 py-1 rounded w-full" placeholder="Senha (opcional)" type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
            <input className="border px-2 py-1 rounded w-full" placeholder="Roles (sep. por vírgula)" value={createForm.roles} onChange={(e) => setCreateForm((f) => ({ ...f, roles: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={createForm.active} onChange={(e) => setCreateForm((f) => ({ ...f, active: e.target.checked }))} /> Ativo</label>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border" onClick={() => setOpenCreate(false)}>Cancelar</button>
              <button className="px-3 py-1 border bg-black text-white" onClick={createUser}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-md space-y-2">
            <h2 className="text-lg font-medium">Editar usuário</h2>
            <input className="border px-2 py-1 rounded w-full" placeholder="Email" value={editUser.email} onChange={(e) => setEditUser((u: any) => ({ ...u, email: e.target.value }))} />
            <input className="border px-2 py-1 rounded w-full" placeholder="Roles (sep. por vírgula)" value={(editUser.roles || []).join(',')} onChange={(e) => setEditUser((u: any) => ({ ...u, roles: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(editUser.active)} onChange={(e) => setEditUser((u: any) => ({ ...u, active: e.target.checked }))} /> Ativo</label>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border" onClick={() => setEditUser(null)}>Cancelar</button>
              <button className="px-3 py-1 border bg-black text-white" onClick={updateUser}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
