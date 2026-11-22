import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Home } from './Home'

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
}

describe('Home page', () => {
  it('shows the original copy verbatim', () => {
    const { container } = renderHome()
    const text = container.textContent ?? ''
    for (const s of [
      'Beatmaker . Bass Player . Producer',
      "LET'S COOK",
      'SOME MUSIC',
      'LATEST RELEASE',
      '2021.02.28',
      'NEW BEAT',
      'ALBUM',
      'Brasil com amor',
      'This album tell us about a love story between two people.  Since the time they met until the day they drifted apart.',
      'Social',
      'BEATS',
      'Bio',
      'Producing instrumental beats since 2003, he soon realized that it was through music that one could express himself in the best way.',
      'First, tooking it as a hobby, or maybe a shelter.',
      'Throughout  the years he focused on telling stories with a message in his melodies.',
    ]) {
      expect(text, s).toContain(s)
    }
  })

  it('bolds the same words as the original bio', () => {
    renderHome()
    const bio = document.getElementById('bio')!
    expect([...bio.querySelectorAll('strong')].map((s) => s.textContent)).toEqual([
      '2003',
      'hobby',
      'telling stories',
      'melodies',
    ])
  })

  it('links: hero play → #releases, LISTEN buttons, beat covers', () => {
    renderHome()
    const heroButtons = screen.getAllByRole('link', { name: /MAD — see releases/ })
    heroButtons.forEach((a) => expect(a).toHaveAttribute('href', '#releases'))
    const listen = screen.getAllByRole('link', { name: 'LISTEN' }).map((a) => a.getAttribute('href'))
    expect(listen).toEqual(['/latest-beats/', '/brasil-com-amor/'])
    const beats = within(document.querySelector('[data-ref="beats-carousel"]') as HTMLElement).getAllByRole('link')
    expect(beats).toHaveLength(10)
  })

  it('instagram block: 4 posts, 3 video overlays, Follow link', () => {
    renderHome()
    const feed = document.querySelector('[data-ref="social-feed"]') as HTMLElement
    const posts = within(feed).getAllByRole('link', { name: /Instagram post by ed8125/ })
    expect(posts).toHaveLength(4)
    expect(feed.querySelectorAll('.ig__play')).toHaveLength(3)
    expect(within(feed).getByRole('link', { name: 'Follow' })).toHaveAttribute('href', 'https://www.instagram.com/ed8125/')
    expect(within(feed).getByRole('heading', { name: 'ed8125' })).toBeInTheDocument()
  })

  it('keeps the original anchors (#social is on the BEATS section)', () => {
    renderHome()
    expect(document.getElementById('home')).toContainElement(document.querySelector('[data-ref="hero"]') as HTMLElement)
    expect(document.getElementById('social')).toHaveAttribute('data-ref', 'section-beats')
    expect(document.getElementById('releases')).toHaveAttribute('data-ref', 'section-releases')
    expect(document.getElementById('bio')).toHaveAttribute('data-ref', 'section-bio')
  })
})
