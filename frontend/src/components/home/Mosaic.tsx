import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Tile {
  to: string
  label: string
  text: string
  image: string
  /** Mosaicos maiores ocupam duas colunas: é o que quebra a grade regular. */
  wide?: boolean
}

const TILES: Tile[] = [
  {
    to: '/catalogo',
    label: 'O acervo',
    text: 'Os sete livros, filtráveis por autor, editora, preço e estoque.',
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
    to: '/cadastro',
    label: 'Sua conta',
    text: 'Guarde pedidos e avalie o que já leu.',
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

/**
 * Grade de mosaicos em paisagem, com a imagem recortada por baixo e o texto
 * por cima — inspirada na grade "Discover" do site oficial. Dois dos cinco
 * ocupam duas colunas, e é essa irregularidade que dá o ritmo da seção.
 */
export function Mosaic() {
  return (
    <section className="bg-stone-950 py-20 lg:py-28" aria-labelledby="mosaico-title">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Cabeçalho alinhado à esquerda, com a régua da casa ao lado do título. */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">Por onde começar</p>
            <h2 id="mosaico-title" className="font-display text-4xl text-chalk-50 sm:text-5xl">
              Descubra a livraria
            </h2>
          </div>
          <span className="hidden h-px flex-1 bg-house-accent/30 sm:block" aria-hidden />
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => (
            <li key={tile.to} className={tile.wide ? 'lg:col-span-2' : undefined}>
              <Link
                to={tile.to}
                className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-xl ring-1 ring-white/10 transition-all duration-500 hover:ring-house-accent/60 lg:h-64"
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
