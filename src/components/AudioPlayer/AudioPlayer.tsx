import { useMemo, type KeyboardEvent, type MouseEvent } from 'react'
import type { Playlist } from '../../data/types'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, RepeatIcon } from '../icons'
import './AudioPlayer.css'
import { formatTime, orderedTracks, trackLabel } from './playlist'
import { useAudioPlayer } from './useAudioPlayer'

const VOLUME_STEPS = 11 // bars for 0%, 10%, … 100%

/** Recreation of the AudioIgniter "full" player the original site used. */
export function AudioPlayer({ playlist }: { playlist: Playlist }) {
  const { options } = playlist
  const items = useMemo(() => orderedTracks(playlist), [playlist])
  const tracks = useMemo(() => items.map((i) => i.track), [items])
  const { audioRef, ...p } = useAudioPlayer(tracks, { cycle: options.cycle })
  const current = tracks[p.index]
  const progress = p.duration > 0 ? Math.min(100, (p.currentTime / p.duration) * 100) : 0

  const seekFromClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (p.duration > 0 && rect.width > 0) p.seek(((e.clientX - rect.left) / rect.width) * p.duration)
  }
  const seekFromKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') p.seek(p.currentTime + 5)
    else if (e.key === 'ArrowLeft') p.seek(p.currentTime - 5)
    else return
    e.preventDefault()
  }

  return (
    <div className={`player player--${playlist.id}`} data-ref="player">
      <div className="player__head">
        {options.activeCover && current.cover && (
          <div className="player__thumb">
            <img src={current.cover} alt="" data-testid="player-cover" width={130} height={130} />
          </div>
        )}
        <div className="player__controls">
          <div className="player__main">
            <button
              type="button"
              className="player__play"
              aria-label={p.playing ? 'Pause' : 'Play'}
              onClick={p.toggle}
            >
              {p.playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="player__info">
              <p className="player__title" data-testid="player-title">
                {current.title}
              </p>
              {options.artistNames && (
                <p className="player__artist" data-testid="player-artist">
                  {current.artist}
                </p>
              )}
            </div>
          </div>

          <div className="player__progress">
            <div
              className="player__bar"
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(p.duration)}
              aria-valuenow={Math.round(p.currentTime)}
              aria-valuetext={formatTime(p.currentTime)}
              onClick={seekFromClick}
              onKeyDown={seekFromKey}
            >
              <span className="player__bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="player__time" data-testid="player-time">
              {formatTime(p.currentTime)}
            </span>
          </div>

          <div className="player__meta">
            <button type="button" className="player__btn" aria-label="Previous track" onClick={p.prev}>
              <PrevIcon />
            </button>
            <button type="button" className="player__btn" aria-label="Next track" onClick={p.next}>
              <NextIcon />
            </button>
            <div className="player__volume">
              <div className="player__volume-bars" role="group" aria-label="Volume">
                {Array.from({ length: VOLUME_STEPS }, (_, i) => (
                  <span
                    key={i}
                    data-testid="volume-bar"
                    className={`player__volume-bar${i / 10 <= p.volume + 1e-6 ? ' is-active' : ''}`}
                    onClick={() => p.setVolume(i / 10)}
                  />
                ))}
              </div>
              <div className="player__volume-btns">
                <button type="button" className="player__btn player__btn--small" aria-label="Volume up" onClick={() => p.setVolume(p.volume + 0.1)}>
                  +
                </button>
                <button type="button" className="player__btn player__btn--small" aria-label="Volume down" onClick={() => p.setVolume(p.volume - 0.1)}>
                  -
                </button>
              </div>
            </div>
            {options.allowLoop && (
              <button
                type="button"
                className={`player__btn player__btn--repeat${p.loop ? ' is-active' : ''}`}
                aria-label="Repeat track"
                aria-pressed={p.loop}
                onClick={p.toggleLoop}
              >
                <RepeatIcon />
              </button>
            )}
          </div>
          {p.error && (
            <p className="player__error" role="status">
              {p.error}
            </p>
          )}
        </div>
      </div>

      <ul className="player__tracklist" aria-label="Tracklist">
        {items.map((item, i) => {
          const active = i === p.index
          return (
            <li key={item.track.id} className={`player__track${active ? ' is-active' : ''}`}>
              <button type="button" aria-current={active ? 'true' : undefined} onClick={() => p.select(i)}>
                {options.tracklistCovers && item.track.cover && (
                  <span className="player__track-thumb">
                    <img src={item.track.cover} alt="" width={40} height={40} loading="lazy" />
                  </span>
                )}
                <span className="player__track-name">{trackLabel(item, options)}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <audio ref={audioRef} src={current.src} preload="metadata" />
    </div>
  )
}
