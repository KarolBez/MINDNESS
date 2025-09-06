// src/app/api/tisaude/consulta/route.ts
import { NextResponse } from 'next/server';
import { BASE, buildHeaders, getHash, chooseToken } from '../utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function isSuccess(raw: any) {
  if (!raw) return false;
  if (raw.success && String(raw.success).toLowerCase() === 'success') return true;
  if (raw.agendamento && (raw.agendamento.id || raw.agendamento.sid)) return true;
  const msg = (raw.mensagem || raw.message || '').toString().toLowerCase();
  if (msg.includes('não está mais disponível') || msg.includes('nao esta mais disponivel')) return false;
  return !!raw;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const procedimentoId =
      body.procedimentoId || process.env.NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID;
    const data = body.data;
    const hora = body.hora;
    const tipo = String(body.tipo || process.env.NEXT_PUBLIC_TISAUDE_TIPO_ID || '1');
    const local = String(body.local || process.env.NEXT_PUBLIC_TISAUDE_LOCAL_ID || '1');

    if (!procedimentoId || !data || !hora) {
      return NextResponse.json(
        { ok: false, error: 'procedimentoId, data e hora são necessários' },
        { status: 400 }
      );
    }

    // ⚠️ Exigir token do paciente (Authorization do cliente)
    const token = chooseToken(req);
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Authorization ausente. Faça login do paciente e envie o Bearer token.' },
        { status: 401 }
      );
    }

    const url = `${BASE}/rest/agenda/consulta/${encodeURIComponent(procedimentoId)}`;
    const payload = { data, hora, tipo, local, hash: getHash() };

    // Repassa Authorization + Content-Type
    const headers = buildHeaders(req, {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const text = await upstream.text();
    let raw: any = null;
    try {
      raw = text ? JSON.parse(text) : null;
    } catch {
      raw = { raw: text };
    }

    if (!upstream.ok) {
      return NextResponse.json({ ok: false, upstream: raw }, { status: upstream.status });
    }

    if (!isSuccess(raw)) {
      const msg =
        raw?.mensagem || raw?.message || raw?.error || 'Falha ao criar agendamento';
      return NextResponse.json({ ok: false, error: msg, upstream: raw }, { status: 409 });
    }

    return NextResponse.json({ ok: true, data: raw });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Erro ao agendar consulta' },
      { status: 500 }
    );
  }
}
