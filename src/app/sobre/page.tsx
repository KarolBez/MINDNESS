import './sobre.css'; 
import Image from 'next/image';
import Link from 'next/link';
import VoltarHomeButton from '@/components/VoltaHomeButton';

export default function SobrePage() {
  return (
    <div className="sobre-container">
        <VoltarHomeButton />
      <div className="sobre-content">
        <div className="logo-container">
          <Image src="/logo_nome.png" alt="Logo Mindness" width={80} height={80} />
        </div>
        <h1 className="sobre-titulo">Sobre a Mindness</h1>
        <p>
          Na <strong>Mindness</strong>, acreditamos que cuidar da saúde mental é essencial para construir ambientes de trabalho mais humanos, produtivos e sustentáveis.
          Nosso propósito é claro: desenvolver soluções simples, mas profundamente eficazes, que apoiem empresas na construção de uma cultura genuína de cuidado com a saúde psicológica de seus colaboradores.
        </p>
        <p>
          Sabemos que cada organização é única — por isso, nossas abordagens combinam ciência, empatia e escuta ativa para oferecer ferramentas que realmente façam sentido no dia a dia corporativo.
        </p>
        <p>
          Da conscientização à ação, nossa missão é ajudar empresas a transformarem o bem-estar emocional em parte estratégica de sua gestão, promovendo relações mais saudáveis, times mais engajados e pessoas mais realizadas.
        </p>
        <p><strong>Cuidar de pessoas é cuidar do futuro</strong> e a Mindness existe para facilitar esse caminho.</p>

        </div>
      </div>
  );
}
