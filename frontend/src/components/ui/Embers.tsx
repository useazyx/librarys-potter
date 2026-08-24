import { useMemo } from 'react'

/**
 * Espalhamento determinístico: devolve um número em [0,1) a partir do índice da
 * brasa e de um canal. `Math.random()` durante o render seria impuro — as duas
 * passagens do StrictMode divergiriam —, e as brasas não precisam de acaso
 * verdadeiro, só de posições que não pareçam alinhadas.
 */
function espalha(index: number, canal: number) {
  const x = Math.sin((index + 1) * 12.9898 + canal * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Brasas do salão: motes de luz na cor da casa que sobem devagar e se apagam.
 *
 * São `<span>` animados só por CSS — nenhum quadro é calculado em JS, então as
 * brasas não travam quando uma rota suspende e não custam nada quando o leitor
 * pede movimento reduzido (o `index.css` some com elas). Decoração pura: o
 * elemento é `aria-hidden` e nunca carrega conteúdo.
 */
export function Embers({ count = 18, className = '' }: { count?: number; className?: string }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: espalha(i, 1) * 100,
        bottom: espalha(i, 2) * 40,
        size: 2 + espalha(i, 3) * 4,
        rise: 180 + espalha(i, 4) * 320,
        drift: (espalha(i, 5) - 0.5) * 90,
        time: 11 + espalha(i, 6) * 12,
        delay: espalha(i, 7) * 12,
        peak: 0.35 + espalha(i, 8) * 0.45,
      })),
    [count],
  )

  return (
    <div className={'pointer-events-none absolute inset-0 overflow-hidden ' + className} aria-hidden>
      {motes.map((mote) => (
        <span
          key={mote.id}
          className="ember"
          style={
            {
              left: mote.left + '%',
              bottom: mote.bottom + '%',
              width: mote.size + 'px',
              height: mote.size + 'px',
              animationDuration: mote.time + 's',
              animationDelay: '-' + mote.delay + 's',
              '--ember-rise': mote.rise + 'px',
              '--ember-drift': mote.drift + 'px',
              '--ember-peak': mote.peak,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
