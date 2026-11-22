import { site } from '../../data/site'
import { LatestReleaseCard } from './Hero'

const { hero } = site

/** Phone-only hero (≤ 767px): logo, tagline, banner with title, latest release. */
export function HeroMobile() {
  return (
    <section className="hero-mobile" data-ref="hero-mobile">
      <div className="hero-mobile__logo">
        <img src={site.logo.src} alt={site.logo.alt} width={100} height={45} data-ref="hero-mobile-logo" />
      </div>
      <h2 className="hero-mobile__tagline" data-ref="hero-mobile-tagline">
        {hero.tagline}
      </h2>
      <div className="hero-mobile__banner" data-ref="hero-mobile-banner">
        <h1 className="hero-mobile__title" data-ref="hero-mobile-title">
          {hero.titleMobile}
        </h1>
      </div>
      <h2 className="hero-mobile__latest" data-ref="hero-mobile-latest-label">
        {hero.latestReleaseLabel}
      </h2>
      <LatestReleaseCard refPrefix="hero-mobile" />
    </section>
  )
}
