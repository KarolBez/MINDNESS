import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(async () => {
      const text = await req.text();
      return JSON.parse(text || '{}');
    });

    const BACK = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const res = await fetch(`${BACK}/api/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status || 401 });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Falha no login' }, { status: 400 });
  }
}
