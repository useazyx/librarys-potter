import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useHouse } from '../../context/HouseContext'
import { formatPrice } from '../../lib/format'
import type { Book } from '../../types/api'
import { ButtonLink } from '../ui/Button'
import { EnchantedSky } from '../ui/EnchantedSky'

// Abertura da home: texto à esquerda e a capa em destaque à direita, sobre a
// faixa na cor da casa. A entrada usa .rise-in, que fica visível quando a
// animação não roda.
export function Hero({ book }: { book?: Book }) {
  const { info } = useHouse()

  return (
    <section className="relative overflow-hidden bg-house-deep" aria-labelledby="hero-title">
      <EnchantedSky embers={22} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-10 lg:pb-28 lg:pt-40">
        <div>
          <p className="rise-in text-[0.66rem] uppercase tracking-[0.4em] text-house-accent" style={{ animationDelay: '0.05s' }}>
            {info ? 'Loja da ' + info.name : 'Livraria e loja do mundo bruxo'} · desde 1997
          </p>

          <h1
            id="hero-title"
            className="rise-in mt-6 font-display text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl"
            style={{ animationDelay: '0.15s' }}
          >
            Sete livros.
            <br />
            Sete corredores.
            <br />
            <span className="text-house-accent">Um mundo.</span>
          </h1>

          <p
            className="rise-in mt-8 max-w-md text-lg leading-relaxed text-white/70"
            style={{ animationDelay: '0.28s' }}
          >
            As edições brasileiras da Rocco e tudo o que orbita a saga: varinhas em caixa de colecionador,
            réplicas, mantos, papelaria, blocos de montar e a casa vestida com as cores da sua.
          </p>

          <div className="rise-in mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: '0.4s' }}>
            <ButtonLink to="/catalogo" size="lg" variant="house">
              Ver a loja
            </ButtonLink>
            <Link
              to="/saga"
              className="link-underline inline-flex items-center gap-2 text-[0.76rem] uppercase tracking-[0.24em] text-white/80 transition-colors hover:text-house-accent"
            >
              <span data-active={false}>Conhecer a saga</span>
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </div>

        {/* capa em destaque */}
        {book && (
          <div
            className="rise-in relative mx-auto w-full max-w-[17rem] lg:max-w-[20rem]"
            style={{ animationDelay: '0.32s' }}
          >
            <Link to={'/produto/' + book.slug} className="group block">
              <div className="relative">
                <div
                  className="absolute -inset-6 rounded-full bg-house-accent/20 blur-3xl"
                  aria-hidden
                />
                <img
                  src={book.coverUrl}
                  alt={'Capa de ' + book.title}
                  className="relative w-full rounded-lg shadow-book transition-transform duration-700 group-hover:-translate-y-2"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>

              <div className="relative mt-7 flex items-end justify-between gap-4 border-t border-white/15 pt-5">
                <div className="min-w-0">
                  <p className="text-[0.6rem] uppercase tracking-[0.28em] text-white/50">Em destaque</p>
                  <p className="mt-2 truncate font-display text-xl text-white">{book.title}</p>
                </div>
                <p className="shrink-0 font-display text-2xl text-house-accent">{formatPrice(book.price)}</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
