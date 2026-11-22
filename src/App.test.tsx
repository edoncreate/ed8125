import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('routing and layout shell', () => {
  it('renders home at / with section nav, social links and footer', () => {
    renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const links = within(nav).getAllByRole('link')
    const hrefs = links.map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(expect.arrayContaining(['#home', '#releases', '#social', '#bio']))
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#home')
    expect(within(nav).getByRole('link', { name: 'bio' })).toHaveAttribute('href', '#bio')
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', 'https://www.facebook.com/ED8125BEATS/')
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/ed8125/')
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent('Copyright © 2020 EDONCREATE')
    expect(within(footer).getByRole('link', { name: 'EDONCREATE' })).toHaveAttribute('href', 'https://edoncreate.com/')
  })

  it('home has the section anchors the nav points to', () => {
    const { container } = renderAt('/')
    for (const id of ['home', 'releases', 'social', 'bio']) {
      expect(container.querySelector(`#${id}`), `#${id}`).not.toBeNull()
    }
  })

  it.each(['/brasil-com-amor/', '/brasil-com-amor', '/latest-beats/', '/latest-beats'])(
    'renders a release page with a Back link at %s',
    (path) => {
      renderAt(path)
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/')
      expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull()
      expect(screen.getByRole('contentinfo')).toHaveTextContent('Copyright © 2020 EDONCREATE')
    },
  )

  it('redirects unknown routes to home', () => {
    renderAt('/does-not-exist')
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })
})
