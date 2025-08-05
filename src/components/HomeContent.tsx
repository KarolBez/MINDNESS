'use client';
import Link from 'next/link';
import Slideshow from './Slideshow';
import './HomeContent.css';

export default function HomeContent() {
  return (
    <div className="homepage-wrapper">
      <section className="intro-section" id="topo">
        <h1>
          Bem-vindo à <span className="highlight">Mindness</span>
        </h1>
        <p>
          Soluções acessíveis e eficazes em saúde emocional para empresas que se importam com seus colaboradores.
        </p>
      </section>

      <section className="about-section" id="sobre">
        <h2>Sobre a Mindness</h2>
        <p>
          Na Mindness, acreditamos que cuidar da saúde mental é essencial para construir ambientes de trabalho mais humanos, produtivos e sustentáveis. Nosso propósito é claro: desenvolver soluções simples, mas profundamente eficazes, que apoiem empresas na construção de uma cultura genuína de cuidado com a saúde psicológica de seus colaboradores.

          Sabemos que cada organização é única — por isso, nossas abordagens combinam ciência, empatia e escuta ativa para oferecer ferramentas que realmente façam sentido no dia a dia corporativo.

          Da conscientização à ação, nossa missão é ajudar empresas a transformarem o bem-estar emocional em parte estratégica de sua gestão, promovendo relações mais saudáveis, times mais engajados e pessoas mais realizadas.

          Cuidar de pessoas é cuidar do futuro e a Mindness existe para facilitar esse caminho.
        </p>
      </section>

      {/* Benefícios para a empresa */}
      <section className="benefits-section">
        <h2 className="titulo-servicos">Benefícios para sua empresa</h2>
        <div className="benefits-grid">
          <div className="benefit-box">
            <span className="emoji">💼</span>
            <h3>Redução do estresse</h3>
            <p>Menos afastamentos e maior bem-estar geral da equipe.</p>
          </div>
          <div className="benefit-box">
            <span className="emoji">🌤️</span>
            <h3>Melhoria no clima</h3>
            <p>Ambiente organizacional mais leve, colaborativo e saudável.</p>
          </div>
          <div className="benefit-box">
            <span className="emoji">🎯</span>
            <h3>Retenção de talentos</h3>
            <p>Profissionais mais satisfeitos e engajados com a empresa.</p>
          </div>
          <div className="benefit-box">
            <span className="emoji">🚀</span>
            <h3>Mais motivação</h3>
            <p>Colaboradores produtivos, focados e comprometidos.</p>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="servicos-home-container" id="servicos">
        <h2 className="titulo-servicos" style={{ color: 'black' }}>Nossos Serviços</h2>
        <div className="grid-servicos">
          <div className="card-servico">
            <img src="/diagnostic.svg" alt="Diagnóstico" className="icon-servico" />
            <h3>Diagnóstico</h3>
            <ul>
              <li>Mapeamento emocional da equipe</li>
              <li>Relatório para o RH com plano de ação</li>
              <li>Análise de clima e engajamento</li>
            </ul>
            <Link href="https://wa.me/5588992347927" target="_blank" className="saiba-mais-link">
              Saiba mais
            </Link>
          </div>

          <div className="card-servico">
            <img src="/teacher.svg" alt="Treinamentos" className="icon-servico" />
            <h3>Treinamentos e Capacitações</h3>
            <ul>
              <li>Workshops sobre saúde mental</li>
              <li>Liderança empática e escuta ativa</li>
              <li>Empresa pode subsidiar o valor</li>
            </ul>
            <Link href="https://wa.me/5588992347927" target="_blank" className="saiba-mais-link">
              Saiba mais
            </Link>
          </div>

          <div className="card-servico">
            <img src="/psychology.svg" alt="Atendimento Psicológico" className="icon-servico" />
            <h3>Atendimento Psicológico</h3>
            <ul>
              <li>Sessões por R$ 65,00</li>
              <li>Agendamento pelo site</li>
              <li>Aplicado a familiares de 1º grau</li>
              <li>Empresa pode subsidiar o valor</li>
            </ul>
            <Link href="https://wa.me/5588992347927" target="_blank" className="saiba-mais-link">
              Saiba mais
            </Link>
          </div>
        </div>

        <div className="contratar-empresa-wrapper">
          <Link href="https://wa.me/5588992347927" target="_blank" className="cta-button">
            Quero contratar para minha empresa
          </Link>
        </div>
      </section>

      {/* Slideshow antes dos depoimentos */}
      <section className="slideshow-wrapper">
        <Slideshow />
      </section>

      {/* Depoimentos */}
      <section className="testimonials-section">
        <h2>Depoimentos</h2>
        <div className="testimonial-card">
          <p>“A Mindness foi essencial para reverter os altos índices de ansiedade na nossa equipe.”</p>
          <span> — Karoline Bezerra Costa</span>
        </div>
      </section>


<section className="contact-content">
  <div className="info-container">
    <h2>Responsável Técnico</h2>
    <p>Thays Santos Fernandes</p>
    <p>CRP 11/12962</p>

    <div className="emoji">🖐️</div>

    <p>
      Atenção: Este site não oferece tratamento ou aconselhamento imediato para pessoas em crise suicida.
    </p>
    <p>
      Em caso de crise, ligue para <strong>188 (CVV)</strong> ou acesse o site{' '}
      <a href="https://www.cvv.org.br" target="_blank" rel="noopener noreferrer">
        www.cvv.org.br
      </a>.
    </p>
    <p>
      Em caso de emergência, procure atendimento em um hospital mais próximo.
    </p>
  </div>
</section>




      <footer className="main-footer">
        <p>© 2025 Desenvolvido pela <strong>Mindness</strong>. Todos os direitos reservados.</p>
      </footer>

      <a href="#topo" className="scroll-top">↑</a>
      <a href="https://wa.me/5588992347927" target="_blank" className="whatsapp-float" />
    </div>
  );
}
