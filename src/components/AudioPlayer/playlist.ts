import type { Playlist, PlayerOptions, Track } from '../../data/types'

export type TrackItem = { track: Track; number: number }

/** Tracks in display order; `number` is the 1-based stored position (AudioIgniter numbering). */
export function orderedTracks(playlist: Playlist): TrackItem[] {
  const items = playlist.tracks.map((track, i) => ({ track, number: i + 1 }))
  return playlist.options.reverse ? items.reverse() : items
}

/** Tracklist row text, e.g. "10. MAD - ED8125" or "Bloco - ED8125". */
export function trackLabel({ track, number }: TrackItem, options: PlayerOptions): string {
  const prefix = options.numbered ? `${number}. ` : ''
  const suffix = options.artistNames && track.artist ? ` - ${track.artist}` : ''
  return `${prefix}${track.title}${suffix}`
}

/** Seconds → "mm:ss"; anything non-finite or negative → "00:00". */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const total = Math.floor(seconds)
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  return `${mm}:${ss}`
}
