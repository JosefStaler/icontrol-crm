"use client";
import { useState } from 'react';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await axios.post('/api/auth/forgot-password', { email });
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Recuperar senha</h1>
        {sent ? (
          <p>Se o email existir, enviamos instruções. Verifique sua caixa de entrada.</p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="w-full bg-black text-white py-2 rounded">Enviar</button>
          </>
        )}
      </form>
    </div>
  );
}





