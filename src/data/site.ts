import type { TextRun } from './types'

// Copy is verbatim from the original site (typos and non-breaking spaces kept).

export const site = {
  logo: { src: '/media/img/logo-white.png', alt: 'ED8125' },
  nav: [
    { label: 'Home', href: '#home' },
    { label: 'Releases', href: '#releases' },
    { label: 'Social', href: '#social' },
    { label: 'bio', href: '#bio' },
  ],
  social: {
    facebook: 'https://www.facebook.com/ED8125BEATS/',
    instagram: 'https://www.instagram.com/ed8125/',
  },
  hero: {
    tagline: 'Beatmaker . Bass Player . Producer',
    title: ["LET'S COOK", 'SOME MUSIC'],
    /** Phone hero heading, lowercase in the source (CSS uppercases it). */
    titleMobile: "let's cook some music",
    latestReleaseLabel: 'LATEST RELEASE',
    latestRelease: { title: 'MAD', date: '2021.02.28', href: '#releases' },
    background: '/media/img/hero.png',
    cardBackground: '/media/img/hero-card.png',
  },
  bio: {
    heading: 'Bio',
    background: '/media/img/bio-bg.png',
    paragraphs: [
      [
        { text: 'Producing instrumental beats since ' },
        { text: '2003', bold: true },
        { text: ', he soon realized that it was through music that one could express himself in the best way.' },
      ],
      [
        { text: 'First, tooking it as a ' },
        { text: 'hobby', bold: true },
        { text: ', or maybe a shelter. No matter what, music was always a part of his life.' },
      ],
      [
        { text: 'Throughout  the years he focused on ' },
        { text: 'telling stories', bold: true },
        { text: ' with a message in his ' },
        { text: 'melodies', bold: true },
        { text: '.' },
      ],
    ] satisfies TextRun[][] as TextRun[][],
  },
  footer: { text: 'Copyright © 2020 ', brand: 'EDONCREATE', href: 'https://edoncreate.com/' },
}
