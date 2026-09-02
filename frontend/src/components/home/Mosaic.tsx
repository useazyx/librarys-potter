import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePointerGlow } from '../../hooks/usePointerGlow'

interface Tile {
  to: string
  label: string
  text: string
  image: string
  /** Ocupa duas colunas, para a grade não ficar toda igual. */
  wide?: boolean
}

const TILES: Tile[] = [
  {
    to: '/catalogo',
    label: 'O acervo',
    text: 'Cento e quarenta produtos em sete corredores, filtráveis por casa, marca e preço.',
    image: '/img/scenes/estantes.webp',
    wide: true,
  },
  {
    to: '/saga',
    label: 'A saga',
    text: 'A linha do tempo, de 1997 ao duelo final.',
    image: '/img/scenes/coruja.webp',
  },
  {
    to: '/ajuda',
    label: 'Ajuda',
    text: 'Abra um chamado e acompanhe a resposta.',
    image: '/img/scenes/poltrona.webp',
  },
  {
    to: '/configuracoes',
    label: 'Acessibilidade',
    text: 'Paletas para daltonismo, alto contraste, texto grande e menos movimento.',
    image: '/img/scenes/livros-antigos.webp',
  },
  {
    to: '/carrinho',
    label: 'Seu carrinho',
    text: 'Frete grátis acima de R$ 250, para todo o Brasil.',
    image: '/img/scenes/castelo.webp',
    wide: true,
  },
]

// Grade de blocos em paisagem, com a foto por baixo e o texto por cima. Dois
// dos cinco ocupam duas colunas.
export function Mosaic() {
  const onPointerGlow = usePointerGlow()

  return (
    <section className="bg-house-bg py-20 lg:py-28" aria-labelledby="mosaico-title">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* cabeçalho da seção */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">Por onde começar</p>
            <h2 id="mosaico-title" className="font-display text-4xl text-chalk-50 sm:text-5xl">
              Descubra a livraria
            </h2>
          </div>
          <span className="shimmer hidden h-px flex-1 bg-house-accent/25 sm:block" aria-hidden />
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => (
            <li key={tile.to} className={tile.wide ? 'lg:col-span-2' : undefined}>
              <Link
                to={tile.to}
                onMouseMove={onPointerGlow}
                className="glow-follow group relative flex h-56 flex-col justify-end overflow-hidden rounded-xl ring-1 ring-white/10 transition-all duration-500 hover:ring-house-accent/60 lg:h-64"
              >
                <img
                  src={tile.image}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-transparent"
                  aria-hidden
                />

                <div className="relative p-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-2xl text-white">{tile.label}</h3>
                    <ArrowUpRight
                      size={18}
                      className="text-house-accent transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-2 max-w-xs text-sm leading-snug text-white/70">{tile.text}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
