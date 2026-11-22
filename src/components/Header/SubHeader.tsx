import { Link } from 'react-router-dom'
import { site } from '../../data/site'
import './Header.css'

/** Release-page header: solid black bar with the logo and a BACK link home. */
export function SubHeader() {
  return (
    <header className="site-header site-header--back" data-ref="header">
      <div className="site-header__bar">
        <span className="site-header__logo">
          <img src={site.logo.src} alt={site.logo.alt} width={92} height={41} />
        </span>
        <Link to="/" className="site-header__back" data-ref="nav-back">
          Back
        </Link>
      </div>
    </header>
  )
}
