import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const access = req.cookies.get('accessToken')?.value;
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${params.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const access = req.cookies.get('accessToken')?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${params.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${access}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const access = req.cookies.get('accessToken')?.value;
  const url = new URL(req.url);
  if (url.pathname.endsWith('/force-reset')) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${params.id}/force-reset`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access}` },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}






