import { useEffect, useState } from 'react'
import { HOUSE_INFO, useHouse } from '../../context/HouseContext'
import { HouseCrest } from './HouseCrest'

// Tempo que o véu fica na tela, em ms. Tem que bater com .sorting-veil.
const VEIL_MS = 1600

// Ao escolher uma casa, a cor toma a tela por um instante com o brasão e o nome.
//
// Mesma regra da transição de página: quem tira o véu é o setTimeout, nunca o
// fim da animação. Se a animação travar, a tela não fica coberta.
export function SortingCeremony() {
  const { ceremony } = useHouse()
  const [visible, setVisible] = useState<typeof ceremony>(null)

  useEffect(() => {
    if (!ceremony) return

    setVisible(ceremony)
    const timer = window.setTimeout(() => setVisible(null), VEIL_MS)

    return () => window.clearTimeout(timer)
  }, [ceremony])

  if (!visible) return null

  const info = HOUSE_INFO[visible.house]

  return (
    <div key={visible.id} className="sorting-veil" aria-hidden>
      <div className="crest-burst flex flex-col items-center">
        <HouseCrest house={visible.house} className="h-40 w-auto drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)]" />
        <p className="mt-8 font-display text-4xl text-white sm:text-5xl">{info.name}</p>
        <p className="mt-3 text-[0.66rem] uppercase tracking-[0.4em] text-white/70">{info.trait}</p>
      </div>
    </div>
  )
}
