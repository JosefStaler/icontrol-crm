import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('accessToken')?.value;
  const refresh = req.cookies.get('refreshToken')?.value;

  async function fetchMe(token: string) {
    return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  if (access) {
    const res = await fetchMe(access);
    if (res.ok) {
      const user = await res.json();
      return NextResponse.json({ authenticated: true, user });
    }
  }

  if (!refresh) return NextResponse.json({ authenticated: false }, { status: 200 });

  // Tenta refresh
  const rf = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!rf.ok) return NextResponse.json({ authenticated: false }, { status: 200 });
  const rdata = await rf.json();
  const newAccess = rdata?.accessToken as string | undefined;
  if (!newAccess) return NextResponse.json({ authenticated: false }, { status: 200 });

  const me2 = await fetchMe(newAccess);
  if (!me2.ok) return NextResponse.json({ authenticated: false }, { status: 200 });
  const user = await me2.json();
  const resp = NextResponse.json({ authenticated: true, user });
  resp.cookies.set('accessToken', newAccess, { httpOnly: true, sameSite: 'lax', path: '/' });
  return resp;
}


