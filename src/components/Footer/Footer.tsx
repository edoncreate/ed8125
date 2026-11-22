import { site } from '../../data/site'
import './Footer.css'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="site-footer__text" data-ref="footer">
          {site.footer.text}
          <a href={site.footer.href} target="_blank" rel="noopener">
            {site.footer.brand}
          </a>
        </p>
      </div>
    </footer>
  )
}
