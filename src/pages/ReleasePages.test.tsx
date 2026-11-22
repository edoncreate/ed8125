import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AlbumPage } from './AlbumPage'
import { LatestBeatsPage } from './LatestBeatsPage'

const DESCRIPTION =
  'This album tell us about a love story between two people.  Since the time they met until the day they drifted apart.'

const renderPage = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)
const tracklist = () => within(screen.getByRole('list', { name: 'Tracklist' })).getAllByRole('listitem')

describe('/brasil-com-amor/', () => {
  it('shows the album block, its 11-track player and the latest beats', () => {
    const { container } = renderPage(<AlbumPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Releases' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'ALBUM' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Brasil com amor' })).toBeInTheDocument()
    expect(container.textContent).toContain(DESCRIPTION)
    expect(screen.getAllByRole('heading', { name: 'Share' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { level: 3, name: 'LATESTE BEATS' })).toBeInTheDocument()
    expect(tracklist()).toHaveLength(11)
    expect(tracklist()[0]).toHaveTextContent(/^Bloco - ED8125$/)
    expect(container.querySelectorAll('[data-ref="beats-carousel"] a')).toHaveLength(10)
  })

  it('header logo and BACK both lead home', () => {
    renderPage(<AlbumPage />)
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'ED8125' })).toHaveAttribute('href', '/')
  })
})

describe('/latest-beats/', () => {
  it('shows the beats player, then the album block with LISTEN', () => {
    const { container } = renderPage(<LatestBeatsPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Releases' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'LATESTE BEATS' })).toBeInTheDocument()
    expect(tracklist()).toHaveLength(10)
    expect(tracklist()[0]).toHaveTextContent('10. MAD - ED8125')
    expect(screen.getByRole('heading', { level: 2, name: 'Share' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'ALBUM' })).toBeInTheDocument()
    expect(container.textContent).toContain(DESCRIPTION)
    expect(screen.getByRole('link', { name: 'LISTEN' })).toHaveAttribute('href', '/brasil-com-amor/')
    expect(screen.getByRole('img', { name: 'art-web-bannerbanner-brasil-com-amor' })).toBeInTheDocument()
  })
})
