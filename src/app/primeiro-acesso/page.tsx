'use client';
import './primeiro-acesso.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import toast from 'react-hot-toast';

function onlyDigits(s: string) {
  return (s || '').replace(/\D+/g, '');
}

/* --------- Máscaras ---------- */
function maskCPF(value: string) {
  const v = onlyDigits(value).slice(0, 11);
  const p1 = v.slice(0, 3);
  const p2 = v.slice(3, 6);
  const p3 = v.slice(6, 9);
  const p4 = v.slice(9, 11);
  let out = p1;
  if (p2) out += '.' + p2;
  if (p3) out += '.' + p3;
  if (p4) out += '-' + p4;
  return out;
}

function maskDate(value: string) {
  const v = onlyDigits(value).slice(0, 8);
  const d = v.slice(0, 2);
  const m = v.slice(2, 4);
  const y = v.slice(4, 8);
  let out = d;
  if (m) out += '/' + m;
  if (y) out += '/' + y;
  return out;
}

function maskDDD(value: string) {
  return onlyDigits(value).slice(0, 2);
}

function maskPhone(value: string) {
  const v = onlyDigits(value).slice(0, 11); // até 11 dígitos (celular)
  const ddd = v.slice(0, 2);
  const rest = v.slice(2);
  if (!ddd) return '';
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  // celular com 9 dígitos
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/* --------- Validações simples ---------- */
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidCPF(cpfMask: string) {
  // checagem simples: 11 dígitos e não repetidos
  const d = onlyDigits(cpfMask);
  if (d.length !== 11) return false;
  if (/^(\d)\1+$/.test(d)) return false;
  // cálculo de dígitos verificadores
  const calc = (base: string, factor: number) =>
    base.split('').reduce((acc, n) => acc + parseInt(n, 10) * factor--, 0);
  const dv1 = (calc(d.slice(0, 9), 10) * 10) % 11 % 10;
  const dv2 = (calc(d.slice(0, 10), 11) * 10) % 11 % 10;
  return dv1 === parseInt(d[9]) && dv2 === parseInt(d[10]);
}
function isValidPhone(phoneMask: string) {
  const d = onlyDigits(phoneMask);
  // 10 (fixo) ou 11 (celular)
  return d.length === 10 || d.length === 11;
}

export default function PrimeiroAcesso() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    nascimento: '', // DD/MM/AAAA
    ddd: '',
    celular: '',
    email: '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    switch (id) {
      case 'cpf':
        setForm(prev => ({ ...prev, cpf: maskCPF(value) }));
        break;
      case 'nascimento':
        setForm(prev => ({ ...prev, nascimento: maskDate(value) }));
        break;
      case 'ddd':
        setForm(prev => ({ ...prev, ddd: maskDDD(value) }));
        break;
      case 'celular':
        setForm(prev => ({ ...prev, celular: maskPhone(value) }));
        break;
      case 'email':
        setForm(prev => ({ ...prev, email: value.toLowerCase() }));
        break;
      default:
        setForm(prev => ({ ...prev, [id]: value }));
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // validações obrigatórias
    if (!form.nome.trim()) return toast.error('Informe seu nome completo.');
    if (!form.cpf || !isValidCPF(form.cpf)) return toast.error('CPF inválido.');
    if (!form.nascimento || form.nascimento.length !== 10)
      return toast.error('Informe a data de nascimento no formato DD/MM/AAAA.');
    if (!form.celular || !isValidPhone(form.celular))
      return toast.error('Informe um celular válido.');
    if (!form.email || !isValidEmail(form.email))
      return toast.error('Informe um e-mail válido.');

    setLoading(true);
    try {
      // prepara payload limpo
      const payload = {
        nome: form.nome.trim(),
        cpf: onlyDigits(form.cpf),
        nascimento: form.nascimento, // já em DD/MM/AAAA
        ddd: onlyDigits(form.ddd),
        celular: onlyDigits(form.celular),
        email: form.email.trim().toLowerCase(),
      };

      const res = await fetch('/api/tisaude/paciente/adicionar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error ||
          data?.upstream?.login?.mensagem ||
          data?.upstream?.cadastro?.mensagem ||
          'Falha no cadastro/login do paciente';
        toast.error(msg);
        console.log('[primeiro-acesso] upstream:', data?.upstream);
        setLoading(false);
        return;
      }

      toast.success('Cadastro criado e login validado com sucesso!');
      router.push('/agendamento');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="primeiro-acesso-container">
      <VoltarHomeButton />
      <div className="form-box">
        <h1>
          <span className="highlight-blue">Mindness</span> – Primeiro Acesso
        </h1>
        <p>Preencha os dados para criar seu acesso</p>

        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="nome">Nome completo</label>
          <input
            id="nome"
            type="text"
            placeholder="Digite seu nome completo"
            value={form.nome}
            onChange={onChange}
            required
            autoComplete="name"
          />

          <label htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={onChange}
            required
            maxLength={14}
            autoComplete="off"
          />

          <label htmlFor="nascimento">Data de nascimento</label>
          <input
            id="nascimento"
            type="text"
            inputMode="numeric"
            placeholder="DD/MM/AAAA"
            value={form.nascimento}
            onChange={onChange}
            required
            maxLength={10}
            autoComplete="bday"
          />

          <label htmlFor="celular">Celular</label>
          <input
            id="celular"
            type="text"
            inputMode="tel"
            placeholder="(88) 9XXXX-XXXX"
            value={form.celular}
            onChange={onChange}
            required
            maxLength={16}
            autoComplete="tel-national"
          />

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            value={form.email}
            onChange={onChange}
            required
            autoComplete="email"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar e ir para o agendamento'}
          </button>
        </form>
      </div>
    </div>
  );
}
