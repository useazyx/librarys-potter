import { useEffect, useRef } from 'react'

interface RevealOptions {
  threshold?: number
  /** Atraso entre os filhos com data-reveal, em ms. */
  stagger?: number
}

// Revela o elemento (e os filhos com data-reveal) quando ele entra na tela.
// Usa IntersectionObserver em vez de listener de scroll, que custaria a cada
// quadro.
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  stagger = 0,
}: RevealOptions = {}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const targets = node.hasAttribute('data-reveal')
      ? [node]
      : Array.from(node.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const target = entry.target as HTMLElement
          const index = targets.indexOf(target)
          target.style.transitionDelay = stagger ? index * stagger + 'ms' : '0ms'
          target.dataset.reveal = 'in'
          observer.unobserve(target)
        })
      },
      { threshold, rootMargin: '0px 0px -60px 0px' },
    )

    targets.forEach((target) => observer.observe(target))

    return () => observer.disconnect()
  }, [threshold, stagger])

  return ref
}
