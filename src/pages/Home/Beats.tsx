import { BeatsCarousel } from '../../components/Carousel/BeatsCarousel'
import { Reveal } from '../../components/Reveal/Reveal'
import { beatsCarousel } from '../../data/releases'

/** BEATS section. It carries id="social" because the original did (the SOCIAL nav item lands here). */
export function Beats() {
  return (
    <section id="social" className="section beats" data-ref="section-beats">
      <div className="container">
        <Reveal as="h2" className="section-heading" data-ref="beats-heading">
          BEATS
        </Reveal>
        <BeatsCarousel items={beatsCarousel} data-ref="beats-carousel" />
      </div>
    </section>
  )
}
