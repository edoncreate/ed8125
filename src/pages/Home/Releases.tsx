import { Link } from 'react-router-dom'
import { CoverSlider } from '../../components/Carousel/CoverSlider'
import { Reveal } from '../../components/Reveal/Reveal'
import { album, newBeat } from '../../data/releases'
import type { Release } from '../../data/types'

function ReleaseColumn({ release, refPrefix }: { release: Release; refPrefix: string }) {
  return (
    <article className="release">
      <CoverSlider images={release.images} className="release__slider" data-ref={`${refPrefix}-slider`} />
      <h3 className="release__label" data-ref={`${refPrefix}-label`}>
        {release.label}
      </h3>
      <h2 className="release__title" data-ref={`${refPrefix}-title`}>
        {release.title}
      </h2>
      <div className="release__text">
        {release.description && <p data-ref={`${refPrefix}-text`}>{release.description}</p>}
      </div>
      <Link to={release.href} className="button" data-ref={`${refPrefix}-listen`}>
        LISTEN
      </Link>
    </article>
  )
}

export function Releases() {
  return (
    <section id="releases" className="section releases" data-ref="section-releases">
      <div className="container">
        <Reveal as="h2" className="section-heading section-heading--gold releases__heading" data-ref="releases-heading">
          Releases
        </Reveal>
        <div className="releases__grid">
          <ReleaseColumn release={newBeat} refPrefix="newbeat" />
          <ReleaseColumn release={album} refPrefix="album" />
        </div>
      </div>
    </section>
  )
}
