import { NextResponse } from 'next/server';
import { BASE, authHeadersPatient, getHash } from '../utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const url = `${BASE}/rest/agenda/profissionais?hash=${getHash()}`;
    const res = await fetch(url, { headers: authHeadersPatient(), cache: 'no-store' });
    const raw = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ ok:false, upstream: raw }, { status: res.status });
 
    const items = Array.isArray(raw) ? raw : (Array.isArray(raw.items) ? raw.items : Object.values(raw || {}));
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro ao listar profissionais' }, { status: 500 });
  }
}
