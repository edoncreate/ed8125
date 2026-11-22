import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import type { Track } from '../../data/types'

export type AudioPlayerApi = {
  audioRef: RefObject<HTMLAudioElement | null>
  index: number
  playing: boolean
  currentTime: number
  duration: number
  volume: number
  loop: boolean
  error: string | null
  toggle: () => void
  select: (index: number) => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  setVolume: (volume: number) => void
  toggleLoop: () => void
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * Playlist playback state for one <audio> element (attach `audioRef` and use
 * `tracks[index].src` as its src). `playing` follows the element's play/pause
 * events, so a rejected play() never leaves the UI claiming to play.
 */
export function useAudioPlayer(tracks: Track[], { cycle }: { cycle: boolean }): AudioPlayerApi {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [loop, setLoop] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Latest values for event handlers registered once.
  const live = useRef({ index, playing, loop, cycle, count: tracks.length, failed: false })
  useLayoutEffect(() => {
    live.current = { index, playing, loop, cycle, count: tracks.length, failed: error !== null }
  })
  /** Start playback once the next track's src is in place. */
  const playOnChange = useRef(false)

  const safePlay = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    const attempt = el.play()
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch((err: unknown) => {
        // AbortError: superseded by a newer load (rapid switching) — harmless.
        if (err instanceof DOMException && err.name === 'AbortError') return
        setPlaying(false)
      })
    }
  }, [])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => setCurrentTime(el.currentTime)
    const onMeta = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0)
    const onEnded = () => {
      const s = live.current
      if (s.loop) {
        el.currentTime = 0
        safePlay()
      } else if (s.index < s.count - 1) {
        playOnChange.current = true
        setIndex(s.index + 1)
      } else if (s.cycle) {
        playOnChange.current = true
        setIndex(0)
      } else {
        setPlaying(false)
      }
    }
    const onError = () => {
      playOnChange.current = false
      setPlaying(false)
      setError('This track could not be played.')
    }
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('durationchange', onMeta)
    el.addEventListener('ended', onEnded)
    el.addEventListener('error', onError)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('durationchange', onMeta)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('error', onError)
    }
  }, [safePlay])

  // After a track change has been committed (new src on the element).
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    setCurrentTime(0)
    setDuration(0)
    setError(null)
    if (playOnChange.current) {
      playOnChange.current = false
      safePlay()
    }
  }, [index, safePlay])

  const toggle = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    if (live.current.playing) {
      el.pause()
      return
    }
    if (live.current.failed) {
      // Retry a track that failed to load (e.g. a transient network error).
      setError(null)
      el.load()
    }
    safePlay()
  }, [safePlay])

  const select = useCallback(
    (i: number) => {
      setError(null)
      if (i === live.current.index) {
        toggle()
        return
      }
      playOnChange.current = true
      setIndex(i)
    },
    [toggle],
  )

  const next = useCallback(() => {
    const s = live.current
    if (s.index < s.count - 1) {
      playOnChange.current = s.playing
      setIndex(s.index + 1)
    } else if (s.cycle) {
      playOnChange.current = s.playing
      setIndex(0)
    }
  }, [])

  const seek = useCallback((seconds: number) => {
    const el = audioRef.current
    if (!el) return
    el.currentTime = Math.max(0, seconds)
    setCurrentTime(el.currentTime)
  }, [])

  const prev = useCallback(() => {
    const s = live.current
    if (s.index > 0) {
      playOnChange.current = s.playing
      setIndex(s.index - 1)
    } else {
      seek(0)
    }
  }, [seek])

  const setVolume = useCallback((v: number) => {
    const value = Math.round(clamp(v, 0, 1) * 100) / 100
    if (audioRef.current) audioRef.current.volume = value
    setVolumeState(value)
  }, [])

  const toggleLoop = useCallback(() => setLoop((l) => !l), [])

  return {
    audioRef,
    index,
    playing,
    currentTime,
    duration,
    volume,
    loop,
    error,
    toggle,
    select,
    next,
    prev,
    seek,
    setVolume,
    toggleLoop,
  }
}
