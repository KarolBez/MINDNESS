'use client';
import './primeiro-acesso.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import toast from 'react-hot-toast';

export default function PrimeiroAcesso() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    empresa: '',
    senha: '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/primeiro-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || data?.error || 'Falha no cadastro');
      }

      toast.success('Cadastro realizado!');
      router.push('/agendamento');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="primeiro-acesso-container">
      <VoltarHomeButton />
      <div className="form-box">
        <h1>
          <span className="highlight-blue">Mindness</span> – Primeiro Acesso
        </h1>
        <p>Preencha os dados para criar seu acesso</p>
        <form onSubmit={onSubmit}>
          <label htmlFor="nome">Nome completo</label>
          <input id="nome" type="text" placeholder="Digite seu nome completo" value={form.nome} onChange={onChange} required />

          <label htmlFor="cpf">CPF</label>
          <input id="cpf" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={onChange} required />

          <label htmlFor="empresa">Empresa</label>
          <input id="empresa" type="text" placeholder="Digite o nome da empresa" value={form.empresa} onChange={onChange} />

          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" placeholder="Crie uma senha" value={form.senha} onChange={onChange} required />

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar e direcionar para o agendamento'}
          </button>
        </form>
      </div>
    </div>
  );
}
