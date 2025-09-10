'use client';
import './login.css';
import Link from 'next/link';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import { useState, useMemo, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function onlyDigits(s: string) { return (s || '').replace(/\D+/g, ''); }
function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  const p1 = d.slice(0, 3), p2 = d.slice(3, 6), p3 = d.slice(6, 9), p4 = d.slice(9, 11);
  let out = p1;
  if (p2) out += '.' + p2;
  if (p3) out += '.' + p3;
  if (p4) out += '-' + p4;
  return out;
}
function safeParse<T=any>(raw: string | null): T | null { try { return raw ? JSON.parse(raw) as T : null; } catch { return null; } }

const keyAgenda     = (cpf: string) => `TISAUDE_MEUS_AGENDAMENTOS_${cpf}`;
const keyAgendaBak  = (cpf: string) => `TISAUDE_MEUS_AGENDAMENTOS_${cpf}__bak`;
const keyBearer     = (cpf: string) => `TISAUDE_PATIENT_BEARER_${cpf}`;

function migrateLegacyToCpf(cpf: string) {
  try {
    const legacyRaw = localStorage.getItem('TISAUDE_MEUS_AGENDAMENTOS');
    if (!legacyRaw) return;
    const legacyArr = safeParse<any[]>(legacyRaw) || [];
    const dst = keyAgenda(cpf);
    const curr = safeParse<any[]>(localStorage.getItem(dst)) || [];
    
 
    const existingIds = new Set(curr.map(item => item._id || item.id));
    const newItems = legacyArr.filter(item => !existingIds.has(item._id || item.id));
    
    const merged = [...newItems, ...curr];
    if (merged.length) {
      const clipped = merged.slice(0, 1000);
      localStorage.setItem(dst, JSON.stringify(clipped));
      localStorage.setItem(keyAgendaBak(cpf), JSON.stringify(clipped));
    }
  } catch {}
}

function setBearerForCpf(cpf: string, token: string) {
  try {
    localStorage.setItem('TISAUDE_PATIENT_BEARER', token); 
    localStorage.setItem(keyBearer(cpf), token);           
  } catch {}
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
    if (!cpfOk) { setInlineError('Informe um CPF válido (11 dígitos).'); return; }

    try {
      setLoadingPaciente(true);

      const res = await fetch('/api/tisaude/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfDigits }),
      });
      
      const j = await res.json().catch(() => ({} as any));
      if (!res.ok || !j?.ok) throw new Error(j?.error || 'Falha no login');

      try {
        localStorage.removeItem('TISAUDE_PACIENTE');
        localStorage.removeItem('TISAUDE_CURRENT_CPF');
        sessionStorage.removeItem('BYPASS_AGENDAMENTO_REDIRECT');
        
        const allKeys = Object.keys(localStorage);
        const bearerKeys = allKeys.filter(key => key.startsWith('TISAUDE_PATIENT_BEARER_'));
        bearerKeys.forEach(key => localStorage.removeItem(key));
        localStorage.removeItem('TISAUDE_PATIENT_BEARER'); 
      } catch {}

     
      const pacienteData = j.data.paciente || { cpf: cpfDigits };
      localStorage.setItem('TISAUDE_PACIENTE', JSON.stringify(pacienteData));
      localStorage.setItem('TISAUDE_CURRENT_CPF', cpfDigits);
      setBearerForCpf(cpfDigits, j.data.access_token);

    
      migrateLegacyToCpf(cpfDigits);

      toast.success('Login realizado!');
      if (liveRef.current) liveRef.current.textContent = 'Login realizado com sucesso.';
      
      router.replace('/minha-agenda');
    } catch (err: any) {
      const msg = err?.message || 'Erro ao logar paciente';
      setInlineError(msg);
      toast.error(msg);
      if (liveRef.current) liveRef.current.textContent = msg;
    } finally {
      setLoadingPaciente(false);
    }
  }

  return (
    <div className="login-container">
      <Toaster position="top-right" />
      <div className="login-box">
        <VoltarHomeButton />
        <h1>Bem-vindo à <span className="highlight-blue">Mindness</span></h1>
        <p>Soluções em saúde emocional para empresas</p>

        <nav className="login-links" aria-label="Ações rápidas">
          <Link href="/primeiro-acesso">🔑 Primeiro Acesso</Link>
        </nav>

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

            <button type="submit" disabled={!cpfOk || loadingPaciente} className={`btn primario ${loadingPaciente ? 'is-loading' : ''}`}>
              {loadingPaciente ? 'Entrando...' : 'Entrar'}
            </button>

            <p id="cpf-hint" className="hint">Após o login, você será levado para a sua agenda. O agendamento só abre pelo botão dentro da agenda.</p>
          </form>
          <div aria-live="polite" aria-atomic="true" className="sr-live" ref={liveRef} />
        </section>
      </div>
    </div>
  );
}