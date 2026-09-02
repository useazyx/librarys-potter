import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { SettingsControls } from './SettingsControls'

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
}

// Gaveta de configurações, aberta pela engrenagem do cabeçalho ou pelo feitiço
// alohomora. Entra pela direita, prende o foco enquanto está aberta e fecha no
// Escape. Com movimento reduzido a animação vira corte seco: o valor é lido do
// useSettings em JavaScript porque o framer-motion anima por style inline e o
// bloco CSS de movimento reduzido não alcança isso.
export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const panel = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useSettings()

  useEffect(() => {
    if (!open) return

    const previous = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const timer = window.setTimeout(() => panel.current?.focus(), 60)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      window.clearTimeout(timer)
      previous?.focus?.()
    }
  }, [open, onClose])

  const duration = reducedMotion ? 0 : 0.42

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-stone-950/70 backdrop-blur-sm"
            aria-hidden
          />

          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="configuracoes-titulo"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[101] flex w-full max-w-md flex-col border-l border-house-accent/30 bg-house-bg shadow-book focus:outline-none"
          >
            <header className="flex items-start justify-between gap-4 border-b border-chalk-100/15 px-6 py-5">
              <div>
                <p className="eyebrow">Sala Precisa</p>
                <h2 id="configuracoes-titulo" className="mt-2 font-display text-2xl text-chalk-50">
                  Configurações
                </h2>
                <p className="mt-1 text-xs text-chalk-300">
                  A loja se ajusta a você: cor, contraste, tamanho, movimento e som.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar configurações"
                className="rounded-full p-2 text-chalk-200 transition-colors hover:bg-chalk-100/10 hover:text-house-accent"
              >
                <X size={20} aria-hidden />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <SettingsControls />
            </div>

            <footer className="border-t border-chalk-100/15 px-6 py-4">
              <Link
                to="/configuracoes"
                onClick={onClose}
                className="link-underline text-xs uppercase tracking-[0.18em] text-house-accent"
              >
                Abrir a página inteira de acessibilidade
              </Link>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
