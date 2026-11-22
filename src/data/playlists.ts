import type { Playlist, Track } from './types'

// The original playlists lived in the WordPress database, which was lost.
// Album order comes from the numbered file names; the latest-beats list is the
// ten covers of the home-page BEATS carousel. Titles/accents are best guesses
// (see docs/ed8125-context.md).

const ARTIST = 'ED8125'
const ALBUM_COVER = '/media/img/covers/brasil-com-amor.png'

const albumTrack = (n: number, slug: string, title: string): Track => ({
  id: `brasil-${n}`,
  title,
  artist: ARTIST,
  src: `/media/audio/brasil-com-amor/${String(n).padStart(2, '0')}-${slug}.mp3`,
  cover: ALBUM_COVER,
})

const beat = (slug: string, title: string): Track => ({
  id: slug,
  title,
  artist: ARTIST,
  src: `/media/audio/beats/${slug}.mp3`,
  cover: `/media/img/covers/${slug}.png`,
})

export const brasilComAmor: Playlist = {
  id: 'brasil-com-amor',
  tracks: [
    albumTrack(1, 'bloco', 'Bloco'),
    albumTrack(2, 'carnaval', 'Carnaval'),
    albumTrack(3, 'amor-a-primeira-vista', 'Amor à primeira vista'),
    albumTrack(4, 'me-beija', 'Me beija'),
    albumTrack(5, 'nosso-samba', 'Nosso samba'),
    albumTrack(6, 'sera-voce', 'Será Você'),
    albumTrack(7, 'discussao', 'Discussão'),
    albumTrack(8, 'partiu', 'Partiu'),
    albumTrack(9, 'vou-por-ai', 'Vou por ai'),
    albumTrack(10, 'livre', 'Livre'),
    albumTrack(11, 'vem', 'Vem'),
  ],
  options: {
    numbered: false,
    reverse: false,
    tracklistCovers: false,
    activeCover: true,
    artistNames: true,
    allowLoop: true,
    cycle: false,
  },
}

/** Stored oldest-first; `reverse` shows MAD (newest) first, as the original did. */
export const latestBeats: Playlist = {
  id: 'latest-beats',
  tracks: [
    beat('abril-maguas-1000', "Abril M'Águas 1000"),
    beat('mais-amor-por-favor', 'Mais Amor Por Favor'),
    beat('follow-your-heart', 'Follow Your Heart'),
    beat('vou-por-ai', 'Vou Por Aí'),
    beat('vamos-a-luta', 'Vamos à Luta'),
    beat('one-love', 'One Love'),
    beat('its-time-to-think', "It's Time to Think"),
    beat('sean-price-ft-tek-remix', 'Sean Price ft Tek (Remix)'),
    beat('tributo-carlos-do-carmo', 'Tributo Carlos do Carmo'),
    beat('mad', 'MAD'),
  ],
  options: {
    numbered: true,
    reverse: true,
    tracklistCovers: true,
    activeCover: true,
    artistNames: true,
    allowLoop: true,
    cycle: false,
  },
}
