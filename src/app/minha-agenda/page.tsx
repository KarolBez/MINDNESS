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
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yy] = s.split('/');
    return `${yy}-${mm}-${dd}`;
  }
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
function capitalizeFirst(s?: string) {
  if (!s) return '';
  const low = (s || '').toLowerCase();
  return low.charAt(0).toUpperCase() + low.slice(1);
}

export default function MinhaAgendaPage() {
  const [itens, setItens] = useState<any[]>([]);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loaded, setLoaded] = useState(false);

  const storageKey = useMemo(() => {
    const p = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('TISAUDE_PACIENTE') || 'null')
      : null;
    const cpf = onlyDigits(p?.cpf || '');
    return cpf ? `TISAUDE_MEUS_AGENDAMENTOS_${cpf}` : null;
  }, []);

  // 👉 Função que seta a flag antes de ir para /agendamento
  const goToAgendar = useCallback(() => {
    try {
      sessionStorage.setItem('BYPASS_AGENDAMENTO_REDIRECT', '1');
    } catch {}
    window.location.href = '/agendamento';
  }, []);

  useEffect(() => {
    try {
      const p: Paciente | null = JSON.parse(localStorage.getItem('TISAUDE_PACIENTE') || 'null');
      setPaciente(p);

      const cpfDigits = p?.cpf ? onlyDigits(p.cpf) : '';
      const NEW_KEY = cpfDigits ? `TISAUDE_MEUS_AGENDAMENTOS_${cpfDigits}` : null;
      const LEGACY_KEY = 'TISAUDE_MEUS_AGENDAMENTOS';

      let data: any[] = [];

      if (NEW_KEY) {
        const rawNew = localStorage.getItem(NEW_KEY);
        if (rawNew) {
          data = JSON.parse(rawNew);
        } else {
          const rawLegacy = localStorage.getItem(LEGACY_KEY);
          if (rawLegacy) {
            const legacyParsed = JSON.parse(rawLegacy);
            if (Array.isArray(legacyParsed) && legacyParsed.length) {
              localStorage.setItem(NEW_KEY, JSON.stringify(legacyParsed));
              localStorage.removeItem(LEGACY_KEY);
              data = legacyParsed;
            }
          }
        }
      }

      const normalized = (Array.isArray(data) ? data : [])
        .map((it) => {
          const dataTopo   = it?.data   as string | undefined;
          const horaTopo   = it?.hora   as string | undefined;
          const tipoTopo   = it?.tipo   as string | undefined;
          const statusTopo = it?.status as string | undefined;

          if (dataTopo || horaTopo || tipoTopo || statusTopo) {
            return {
              ...it,
              _dataISO: parseISOorPTBR(dataTopo),
              _horaHHMM: hhmm(horaTopo),
              _tipo: capitalizeFirst(tipoTopo || 'Consulta'),
              _status: capitalizeFirst(statusTopo || 'Marcada'),
            };
          }

          const ag = it?.data?.agendamento || it?.data?.consulta || it?.data || it?.agendamento;
          const dia    = ag?.data || ag?.dia || ag?.dataConsulta;
          const hora   = ag?.horario || ag?.hora;
          const tipo   = ag?.tipo || ag?.tipoDescricao || 'Consulta';
          const status = ag?.status || ag?.status_consulta || ag?.situacao || 'Marcada';

          return {
            ...it,
            _dataISO: parseISOorPTBR(dia),
            _horaHHMM: hhmm(hora),
            _tipo: capitalizeFirst(tipo),
            _status: capitalizeFirst(status),
          };
        })
        .filter((it) => it._dataISO || it._horaHHMM);

      setItens(normalized);
    } catch {
      setItens([]);
      setPaciente(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  const excluirItem = useCallback((idx: number) => {
    if (!storageKey) return;
    if (!confirm('Remover este agendamento do histórico?')) return;

    const all = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(all)) return;
    all.splice(idx, 1);
    localStorage.setItem(storageKey, JSON.stringify(all));
    setItens((prev) => prev.filter((_, i) => i !== idx));
  }, [storageKey]);

  const apagarTudo = useCallback(() => {
    if (!storageKey) return;
    if (!confirm('Apagar TODO o histórico deste usuário?')) return;
    localStorage.removeItem(storageKey);
    setItens([]);
  }, [storageKey]);

  const cpfFmt = useMemo(() => formatCPF(paciente?.cpf), [paciente]);
  const celFmt = useMemo(() => formatPhone(paciente?.celular), [paciente]);

  return (
    <div className="ma-wrap">
      <header className="ma-hero">
        <div>
          <h1 className="ma-tt">Minha agenda</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ma-btn ma-btn-primary" onClick={goToAgendar}>
            + Marcar novo agendamento
          </button>
          {itens.length > 0 && (
            <button className="ma-btn ma-btn-outline" onClick={apagarTudo} title="Apagar tudo">
              Apagar tudo
            </button>
          )}
        </div>
      </header>

      <section className="ma-card ma-card--glass">
        <div className="ma-card__head">
          <h2 className="ma-card__title">Seus dados</h2>
        </div>

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
            {/* ⬇️ também seta a flag aqui */}
            <button className="ma-btn ma-btn-outline" onClick={goToAgendar}>
              Marcar novo agendamento
            </button>
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
                    <div className="ma-created">
                      Registrado em {criado ? criado.toLocaleString() : '—'}
                    </div>

                    <div className="ma-chips">
                      <span className="ma-chip ma-chip--outline">
                        Data: {dataISO ? new Date(dataISO).toLocaleDateString() : '—'}
                      </span>
                      <span className="ma-chip ma-chip--amber-outline">
                        Hora: {horaHHMM || '—'}
                      </span>
                      <span className="ma-chip ma-chip--mint-outline">
                        Tipo: {tipo}
                      </span>
                      <span className="ma-chip ma-chip--blue-outline">
                        Status: {status}
                      </span>
                    </div>

                    <div>
                      <button className="ma-btn ma-btn-danger" onClick={() => excluirItem(idx)}>
                        Excluir
                      </button>
                    </div>
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
