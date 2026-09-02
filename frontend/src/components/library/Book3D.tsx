import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../../context/SettingsContext'

// Um livro em três dimensões montado só com CSS: seis faces (capa, contracapa,
// lombada, corte das folhas, cabeça e pé). A capa é a foto real do produto, as
// outras faces são superfícies lisas e o corte é um listrado.
//
// O volume gira sozinho devagar e segue o ponteiro quando é arrastado. Com
// movimento reduzido ele fica parado em três quartos, que já é o ângulo em que
// dá para ver que aquilo é um livro.

interface Book3DProps {
  coverUrl: string
  title: string
  /** Largura da capa em pixels. A altura vem da proporção 2:3. */
  width?: number
  /** Espessura do volume, calculada a partir do número de páginas. */
  thickness?: number
}

export function Book3D({ coverUrl, title, width = 220, thickness = 34 }: Book3DProps) {
  const { reducedMotion } = useSettings()
  const height = Math.round(width * 1.5)

  // Ângulo parado: três quartos, com a lombada aparecendo à esquerda.
  const [angle, setAngle] = useState({ y: -28, x: 6 })
  const dragging = useRef<{ x: number; y: number; startY: number; startX: number } | null>(null)
  const [held, setHeld] = useState(false)

  // A rotação só roda quando ninguém está arrastando e o visitante não pediu
  // menos movimento.
  useEffect(() => {
    if (reducedMotion || held) return

    const timer = window.setInterval(() => {
      setAngle((current) => ({ ...current, y: current.y - 0.35 }))
    }, 40)

    return () => window.clearInterval(timer)
  }, [held, reducedMotion])

  function onPointerDown(event: React.PointerEvent) {
    dragging.current = { x: event.clientX, y: event.clientY, startY: angle.y, startX: angle.x }
    setHeld(true)
    ;(event.target as HTMLElement).setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event: React.PointerEvent) {
    const start = dragging.current
    if (!start) return

    setAngle({
      y: start.startY + (event.clientX - start.x) * 0.6,
      // Trava o eixo vertical: virar o livro de cabeça para baixo desorienta.
      x: Math.max(-24, Math.min(24, start.startX - (event.clientY - start.y) * 0.35)),
    })
  }

  function release() {
    dragging.current = null
    setHeld(false)
  }

  /** Uma das seis faces, já posicionada e girada. */
  const face = (style: React.CSSProperties, className = '') => ({ className: 'book-face ' + className, style })

  return (
    <div
      className="select-none"
      style={{ perspective: '1500px', width, height }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
    >
      <div
        className="book-model relative h-full w-full"
        style={{
          transform: 'rotateX(' + angle.x + 'deg) rotateY(' + angle.y + 'deg)',
          // Sem transição durante o arrasto, senão o giro fica meio segundo
          // atrasado em relação ao ponteiro.
          transition: held ? 'none' : undefined,
          cursor: held ? 'grabbing' : 'grab',
        }}
      >
        {/* Capa */}
        <div {...face({ transform: 'translateZ(' + thickness / 2 + 'px)' })}>
          <img
            src={coverUrl}
            alt={'Capa de ' + title}
            draggable={false}
            className="h-full w-full object-cover"
            style={{ boxShadow: 'inset 0 0 60px rgb(0 0 0 / 0.35)' }}
          />
        </div>

        {/* Contracapa */}
        <div
          {...face(
            {
              transform: 'rotateY(180deg) translateZ(' + thickness / 2 + 'px)',
              background: 'linear-gradient(160deg, #2a2118, #16110c)',
            },
            'border border-black/40',
          )}
        />

        {/* Lombada, com o título de pé */}
        <div
          {...face({
            width: thickness,
            left: (width - thickness) / 2,
            transform: 'rotateY(-90deg) translateZ(' + width / 2 + 'px)',
            background: 'linear-gradient(90deg, #120d09, #3a2c1e 45%, #120d09)',
          })}
        >
          <span
            className="absolute inset-0 flex items-center justify-center whitespace-nowrap text-[9px] uppercase tracking-[0.18em] text-chalk-200/80"
            style={{ transform: 'rotate(90deg)' }}
          >
            {title.slice(0, 26)}
          </span>
        </div>

        {/* Corte das folhas */}
        <div
          {...face(
            {
              width: thickness,
              left: (width - thickness) / 2,
              transform: 'rotateY(90deg) translateZ(' + width / 2 + 'px)',
            },
            'book-pages',
          )}
        />

        {/* Cabeça e pé */}
        <div
          {...face(
            {
              height: thickness,
              top: (height - thickness) / 2,
              transform: 'rotateX(90deg) translateZ(' + height / 2 + 'px)',
            },
            'book-pages',
          )}
        />
        <div
          {...face(
            {
              height: thickness,
              top: (height - thickness) / 2,
              transform: 'rotateX(-90deg) translateZ(' + height / 2 + 'px)',
            },
            'book-pages',
          )}
        />
      </div>
    </div>
  )
}
