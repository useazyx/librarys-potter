import { useMemo } from 'react'

// Devolve um número entre 0 e 1 a partir do índice da brasa. Não usa
// Math.random() porque sortear no render dá resultado diferente nas duas
// passagens do StrictMode, e aqui basta que as posições não fiquem alinhadas.
function espalha(index: number, canal: number) {
  const x = Math.sin((index + 1) * 12.9898 + canal * 78.233) * 43758.5453
  return x - Math.floor(x)
}

// Brasas na cor da casa, que sobem devagar e apagam. São spans animados só por
// CSS, então não travam quando uma rota suspende e somem sozinhas com movimento
// reduzido. É decoração: aria-hidden e sem conteúdo.
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
