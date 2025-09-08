'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import './minha-agenda.css';

type Paciente = { nome?: string; cpf?: string; email?: string; celular?: string };

function onlyDigits(s: string) { return (s || '').replace(/\D+/g, ''); }
function formatCPF(cpf?: string) {
  const d = onlyDigits(cpf || '');
  if (d.length !== 11) return cpf || '';
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}
function formatPhone(phone?: string) {
  const d = onlyDigits(phone || '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return phone || '';
}
function parseISOorPTBR(dateStr?: string): string {
  if (!dateStr) return '';
  const s = String(dateStr);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) { const [dd, mm, yy] = s.split('/'); return `${yy}-${mm}-${dd}`; }
  const dt = new Date(s);
  return isNaN(+dt) ? '' : dt.toISOString().slice(0, 10);
}
function hhmm(timeStr?: string): string {
  if (!timeStr) return '';
  const s = String(timeStr);
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return s.slice(0,5);
  const m = s.match(/(\d{1,2}:\d{2})/);
  return m ? (m[1].length === 4 ? '0' + m[1] : m[1]) : '';
}
function capitalizeFirst(s?: string) { if (!s) return ''; const low = (s || '').toLowerCase(); return low.charAt(0).toUpperCase() + low.slice(1); }
function safeParse<T=any>(raw: string | null): T | null { try { return raw ? JSON.parse(raw) as T : null; } catch { return null; } }

const keyAgenda    = (cpf: string) => `TISAUDE_MEUS_AGENDAMENTOS_${cpf}`;
const keyAgendaBak = (cpf: string) => `TISAUDE_MEUS_AGENDAMENTOS_${cpf}__bak`;

/** Recupera do backup caso a chave principal esteja vazia/corrompida */
function ensureAgendaWithBackup(cpf: string): any[] {
  const k = keyAgenda(cpf);
  const kb = keyAgendaBak(cpf);
  const main = safeParse<any[]>(localStorage.getItem(k));
  if (Array.isArray(main) && main.length) return main;

  const bak = safeParse<any[]>(localStorage.getItem(kb));
  if (Array.isArray(bak) && bak.length) {
    try { localStorage.setItem(k, JSON.stringify(bak)); } catch {}
    return bak;
  }
  return Array.isArray(main) ? main : [];
}

/** Migra legado para a chave por CPF e faz backup */
function migrateLegacyToCpf(cpf: string) {
  try {
    const legacyRaw = localStorage.getItem('TISAUDE_MEUS_AGENDAMENTOS');
    if (!legacyRaw) return;
    const legacyArr = safeParse<any[]>(legacyRaw) || [];
    const dst = keyAgenda(cpf);
    const curr = safeParse<any[]>(localStorage.getItem(dst)) || [];
    const merged = [...legacyArr, ...curr];
    if (merged.length) {
      localStorage.setItem(dst, JSON.stringify(merged.slice(0, 500)));
      localStorage.setItem(keyAgendaBak(cpf), JSON.stringify(merged.slice(0, 500)));
    }
  } catch {}
}

export default function MinhaAgendaPage() {
  const [itens, setItens] = useState<any[]>([]);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loaded, setLoaded] = useState(false);

  const storageKey = useMemo(() => {
    const p = typeof window !== 'undefined' ? safeParse<Paciente>(localStorage.getItem('TISAUDE_PACIENTE')) : null;
    const cpf = onlyDigits(p?.cpf || '');
    return cpf ? keyAgenda(cpf) : null;
  }, []);

  const goToAgendar = useCallback(() => {
    try { sessionStorage.setItem('BYPASS_AGENDAMENTO_REDIRECT', '1'); } catch {}
    window.location.href = '/agendamento';
  }, []);

  useEffect(() => {
    try {
      const p = safeParse<Paciente>(localStorage.getItem('TISAUDE_PACIENTE'));
      const currentCpf = onlyDigits(p?.cpf || '');
      const currentFlag = localStorage.getItem('TISAUDE_CURRENT_CPF') || '';

      if (!p || !currentCpf) { window.location.href = '/login'; return; }
      if (currentFlag && currentFlag !== currentCpf) {
        localStorage.removeItem('TISAUDE_PACIENTE');
        window.location.href = '/login';
        return;
      }
      setPaciente(p);

      // 1) migra legado → cpf (sem apagar) e grava backup
      migrateLegacyToCpf(currentCpf);

      // 2) carrega garantindo recuperação pelo backup
      const arr = ensureAgendaWithBackup(currentCpf);

      // 3) normalização só para exibição (não regrava)
      const normalized = (Array.isArray(arr) ? arr : []).map((it) => {
        const topoData   = it?.data as string | undefined;
        const topoHora   = it?.hora as string | undefined;
        const topoTipo   = it?.tipo as string | undefined;
        const topoStatus = it?.status as string | undefined;

        if (topoData || topoHora || topoTipo || topoStatus) {
          return {
            ...it,
            _dataISO: parseISOorPTBR(topoData),
            _horaHHMM: hhmm(topoHora),
            _tipo: capitalizeFirst(topoTipo || 'Consulta'),
            _status: capitalizeFirst(topoStatus || 'Marcada'),
          };
        }

        const ag = it?.data?.agendamento || it?.data?.consulta || it?.data || it?.agendamento;
        const dia    = ag?.data || ag?.dia || ag?.dataConsulta || ag?.date;
        const hora   = ag?.horario || ag?.hora || ag?.time;
        const tipo   = ag?.tipo || ag?.tipoDescricao || ag?.descricao || 'Consulta';
        const status = ag?.status || ag?.status_consulta || ag?.situacao || 'Marcada';

        return {
          ...it,
          _dataISO: parseISOorPTBR(dia),
          _horaHHMM: hhmm(hora),
          _tipo: capitalizeFirst(tipo),
          _status: capitalizeFirst(status),
        };
      });

      setItens(normalized);
    } finally {
      setLoaded(true);
    }
  }, []);

  const excluirItem = useCallback((idx: number) => {
    if (!storageKey) return;
    if (!confirm('Remover este agendamento do histórico?')) return;

    const cpf = onlyDigits(paciente?.cpf || '');
    const all = safeParse<any[]>(localStorage.getItem(storageKey)) || [];
    if (!Array.isArray(all)) return;
    all.splice(idx, 1);
    const clipped = all.slice(0, 500);
    localStorage.setItem(storageKey, JSON.stringify(clipped));
    // mantém o backup sincronizado
    if (cpf) localStorage.setItem(keyAgendaBak(cpf), JSON.stringify(clipped));
    setItens((prev) => prev.filter((_, i) => i !== idx));
  }, [storageKey, paciente]);

  const apagarTudo = useCallback(() => {
    if (!storageKey) return;
    if (!confirm('Apagar TODO o histórico deste usuário?')) return;
    const cpf = onlyDigits(paciente?.cpf || '');
    localStorage.removeItem(storageKey);
    if (cpf) localStorage.removeItem(keyAgendaBak(cpf));
    setItens([]);
  }, [storageKey, paciente]);

  const cpfFmt = useMemo(() => formatCPF(paciente?.cpf), [paciente]);
  const celFmt = useMemo(() => formatPhone(paciente?.celular), [paciente]);

  return (
    <div className="ma-wrap">
      <header className="ma-hero">
        <div><h1 className="ma-tt">Minha agenda</h1></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ma-btn ma-btn-primary" onClick={goToAgendar}>+ Marcar novo agendamento</button>
          {itens.length > 0 && (
            <button className="ma-btn ma-btn-outline" onClick={apagarTudo} title="Apagar tudo">Apagar tudo</button>
          )}
        </div>
      </header>

      <section className="ma-card ma-card--glass">
        <div className="ma-card__head"><h2 className="ma-card__title">Seus dados</h2></div>
        {paciente ? (
          <div className="ma-grid">
            <div className="ma-field"><span className="ma-label">Nome</span><span className="ma-value">{paciente.nome || '—'}</span></div>
            <div className="ma-field"><span className="ma-label">CPF</span><span className="ma-value">{cpfFmt || '—'}</span></div>
            <div className="ma-field"><span className="ma-label">E-mail</span><span className="ma-value">{paciente.email || '—'}</span></div>
            <div className="ma-field"><span className="ma-label">Celular</span><span className="ma-value">{celFmt || '—'}</span></div>
          </div>
        ) : (
          <p className="ma-muted">Sem dados do paciente. Faça <a className="ma-link" href="/login">login</a>.</p>
        )}
      </section>

      <section className="ma-list">
        {!loaded ? null : itens.length === 0 ? (
          <div className="ma-empty ma-card--glass">
            <div className="ma-illus" />
            <p>Você ainda não possui agendamentos.</p>
            <button className="ma-btn ma-btn-outline" onClick={goToAgendar}>Marcar novo agendamento</button>
          </div>
        ) : (
          <ul className="ma-ul">
            {itens.map((it, idx) => {
              const criado = it?.criadoEm ? new Date(it.criadoEm) : null;
              const dataISO = it?._dataISO || '';
              const horaHHMM = it?._horaHHMM || '';
              const tipo = it?._tipo || 'Consulta';
              const status = it?._status || 'Marcada';

              return (
                <li key={idx} className="ma-card ma-card--glass ma-item">
                  <div className="ma-item__head">
                    <div className="ma-created">Registrado em {criado ? criado.toLocaleString() : '—'}</div>
                    <div className="ma-chips">
                      <span className="ma-chip ma-chip--outline">Data: {dataISO ? new Date(dataISO).toLocaleDateString() : '—'}</span>
                      <span className="ma-chip ma-chip--amber-outline">Hora: {horaHHMM || '—'}</span>
                      <span className="ma-chip ma-chip--mint-outline">Tipo: {tipo}</span>
                      <span className="ma-chip ma-chip--blue-outline">Status: {status}</span>
                    </div>
                    <div><button className="ma-btn ma-btn-danger" onClick={() => excluirItem(idx)}>Excluir</button></div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
