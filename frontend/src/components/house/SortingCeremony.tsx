import { useEffect, useState } from 'react'
import { HOUSE_INFO, useHouse } from '../../context/HouseContext'
import { useSettings } from '../../context/SettingsContext'
import { Embers } from '../ui/Embers'
import { HouseCrest } from './HouseCrest'

// Tempo que a cerimônia fica na tela, em ms. Tem que bater com .ceremony no
// index.css.
const CEREMONY_MS = 2400

// A cerimônia de escolha de casa. Escolher a Sonserina não é só o site ficar
// verde: uma cortina fecha, o brasão assenta com o nome e a divisa, e a
// cortina abre com a loja já repintada. Quem segura a paleta antiga durante o
// fechamento é o HouseProvider.
//
// Mesma regra da transição de página: quem tira a cerimônia é o setTimeout,
// nunca o fim da animação. Se a animação travar, a tela não fica coberta.
export function SortingCeremony() {
  const { ceremony } = useHouse()
  const { reducedMotion } = useSettings()
  const [visible, setVisible] = useState<typeof ceremony>(null)

  useEffect(() => {
    if (!ceremony) return

    setVisible(ceremony)
    const timer = window.setTimeout(() => setVisible(null), CEREMONY_MS)

    return () => window.clearTimeout(timer)
  }, [ceremony])

  // Quem pediu menos movimento não vê cerimônia nenhuma. O CSS zera a duração
  // de toda animação nesse caso, então o que sobraria era um lampejo preto de
  // um quadro, pior do que a troca direta de cor.
  if (!visible || reducedMotion) return null

  const info = HOUSE_INFO[visible.house]

  return (
    <div key={visible.id} className="ceremony" aria-hidden>
      {/* a cortina: preta e rápida, para a troca de cor acontecer escondida */}
      <div className="ceremony-ink" />
      {/* e a cor da casa tomando a tela a partir do centro */}
      <div className="ceremony-bloom" />
      <div className="ceremony-ring" />
      <Embers count={22} />

      <div className="ceremony-stage">
        <HouseCrest house={visible.house} className="ceremony-crest house-crest" />
        <p className="ceremony-name font-display">{info.name}</p>
        <span className="ceremony-rule" />
        <p className="ceremony-trait">{info.trait}</p>
      </div>
    </div>
  )
}
