"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [pwd, setPwd] = useState('');
  const [ok, setOk] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await axios.post('/api/auth/reset-password', { token, newPassword: pwd });
    setOk(true);
    setTimeout(() => router.push('/login'), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Redefinir senha</h1>
        {ok ? (
          <p>Senha alterada com sucesso. Redirecionando...</p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nova senha"
              className="w-full border px-3 py-2 rounded"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
            <button className="w-full bg-black text-white py-2 rounded">Alterar senha</button>
          </>
        )}
      </form>
    </div>
  );
}






