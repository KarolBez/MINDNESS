'use client'
import { useState } from 'react'
import Slideshow from './Slideshow'

export default function InfoCard() {
  const [text, setText] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
  )

  return (
    <div className="card">
      <h2>Mindness</h2>
      <p> Soluções em saúde emocional para empresas</p> 
      <Slideshow />

      <a
        href="https://wa.me/558881929593" 
        target="_blank"
        rel="noopener noreferrer"
        className="circle whatsapp-button"
        aria-label="Fale conosco no WhatsApp"
      >
        <img src="/whatsapp-icon.svg" alt="WhatsApp" />
      </a>
    </div>
  )
}
