import { describe, expect, it } from 'vitest'
import { brasilComAmor, latestBeats } from '../../data/playlists'
import { formatTime, orderedTracks, trackLabel } from './playlist'

describe('orderedTracks / trackLabel', () => {
  it('album keeps stored order and labels without numbers', () => {
    const items = orderedTracks(brasilComAmor)
    expect(items.map((i) => i.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(trackLabel(items[0], brasilComAmor.options)).toBe('Bloco - ED8125')
    expect(trackLabel(items[10], brasilComAmor.options)).toBe('Vem - ED8125')
  })

  it('beats are reversed and numbered by stored position', () => {
    const items = orderedTracks(latestBeats)
    expect(items[0].track.title).toBe('MAD')
    expect(trackLabel(items[0], latestBeats.options)).toBe('10. MAD - ED8125')
    expect(trackLabel(items[9], latestBeats.options)).toBe("1. Abril M'Águas 1000 - ED8125")
  })

  it('does not mutate the playlist', () => {
    orderedTracks(latestBeats)
    expect(latestBeats.tracks[0].title).toBe("Abril M'Águas 1000")
  })
})

describe('formatTime', () => {
  it.each([
    [0, '00:00'],
    [9.9, '00:09'],
    [202.8, '03:22'],
    [3600, '60:00'],
    [Number.NaN, '00:00'],
    [Number.POSITIVE_INFINITY, '00:00'],
    [-5, '00:00'],
  ])('%s → %s', (input, out) => {
    expect(formatTime(input)).toBe(out)
  })
})
