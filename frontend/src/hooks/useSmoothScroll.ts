import Lenis from 'lenis'
import { useEffect } from 'react'

/**
 * Inertial scrolling for the whole document — the "fluidez moderna" of the brief.
 * Disabled outright when the visitor asks for reduced motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    let frame = 0

    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }

    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])
}
