import { NextResponse } from 'next/server';
import { BASE, authHeadersPatient, getHash } from '../utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const procedimentoId = body.procedimentoId || process.env.NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID;
    const data = body.data;
    const hora = body.hora;
    const tipo = body.tipo || process.env.NEXT_PUBLIC_TISAUDE_TIPO_ID || '1';
    const local = body.local || process.env.NEXT_PUBLIC_TISAUDE_LOCAL_ID || '1';

    if (!procedimentoId || !data || !hora) {
      return NextResponse.json({ ok:false, error:'procedimentoId, data e hora são necessários' }, { status:400 });
    }

    const url = `${BASE}/rest/agenda/consulta/${procedimentoId}`;
    const payload = { data, hora, tipo: String(tipo), local: String(local), hash: getHash() };

    const res = await fetch(url, { method:'POST', headers: authHeadersPatient(), body: JSON.stringify(payload) });
    const raw = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ ok:false, upstream: raw }, { status: res.status });

    return NextResponse.json({ ok: true, data: raw });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'Erro ao agendar consulta' }, { status:500 });
  }
}
