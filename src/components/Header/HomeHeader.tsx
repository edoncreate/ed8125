import { useEffect, useState } from 'react'
import { site } from '../../data/site'
import { FacebookIcon, InstagramIcon } from '../icons'
import './Header.css'

const SECTION_IDS = site.nav.map((item) => item.href.slice(1))

/** Section whose top has passed the middle of the viewport (page-scroll-to-id highlight). */
function currentSection(): string {
  let current = SECTION_IDS[0]
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) current = id
  }
  return current
}

/**
 * Home header: transparent over the hero, black once the page scrolls past
 * 60px; bottom tab bar on small screens. HOME is always gold; the link of the
 * section in view is highlighted gold too.
 */
export function HomeHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(SECTION_IDS[0])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      setActive(currentSection())
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <header className={`site-header site-header--home${scrolled ? ' is-scrolled' : ''}`} data-ref="header">
      <div className="site-header__bar">
        <span className="site-header__logo">
          <img src={site.logo.src} alt={site.logo.alt} width={92} height={41} />
        </span>
        <nav aria-label="Main" className="site-nav">
          <ul>
            {site.nav.map((item) => {
              const id = item.href.slice(1)
              const classes = ['site-nav__item', id === 'home' && 'site-nav__item--home'].filter(Boolean).join(' ')
              return (
                <li key={item.href} className={classes}>
                  <a
                    href={item.href}
                    className={active === id ? 'is-active' : undefined}
                    aria-current={active === id ? 'location' : undefined}
                    data-ref={`nav-${id}`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        <ul className="site-header__social">
          <li className="site-header__social-item site-header__social-item--facebook">
            <a href={site.social.facebook} aria-label="Facebook" data-ref="nav-facebook">
              <FacebookIcon />
            </a>
          </li>
          <li className="site-header__social-item site-header__social-item--instagram">
            <a href={site.social.instagram} aria-label="Instagram" data-ref="nav-instagram">
              <InstagramIcon />
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
