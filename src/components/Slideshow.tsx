"use client";
import React, { useEffect, useState } from 'react';
import './Slideshow.css';

type Slide = {
  image?: string;
  text?: React.ReactNode;
};

interface SlideshowProps {
  startAt?: number;
}

const slides: Slide[] = [
  { image: '/slide1.png' },
  {
    image: '/slide2.png',
    text: (
      <div className="slide-text">
        <h2>Somos a <span style={{ color: '#90c8f0' }}>MINDNESS</span></h2>
        <p>
          Uma empresa especializada em Saúde Mental no Trabalho, com serviços ideais para empresas que buscam cuidar da saúde mental de seus funcionários.
        </p>
        <p>
          Nosso propósito é desenvolver soluções simples, mas profundamente eficazes, que apoiam empresas na construção de uma cultura de cuidado com a saúde emocional de seus colaboradores.
        </p>
      </div>
    )
  },
  { image: '/slide3.png' },
  { image: '/slide4.png' },
  { image: '/slide5.png' },
  { image: '/slide6.png' },
  {
    text: (
      <div className="slide-text">
        <h2 style={{ color: '#2c3e50' }}>Atendimento Psicológico</h2>
        <ul style={{ lineHeight: '1.8', marginTop: '1rem', fontSize: '1.1rem' }}>
          <li>Sessão de psicoterapia com valor acessível (R$ 65,00);</li>
          <li>Colaborador pode acessar diretamente no site;</li>
          <li>Aplicado a parentes de 1º grau;</li>
          <li>Empresa pode custear uma porcentagem do valor e pagar mensalmente o total no mês subsequente;</li>
          <li>Envio quinzenal de material com tema de saúde mental para o RH enviar aos colaboradores.</li>
        </ul>
      </div>
    )
  },
  { image: '/slide8.png' },
  { image: '/slide9.png' }
];

export default function Slideshow({ startAt = 0 }: SlideshowProps) {
  const [current, setCurrent] = useState(startAt);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slideshow-container">
      {slides[current].image && (
        <img
          src={slides[current].image}
          alt={`Slide ${current + 1}`}
          className="slide-image"
        />
      )}
      {slides[current].text && (
        <div className="overlay">
          {slides[current].text}
        </div>
      )}
    </div>
  );
}
