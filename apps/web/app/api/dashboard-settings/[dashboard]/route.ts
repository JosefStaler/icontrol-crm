import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { dashboard: string } }) {
  const access = req.cookies.get('accessToken')?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard-settings/${params.dashboard}`, {
    headers: access ? { Authorization: `Bearer ${access}` } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest, { params }: { params: { dashboard: string } }) {
  const access = req.cookies.get('accessToken')?.value;
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard-settings/${params.dashboard}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


