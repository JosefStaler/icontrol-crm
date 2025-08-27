import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return NextResponse.json({ error: 'Erro' }, { status: res.status });
  return NextResponse.json({ ok: true });
}






