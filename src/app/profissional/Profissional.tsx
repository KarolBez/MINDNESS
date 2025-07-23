'use client';
import './Profissional.css';

export default function EscolherProfissional() {
  return (
    <div className="profissional-container">
      <h2>Escolha sua profissional</h2>
      <div className="card-profissional">
        <img
          src="/avatar-psicologa.png"
          alt="Psicóloga"
          className="avatar"
        />
        <h3>Thays Fernandes</h3>
        <p>Psicóloga especializada em saúde emocional no ambiente corporativo. Atendimento humanizado e acolhedor.</p>
        <button className="botao-selecionar">Selecionar profissional</button>
      </div>
    </div>
  );
}
