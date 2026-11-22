import { Reveal } from '../../components/Reveal/Reveal'
import { PlayIcon } from '../../components/icons'
import { site } from '../../data/site'

const { hero } = site

/** Latest-release card: background art, title/date bottom-left, round play button. */
export function LatestReleaseCard({ refPrefix }: { refPrefix: string }) {
  return (
    <div className="hero-card" data-ref={`${refPrefix}-card`}>
      <div className="hero-card__info">
        <h3 className="hero-card__title" data-ref={`${refPrefix}-card-title`}>
          {hero.latestRelease.title}
        </h3>
        <h6 className="hero-card__date" data-ref={`${refPrefix}-card-date`}>
          {hero.latestRelease.date}
        </h6>
      </div>
      <a
        className="hero-card__button"
        href={hero.latestRelease.href}
        aria-label={`${hero.latestRelease.title} — see releases`}
        data-ref={`${refPrefix}-card-button`}
      >
        <PlayIcon />
      </a>
    </div>
  )
}

/** Desktop/tablet hero (hidden on phones). */
export function Hero() {
  return (
    <Reveal as="section" animation="fadeIn" slow className="hero" data-ref="hero">
      <div className="hero__left">
        <div className="hero__intro">
          <img className="hero__logo-tablet" src={site.logo.src} alt="" width={92} height={41} />
          <Reveal as="h2" className="hero__tagline" data-ref="hero-tagline">
            {hero.tagline}
          </Reveal>
          <Reveal as="h1" className="hero__title" data-ref="hero-title">
            {hero.title[0]}
            <br />
            {hero.title[1]}
          </Reveal>
        </div>
        <Reveal as="h2" className="hero__latest" data-ref="hero-latest-label">
          {hero.latestReleaseLabel}
        </Reveal>
        <LatestReleaseCard refPrefix="hero" />
      </div>
    </Reveal>
  )
}
