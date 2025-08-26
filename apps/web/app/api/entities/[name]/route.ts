import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  const access = req.cookies.get('accessToken')?.value;
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${params.name}?${qs}`, {
      headers: access ? { Authorization: `Bearer ${access}` } : undefined,
    });
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

export async function PATCH(req: NextRequest, { params }: { params: { name: string } }) {
  const access = req.cookies.get('accessToken')?.value;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }
  const id = body?.id;
  if (id === undefined || id === null || id === '') {
    return NextResponse.json({ error: 'ID ausente' }, { status: 400 });
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${params.name}/${encodeURIComponent(String(id))}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) },
      body: JSON.stringify(body?.data ?? {}),
    });
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


