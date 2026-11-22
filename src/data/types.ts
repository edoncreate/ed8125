export type Image = { src: string; alt: string }

export type Track = {
  id: string
  title: string
  artist: string
  /** Path under /media/audio/. */
  src: string
  /** Path under /media/img/covers/. */
  cover?: string
}

/** Mirrors the AudioIgniter options the original players used. */
export type PlayerOptions = {
  numbered: boolean
  reverse: boolean
  tracklistCovers: boolean
  activeCover: boolean
  artistNames: boolean
  allowLoop: boolean
  cycle: boolean
}

export type Playlist = {
  id: 'brasil-com-amor' | 'latest-beats'
  tracks: Track[]
  options: PlayerOptions
}

export type CoverLink = { cover: string; alt: string; href: string }

export type InstagramPost = { image: string; href: string; isVideo: boolean }

/** A run of text inside a paragraph; `bold` runs render as <strong>. */
export type TextRun = { text: string; bold?: boolean }

export type Release = {
  label: string
  title: string
  description?: string
  href: string
  images: Image[]
}
