import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Route-change scrolling for an SPA: jump to the element named by the URL hash
 * (deep links like /#bio, after React has rendered it), otherwise to the top.
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    // Wait a frame so the target section exists and has laid out.
    const raf = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
    return () => cancelAnimationFrame(raf)
  }, [pathname, hash])
}
