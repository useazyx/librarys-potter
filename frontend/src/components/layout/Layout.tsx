import { Suspense, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { SortingCeremony } from '../house/SortingCeremony'
import { BrandLoader } from '../ui/Loaders'
import { Footer } from './Footer'
import { Header } from './Header'

/** Time the sweep is allowed on screen, in ms. Must match `.page-turn` in index.css. */
const SWEEP_MS = 600

export function Layout() {
  const location = useLocation()
  const previousPath = useRef(location.pathname)
  const [sweepKey, setSweepKey] = useState<string | null>(null)
  useSmoothScroll()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })

    // StrictMode runs this effect twice on mount with the same pathname, so the
    // guard compares paths instead of burning a "first render" flag — a flag got
    // consumed by the discarded first run and let the sweep cover the first paint.
    // There is also nothing to turn away from when the site loads.
    if (previousPath.current === location.pathname) return
    previousPath.current = location.pathname

    setSweepKey(location.pathname)

    // The sheet is taken down by this timer, never by the animation finishing.
    // A stalled animation — a route chunk suspending mid-flight, a throttled tab —
    // used to leave an opaque panel over the whole viewport with no way back.
    const timer = window.setTimeout(() => setSweepKey(null), SWEEP_MS)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-castle">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-house-accent focus:px-5 focus:py-3 focus:text-sm focus:text-stone-900"
      >
        Pular para o conteúdo
      </a>

      <Header />

      {/* Page change reads like a sheet being turned. See `.page-turn`: it rests
          uncovered, so it can only ever hide the page while the sweep is running. */}
      {sweepKey && <div key={sweepKey} className="page-turn" aria-hidden />}

      <SortingCeremony />

      <main id="conteudo" className="flex-1">
        {/* Suspense sits inside the Layout: a lazily loaded route must not tear
            down the header, the footer and the smooth scrolling around it. */}
        <Suspense fallback={<BrandLoader />}>
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
