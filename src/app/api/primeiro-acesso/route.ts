import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json(); 
    const BACK = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const res = await fetch(`${BACK}/api/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        hash: process.env.HASH_FIXO || '72d5204a08ccf04c44f29f65c3e86202',
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status || 400 });

    return NextResponse.json({ ok: true, ...data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Erro no cadastro' }, { status: 400 });
  }
}
