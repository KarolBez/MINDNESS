'use client';
import { useEffect, useMemo, useState } from 'react';
import './agendamento.css';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import { toast } from 'react-hot-toast';

type Prof = {
  id: string | number;
  nome?: string;
  nome_profissional?: string;
  foto?: string | null;
};

const PROC_ID_DEFAULT = process.env.NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID || '';

/** Garante array antes de mapear (defensivo contra respostas variadas da API) */
function toArraySafe(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== 'object') return [];
  const candidates = [input.items, input.data, input.result, input.results, input.list];
  for (const c of candidates) if (Array.isArray(c)) return c;
  const values = Object.values(input);
  return Array.isArray(values) ? values : [];
}

export default function Agendamento() {
  const [profissionais, setProfissionais] = useState<Prof[]>([]);
  const [profissional, setProfissional] = useState<Prof | null>(null);

  const [datas, setDatas] = useState<string[]>([]);
  const [dataSel, setDataSel] = useState<string>('');

  const [horas, setHoras] = useState<string[]>([]);
  const [horaSel, setHoraSel] = useState<string>('');

  const [loadingProfs, setLoadingProfs] = useState(false);
  const [loadingDatas, setLoadingDatas] = useState(false);
  const [loadingHoras, setLoadingHoras] = useState(false);

  // 1) Carrega profissionais
  useEffect(() => {
    (async () => {
      try {
        setLoadingProfs(true);
        const res = await fetch('/api/tisaude/profissionais', { cache: 'no-store' });
        const json = await res.json();
        console.log('[profissionais] status:', res.status, 'json:', json);

        if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao listar profissionais');

        const arr = toArraySafe(json.items);
        const list: Prof[] = arr
          .map((p: any) => ({
            id: p.id ?? p.id_profissional ?? p.procedimento_id ?? p.codigo ?? p.ID,
            nome: p.nome ?? p.nome_profissional ?? p.descricao ?? 'Profissional',
            nome_profissional: p.nome_profissional,
            foto: p.foto ?? null,
          }))
          .filter((x: any) => x.id != null);

        setProfissionais(list);
      } catch (e: any) {
        console.error('[profissionais] erro:', e);
        toast.error(e?.message || 'Erro ao carregar profissionais');
      } finally {
        setLoadingProfs(false);
      }
    })();
  }, []);

  // 2) Seleciona profissional → busca datas
  async function selecionarProf(p: Prof) {
    setProfissional(p);
    setDatas([]);
    setDataSel('');
    setHoras([]);
    setHoraSel('');

    try {
      setLoadingDatas(true);
      const procedimentoId = String(p.id || PROC_ID_DEFAULT);
      const url = `/api/tisaude/datas?procedimentoId=${encodeURIComponent(procedimentoId)}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      console.log('[datas] req:', url, 'status:', res.status, 'json:', json);

      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao listar datas');

      setDatas(toArraySafe(json.items));
    } catch (e: any) {
      console.error('[datas] erro:', e);
      toast.error(e?.message || 'Erro ao carregar datas');
    } finally {
      setLoadingDatas(false);
    }
  }

  // 3) Seleciona data → busca horas
  async function selecionarData(iso: string) {
    setDataSel(iso);
    setHoras([]);
    setHoraSel('');
    if (!profissional) return;

    try {
      setLoadingHoras(true);
      const procedimentoId = String(profissional.id || PROC_ID_DEFAULT);
      const url = `/api/tisaude/horas?procedimentoId=${encodeURIComponent(procedimentoId)}&data=${encodeURIComponent(iso)}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      console.log('[horas] req:', url, 'status:', res.status, 'json:', json);

      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao listar horários');

      const arr = toArraySafe(json.items).map((h: any) =>
        typeof h === 'string' ? h : (h.hora ?? h.Hora ?? '')
      );
      setHoras(arr.filter(Boolean));
    } catch (e: any) {
      console.error('[horas] erro:', e);
      toast.error(e?.message || 'Erro ao carregar horários');
    } finally {
      setLoadingHoras(false);
    }
  }

  // 4) Confirmar → cria consulta
  async function confirmarAgendamento() {
    if (!profissional || !dataSel || !horaSel) {
      toast('Selecione profissional, data e horário.');
      return;
    }
    try {
      const procedimentoId = String(profissional.id || PROC_ID_DEFAULT);
      const payload = { procedimentoId, data: dataSel, hora: horaSel + (horaSel.length === 5 ? ':00' : '') };
      console.log('[consulta] payload:', payload);

      const res = await fetch('/api/tisaude/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      console.log('[consulta] status:', res.status, 'json:', json);

      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao agendar');

      toast.success('Agendamento criado com sucesso!');
    } catch (e: any) {
      console.error('[consulta] erro:', e);
      toast.error(e?.message || 'Erro ao agendar consulta');
    }
  }

  const horasFmt = useMemo(
    () => horas.map(h => (h?.length === 8 ? h.slice(0, 5) : h)),
    [horas]
  );

  return (
    <div className="agendamento-container">
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
              Nenhum profissional retornado. Verifique o token (TISAUDE_BEARER) e o hash no .env.
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
                  />
                  <div className="prof-info">
                    <h3>{p.nome || p.nome_profissional}</h3>
                    <p>Atendimento humanizado e acolhedor.</p>
                  </div>
                  <button className="botao-selecionar primario" onClick={() => selecionarProf(p)}>
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
                  <button
                    key={d}
                    className={dataSel === d ? 'ativo' : ''}
                    onClick={() => selecionarData(d)}
                  >
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
          <button className="confirmar" onClick={confirmarAgendamento} style={{ marginTop: 24 }}>
            Confirmar Agendamento
          </button>
        )}
      </div>
    </div>
  );
}
