'use client'
import Link from 'next/link'
import './HomeContent.css'

export default function HomeContent() {
  return (
    <>
      {/* Seção de Introdução */}
      <section className="intro-section">
        <h1>
          Bem-vindo à <span className="highlight">Mindness</span>
        </h1>
        <p>
          Soluções acessíveis e eficazes em saúde emocional para empresas que se importam com seus colaboradores.
        </p>
        <Link href="/agendamento" className="cta-button">
          Agende uma sessão
        </Link>
      </section>

      {/* Sobre a empresa */}
      <section className="about-section">
        <h2>Sobre a Mindness</h2>
        <p>
          Somos especialistas em saúde mental no ambiente corporativo. Nossos serviços fortalecem o bem-estar emocional e a cultura de cuidado nas organizações.
        </p>
      </section>

      {/* Benefícios */}
      <section className="benefits-section">
        <h2>Benefícios para sua empresa</h2>
        <ul>
          <li>Redução do estresse e absenteísmo</li>
          <li>Melhoria no clima organizacional</li>
          <li>Retenção de talentos</li>
          <li>Colaboradores mais motivados</li>
        </ul>
      </section>

      {/* Seção de blocos com links rápidos */}
      <section className="quick-links-section">
        <div className="quick-links-grid">
          <div className="quick-link-box">
            <div className="emoji">🧠</div>
            <h3>Serviços</h3>
            <p><Link href="/services">Conheça nossas soluções</Link></p>
          </div>
          <div className="quick-link-box">
            <div className="emoji">📝</div>
            <h3>Blog</h3>
            <p><Link href="/blog">Dicas e conteúdos sobre saúde emocional</Link></p>
          </div>
          <div className="quick-link-box">
            <div className="emoji">📅</div>
            <h3>Agendamento</h3>
            <p><Link href="/agendamento">Agende uma sessão</Link></p>
          </div>
          <div className="quick-link-box">
            <div className="emoji">🔐</div>
            <h3>Login</h3>
            <p><Link href="/login">Entrar como usuário ou admin</Link></p>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="testimonials-section">
        <h2>Depoimentos</h2>
        <div className="testimonial-card">
          <p>“A Mindness foi essencial para reverter os altos índices de ansiedade na nossa equipe.”</p>
          <span> — Karoline Bezerra Costa</span>
        </div>
      </section>

      {/* Mapa e contato */}
      <section className="contact-map-section">
        <div className="contact-content">
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.3763789684613!2d-34.87589792544177!3d-8.0630366805675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab18e8c1630829%3A0x6bf01b6f8219685b!2zVEkuU2HDumRl!5e0!3m2!1spt-BR!2sjp!4v1752354419329!5m2!1spt-BR!2sjp"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="info-container">
            <h2>Mindness</h2>
            <p>Av. da Saúde Emocional, 123 – São Paulo, SP</p>
            <p>Whatsapp: (88) 99234-7927</p>
            <p>Email: contato@mindness.com</p>
            <p>Segunda a Sexta, das 08h às 18h</p>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="main-footer">
        <p>
          © 2025 Desenvolvido pela <strong>Mindness</strong>. Todos os direitos reservados.
        </p>
      </footer>

      {/* Botões flutuantes */}
      <a href="#top" className="scroll-top">↑</a>
      <a href="https://wa.me/5588992347927" target="_blank" className="whatsapp-float" />
    </>
  );
}
