// src/app/agendamento/page.tsx
'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './agendamento.css';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import { toast, Toaster } from 'react-hot-toast';

export type Prof = { id: string | number; nome?: string; nome_profissional?: string; foto?: string | null; };
type ApiOk<T = any> = { ok: true; [k: string]: any } & T;
type ApiErr = { ok?: false; error?: string; [k: string]: any };

type CriarAgendamentoPayload = { procedimentoId: string; data: string; hora: string; };
const PROC_ID_DEFAULT = process.env.NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID || '';

function onlyDigits(s: string) { return (s || '').replace(/\D+/g, ''); }
async function safeJson(res: Response): Promise<any> { try { return await res.json(); } catch { return {}; } }

const bearerKey   = (cpf: string) => `TISAUDE_PATIENT_BEARER_${cpf}`;
const keyAgenda   = (cpf: string) => `TISAUDE_MEUS_AGENDAMENTOS_${cpf}`;
const keyAgendaBk = (cpf: string) => `TISAUDE_MEUS_AGENDAMENTOS_${cpf}__bak`;

function authHeaders(): Record<string, string> {
  const paciente = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('TISAUDE_PACIENTE') || 'null') : null;
  const cpf = onlyDigits(paciente?.cpf || '');
  let token = '';
  if (cpf) token = localStorage.getItem(bearerKey(cpf)) || localStorage.getItem('TISAUDE_PATIENT_BEARER') || '';
  else token = localStorage.getItem('TISAUDE_PATIENT_BEARER') || '';
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (cpf)  h['X-Patient-CPF'] = cpf;
  return h;
}

/** /agendamento só abre via botão da agenda */
function guardAgendamentoEntry(router: ReturnType<typeof useRouter>) {
  const bypass = sessionStorage.getItem('BYPASS_AGENDAMENTO_REDIRECT') === '1';
  if (!bypass) { router.replace('/minha-agenda'); return false; }
  sessionStorage.removeItem('BYPASS_AGENDAMENTO_REDIRECT');
  return true;
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
  const nested = arr.find((el) => Array.isArray(el) && el.length > 0 && typeof el[0] === 'object' && !Array.isArray(el[0]));
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
  return arr.map((h: any) => (typeof h === 'string' ? h : h?.horario ?? h?.hora ?? h?.Hora ?? '')).filter(Boolean);
}
function capitalizeFirst(s: string) { if (!s) return s; const low = String(s).toLowerCase(); return low.charAt(0).toUpperCase() + low.slice(1); }
function normalizeBooking(fromApi: any) {
  const d = fromApi?.data || fromApi;
  const ag = d?.agendamento || d?.appointment || d;
  const rawDate = ag?.data || ag?.data_consulta || ag?.date || ag?.dia || ag?.when || ag?.inicio || ag?.startDate;
  const rawTime = ag?.hora || ag?.horario || ag?.time || ag?.startTime || ag?.inicio_hora;
  const rawTipo = ag?.tipo || ag?.type || ag?.descricao || ag?.descricao_procedimento || 'Consulta';
  const rawStatus = ag?.status || ag?.status_consulta || ag?.situacao || ag?.situation || ag?.payment_status;

  const dateISO = (() => { if (!rawDate) return ''; const s = String(rawDate);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) { const [dd,mm,yy] = s.split('/'); return `${yy}-${mm}-${dd}`; }
    const dt = new Date(s); return isNaN(+dt) ? '' : dt.toISOString().slice(0,10);
  })();
  const timeHHmm = (() => { const s = rawTime ? String(rawTime) : ''; if (!s) return '';
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return s.slice(0,5);
    const m = s.match(/(\d{1,2}:\d{2})/); return m ? (m[1].length === 4 ? '0'+m[1] : m[1]) : '';
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
    data: dateISO,
    hora: timeHHmm,
    tipo: capitalizeFirst(rawTipo || 'Consulta'),
    status: statusNorm || 'Marcada',
    raw: fromApi,
  };
}

/** Salva histórico (principal + backup) */
function saveHistory(cpf: string, items: any[]) {
  const clipped = (items || []).slice(0, 1000);
  localStorage.setItem(keyAgenda(cpf), JSON.stringify(clipped));
  localStorage.setItem(keyAgendaBk(cpf), JSON.stringify(clipped));
}

function saveBookingToHistoryPerCPF(apiResp: any, procedimentoId: string, chosenDate: string, chosenTime: string) {
  try {
    const paciente = JSON.parse(localStorage.getItem('TISAUDE_PACIENTE') || 'null');
    const cpf = onlyDigits(paciente?.cpf || '');
    if (!cpf) return;
    const KEY = keyAgenda(cpf);
    const hist = JSON.parse(localStorage.getItem(KEY) || '[]');
    const normalized = normalizeBooking(apiResp);
    const ensured = {
      ...normalized,
      procedimentoId,
      data: normalized.data || chosenDate,
      hora: normalized.hora || (chosenTime.length === 5 ? chosenTime : (chosenTime || '').slice(0,5)),
      ownerCpf: cpf,
      criadoEm: new Date().toISOString(),
    };
    const newHist = [ensured, ...(Array.isArray(hist) ? hist : [])];
    saveHistory(cpf, newHist);
  } catch {}
}

async function criarAgendamento(payload: CriarAgendamentoPayload): Promise<ApiOk> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authHeaders() };
  const res = await fetch('/api/tisaude/consulta', { method: 'POST', headers, body: JSON.stringify(payload) });
  const j: ApiOk | ApiErr = await safeJson(res);
  if (!res.ok || !('ok' in j) || !j.ok) throw new Error((j as ApiErr)?.error || 'Falha ao criar agendamento');
  return j as ApiOk;
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
    if (!guardAgendamentoEntry(router)) return;

    (async () => {
      try {
        setLoadingProfs(true);
        const headers: Record<string, string> = { ...authHeaders() };
        const res = await fetch('/api/tisaude/profissionais', { cache: 'no-store', headers });
        const json = await safeJson(res);
        if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao listar profissionais');

        const base = toArraySafe(json.items);
        const arr = pickNestedObjectArray(base);

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
      setDatas(normalizeDates(json));
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
      setHoras(normalizeHours(json));
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao carregar horários');
    } finally {
      setLoadingHoras(false);
    }
  }, [profissional]);

  const confirmarAgendamento = useCallback(async () => {
    if (!profissional || !dataSel || !horaSel) { toast('Selecione profissional, data e horário.'); return; }
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

        const paciente = JSON.parse(localStorage.getItem('TISAUDE_PACIENTE') || 'null');
        const cpf = onlyDigits(paciente?.cpf || '');
        saveBookingToHistoryPerCPF(apiResp, procedimentoId, dataSel, horaSel);

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

        <div className="profissional-container">
          <h2>Escolha sua profissional</h2>
          {loadingProfs ? (
            <p>Carregando profissionais...</p>
          ) : profissionais.length === 0 ? (
            <p style={{ color: '#666' }}>Nenhum profissional retornado. Faça login e verifique o hash no .env.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {profissionais.map((p) => (
                <div key={String(p.id)} className={`card-profissional novo ${profissional?.id === p.id ? 'ativo' : ''}`}>
                  <img src={p.foto || '/avatar_thays.png'} alt={p.nome || 'Profissional'} className="avatar pequeno" width={64} height={64} loading="lazy" />
                  <div className="prof-info">
                    <h3>{p.nome || p.nome_profissional}</h3>
                    <p>Atendimento humanizado e acolhedor.</p>
                  </div>
                  <button className="botao-selecionar primario" onClick={() => selecionarProf(p)} aria-pressed={profissional?.id === p.id}>
                    {profissional?.id === p.id ? 'Selecionado' : 'Selecionar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {profissional && (
          <div className="horarios-section" style={{ marginTop: 20 }}>
            <h3>Datas disponíveis</h3>
            {loadingDatas ? <p>Carregando datas...</p> : datas.length === 0 ? (
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

        {dataSel && (
          <div className="pagamento-section">
            <h3>Horários disponíveis</h3>
            {loadingHoras ? <p>Carregando horários...</p> : horasFmt.length === 0 ? (
              <p style={{ color: '#666' }}>Nenhum horário disponível para esta data.</p>
            ) : (
              <div className="horarios">
                {horasFmt.map((h) => (
                  <button key={h} className={horaSel === h ? 'ativo' : ''} onClick={() => setHoraSel(h)}>{h}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {horaSel && (
          <button className="confirmar" onClick={confirmarAgendamento} disabled={agendando} style={{ marginTop: 24 }}>
            {agendando ? 'Agendando...' : 'Confirmar Agendamento'}
          </button>
        )}
      </div>
    </div>
  );
}
