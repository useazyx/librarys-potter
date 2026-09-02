import type { House } from '../../context/HouseContext'
import { HOUSE_INFO } from '../../context/HouseContext'

// Brasão da casa. São os escudos do Wikimedia Commons (CC BY-SA 3.0), um SVG
// por casa em public/img/houses/. Créditos em public/CREDITOS-IMAGENS.md.
interface HouseCrestProps {
  house: House
  /** Entrada com o escudo subindo. Ver .crest-rise no index.css. */
  animate?: boolean
  className?: string
}

export function HouseCrest({ house, animate = false, className }: HouseCrestProps) {
  return (
    <img
      src={'/img/houses/' + house + '.svg'}
      alt={'Brasão da ' + HOUSE_INFO[house].name}
      className={[animate ? 'crest-rise' : '', className].filter(Boolean).join(' ')}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  )
}
