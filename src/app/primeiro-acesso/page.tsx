'use client';
import './primeiro-acesso.css';
import VoltarHomeButton from '@/components/VoltaHomeButton';

export default function PrimeiroAcesso() {
  return (
    <div className="primeiro-acesso-container">
              <VoltarHomeButton />
      <div className="form-box">
        <h1>
          <span className="highlight-blue">Mindness</span> – Primeiro Acesso
        </h1>
        <p>Preencha os dados para criar seu acesso</p>
        <form>
          <label htmlFor="nome">Nome completo</label>
          <input type="text" id="nome" placeholder="Digite seu nome completo" />

          <label htmlFor="cpf">CPF</label>
          <input type="text" id="cpf" placeholder="000.000.000-00" />

          <label htmlFor="empresa">Empresa</label>
          <input type="text" id="empresa" placeholder="Digite o nome da empresa" />

          <label htmlFor="senha">Senha</label>
          <input type="password" id="senha" placeholder="Crie uma senha" />

          <button type="submit">Salvar e direcionar para o agendamento</button>
        </form>
      </div>
    </div>
  );
}
