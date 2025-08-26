import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('accessToken')?.value;
  const refresh = req.cookies.get('refreshToken')?.value;
  const url = new URL(req.url);
  const month = url.searchParams.get('month') ?? '';
  const year = url.searchParams.get('year') ?? '';
  const qs = `month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`;
  try {
    const upstream = (token?: string) => fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/retiradas?${qs}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    let res = await upstream(access);
    if (res.status === 401 && refresh) {
      const rf = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (rf.ok) {
        const rdata = await rf.json();
        const newAccess: string | undefined = rdata?.accessToken;
        if (newAccess) {
          const res2 = await upstream(newAccess);
          const ct2 = res2.headers.get('content-type') || '';
          const data2 = ct2.includes('application/json') ? await res2.json() : await res2.text();
          const resp2 = NextResponse.json(typeof data2 === 'string' ? { data: data2 } : data2, { status: res2.status });
          resp2.cookies.set('accessToken', newAccess, { httpOnly: true, sameSite: 'lax', path: '/' });
          return resp2;
        }
      }
    }
    const contentType = res.headers.get('content-type') || '';
    if (res.ok) {
      const data = contentType.includes('application/json') ? await res.json() : await res.text();
      return NextResponse.json(typeof data === 'string' ? { data } : data, { status: res.status });
    }
    const errBody = contentType.includes('application/json') ? await res.json() : await res.text();
    return NextResponse.json({ error: 'Upstream error', details: errBody }, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: 'Proxy error', details: String(e?.message || e) }, { status: 500 });
  }
}


