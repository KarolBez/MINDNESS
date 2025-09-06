'use client';
import './login.css';
import Link from 'next/link';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import { useState, useMemo, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function onlyDigits(s: string) {
  return (s || '').replace(/\D+/g, '');
}
function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  let out = p1;
  if (p2) out += '.' + p2;
  if (p3) out += '.' + p3;
  if (p4) out += '-' + p4;
  return out;
}

export default function LoginPage() {
  const [cpf, setCpf] = useState('');
  const [loadingPaciente, setLoadingPaciente] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const router = useRouter();
  const liveRef = useRef<HTMLDivElement>(null);

  const cpfDigits = useMemo(() => onlyDigits(cpf), [cpf]);
  const cpfOk = cpfDigits.length === 11;

  async function onLoginPaciente(e: React.FormEvent) {
    e.preventDefault();
    setInlineError(null);

    if (!cpfOk) {
      setInlineError('Informe um CPF válido (11 dígitos).');
      return;
    }

    try {
      setLoadingPaciente(true);
      const payload = { cpf: cpfDigits };

      const res = await fetch('/api/tisaude/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || 'Falha no login');

      localStorage.setItem('TISAUDE_PATIENT_BEARER', j.data.access_token);
      localStorage.setItem('TISAUDE_PACIENTE', JSON.stringify(j.data.paciente));

      const hist = JSON.parse(localStorage.getItem('TISAUDE_MEUS_AGENDAMENTOS') || '[]');
      const hasHistory = Array.isArray(hist) && hist.length > 0;

      toast.success('Login realizado!');
      liveRef.current!.textContent = 'Login realizado com sucesso.';
      router.push(hasHistory ? '/minha-agenda' : '/agendamento');
    } catch (err: any) {
      const msg = err?.message || 'Erro ao logar paciente';
      setInlineError(msg);
      toast.error(msg);
      liveRef.current!.textContent = msg;
    } finally {
      setLoadingPaciente(false);
    }
  }

  return (
    <div className="login-container">
      <Toaster position="top-right" />
      <div className="login-box">
        <VoltarHomeButton />
        <h1>
          Bem-vindo à <span className="highlight-blue">Mindness</span>
        </h1>
        <p>Soluções em saúde emocional para empresas</p>

        <nav className="login-links" aria-label="Ações rápidas">
          <Link href="/agendamento">📅 Fazer Agendamento</Link>
          <Link href="/primeiro-acesso">🔑 Primeiro Acesso</Link>
        </nav>

        {/* Login do Paciente */}
        <section className="card bloco login-paciente" aria-labelledby="lp-title">
          <h2 id="lp-title">Login do Paciente</h2>

          <form onSubmit={onLoginPaciente} className="form" noValidate>
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              inputMode="numeric"
              autoComplete="username"
              placeholder="Digite seu CPF (somente números)"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              onPaste={(e) => {
                e.preventDefault();
                const text = (e.clipboardData || (window as any).clipboardData).getData('text');
                setCpf(maskCPF(text));
              }}
              aria-invalid={!cpfOk}
              aria-describedby="cpf-hint"
            />

            {inlineError && <div className="field-error" role="alert">{inlineError}</div>}

            <button
              type="submit"
              disabled={!cpfOk || loadingPaciente}
              className={`btn primario ${loadingPaciente ? 'is-loading' : ''}`}
            >
              {loadingPaciente ? 'Entrando...' : 'Entrar'}
            </button>

            <p id="cpf-hint" className="hint">
              No primeiro login, você será levado ao agendamento.
            </p>
          </form>
          <div aria-live="polite" aria-atomic="true" className="sr-live" ref={liveRef} />
        </section>
      </div>
    </div>
  );
}
