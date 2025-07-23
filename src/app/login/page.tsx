'use client';
import './login.css';
import Link from 'next/link';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminSenha, setAdminSenha] = useState('');
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: adminSenha,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao logar');

      localStorage.setItem('admin', JSON.stringify(data));
      toast.success('Login de administrador bem-sucedido!');
      router.push('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <VoltarHomeButton />
        <h1>Bem-vindo à <span className="highlight-blue">Mindness</span></h1>
        <p>Soluções em saúde emocional para empresas</p>

        <form>
          <label htmlFor="email">Login</label>
          <input type="email" id="email" placeholder="Digite seu login" />

          <label htmlFor="senha">Senha</label>
          <input type="password" id="senha" placeholder="Digite sua senha" />

          <button type="submit">Entrar na Sala Virtual</button>
        </form>

        <div className="login-links">
          <Link href="/agendamento">📅 Fazer Agendamento</Link>
          <Link href="/primeiro-acesso">🔑 Primeiro Acesso</Link>
          <button
            type="button"
            onClick={() => setShowAdmin(!showAdmin)}
            className="admin-button"
          >
            👤 Sou Administrador
          </button>
        </div>

        {showAdmin && (
          <div className="admin-login">
            <h3>Login do Administrador</h3>
            <form onSubmit={handleAdminLogin}>
              <input
                type="email"
                placeholder="E-mail do admin"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                value={adminSenha}
                onChange={(e) => setAdminSenha(e.target.value)}
              />
              <button type="submit" className="admin-submit">
                Acessar Painel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
