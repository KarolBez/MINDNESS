'use client'
import { useState } from 'react'
import Slideshow from './Slideshow'

export default function InfoCard() {
  const [text, setText] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
  )

  return (
    <div className="card">
      <p> </p> 
      <Slideshow />

      <a
        href="https://wa.me/5588992347927"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Fale conosco no WhatsApp"
      ></a>
    </div>
  )
}
