'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './agendamento.css';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import { toast, Toaster } from 'react-hot-toast';
import { saveBookingToHistoryPerCPF } from '@/helpers/agendamentoHistory';


export type Prof = {
  id: string | number;
  nome?: string;
  nome_profissional?: string;
  foto?: string | null;
};

type ApiOk<T = any> = { ok: true; [k: string]: any } & T;
type ApiErr = { ok?: false; error?: string; [k: string]: any };

type CriarAgendamentoPayload = {
  procedimentoId: string;
  data: string; 
  hora: string; 
};

const PROC_ID_DEFAULT = process.env.NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID || '';



function onlyDigits(s: string) { return (s || '').replace(/\D+/g, ''); }

async function safeJson(res: Response): Promise<any> {
  try { return await res.json(); } catch { return {}; }
}


function authHeaders(): Record<string, string> {
  const paciente = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('TISAUDE_PACIENTE') || 'null')
    : null;
  const cpf = onlyDigits(paciente?.cpf || '');

  let token = '';
  if (cpf) {
    token = localStorage.getItem(`TISAUDE_PATIENT_BEARER_${cpf}`) || '';
    if (!token) {
      const legacy = localStorage.getItem('TISAUDE_PATIENT_BEARER') || '';
      if (legacy) {
        localStorage.setItem(`TISAUDE_PATIENT_BEARER_${cpf}`, legacy);
        token = legacy;
      }
    }
  } else {
    token = localStorage.getItem('TISAUDE_PATIENT_BEARER') || '';
  }

  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (cpf)  h['X-Patient-CPF'] = cpf;
  return h;
}


function ensureAuthIsolation() {
  const p = JSON.parse(localStorage.getItem('TISAUDE_PACIENTE') || 'null');
  const cpf = onlyDigits(p?.cpf || '');
  const last = localStorage.getItem('TISAUDE_LAST_CPF') || '';
  if (last && cpf && last !== cpf) {
    localStorage.removeItem('TISAUDE_PATIENT_BEARER');
    localStorage.removeItem('TISAUDE_MEUS_AGENDAMENTOS');
  }
  if (cpf) localStorage.setItem('TISAUDE_LAST_CPF', cpf);
}

function toArraySafe(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== 'object') return [];
  const candidates = [input.items, input.data, input.result, input.results, input.list];
  for (const c of candidates) if (Array.isArray(c)) return c;
  const values = Object.values(input);
  return Array.isArray(values) ? (values as any[]) : [];
}
function pickNestedObjectArray(arr: any[]): any[] {
  if (!Array.isArray(arr)) return [];
  const nested = arr.find(
    (el) => Array.isArray(el) && el.length > 0 && typeof el[0] === 'object' && !Array.isArray(el[0])
  );
  return Array.isArray(nested) ? nested : arr;
}
function normalizeDates(raw: any): string[] {
  const base = toArraySafe(raw?.items ?? raw);
  const list = pickNestedObjectArray(base);
  return list.map((d: any) => (typeof d === 'string' ? d : d?.data)).filter(Boolean);
}
function normalizeHours(raw: any): string[] {
  const base = toArraySafe(raw?.items ?? raw);
  const arr = pickNestedObjectArray(base);
  return arr
    .map((h: any) => (typeof h === 'string' ? h : h?.horario ?? h?.hora ?? h?.Hora ?? ''))
    .filter(Boolean);
}
function capitalizeFirst(s: string) {
  if (!s) return s;
  const low = String(s).toLowerCase();
  return low.charAt(0).toUpperCase() + low.slice(1);
}


function normalizeBooking(fromApi: any, fallbackProcId?: string) {
  const d = fromApi?.data || fromApi;
  const ag = d?.agendamento || d?.appointment || d;


  const appointmentId =
    ag?.id || ag?.agendamento_id || ag?.codigo || ag?.cod_agendamento || ag?.ID || ag?.uuid || ag?.sid || ag?.schedule_id || '';

  const procedimentoId =
    ag?.procedimento_id || ag?.procedimentoId || fallbackProcId || '';


  const rawDate =
    ag?.data || ag?.data_consulta || ag?.date || ag?.dia || ag?.when || ag?.inicio || ag?.startDate;
  const rawTime = ag?.hora || ag?.horario || ag?.time || ag?.startTime || ag?.inicio_hora;

  const rawTipo =
    ag?.tipo || ag?.type || ag?.descricao || ag?.descricao_procedimento || 'Consulta';
  const rawStatus =
    ag?.status || ag?.status_consulta || ag?.situacao || ag?.situation || ag?.payment_status;

  const dateISO = (() => {
    if (!rawDate) return '';
    const s = String(rawDate);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const [dd, mm, yy] = s.split('/');
      return `${yy}-${mm}-${dd}`;
    }
    const dt = new Date(s);
    return isNaN(+dt) ? '' : dt.toISOString().slice(0, 10);
  })();

  const timeHHmm = (() => {
    const s = rawTime ? String(rawTime) : '';
    if (!s) return '';
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return s.slice(0, 5);
    const m = s.match(/(\d{1,2}:\d{2})/);
    return m ? (m[1].length === 4 ? '0' + m[1] : m[1]) : '';
  })();

  const statusNorm = (() => {
    const s = (rawStatus || '').toString().toLowerCase();
    if (!s) return '';
    if (/(cancel|desmarc)/.test(s)) return 'Desmarcada';
    if (/(pend|aguard|payment)/.test(s)) return 'Aguardando pagamento';
    if (/(confirm|marc|book)/.test(s)) return 'Marcada';
    return capitalizeFirst(rawStatus);
  })();

  return {
    appointmentId: String(appointmentId || ''),
    procedimentoId: procedimentoId ? String(procedimentoId) : '',
    data: dateISO,           
    hora: timeHHmm,          
    tipo: capitalizeFirst(rawTipo || 'Consulta'),
    status: statusNorm || 'Marcada',
    raw: fromApi,
  };
}



async function criarAgendamento(payload: CriarAgendamentoPayload): Promise<ApiOk | never> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
  };
  const res = await fetch('/api/tisaude/consulta', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const j: ApiOk | ApiErr = await safeJson(res);
  if (!res.ok || !('ok' in j) || !j.ok) {
    const msg = (j as ApiErr)?.error || 'Falha ao criar agendamento';
    throw new Error(msg);
  }
  try {
    await Promise.resolve(saveBookingToHistoryPerCPF((j as any).data));
  } catch {}
  return j;
}



export default function Agendamento() {
  const router = useRouter();

  const [profissionais, setProfissionais] = useState<Prof[]>([]);
  const [profissional, setProfissional] = useState<Prof | null>(null);

  const [datas, setDatas] = useState<string[]>([]);
  const [dataSel, setDataSel] = useState<string>('');

  const [horas, setHoras] = useState<string[]>([]);
  const [horaSel, setHoraSel] = useState<string>('');

  const [loadingProfs, setLoadingProfs] = useState(false);
  const [loadingDatas, setLoadingDatas] = useState(false);
  const [loadingHoras, setLoadingHoras] = useState(false);
  const [agendando, setAgendando] = useState(false);

  useEffect(() => {
    ensureAuthIsolation();

  
    const bypass = sessionStorage.getItem('BYPASS_AGENDAMENTO_REDIRECT') === '1';
    if (bypass) {
      sessionStorage.removeItem('BYPASS_AGENDAMENTO_REDIRECT');
    } else {
      
      try {
        const p = JSON.parse(localStorage.getItem('TISAUDE_PACIENTE') || 'null');
        const cpf = onlyDigits(p?.cpf || '');
        if (cpf) {
          const key = `TISAUDE_MEUS_AGENDAMENTOS_${cpf}`;
          const raw = localStorage.getItem(key);
          const arr = raw ? JSON.parse(raw) : [];
          if (Array.isArray(arr) && arr.length > 0) {
            router.replace('/minha-agenda');
            return;
          }
        }
      } catch {}
    }

    (async () => {
      try {
        setLoadingProfs(true);
        const headers: Record<string, string> = { ...authHeaders() };
        const res = await fetch('/api/tisaude/profissionais', { cache: 'no-store', headers });
        const json = await safeJson(res);
        if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao listar profissionais');

        const raw = toArraySafe(json.items);
        const arr = pickNestedObjectArray(raw);

        const list: Prof[] = arr
          .filter((p: any) => p && typeof p === 'object' && !Array.isArray(p))
          .map((p: any) => ({
            id: p.id ?? p.id_profissional ?? p.procedimento_id ?? p.codigo ?? p.ID,
            nome: p.nome ?? p.nome_profissional ?? p.descricao ?? 'Profissional',
            nome_profissional: p.nome_profissional,
            foto: p.profilepicture ?? p.foto ?? null,
          }))
          .filter((x: any) => x.id != null);

        setProfissionais(list);
      } catch (e: any) {
        toast.error(e?.message || 'Erro ao carregar profissionais');
      } finally {
        setLoadingProfs(false);
      }

    
      try {
        const arr = JSON.parse(localStorage.getItem('TISAUDE_MEUS_AGENDAMENTOS') || '[]');
        const cleaned = (Array.isArray(arr) ? arr : []).filter(
          (it: any) =>
            (it?.data && it?.hora) ||
            (it?.raw && (it?.raw.data?.agendamento || it?.raw.data?.consulta))
        );
        if (cleaned.length !== arr.length) {
          localStorage.setItem('TISAUDE_MEUS_AGENDAMENTOS', JSON.stringify(cleaned));
        }
      } catch {}
    })();
  }, [router]);

  const selecionarProf = useCallback(async (p: Prof) => {
    setProfissional(p);
    setDatas([]); setDataSel('');
    setHoras([]); setHoraSel('');

    try {
      setLoadingDatas(true);
      const procedimentoId = String(p.id || PROC_ID_DEFAULT);
      const url = `/api/tisaude/datas?procedimentoId=${encodeURIComponent(procedimentoId)}`;
      const headers: Record<string, string> = { ...authHeaders() };
      const res = await fetch(url, { cache: 'no-store', headers });
      const json = await safeJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao listar datas');

      const list = normalizeDates(json);
      setDatas(list);
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao carregar datas');
    } finally {
      setLoadingDatas(false);
    }
  }, []);

  const selecionarData = useCallback(async (iso: string) => {
    setDataSel(iso);
    setHoras([]); setHoraSel('');
    if (!profissional) return;

    try {
      setLoadingHoras(true);
      const procedimentoId = String(profissional.id || PROC_ID_DEFAULT);
      const url = `/api/tisaude/horas?procedimentoId=${encodeURIComponent(procedimentoId)}&data=${encodeURIComponent(iso)}`;
      const headers: Record<string, string> = { ...authHeaders() };
      const res = await fetch(url, { cache: 'no-store', headers });
      const json = await safeJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao listar horários');

      const list = normalizeHours(json);
      setHoras(list);
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao carregar horários');
    } finally {
      setLoadingHoras(false);
    }
  }, [profissional]);

  const confirmarAgendamento = useCallback(async () => {
    if (!profissional || !dataSel || !horaSel) {
      toast('Selecione profissional, data e horário.');
      return;
    }
    try {
      setAgendando(true);
      const procedimentoId = String(profissional.id || PROC_ID_DEFAULT);
      const horaFmt = horaSel.length === 5 ? `${horaSel}:00` : horaSel;

      const apiResp = await criarAgendamento({ procedimentoId, data: dataSel, hora: horaFmt });

      const apiMsg = (apiResp as any)?.data?.mensagem || (apiResp as any)?.data?.message;
      const apiErr = (apiResp as any)?.data?.error;

      if (apiErr) {
        toast(apiMsg || 'Agendamento já existente para esse horário.');
      } else {
        toast.success('Agendamento criado com sucesso!');


        try {
          const paciente = JSON.parse(localStorage.getItem('TISAUDE_PACIENTE') || 'null');
          const cpfDigits = onlyDigits(paciente?.cpf || '');
          if (!cpfDigits) throw new Error('CPF inválido ou não encontrado');
          const KEY = `TISAUDE_MEUS_AGENDAMENTOS_${cpfDigits}`;

          const hist = JSON.parse(localStorage.getItem(KEY) || '[]');
          const normalized = normalizeBooking(apiResp, procedimentoId);
          const ensured = {
            ...normalized,
            procedimentoId: normalized.procedimentoId || procedimentoId,
            data: normalized.data || dataSel,
            hora: normalized.hora || horaSel,
            tipo: normalized.tipo || 'Consulta',
          };
          hist.unshift({ criadoEm: new Date().toISOString(), ...ensured });
          localStorage.setItem(KEY, JSON.stringify(hist.slice(0, 50)));

        
          localStorage.removeItem('TISAUDE_MEUS_AGENDAMENTOS');
        } catch (e) {
          console.error('Falha ao salvar no histórico por CPF:', e);
        }

        setHoraSel(''); setDataSel(''); setProfissional(null);

        const link = (apiResp as any)?.data?.agendamento?.link_agendamento;
        if (link) window.open(link, '_blank');

        router.replace('/minha-agenda');
        return;
      }

      await selecionarData(dataSel);
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao agendar consulta');
    } finally {
      setAgendando(false);
    }
  }, [profissional, dataSel, horaSel, selecionarData, router]);

  const horasFmt = useMemo(() => horas.map((h) => (h?.length === 8 ? h.slice(0, 5) : h)), [horas]);

  return (
    <div className="agendamento-container">
      <Toaster position="top-right" />
      <div className="agendamento-box">
        <VoltarHomeButton />
        <h1>Agendar Sessão</h1>

        {/* PROFISSIONAIS */}
        <div className="profissional-container">
          <h2>Escolha sua profissional</h2>

          {loadingProfs ? (
            <p>Carregando profissionais...</p>
          ) : profissionais.length === 0 ? (
            <p style={{ color: '#666' }}>
              Nenhum profissional retornado. Faça login e verifique o hash no .env.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {profissionais.map((p) => (
                <div
                  key={String(p.id)}
                  className={`card-profissional novo ${profissional?.id === p.id ? 'ativo' : ''}`}
                >
                  <img
                    src={p.foto || '/avatar_thays.png'}
                    alt={p.nome || 'Profissional'}
                    className="avatar pequeno"
                    width={64}
                    height={64}
                    loading="lazy"
                  />
                  <div className="prof-info">
                    <h3>{p.nome || p.nome_profissional}</h3>
                    <p>Atendimento humanizado e acolhedor.</p>
                  </div>
                  <button
                    className="botao-selecionar primario"
                    onClick={() => selecionarProf(p)}
                    aria-pressed={profissional?.id === p.id}
                  >
                    {profissional?.id === p.id ? 'Selecionado' : 'Selecionar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DATAS */}
        {profissional && (
          <div className="horarios-section" style={{ marginTop: 20 }}>
            <h3>Datas disponíveis</h3>
            {loadingDatas ? (
              <p>Carregando datas...</p>
            ) : datas.length === 0 ? (
              <p style={{ color: '#666' }}>Nenhuma data disponível para este procedimento.</p>
            ) : (
              <div className="horarios">
                {datas.map((d) => (
                  <button key={d} className={dataSel === d ? 'ativo' : ''} onClick={() => selecionarData(d)}>
                    {new Date(d).toLocaleDateString()}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HORAS */}
        {dataSel && (
          <div className="pagamento-section">
            <h3>Horários disponíveis</h3>
            {loadingHoras ? (
              <p>Carregando horários...</p>
            ) : horasFmt.length === 0 ? (
              <p style={{ color: '#666' }}>Nenhum horário disponível para esta data.</p>
            ) : (
              <div className="horarios">
                {horasFmt.map((h) => (
                  <button key={h} className={horaSel === h ? 'ativo' : ''} onClick={() => setHoraSel(h)}>
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONFIRMAR */}
        {horaSel && (
          <button className="confirmar" onClick={confirmarAgendamento} disabled={agendando} style={{ marginTop: 24 }}>
            {agendando ? 'Agendando...' : 'Confirmar Agendamento'}
          </button>
        )}
      </div>
    </div>
  );
}
