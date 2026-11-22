import type { CoverLink, Image, Release } from './types'

export const newBeat: Release = {
  label: 'NEW BEAT',
  title: 'MAD',
  href: '/latest-beats/',
  images: [{ src: '/media/img/mad-banner.png', alt: 'banner-release', width: 768, height: 768 }],
}

export const album: Release = {
  label: 'ALBUM',
  title: 'Brasil com amor',
  // Verbatim from the original, including the grammar slip and the NBSP.
  description:
    'This album tell us about a love story between two people.  Since the time they met until the day they drifted apart.',
  href: '/brasil-com-amor/',
  images: [
    { src: '/media/img/brasil-front.png', alt: 'front-cover', width: 768, height: 768 },
    { src: '/media/img/brasil-back.png', alt: 'back-cover', width: 768, height: 768 },
  ],
}

/** Wide banner used for the album block on /latest-beats/. */
export const albumBanner: Image = {
  src: '/media/img/brasil-banner.png',
  alt: 'art-web-bannerbanner-brasil-com-amor',
  width: 1200,
  height: 641,
}

const cover = (slug: string, alt: string): CoverLink => ({
  cover: `/media/img/covers/${slug}.png`,
  alt,
  href: '/latest-beats/',
})

/** Home BEATS carousel, in display order (alts as in the original). */
export const beatsCarousel: CoverLink[] = [
  cover('mad', 'banner-release'),
  cover('tributo-carlos-do-carmo', 'cover-carlos-do-carmo-tributo'),
  cover('sean-price-ft-tek-remix', 'Cover - Sean Price'),
  cover('its-time-to-think', 'it is time to think'),
  cover('one-love', 'One Love'),
  cover('vamos-a-luta', 'VamosALuta_optimized'),
  cover('vou-por-ai', 'Vou Por Ai'),
  cover('follow-your-heart', 'Follow Your Heart'),
  cover('mais-amor-por-favor', 'art-cover'),
  cover('abril-maguas-1000', 'Abril Maguas 1000'),
]
