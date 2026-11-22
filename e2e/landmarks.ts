import { dataRef, el, heading, type Landmark } from './fidelity'

const lm = (name: string, ref: string, text = false): Landmark => ({ name, ref, app: dataRef(name), text })

/** Header + home sections shared by desktop and tablet (≥ 910px header layout). */
export const HOME_DESKTOP: Landmark[] = [
  lm('header', '#menuTop'),
  { name: 'logo', ref: '.main-logo .logo', app: '.site-header__logo img' },
  lm('nav-home', '.home-menu a', true),
  lm('nav-releases', '#elementor-navmenu a[href="#releases"]', true),
  lm('nav-bio', '#elementor-navmenu a[href="#bio"]', true),
  lm('nav-facebook', '.menu-item-267 a'),
  lm('nav-instagram', '.menu-item-268 a'),

  lm('hero', el('8215a0f')),
  lm('hero-tagline', heading('107be24'), true),
  lm('hero-title', heading('869e6b9'), true),
  lm('hero-latest-label', heading('4cdf5d4'), true),
  lm('hero-card', el('0e895d1')),
  lm('hero-card-title', heading('362e274'), true),
  lm('hero-card-date', heading('b9c4d5d'), true),
  lm('hero-card-button', el('21eed71', '.elementor-button')),

  lm('section-releases', el('c22d2e4')),
  lm('releases-heading', heading('e652b44'), true),
  lm('newbeat-slider', el('965811e')),
  lm('newbeat-label', heading('8db25c0'), true),
  lm('newbeat-title', heading('99f120b'), true),
  lm('newbeat-listen', el('a4c7379', '.elementor-button'), true),
  lm('album-slider', el('a97f81a')),
  lm('album-label', heading('3a79341'), true),
  lm('album-title', heading('6029662'), true),
  lm('album-text', el('f67bd15', 'p'), true),
  lm('album-listen', el('8ec7dc3', '.elementor-button'), true),

  lm('section-social', el('3f36826')),
  lm('social-heading', heading('c4f6d30'), true),
  lm('social-feed', el('076a137', '#sb_instagram')),

  lm('section-beats', el('6e1ef12')),
  lm('beats-heading', heading('e2772b4'), true),
  lm('beats-carousel', el('7badd40')),

  lm('section-bio', el('5bb7990')),
  lm('bio-heading', heading('a332fd0'), true),
  lm('bio-text', el('f40517a', '.elementor-text-editor'), true),

  lm('footer', el('7d87a6f', '.elementor-text-editor'), true),
]

/** Phone (≤ 767px): separate hero, bottom tab bar. */
export const HOME_PHONE: Landmark[] = [
  lm('header', '#menuTop'),
  lm('nav-releases', '#elementor-navmenu a[href="#releases"]', true),
  lm('hero-mobile', el('5a22e58')),
  { name: 'hero-mobile-logo', ref: el('0aa422f', 'img'), app: dataRef('hero-mobile-logo') },
  lm('hero-mobile-tagline', heading('11d3a9f'), true),
  lm('hero-mobile-banner', el('084b228')),
  lm('hero-mobile-title', heading('b0c24e7'), true),
  lm('hero-mobile-latest-label', heading('a955cb8'), true),
  lm('hero-mobile-card', el('1f8d647')),
  lm('hero-mobile-card-title', heading('8c6201e'), true),
  lm('hero-mobile-card-date', heading('6a1efb0'), true),
  lm('hero-mobile-card-button', el('14d833e', '.elementor-button')),
  lm('section-releases', el('c22d2e4')),
  lm('releases-heading', heading('e652b44'), true),
  lm('newbeat-slider', el('965811e')),
  lm('album-slider', el('a97f81a')),
  lm('album-text', el('f67bd15', 'p'), true),
  lm('social-heading', heading('c4f6d30'), true),
  lm('social-feed', el('076a137', '#sb_instagram')),
  { name: 'social-photo-1', ref: el('076a137', '.sbi_item'), app: '.ig__item' },
  lm('beats-heading', heading('e2772b4'), true),
  lm('beats-carousel', el('7badd40')),
  lm('bio-heading', heading('a332fd0'), true),
  lm('bio-text', el('f40517a', '.elementor-text-editor'), true),
  lm('footer', el('7d87a6f', '.elementor-text-editor'), true),
]

const RELEASE_COMMON: Landmark[] = [
  lm('header', el('e427316')),
  { name: 'logo', ref: '.menu-item-home .logo', app: '.site-header__logo img' },
  lm('nav-back', '.btn-back a', true),
  lm('releases-heading', heading('1a121c4'), true),
  lm('footer', el('39f5a1e', '.elementor-text-editor'), true),
]

/** /brasil-com-amor/ */
export const ALBUM_PAGE = (phone: boolean): Landmark[] => [
  ...RELEASE_COMMON,
  lm('album-label', heading('9714595'), true),
  lm('album-slider', el('fb58e87')),
  lm('album-title', heading('e04abc4'), true),
  lm('album-text', el('f51d410', 'p'), true),
  phone ? lm('share-heading-phone', heading('68cfbee'), true) : lm('share-heading', heading('429ba87'), true),
  lm('player', el('d476227', '.ai-wrap')),
  lm('beats-heading', heading('0910689'), true),
  lm('beats-carousel', el('2bf8cfd')),
]

/** /latest-beats/ */
export const BEATS_PAGE: Landmark[] = [
  ...RELEASE_COMMON,
  lm('beats-heading', heading('0910689'), true),
  lm('player', el('f8825fe', '.ai-wrap')),
  lm('player-next', el('f8825fe', '.ai-tracklist-next')),
  lm('player-repeat', el('f8825fe', '.ai-btn-repeat')),
  lm('share-heading', heading('429ba87'), true),
  lm('album-label', heading('9714595'), true),
  lm('album-slider', el('fb58e87')),
  lm('album-title', heading('e04abc4'), true),
  lm('album-text', el('f51d410', 'p'), true),
  lm('album-listen', el('fea33bd', '.elementor-button'), true),
]
