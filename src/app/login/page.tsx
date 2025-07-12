'use client'
import './login.css'
import Link from 'next/link';
import VoltarHomeButton from '@/components/VoltaHomeButton';

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-box">
              <VoltarHomeButton />
        <h1>Bem-vindo à <span className="highlight-blue">Mindness</span></h1>
        <p>Soluções em saúde emocional para empresas</p>

        <form>
          <label htmlFor="login">Login</label>
          <input type="email" id="email" placeholder="Digite seu login" />

          <label htmlFor="senha">Senha</label>
          <input type="password" id="senha" placeholder="Digite sua senha" />

          <button type="submit">Entrar na Sala Virtual</button>
        </form>

        <div className="login-links">
          <Link href="/agendamento"> 📅 Fazer Agendamento</Link>
          <Link href="/primeiro-acesso"> 🔑 Primeiro Acesso</Link>
        </div> 
      </div>
    </div>
  )
}
