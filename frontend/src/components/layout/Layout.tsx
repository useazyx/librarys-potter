import { Suspense, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { SortingCeremony } from '../house/SortingCeremony'
import { MagicLayer } from '../magic/MagicLayer'
import { SettingsDrawer } from '../settings/SettingsDrawer'
import { BrandLoader } from '../ui/Loaders'
import { Footer } from './Footer'
import { Header } from './Header'

// Tempo que a folha da transição fica na tela, em ms. Tem que bater com
// .page-turn no index.css.
const SWEEP_MS = 600

export function Layout() {
  const location = useLocation()
  const previousPath = useRef(location.pathname)
  const [sweepKey, setSweepKey] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  useSmoothScroll()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })

    // O StrictMode roda este efeito duas vezes no mount com o mesmo pathname,
    // então a comparação é de caminho e não de uma flag de "primeiro render":
    // a flag era consumida pela primeira passagem e a folha cobria a tela
    // inicial. E, ao abrir o site, não tem página anterior para virar.
    if (previousPath.current === location.pathname) return
    previousPath.current = location.pathname

    setSweepKey(location.pathname)

    // Quem tira a folha é este timer, nunca o fim da animação. Animação travada
    // (rota suspendendo no meio, aba em segundo plano) deixava um painel opaco
    // cobrindo a tela inteira sem volta.
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

      <Header onOpenSettings={() => setSettingsOpen(true)} />

      {/* Troca de página parece uma folha virando. Ver .page-turn: o estado de
          repouso é descoberto, então ela só cobre enquanto a animação roda. */}
      {sweepKey && <div key={sweepKey} className="page-turn" aria-hidden />}

      <SortingCeremony />

      {/* Faíscas, feitiços digitados e a trilha do castelo. Nada aqui captura
          clique nem carrega conteúdo: se falhar, some o encanto, não a loja. */}
      <MagicLayer onOpenSettings={() => setSettingsOpen(true)} />

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main id="conteudo" className="flex-1">
        {/* O Suspense fica dentro do Layout para a rota em lazy não derrubar o
            cabeçalho, o rodapé e a rolagem suave em volta. */}
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
