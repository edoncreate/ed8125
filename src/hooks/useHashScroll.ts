import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Route-change scrolling for an SPA: jump to the element named by the URL hash
 * (deep links like /#bio), otherwise to the top. Re-aligns once web fonts and
 * the page's resources have loaded, since both shift the layout above the target.
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    let cancelled = false
    const align = () => {
      if (!cancelled) document.getElementById(id)?.scrollIntoView()
    }

    const raf = requestAnimationFrame(align)
    document.fonts?.ready.then(align)
    const onLoad = () => align()
    if (document.readyState === 'complete') requestAnimationFrame(align)
    else window.addEventListener('load', onLoad, { once: true })

    // Stop re-aligning as soon as the user scrolls on their own.
    const stop = () => {
      cancelled = true
    }
    window.addEventListener('wheel', stop, { passive: true, once: true })
    window.addEventListener('touchmove', stop, { passive: true, once: true })
    window.addEventListener('keydown', stop, { once: true })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('load', onLoad)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchmove', stop)
      window.removeEventListener('keydown', stop)
    }
  }, [pathname, hash])
}
