import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Track } from '../../data/types'
import { useAudioPlayer, type AudioPlayerApi } from './useAudioPlayer'

const tracks: Track[] = ['a', 'b', 'c'].map((id) => ({ id, title: id.toUpperCase(), artist: 'X', src: `/${id}.mp3` }))

let api: AudioPlayerApi
function Harness({ cycle = false }: { cycle?: boolean }) {
  api = useAudioPlayer(tracks, { cycle })
  return <audio ref={api.audioRef} src={tracks[api.index].src} data-testid="audio" />
}

const audio = () => document.querySelector('audio')!
const play = () => HTMLMediaElement.prototype.play as unknown as ReturnType<typeof vi.fn>

afterEach(() => {
  play().mockClear()
  play().mockImplementation(function (this: HTMLMediaElement) {
    this.dispatchEvent(new Event('play'))
    return Promise.resolve()
  })
})

describe('useAudioPlayer', () => {
  it('select(i) switches track and starts playback', async () => {
    render(<Harness />)
    await act(async () => api.select(1))
    expect(api.index).toBe(1)
    expect(audio().getAttribute('src')).toBe('/b.mp3')
    expect(play()).toHaveBeenCalled()
    expect(api.playing).toBe(true)
  })

  it('toggle plays then pauses', async () => {
    render(<Harness />)
    await act(async () => api.toggle())
    expect(api.playing).toBe(true)
    await act(async () => api.toggle())
    expect(api.playing).toBe(false)
  })

  it('ended advances to the next track and keeps playing', async () => {
    render(<Harness />)
    await act(async () => api.toggle())
    play().mockClear()
    await act(async () => fireEvent(audio(), new Event('ended')))
    expect(api.index).toBe(1)
    expect(play()).toHaveBeenCalled()
    expect(api.playing).toBe(true)
  })

  it('ended on the last track stops when cycle is off', async () => {
    render(<Harness />)
    await act(async () => api.select(2))
    play().mockClear()
    await act(async () => fireEvent(audio(), new Event('ended')))
    expect(api.index).toBe(2)
    expect(api.playing).toBe(false)
    expect(play()).not.toHaveBeenCalled()
  })

  it('ended on the last track wraps to the first when cycle is on', async () => {
    render(<Harness cycle />)
    await act(async () => api.select(2))
    await act(async () => fireEvent(audio(), new Event('ended')))
    expect(api.index).toBe(0)
    expect(api.playing).toBe(true)
  })

  it('loop replays the same track', async () => {
    render(<Harness />)
    await act(async () => api.toggle())
    await act(async () => api.toggleLoop())
    play().mockClear()
    await act(async () => fireEvent(audio(), new Event('ended')))
    expect(api.index).toBe(0)
    expect(audio().currentTime).toBe(0)
    expect(play()).toHaveBeenCalled()
  })

  it('prev on the first track restarts it; next on the last does nothing without cycle', async () => {
    render(<Harness />)
    audio().currentTime = 42
    await act(async () => api.prev())
    expect(api.index).toBe(0)
    expect(audio().currentTime).toBe(0)
    await act(async () => api.select(2))
    await act(async () => api.next())
    expect(api.index).toBe(2)
  })

  it('a play() AbortError (rapid switching) is swallowed and leaves the player paused', async () => {
    play().mockImplementation(() => Promise.reject(new DOMException('interrupted', 'AbortError')))
    render(<Harness />)
    await act(async () => api.toggle())
    expect(api.playing).toBe(false)
    expect(api.error).toBeNull()
  })

  it('a blocked play() (NotAllowedError) leaves the player paused without throwing', async () => {
    play().mockImplementation(() => Promise.reject(new DOMException('blocked', 'NotAllowedError')))
    render(<Harness />)
    await act(async () => api.toggle())
    expect(api.playing).toBe(false)
  })

  it('a media error marks the player as errored and paused', async () => {
    render(<Harness />)
    await act(async () => api.toggle())
    await act(async () => fireEvent(audio(), new Event('error')))
    expect(api.playing).toBe(false)
    expect(api.error).not.toBeNull()
    await act(async () => api.select(1))
    expect(api.error).toBeNull()
  })

  it('an error is cleared when moving on with next()', async () => {
    render(<Harness />)
    await act(async () => fireEvent(audio(), new Event('error')))
    expect(api.error).not.toBeNull()
    await act(async () => api.next())
    expect(api.index).toBe(1)
    expect(api.error).toBeNull()
  })

  it('pressing play on a failed track reloads it and retries', async () => {
    render(<Harness />)
    await act(async () => fireEvent(audio(), new Event('error')))
    const load = HTMLMediaElement.prototype.load as unknown as ReturnType<typeof vi.fn>
    load.mockClear()
    play().mockClear()
    await act(async () => api.toggle())
    expect(load).toHaveBeenCalledTimes(1)
    expect(play()).toHaveBeenCalledTimes(1)
    expect(api.error).toBeNull()
    expect(api.playing).toBe(true)
  })

  it('tracks time and duration from media events', async () => {
    render(<Harness />)
    Object.defineProperty(audio(), 'duration', { configurable: true, value: 202.8 })
    audio().currentTime = 61
    await act(async () => {
      fireEvent(audio(), new Event('loadedmetadata'))
      fireEvent(audio(), new Event('timeupdate'))
    })
    expect(api.duration).toBe(202.8)
    expect(api.currentTime).toBe(61)
  })

  it('volume and seek are applied to the element and clamped', async () => {
    render(<Harness />)
    await act(async () => api.setVolume(1.4))
    expect(api.volume).toBe(1)
    await act(async () => api.setVolume(0.3))
    expect(audio().volume).toBeCloseTo(0.3)
    await act(async () => api.seek(12))
    expect(audio().currentTime).toBe(12)
  })
})
