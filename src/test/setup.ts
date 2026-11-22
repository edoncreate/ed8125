import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => cleanup())

// jsdom has no media playback: make play/pause/load observable no-ops.
if (typeof window !== 'undefined') {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: vi.fn(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event('play'))
      return Promise.resolve()
    }),
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: vi.fn(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event('pause'))
    }),
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  })

  // IntersectionObserver stub; tests can grab instances to fire callbacks.
  class IO {
    static instances: IO[] = []
    callback: IntersectionObserverCallback
    elements: Element[] = []
    constructor(cb: IntersectionObserverCallback) {
      this.callback = cb
      IO.instances.push(this)
    }
    observe(el: Element) { this.elements.push(el) }
    unobserve(el: Element) { this.elements = this.elements.filter((e) => e !== el) }
    disconnect() { this.elements = [] }
    takeRecords() { return [] }
    trigger(isIntersecting = true) {
      this.callback(
        this.elements.map((target) => ({ target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }) as IntersectionObserverEntry),
        this as unknown as IntersectionObserver,
      )
    }
  }
  Object.defineProperty(window, 'IntersectionObserver', { configurable: true, writable: true, value: IO })

  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    })
  }
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  Element.prototype.scrollIntoView = vi.fn()
}
