import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from './Reveal'

type IOStub = { instances: { trigger: (v?: boolean) => void }[] }
const io = () => window.IntersectionObserver as unknown as IOStub

function mockReducedMotion(reduce: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  io().instances.length = 0
})

describe('Reveal', () => {
  it('is visible immediately when the user prefers reduced motion', () => {
    mockReducedMotion(true)
    render(<Reveal>hello</Reveal>)
    expect(screen.getByText('hello')).toHaveClass('reveal', 'is-visible')
  })

  it('starts hidden and becomes visible when scrolled into view', () => {
    mockReducedMotion(false)
    render(<Reveal animation="fadeIn">hello</Reveal>)
    const el = screen.getByText('hello')
    expect(el).toHaveClass('reveal', 'reveal--fadeIn')
    expect(el).not.toHaveClass('is-visible')
    act(() => io().instances.at(-1)!.trigger(true))
    expect(el).toHaveClass('is-visible')
  })

  it('renders the requested element and passes through props', () => {
    mockReducedMotion(true)
    render(
      <Reveal as="h2" className="title" data-ref="x">
        hi
      </Reveal>,
    )
    const el = screen.getByRole('heading', { level: 2, name: 'hi' })
    expect(el).toHaveClass('title')
    expect(el).toHaveAttribute('data-ref', 'x')
  })
})
