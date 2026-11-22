// @vitest-environment node
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { instagramHandle, instagramPosts } from './instagram'
import { brasilComAmor, latestBeats } from './playlists'
import { album, beatsCarousel, newBeat } from './releases'
import { site } from './site'

/** Every string in a value tree that looks like a local media path. */
function mediaPaths(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (value.startsWith('/media/')) out.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((v) => mediaPaths(v, out))
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => mediaPaths(v, out))
  }
  return out
}

const all = { site, album, newBeat, beatsCarousel, brasilComAmor, latestBeats, instagramPosts }

describe('content data', () => {
  it('every media path exists and is lowercase ascii', () => {
    const paths = mediaPaths(all)
    expect(paths.length).toBeGreaterThan(40)
    for (const p of paths) {
      expect(p, p).toMatch(/^\/media\/[a-z0-9/._-]+$/)
      expect(existsSync(join('public', p)), `missing public${p}`).toBe(true)
    }
  })

  it('album tracklist', () => {
    expect(brasilComAmor.tracks.map((t) => t.title)).toEqual([
      'Bloco', 'Carnaval', 'Amor à primeira vista', 'Me beija', 'Nosso samba', 'Será Você',
      'Discussão', 'Partiu', 'Vou por ai', 'Livre', 'Vem',
    ])
    expect(new Set(brasilComAmor.tracks.map((t) => t.artist))).toEqual(new Set(['ED8125']))
    expect(brasilComAmor.options).toEqual({
      numbered: false, reverse: false, tracklistCovers: false, activeCover: true,
      artistNames: true, allowLoop: true, cycle: false,
    })
  })

  it('beats tracklist is stored oldest-first and shown reversed', () => {
    expect(latestBeats.tracks.map((t) => t.title)).toEqual([
      "Abril M'Águas 1000", 'Mais Amor Por Favor', 'Follow Your Heart', 'Vou Por Aí', 'Vamos à Luta',
      'One Love', "It's Time to Think", 'Sean Price ft Tek (Remix)', 'Tributo Carlos do Carmo', 'MAD',
    ])
    expect(latestBeats.options).toEqual({
      numbered: true, reverse: true, tracklistCovers: true, activeCover: true,
      artistNames: true, allowLoop: true, cycle: false,
    })
    expect(latestBeats.tracks.every((t) => t.cover)).toBe(true)
  })

  it('beats carousel matches the home carousel order and links', () => {
    expect(beatsCarousel.map((c) => c.alt)).toEqual([
      'banner-release', 'cover-carlos-do-carmo-tributo', 'Cover - Sean Price', 'it is time to think',
      'One Love', 'VamosALuta_optimized', 'Vou Por Ai', 'Follow Your Heart', 'art-cover', 'Abril Maguas 1000',
    ])
    expect(beatsCarousel.every((c) => c.href === '/latest-beats/')).toBe(true)
    expect(beatsCarousel[0].cover).toBe(latestBeats.tracks[9].cover)
  })

  it('releases', () => {
    expect(newBeat).toMatchObject({ label: 'NEW BEAT', title: 'MAD', href: '/latest-beats/' })
    expect(newBeat.images).toHaveLength(1)
    expect(album).toMatchObject({
      label: 'ALBUM',
      title: 'Brasil com amor',
      description: 'This album tell us about a love story between two people.  Since the time they met until the day they drifted apart.',
      href: '/brasil-com-amor/',
    })
    expect(album.images.map((i) => i.src)).toEqual(['/media/img/brasil-front.png', '/media/img/brasil-back.png'])
  })

  it('instagram', () => {
    expect(instagramHandle).toBe('ed8125')
    expect(instagramPosts.map((p) => p.href)).toEqual([
      'https://www.instagram.com/tv/CeHEP9XIYgq/',
      'https://www.instagram.com/p/CblKyB-orkI/',
      'https://www.instagram.com/p/Ca3PJYbo1t-/',
      'https://www.instagram.com/tv/CXOOaFmISUB/',
    ])
    expect(instagramPosts.map((p) => p.isVideo)).toEqual([true, true, false, true])
  })

  it('site copy and links', () => {
    expect(site.social).toEqual({
      facebook: 'https://www.facebook.com/ED8125BEATS/',
      instagram: 'https://www.instagram.com/ed8125/',
    })
    expect(site.hero.tagline).toBe('Beatmaker . Bass Player . Producer')
    expect(site.hero.title).toEqual(["LET'S COOK", 'SOME MUSIC'])
    expect(site.hero.latestRelease).toEqual({ title: 'MAD', date: '2021.02.28', href: '#releases' })
    expect(site.footer).toEqual({ text: 'Copyright © 2020 ', brand: 'EDONCREATE', href: 'https://edoncreate.com/' })
    const bold = site.bio.paragraphs.flat().filter((s) => s.bold).map((s) => s.text)
    expect(bold).toEqual(['2003', 'hobby', 'telling stories', 'melodies'])
  })
})
