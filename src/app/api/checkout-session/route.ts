import { NextResponse } from 'next/server';

export async function POST() {
  const BACK = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const res = await fetch(`${BACK}/api/checkout-session`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json(data, { status: res.status || 400 });
  return NextResponse.json(data);
}
