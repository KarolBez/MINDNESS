import { NextResponse } from 'next/server';
import { BASE, authHeadersPatient, getHash } from '../utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const procedimentoId = searchParams.get('procedimentoId')
      || process.env.NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID
      || '';
    const data = searchParams.get('data') || '';
    if (!procedimentoId || !data) {
      return NextResponse.json({ ok:false, error:'procedimentoId e data são necessários' }, { status:400 });
    }

    const url = `${BASE}/rest/agenda/horasDisponiveis/${procedimentoId}?hash=${getHash()}&data=${encodeURIComponent(data)}`;
    const res = await fetch(url, { headers: authHeadersPatient(), cache: 'no-store' });
    const raw = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ ok:false, upstream: raw }, { status: res.status });

    const items = Array.isArray(raw) ? raw : (Array.isArray(raw.items) ? raw.items : Object.values(raw || {}));
    return NextResponse.json({ ok: true, items });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'Erro ao listar horários' }, { status:500 });
  }
}
