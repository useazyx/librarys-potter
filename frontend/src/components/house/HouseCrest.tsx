import type { House } from '../../context/HouseContext'

/**
 * Brasões heráldicos desenhados a traço — um escudo comum e o emblema da casa
 * por dentro. São traços, e não imagens, para herdarem a cor do contexto e para
 * poderem se desenhar sozinhos (ver `.crest-draw` no `index.css`).
 */
const EMBLEMS: Record<House, string> = {
  // Leão: focinho redondo com a juba em raios — é a juba que faz reconhecer.
  grifinoria: [
    'M32 26a8 8 0 100 16 8 8 0 100-16',
    'M42 34h4M40.7 39l3.4 2M37 42.7l2 3.4M32 44v4M27 42.7l-2 3.4M23.3 39l-3.4 2',
    'M22 34h-4M23.3 29l-3.4-2M27 25.3l-2-3.4M32 24v-4M37 25.3l2-3.4M40.7 29l3.4-2',
    'M29.5 32.5v1M34.5 32.5v1M30 37q2 2 4 0',
  ].join(' '),

  // Serpente: uma espiral que se fecha, com a cabeça e a língua para fora.
  sonserina: [
    'M41 27c-9-4-18 2-18 10 0 7 5 12 12 12 5 0 9-4 9-8s-3-7-7-7-6 3-6 5',
    'M41 27l4-2m0 0 3-1m-3 1 2 2',
  ].join(' '),

  // Águia: asas abertas em duas curvas simétricas, cabeça de perfil.
  corvinal: [
    'M32 33C28 26 20 22 13 23c4 2 7 5 8 8-3 0-6 1-8 3 4 0 8 1 11 3-2 2-3 5-3 8 4-4 8-6 11-6',
    'M32 33C36 26 44 22 51 23c-4 2-7 5-8 8 3 0 6 1 8 3-4 0-8 1-11 3 2 2 3 5 3 8-4-4-8-6-11-6',
    'M32 33v-4c0-2 1-3 3-4l4 2-4 2',
    'M32 39v9m-3 0h6',
  ].join(' '),

  // Texugo: cabeça baixa, orelhas curtas e as duas listras que o identificam.
  'lufa-lufa': [
    'M32 49c-7-4-11-10-11-16 0-6 5-10 11-10s11 4 11 10c0 6-4 12-11 16',
    'M25 27l-2-5 5 1M39 27l2-5-5 1',
    'M28 28v12M36 28v12',
    'M32 41v4m-3-1h6',
  ].join(' '),
}

interface HouseCrestProps {
  house: House
  /** Redesenha o traço ao entrar em cena. Só decorativo — ver `.crest-draw`. */
  animate?: boolean
  className?: string
}

export function HouseCrest({ house, animate = false, className }: HouseCrestProps) {
  return (
    <svg viewBox="0 0 64 72" fill="none" className={className} aria-hidden>
      <g
        className={animate ? 'crest-draw' : undefined}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* O escudo, igual para as quatro casas. */}
        <path d="M32 3 4 12v26c0 16 12 26 28 31 16-5 28-15 28-31V12L32 3z" />
        <path d="M32 9 9 16v22c0 13 10 22 23 26 13-4 23-13 23-26V16L32 9z" opacity="0.45" />
        <path d={EMBLEMS[house]} />
      </g>
    </svg>
  )
}
