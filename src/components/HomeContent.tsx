'use client';

import Link from 'next/link';
import Image from 'next/image';
import Slideshow from './Slideshow';
import './HomeContent.css';

export default function HomeContent() {
  return (
    <div className="homepage">

   
      <section className="hero" id="topo">
        <div className="hero__inner">
          <span className="badge">Plataforma de saúde emocional para empresas</span>
          <h1 className="hero__title">
            Cuidar de pessoas é cuidar do futuro. <br />
            <span className="hero__title--brand">Mindness</span> conecta sua equipe a bem-estar real.
          </h1>
          <p className="hero__subtitle">
            Programas acessíveis, dados acionáveis e atendimento psicológico com UX simples e acolhedora.
          </p>
          <div className="hero__ctas">
            <Link className="btn btn--brand" href="/agendamento">Agendar Sessão</Link>
            <Link className="btn btn--ghost" href="/primeiro-acesso">Primeiro acesso</Link>
          </div>

          <div className="trustbar">
            <span className="trustbar__label">Apoiado por times que valorizam pessoas</span>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="about" id="sobre">
        <div className="about__grid">
          <div className="about__text">
            <h2>Sobre a Mindness</h2>
            <p>
              A Mindness nasce para tornar a saúde mental parte estratégica da gestão. Combinamos ciência,
              empatia e escuta ativa para criar soluções simples e eficazes – do diagnóstico à ação,
              ajudando empresas a construírem ambientes mais humanos, produtivos e sustentáveis.
            </p>
            <p>
              Ao cuidar da experiência emocional das pessoas, transformamos cultura, engajamento e resultados.
              Cuidar de pessoas é cuidar do futuro – e nós facilitamos esse caminho.
            </p>
            <div className="about__bullets">
              <div className="chip">Mapeamento emocional</div>
              <div className="chip">Atendimento acessível</div>
              <div className="chip">Indicadores e insights</div>
            </div>
          </div>
          <div className="about__media">
            <div className="about__card">
              <Image src="/sobre.avif" alt="Cuidado emocional" width={550} height={400} className="rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="benefits">
        <h2>Benefícios para sua empresa</h2>
        <div className="benefits__grid">
          <article className="benefit">
            <span className="benefit__emoji">💼</span>
            <h3>Menos estresse</h3>
            <p>Redução de afastamentos e um cotidiano mais leve para a equipe.</p>
          </article>
          <article className="benefit">
            <span className="benefit__emoji">🌤</span>
            <h3>Clima saudável</h3>
            <p>Ambiente colaborativo, transparente e psicologicamente seguro.</p>
          </article>
          <article className="benefit">
            <span className="benefit__emoji">🎯</span>
            <h3>Talentos retidos</h3>
            <p>Pessoas engajadas permanecem. Bem-estar é vantagem competitiva.</p>
          </article>
          <article className="benefit">
            <span className="benefit__emoji">🚀</span>
            <h3>Alta performance</h3>
            <p>Times motivados, produtivos e focados no que importa.</p>
          </article>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="services" id="servicos">
        <div className="services__head">
          <h2>Nossos serviços</h2>
          <p>Do diagnóstico à intervenção, tudo integrado, simples e com indicadores claros.</p>
        </div>

        <div className="services__grid">
          <article className="service">
            <Image src="/diagnostic.svg" alt="Diagnóstico" width={48} height={48} />
            <h3>Diagnóstico</h3>
            <ul>
              <li>Mapeamento emocional</li>
              <li>Relatório com plano de ação</li>
              <li>Clima e engajamento</li>
            </ul>
          </article>

          <article className="service">
            <Image src="/teacher.svg" alt="Treinamentos" width={48} height={48} />
            <h3>Treinamentos</h3>
            <ul>
              <li>Workshops em saúde mental</li>
              <li>Liderança empática & escuta ativa</li>
              <li>Empresa pode subsidiar</li>
            </ul>
          </article>

          <article className="service">
            <Image src="/psychology.svg" alt="Atendimento Psicológico" width={48} height={48} />
            <h3>Atendimento Psicológico</h3>
            <ul>
              <li>Sessões a partir de R$ 65,00</li>
              <li>Agendamento online</li>
              <li>Familiares de 1º grau</li>
              <li>Empresa pode subsidiar</li>
            </ul>
          </article>
        </div>

        <div className="services__ribbon">
          <div className="ribbon__text">
            Pronto para impulsionar o bem-estar do seu time?
          </div>
          <Link className="btn btn--brand btn--lg" href="https://wa.me/5588992347927" target="_blank">
            Falar com especialista
          </Link>
        </div>
      </section>

  
      <section className="slider">
        <Slideshow />
      </section>

      {/* DEPOIMENTOS */}
      <section className="testimonials">
        <h2>Depoimentos</h2>
        <div className="testimonials__grid">
          <figure className="testimonial">
            <blockquote>“A Mindness foi essencial para reverter altos índices de ansiedade na nossa equipe.”</blockquote>
            <figcaption>Karoline Bezerra Costa</figcaption>
          </figure>
          <figure className="testimonial">
            <blockquote>“Fluxo simples, adesão alta e resultados mensuráveis — exatamente o que precisávamos.”</blockquote>
            <figcaption>Gestor de RH</figcaption>
          </figure>
          <figure className="testimonial">
            <blockquote>“As pessoas se sentem acolhidas e a liderança ganhou ferramentas práticas.”</blockquote>
            <figcaption>Head de Pessoas</figcaption>
          </figure>
        </div>
      </section>

      {/* RESPONSÁVEL TÉCNICO */}
      <section className="rt">
        <div className="rt__card">
          <div className="rt__icon">🖐</div>
          <h2>Responsável Técnico</h2>
          <p><strong>Thays Santos Fernandes</strong></p>
          <p>CRP 11/12962</p>
          <div className="rt__alert">
            Em caso de crise, ligue <strong>188 (CVV)</strong> ou acesse <a href="https://www.cvv.org.br" target="_blank">cvv.org.br</a>.
          </div>
        </div>
      </section>

     {/* FOOTER */}
<footer className="footer">
  <div className="footer__inner">
    <p>© {new Date().getFullYear()} Mindness. Todos os direitos reservados.</p>

    <nav className="footer__social" aria-label="Redes sociais">
      <a
        href="https://www.instagram.com/mindness"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="social social--ig"
        title="Instagram"
      >

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
          <path fill="currentColor"
            d="M8 0C5.829 0 5.556.01 4.703.048 3.85.087 3.269.23 2.76.437c-.52.214-.96.5-1.396.936-.437.437-.723.877-.937 1.396-.207.51-.35 1.09-.389 1.943C0 5.556 0 5.829 0 8s.01 2.444.048 3.297c.039.853.182 1.434.389 1.943.214.52.5.96.936 1.396.437.437.877.723 1.396.937.51.207 1.09.35 1.943.389C5.556 16 5.829 16 8 16s2.444-.01 3.297-.048c.853-.039 1.434-.182 1.943-.389.52-.214.96-.5 1.396-.936.437-.437.723-.877.937-1.396.207-.51.35-1.09.389-1.943C16 10.444 16 10.171 16 8s-.01-2.444-.048-3.297c-.039-.853-.182-1.434-.389-1.943a3.9 3.9 0 0 0-.936-1.396A3.9 3.9 0 0 0 12.24.437c-.51-.207-1.09-.35-1.943-.389C10.444 0 10.171 0 8 0Zm0 1.44c2.137 0 2.39.008 3.233.046.78.036 1.203.166 1.484.276.374.145.64.318.921.6.282.281.455.547.6.92.11.282.24.705.276 1.485.038.844.046 1.097.046 3.233s-.008 2.39-.046 3.233c-.036.78-.166 1.203-.276 1.484a2.46 2.46 0 0 1-.6.921c-.281.282-.547.455-.92.6-.282.11-.705.24-1.485.276-.844.038-1.097.046-3.233.046s-2.39-.008-3.233-.046c-.78-.036-1.203-.166-1.484-.276a2.46 2.46 0 0 1-.921-.6 2.46 2.46 0 0 1-.6-.92c-.11-.282-.24-.705-.276-1.485C1.448 10.39 1.44 10.137 1.44 8s.008-2.39.046-3.233c.036-.78.166-1.203.276-1.484.145-.374.318-.64.6-.921.281-.282.547-.455.92-.6.282-.11.705-.24 1.485-.276C5.61 1.448 5.863 1.44 8 1.44Zm0 2.32a4.24 4.24 0 1 0 0 8.48 4.24 4.24 0 0 0 0-8.48Zm0 1.44a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Zm4.52-.92a.84.84 0 1 0 0 1.68.84.84 0 0 0 0-1.68Z"/>
        </svg>
      </a>

      <a
        href="https://www.linkedin.com/in/karoline-bezerra-costa-5735a3218/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="social social--li"
        title="LinkedIn"
      >
  
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
          <path fill="currentColor"
            d="M0 1.146C0 .513.526 0 1.175 0h.65C2.474 0 3 .513 3 1.146v.708C3 2.487 2.474 3 1.825 3h-.65C.526 3 0 2.487 0 1.854v-.708ZM0 4.5h3v11H0v-11ZM5 4.5h2.839v1.561h.04c.396-.75 1.368-1.541 2.817-1.541C13.6 4.52 15 5.88 15 8.475V15.5h-3v-6.16c0-1.468-.525-2.469-1.838-2.469-.999 0-1.593.675-1.854 1.326-.096.234-.12.562-.12.892V15.5H5v-11Z"/>
        </svg>
      </a>
    </nav>
  </div>
</footer>


      {/* FLOATS */}
      <a href="#topo" className="float float--top" aria-label="Voltar ao topo">↑</a>
      <a href="https://wa.me/5588992347927" target="_blank" className="float float--wa" aria-label="WhatsApp" />
    </div>
  );
}
