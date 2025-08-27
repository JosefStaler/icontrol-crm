import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: 'Login inválido' }, { status: res.status });

  const response = NextResponse.json({ ok: true });
  response.cookies.set('accessToken', data.accessToken, { httpOnly: true, sameSite: 'lax', path: '/' });
  response.cookies.set('refreshToken', data.refreshToken, { httpOnly: true, sameSite: 'lax', path: '/' });
  return response;
}






