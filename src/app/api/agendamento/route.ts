import { NextResponse } from 'next/server';

type Agendamento = {
  id: string;
  paciente?: string;
  data?: string;
  horario?: string;
  servico?: string;
  formaPagamento?: string;
  createdAt: string;
};



const AGENDAMENTOS: Agendamento[] = [];

export async function GET() {
  return NextResponse.json({ ok: true, total: AGENDAMENTOS.length, items: AGENDAMENTOS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const agendamento: Agendamento = {
      id: 'ag_' + Date.now(),
      paciente: body.paciente || '',    
      data: body.data || '',
      horario: body.horario || '',
      servico: body.servico || 'Sessão Mindness',
      formaPagamento: body.formaPagamento || 'PIX',
      createdAt: new Date().toISOString(),
    };

    AGENDAMENTOS.push(agendamento);

    return NextResponse.json({ ok: true, message: 'Agendamento criado', agendamento });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Erro ao agendar' }, { status: 400 });
  }
}
