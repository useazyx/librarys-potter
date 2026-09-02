import { Hand, Library as LibraryIcon, ShoppingBag, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Book3D } from '../components/library/Book3D'
import { PageHeader } from '../components/layout/PageHeader'
import { Embers } from '../components/ui/Embers'
import { BrandLoader } from '../components/ui/Loaders'
import { Stars } from '../components/ui/Stars'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { Book } from '../types/api'

// A biblioteca: as estantes do castelo em perspectiva.
//
// O catálogo serve para comparar e comprar; esta página serve para passear. Os
// volumes ficam de pé na prateleira, o ponteiro puxa um para fora da fileira e
// o clique tira o livro para a mesa, onde ele vira um objeto de seis faces.
//
// Tudo é CSS: a profundidade sai do perspective no cenário e do translateZ em
// cada volume, sem canvas nem biblioteca 3D. Sem animação nenhuma a página
// continua sendo uma lista de livros com sinopse, nota e botão de compra.

// Número de prateleiras. Os produtos são distribuídos entre elas.
const SHELVES = 4

export default function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [chosen, setChosen] = useState<Book | null>(null)

  const { reducedMotion } = useSettings()
  const { user } = useAuth()
  const { add, busy } = useCart()
  const { notify } = useToast()

  useEffect(() => {
    const controller = new AbortController()

    // Só livros, caixas e edições. Varinha em pé numa prateleira de biblioteca
    // não faz sentido.
    api.catalog
      .books({ department: 'livros', sort: 'relevance' }, controller.signal)
      .then(setBooks)
      .catch(() => undefined)
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  // Distribui os volumes pelas prateleiras mantendo a ordem do acervo.
  const shelves = useMemo(() => {
    const perShelf = Math.ceil(books.length / SHELVES) || 1
    return Array.from({ length: SHELVES }, (_, index) => books.slice(index * perShelf, (index + 1) * perShelf))
  }, [books])

  useEffect(() => {
    if (!chosen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setChosen(null)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [chosen])

  async function addToCart(book: Book) {
    if (!user) {
      notify('Entre na sua conta para montar o pedido.', 'info')
      return
    }

    try {
      await add(book.id)
      notify(book.title + ' foi para o carrinho.')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Não conseguimos adicionar agora.', 'error')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Ala proibida, entrada liberada"
        title="A biblioteca"
        description="Passe o ponteiro pelas prateleiras: o volume sai da fileira. Clique e ele vem para a mesa, onde dá para girar o livro na mão e ler o que ele é."
        aside={
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[0.66rem] uppercase tracking-[0.2em] text-white/80">
            <LibraryIcon size={14} aria-hidden />
            {books.length} volumes
          </span>
        }
      />

      <section className="relative overflow-hidden bg-house-bg py-16 lg:py-24">
        <Embers count={10} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          {loading ? (
            <BrandLoader label="Abrindo a ala proibida..." />
          ) : (
            <div className="shelf-scene space-y-14">
              {shelves.map((shelf, shelfIndex) => (
                <div key={shelfIndex} className="flex justify-center">
                  {/* Este wrapper encolhe até a largura dos volumes e a tábua
                      herda o tamanho dele. Sem isso sobrava madeira vazia dos
                      dois lados. */}
                  <div className="inline-block">
                  {/* fileira de volumes */}
                  <ul className="shelf-rail flex flex-wrap items-end justify-center gap-y-6">
                    {shelf.map((book, index) => (
                      <li key={book.id}>
                        <button
                          type="button"
                          onClick={() => setChosen(book)}
                          className="shelf-book block overflow-hidden rounded-[2px] border-x border-black/50 bg-stone-800 shadow-[inset_-3px_0_8px_rgba(0,0,0,0.55),inset_3px_0_6px_rgba(255,255,255,0.09)] focus:outline-none"
                          style={{
                            // Alturas um pouco diferentes, como numa estante de
                            // verdade. A variação vem do índice: sorteio no
                            // render faria a estante tremer no StrictMode.
                            height: 148 + ((index * 7 + shelfIndex * 3) % 5) * 13 + 'px',
                            width: 30 + ((index * 5 + shelfIndex) % 4) * 7 + 'px',
                            transform: reducedMotion ? undefined : 'rotateY(' + (((index % 3) - 1) * 2) + 'deg)',
                          }}
                          aria-label={'Tirar da estante: ' + book.title}
                          title={book.title}
                        >
                          {/* A lombada é a própria capa esticada na vertical.
                              Recortar só a borda esquerda seria mais fiel, mas
                              em capa escura virava uma faixa preta que parecia
                              buraco na prateleira. */}
                          <img
                            src={book.coverUrl}
                            alt=""
                            aria-hidden
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover opacity-95"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* tábua da prateleira */}
                  <div
                    className="-mx-3 mt-1 h-3 rounded-sm"
                    style={{
                      background: 'linear-gradient(180deg, #4a3a26 0%, #241a10 60%, #120c07 100%)',
                      boxShadow: '0 14px 30px -12px rgb(0 0 0 / 0.9)',
                    }}
                    aria-hidden
                  />
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-14 flex items-center justify-center gap-2 text-center text-xs text-chalk-300">
            <Hand size={14} aria-hidden />
            Clique num volume para tirá-lo da estante. Na mesa, arraste para girar o livro.
          </p>
        </div>
      </section>

      {/* o volume aberto na mesa */}
      {chosen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={chosen.title}
          onClick={(event) => {
            if (event.target === event.currentTarget) setChosen(null)
          }}
        >
          <div className="page-enter relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-house-accent/30 bg-house-surface p-8 shadow-book lg:p-12">
            <button
              type="button"
              onClick={() => setChosen(null)}
              aria-label="Devolver à estante"
              className="absolute right-5 top-5 rounded-full p-2 text-chalk-200 transition-colors hover:bg-chalk-100/10 hover:text-house-accent"
            >
              <X size={20} aria-hidden />
            </button>

            <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
              <div className="mx-auto">
                <Book3D
                  coverUrl={chosen.coverUrl}
                  title={chosen.title}
                  width={210}
                  // A espessura vem do número de páginas. Sem esse dado, usa
                  // uma espessura média de brochura.
                  thickness={Math.max(18, Math.min(64, Math.round((chosen.pages ?? 320) / 12)))}
                />
              </div>

              <div>
                <p className="eyebrow">{chosen.brand ?? chosen.genre}</p>

                <h2 className="mt-3 text-balance font-display text-3xl leading-snug text-chalk-50 sm:text-4xl">
                  {chosen.title}
                </h2>

                {chosen.author && (
                  <p className="mt-2 text-sm text-chalk-300">
                    {chosen.author.name}
                    {chosen.pages ? ' · ' + chosen.pages + ' páginas' : ''}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Stars value={chosen.rating.average} size={14} />
                  <span className="text-xs text-chalk-300">
                    {chosen.rating.count === 0 ? 'sem avaliações' : chosen.rating.count + ' avaliações'}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-chalk-200">{chosen.synopsis}</p>

                {chosen.excerpt && (
                  <blockquote className="mt-5 border-l-2 border-house-accent pl-4 font-serif text-lg italic leading-snug text-chalk-100">
                    {chosen.excerpt}
                  </blockquote>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-chalk-100/15 pt-6">
                  <span className="font-display text-2xl text-house-accent">{formatPrice(chosen.price)}</span>

                  <button
                    type="button"
                    onClick={() => addToCart(chosen)}
                    disabled={busy || chosen.stock <= 0}
                    className="inline-flex items-center gap-2 rounded-full bg-house-accent px-6 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-stone-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ShoppingBag size={15} aria-hidden />
                    {chosen.stock <= 0 ? 'Esgotado' : 'Levar este'}
                  </button>

                  <Link
                    to={'/produto/' + chosen.slug}
                    className="link-underline text-xs uppercase tracking-[0.18em] text-chalk-200"
                  >
                    Ficha completa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
