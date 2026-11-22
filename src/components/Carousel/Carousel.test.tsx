import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { album, beatsCarousel, newBeat } from '../../data/releases'
import { BeatsCarousel } from './BeatsCarousel'
import { CoverSlider } from './CoverSlider'

describe('BeatsCarousel', () => {
  it('renders every cover once as a link to its page', () => {
    render(<BeatsCarousel items={beatsCarousel} />, { wrapper: MemoryRouter })
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(10)
    links.forEach((a) => expect(a).toHaveAttribute('href', '/latest-beats/'))
    expect(screen.getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual(beatsCarousel.map((c) => c.alt))
  })

  it('has pagination dots', () => {
    const { container } = render(<BeatsCarousel items={beatsCarousel} />, { wrapper: MemoryRouter })
    expect(container.querySelector('.swiper-pagination')).not.toBeNull()
  })
})

describe('CoverSlider', () => {
  it('with one image renders it without pagination', () => {
    const { container } = render(<CoverSlider images={newBeat.images} />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(container.querySelector('.swiper-pagination')).toBeNull()
  })

  it('with two images renders both and pagination', () => {
    const { container } = render(<CoverSlider images={album.images} />)
    expect(screen.getAllByRole('img').map((i) => i.getAttribute('src'))).toEqual([
      '/media/img/brasil-front.png',
      '/media/img/brasil-back.png',
    ])
    expect(container.querySelector('.swiper-pagination')).not.toBeNull()
  })
})
