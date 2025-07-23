'use client'
import Link from 'next/link'
import '@/app/services/servicos.css'


export default function ServicosHome() {
  return (
    <section className="servicos-container">
      <h2 className="titulo">Serviços Mindness</h2>
      <div className="grid-servicos">
        <div className="card-servico">
          <img src="/diagnostic.svg" alt="Diagnóstico" className="icon-servico" />
          <h3>Diagnóstico</h3>
          <ul>
            <li>Mapeamento emocional da equipe</li>
            <li>Relatório para o RH com plano de ação</li>
            <li>Análise de clima e engajamento</li>
          </ul>
        </div>

        <div className="card-servico">
          <img src="/teacher.svg" alt="Treinamentos" className="icon-servico" />
          <h3>Treinamentos e Capacitações</h3>
          <ul>
            <li>Workshops sobre saúde mental no trabalho</li>
            <li>Liderança empática e escuta ativa</li>
            <li>Empresa pode subsidiar o valor</li>
          </ul>
        </div>

        <div className="card-servico">
          <img src="/psychology.svg" alt="Psicologia" className="icon-servico" />
          <h3>Atendimento Psicológico</h3>
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
        href="https://wa.me/5588992347927"
        target="_blank"
        className="whatsapp-float"
        aria-label="Fale conosco no WhatsApp"
      >
        <img src="/whatsapp-icon.svg" alt="WhatsApp" />
      </Link>
    </section>
  )
}
