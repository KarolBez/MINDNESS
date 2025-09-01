'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type React from 'react';

type Agendamento = {
  id: string;
  paciente: string;
  data: string;
  horario: string;
  servico?: string;
  formaPagamento?: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  useEffect(() => {
    const admin = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
    if (!admin) {
      router.replace('/admin/login');
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/agendamento', { method: 'GET' });
        const data = await res.json();
        if (res.ok && data?.ok) {
          setAgendamentos(data.items || []);
          setStatus('ok');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const sair = () => {
    localStorage.removeItem('admin');
    router.replace('/admin/login');
  };

  const filtrados = useMemo(() => {
    if (!busca.trim()) return agendamentos;
    const q = busca.toLowerCase();
    return agendamentos.filter(a =>
      (a.paciente || '').toLowerCase().includes(q) ||
      (a.servico || '').toLowerCase().includes(q) ||
      (a.data || '').toLowerCase().includes(q) ||
      (a.horario || '').toLowerCase().includes(q)
    );
  }, [busca, agendamentos]);

  if (loading) {
    return <div style={{ padding: 24 }}><p>Carregando painel...</p></div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1080, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Painel do Administrador</h1>
        <button onClick={sair} style={{ background: '#e11d48', color: '#fff', padding: '8px 12px', borderRadius: 8, border: 0 }}>
          Sair
        </button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <Card titulo="Total de agendamentos" valor={agendamentos.length.toString()} />
        <Card
          titulo="Próximos (hoje+)"
          valor={agendamentos.filter(a => new Date(a.data) >= new Date(new Date().toDateString())).length.toString()}
        />
        <Card
          titulo="Hoje"
          valor={agendamentos.filter(a => new Date(a.data).toDateString() === new Date().toDateString()).length.toString()}
        />
      </section>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          placeholder="Buscar por paciente, serviço, data ou horário"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ flex: 1, padding: 10, border: '1px solid #ccc', borderRadius: 8 }}
        />
        <span style={{ color: '#666', fontSize: 13 }}>
          {filtrados.length} resultados
        </span>
      </div>

      {status === 'error' ? (
        <div style={{ padding: 16, background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 8 }}>
          Não foi possível carregar os agendamentos.
        </div>
      ) : (
        <Tabela agendamentos={filtrados} />
      )}
    </div>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #eee',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
    }}>
      <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{valor}</div>
    </div>
  );
}

function Tabela({ agendamentos }: { agendamentos: any[] }) {
  return (
    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, border: '1px solid #eee' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
            <Th>Paciente</Th>
            <Th>Data</Th>
            <Th>Horário</Th>
            <Th>Serviço</Th>
            <Th>Pagamento</Th>
            <Th>ID</Th>
            <Th>Criado em</Th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>
                Nenhum agendamento cadastrado.
              </td>
            </tr>
          ) : agendamentos.map(a => (
            <tr key={a.id} style={{ borderTop: '1px solid #f1f5f9' }}>
              <Td>{a.paciente}</Td>
              <Td>{formatDate(a.data)}</Td>
              <Td>{a.horario}</Td>
              <Td>{a.servico}</Td>
              <Td>{a.formaPagamento}</Td>
              <Td style={{ fontFamily: 'monospace' }}>{a.id}</Td>
              <Td>{formatDateTime(a.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* === Th e Td tipados para aceitar style e demais props === */
function Th(
  { children, style, ...props }:
  React.PropsWithChildren<React.ThHTMLAttributes<HTMLTableCellElement>>
) {
  return (
    <th
      {...props}
      style={{ padding: 12, fontSize: 13, color: '#334155', ...(style || {}) }}
    >
      {children}
    </th>
  );
}

function Td(
  { children, style, ...props }:
  React.PropsWithChildren<React.TdHTMLAttributes<HTMLTableCellElement>>
) {
  return (
    <td
      {...props}
      style={{ padding: 12, fontSize: 14, color: '#0f172a', ...(style || {}) }}
    >
      {children}
    </td>
  );
}

function formatDate(iso: string) {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}
function formatDateTime(iso: string) {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
