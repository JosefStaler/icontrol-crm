import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('accessToken')?.value;
  const url = new URL(req.url);
  const page = url.searchParams.get('page') ?? '1';
  const pageSize = url.searchParams.get('pageSize') ?? '20';
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users?page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const access = req.cookies.get('accessToken')?.value;
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
