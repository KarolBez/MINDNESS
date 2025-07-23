'use client'
import useEmblaCarousel from 'embla-carousel-react'
import './destaques.css'

export default function DestaquesCarrossel() {
  const [emblaRef] = useEmblaCarousel({ loop: true })

  return (
    <section className="destaques-section">
      <h2>Destaques Mindness</h2>
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          <div className="embla__slide">
            <h3>+1200 sessões realizadas</h3>
            <p>Com alta taxa de satisfação</p>
          </div>
          <div className="embla__slide">
            <h3>Parcerias com grandes empresas</h3>
            <p>Transformando a saúde emocional nas organizações</p>
          </div>
          <div className="embla__slide">
            <h3>Equipe 100% qualificada</h3>
            <p>Psicólogos com foco no ambiente corporativo</p>
          </div>
        </div>
      </div>
    </section>
  )
}
