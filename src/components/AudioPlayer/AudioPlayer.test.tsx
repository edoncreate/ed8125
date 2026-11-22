import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { brasilComAmor, latestBeats } from '../../data/playlists'
import { AudioPlayer } from './AudioPlayer'

describe('AudioPlayer', () => {
  it('beats: reversed, numbered rows with covers, newest first active', () => {
    render(<AudioPlayer playlist={latestBeats} />)
    const rows = within(screen.getByRole('list', { name: 'Tracklist' })).getAllByRole('listitem')
    expect(rows).toHaveLength(10)
    expect(rows[0]).toHaveTextContent('10. MAD - ED8125')
    expect(rows[9]).toHaveTextContent("1. Abril M'Águas 1000 - ED8125")
    rows.forEach((row) => expect(row.querySelector('img')).not.toBeNull())
    expect(rows[0].querySelector('button')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByTestId('player-title')).toHaveTextContent('MAD')
    expect(screen.getByTestId('player-artist')).toHaveTextContent('ED8125')
  })

  it('album: rows have no covers and no numbers; active cover is the album art', () => {
    render(<AudioPlayer playlist={brasilComAmor} />)
    const rows = within(screen.getByRole('list', { name: 'Tracklist' })).getAllByRole('listitem')
    expect(rows).toHaveLength(11)
    expect(rows[0]).toHaveTextContent(/^Bloco - ED8125$/)
    rows.forEach((row) => expect(row.querySelector('img')).toBeNull())
    expect(screen.getByTestId('player-cover')).toHaveAttribute('src', '/media/img/covers/brasil-com-amor.png')
  })

  it('clicking a row makes it current and shows its title', async () => {
    const user = userEvent.setup()
    render(<AudioPlayer playlist={brasilComAmor} />)
    await user.click(screen.getByRole('button', { name: 'Amor à primeira vista - ED8125' }))
    expect(screen.getByRole('button', { name: 'Amor à primeira vista - ED8125' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByTestId('player-title')).toHaveTextContent('Amor à primeira vista')
  })

  it('play button toggles between Play and Pause', async () => {
    const user = userEvent.setup()
    render(<AudioPlayer playlist={latestBeats} />)
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('repeat button toggles pressed state; volume bars reflect volume', async () => {
    const user = userEvent.setup()
    render(<AudioPlayer playlist={latestBeats} />)
    const repeat = screen.getByRole('button', { name: 'Repeat track' })
    expect(repeat).toHaveAttribute('aria-pressed', 'false')
    await user.click(repeat)
    expect(repeat).toHaveAttribute('aria-pressed', 'true')

    const bars = screen.getAllByTestId('volume-bar')
    expect(bars).toHaveLength(11)
    expect(bars.filter((b) => b.classList.contains('is-active'))).toHaveLength(11)
    await user.click(screen.getByRole('button', { name: 'Volume down' }))
    expect(bars.filter((b) => b.classList.contains('is-active'))).toHaveLength(10)
    await act(async () => bars[3].click())
    expect(bars.filter((b) => b.classList.contains('is-active'))).toHaveLength(4)
  })

  it('shows elapsed time as mm:ss', () => {
    render(<AudioPlayer playlist={latestBeats} />)
    expect(screen.getByTestId('player-time')).toHaveTextContent('00:00')
  })
})
