import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react'
import './Reveal.css'

type Animation = 'fadeIn' | 'fadeInUp'

type RevealProps<T extends ElementType> = {
  as?: T
  animation?: Animation
  /** Elementor "animated-slow": 2s instead of 1.25s. */
  slow?: boolean
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>

function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Entrance animation like Elementor's: content stays invisible until it scrolls
 * into view, then plays fadeIn / fadeInUp once. Shown immediately when the user
 * prefers reduced motion or IntersectionObserver is unavailable.
 */
export function Reveal<T extends ElementType = 'div'>({
  as,
  animation = 'fadeInUp',
  slow = false,
  className,
  children,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(
    () => prefersReducedMotion() || typeof window === 'undefined' || !('IntersectionObserver' in window),
  )

  useEffect(() => {
    if (visible || !ref.current) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible])

  const classes = ['reveal', `reveal--${animation}`, slow && 'reveal--slow', visible && 'is-visible', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  )
}
