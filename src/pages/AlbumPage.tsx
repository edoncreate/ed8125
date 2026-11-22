import { AudioPlayer } from '../components/AudioPlayer/AudioPlayer'
import { BeatsCarousel } from '../components/Carousel/BeatsCarousel'
import { CoverSlider } from '../components/Carousel/CoverSlider'
import { Footer } from '../components/Footer/Footer'
import { SubHeader } from '../components/Header/SubHeader'
import { Reveal } from '../components/Reveal/Reveal'
import { brasilComAmor } from '../data/playlists'
import { album, beatsCarousel } from '../data/releases'
import './ReleasePage.css'

/** /brasil-com-amor/ — album cover + text, album player, latest beats carousel. */
export function AlbumPage() {
  return (
    <>
      <SubHeader />
      <main className="release-page release-page--album">
        <div className="container">
          <Reveal as="h1" className="release-page__heading" data-ref="releases-heading">
            Releases
          </Reveal>
          <h3 className="release-page__label release-page__label--album" data-ref="album-label">
            {album.label}
          </h3>
          <div className="release-page__cols release-page__cols--40-60">
            <div className="release-page__media">
              <CoverSlider images={album.images} data-ref="album-slider" />
            </div>
            <div className="release-page__info">
              <h2 className="release-page__title" data-ref="album-title">
                {album.title}
              </h2>
              <div className="release-page__text">
                <p data-ref="album-text">{album.description}</p>
              </div>
              <h2 className="release-page__share release-page__share--wide" data-ref="share-heading">
                Share
              </h2>
            </div>
          </div>
          <div className="release-page__block">
            <AudioPlayer playlist={brasilComAmor} />
            <h2 className="release-page__share release-page__share--phone" data-ref="share-heading-phone">
              Share
            </h2>
          </div>
          <h3 className="release-page__label" data-ref="beats-heading">
            LATESTE BEATS
          </h3>
          <BeatsCarousel items={beatsCarousel} data-ref="beats-carousel" />
        </div>
      </main>
      <Footer />
    </>
  )
}
