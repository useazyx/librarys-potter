import type { House } from '../../context/HouseContext'
import { HOUSE_INFO } from '../../context/HouseContext'

/**
 * Brasão da casa. São escudos heráldicos do Wikimedia Commons (CC BY-SA 3.0),
 * os mesmos que a Wikipédia usa para ilustrar as casas — ver
 * `public/CREDITOS-IMAGENS.md`. Ficam em `public/img/houses/`, um SVG por casa.
 */
interface HouseCrestProps {
  house: House
  /** Entrada com o escudo subindo. Decorativa: ver `.crest-rise` no index.css. */
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
