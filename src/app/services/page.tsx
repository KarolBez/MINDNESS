
'use client'
import Link from 'next/link';
import './servicos.css';
import VoltarHomeButton from '@/components/VoltaHomeButton';



export default function Servicos() {
  return (
    <div className="servicos-container">
        <VoltarHomeButton />
      <h1 className="titulo">Serviços Mindness</h1>
      <div className="grid-servicos">
        <div className="card-servico">
          <img src="diagnostic.svg" alt="Diagnóstico" className="icon-servico" />
          <h2>Diagnóstico</h2>
          <ul>
            <li>Mapeamento emocional da equipe</li>
            <li>Relatório para o RH com plano de ação</li>
            <li>Análise de clima e engajamento</li>
          </ul>
        </div>

        <div className="card-servico">
          <img src="teacher.svg" alt="Treinamentos" className="icon-servico" />
          <h2>Treinamentos e Capacitações</h2>
          <ul>
            <li>Workshops sobre saúde mental no trabalho</li>
            <li>Liderança empática e escuta ativa</li>
            <li>Empresa pode subsidiar o valor</li>
          </ul>
        </div>

        <div className="card-servico">
          <img src="psychology.svg" alt="Atendimento Psicológico" className="icon-servico" />
          <h2>Atendimento Psicológico</h2>
          <ul>
            <li>Sessões por R$ 65,00</li>
            <li>Agendamento pelo site</li>
            <li>Aplicado a familiares de 1º grau</li>
            <li>Empresa pode subsidiar o valor</li>
            <li>Faturamento mensal facilitado</li>
          </ul>
        </div>
      </div>

      <Link
        href="https://wa.me/5599999999999"
        target="_blank"
        className="whatsapp-float"
        aria-label="Fale conosco no WhatsApp"
      >
        <img src="/whatsapp-icon.svg" alt="WhatsApp" />
      </Link>
    </div>
  );
}
