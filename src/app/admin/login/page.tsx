'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const login = async () => {
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.error || 'Login inválido');

      localStorage.setItem('admin', JSON.stringify(data));
      router.push('/admin/dashboard');
    } catch (e: any) {
      alert(e?.message || 'Falha no login');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: '40px auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Login do Admin</h1>
      <input
        placeholder="E-mail"
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 8, marginBottom: 10 }}
      />
      <input
        placeholder="Senha"
        type="password"
        onChange={e => setSenha(e.target.value)}
        style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 8, marginBottom: 12 }}
      />
      <button onClick={login} style={{ background: '#122ecc', color: '#fff', padding: '10px 16px', borderRadius: 8, border: 0 }}>
        Entrar
      </button>
    </div>
  );
}
