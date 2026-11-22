import { Link } from 'react-router-dom'
import { AudioPlayer } from '../components/AudioPlayer/AudioPlayer'
import { CoverSlider } from '../components/Carousel/CoverSlider'
import { Footer } from '../components/Footer/Footer'
import { SubHeader } from '../components/Header/SubHeader'
import { Reveal } from '../components/Reveal/Reveal'
import { latestBeats } from '../data/playlists'
import { album, albumBanner } from '../data/releases'
import './ReleasePage.css'

/** /latest-beats/ — beats player, then the album block with a LISTEN link. */
export function LatestBeatsPage() {
  return (
    <>
      <SubHeader />
      <main className="release-page release-page--beats">
        <div className="container">
          <Reveal as="h1" className="release-page__heading" data-ref="releases-heading">
            Releases
          </Reveal>
          <div className="release-page__block">
            <h3 className="release-page__label" data-ref="beats-heading">
              LATESTE BEATS
            </h3>
            <AudioPlayer playlist={latestBeats} />
            <h2 className="release-page__share" data-ref="share-heading">
              Share
            </h2>
          </div>
          <h3 className="release-page__label release-page__label--album" data-ref="album-label">
            {album.label}
          </h3>
          <div className="release-page__cols release-page__cols--50-50">
            <div className="release-page__media">
              <CoverSlider images={[albumBanner]} data-ref="album-slider" />
            </div>
            <div className="release-page__info">
              <h2 className="release-page__title" data-ref="album-title">
                {album.title}
              </h2>
              <div className="release-page__text">
                <p data-ref="album-text">{album.description}</p>
              </div>
              <Link to={album.href} className="button" data-ref="album-listen">
                LISTEN
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
