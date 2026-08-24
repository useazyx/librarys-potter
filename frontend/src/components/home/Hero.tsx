import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useHouse } from '../../context/HouseContext'
import { formatPrice } from '../../lib/format'
import type { Book } from '../../types/api'
import { ButtonLink } from '../ui/Button'
import { Embers } from '../ui/Embers'

/**
 * Vitrine de abertura, assimétrica: a coluna de texto à esquerda e a capa do
 * livro em destaque à direita, sobre uma faixa na cor da casa. Não é uma
 * fotografia de tela cheia com o título centralizado — a loja começa mostrando
 * um livro, que é o que ela vende.
 *
 * Toda a entrada usa `.rise-in`, cujo estado de repouso é o visível.
 */
export function Hero({ book }: { book?: Book }) {
  const { info } = useHouse()

  return (
    <section className="relative overflow-hidden bg-house-deep" aria-labelledby="hero-title">
      {/* Cantaria do castelo ao fundo, bem discreta. */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 54px),repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 108px)',
        }}
        aria-hidden
      />

      <Embers count={22} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-10 lg:pb-28 lg:pt-40">
        <div>
          <p className="rise-in text-[0.66rem] uppercase tracking-[0.4em] text-house-accent" style={{ animationDelay: '0.05s' }}>
            {info ? 'Livraria da ' + info.name : 'A livraria da saga'} · desde 1997
          </p>

          <h1
            id="hero-title"
            className="rise-in mt-6 font-display text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl"
            style={{ animationDelay: '0.15s' }}
          >
            Sete livros.
            <br />
            Uma geração
            <br />
            <span className="text-house-accent">inteira.</span>
          </h1>

          <p
            className="rise-in mt-8 max-w-md text-lg leading-relaxed text-white/70"
            style={{ animationDelay: '0.28s' }}
          >
            As edições brasileiras da Rocco, as capas que você reconhece de longe e as avaliações de
            quem já leu — inclusive as sinceras demais.
          </p>

          <div className="rise-in mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: '0.4s' }}>
            <ButtonLink to="/catalogo" size="lg" variant="house">
              Ver o acervo
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

        {/* A capa em destaque, apoiada como um livro numa mesa. */}
        {book && (
          <div
            className="rise-in relative mx-auto w-full max-w-[17rem] lg:max-w-[20rem]"
            style={{ animationDelay: '0.32s' }}
          >
            <Link to={'/livro/' + book.slug} className="group block">
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
