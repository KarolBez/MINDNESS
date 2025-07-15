'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const login = async () => {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });

    if (res.ok) router.push('/admin');
    else alert('Login inválido');
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login do Admin</h1>
      <input
        className="border px-4 py-2 w-full mb-2"
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="border px-4 py-2 w-full mb-4"
        placeholder="Senha"
        type="password"
        onChange={e => setSenha(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={login}
      >
        Entrar
      </button>
    </div>
  );
}
