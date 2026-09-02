import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Building2, ChevronRight, Globe, Minus, Package, Plus, Star, Tag } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductCard } from '../components/catalog/ProductCard'
import { EnchantedSky } from '../components/ui/EnchantedSky'
import { Button } from '../components/ui/Button'
import { BrandLoader } from '../components/ui/Loaders'
import { Stars, StarPicker } from '../components/ui/Stars'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { ApiError, api } from '../lib/api'
import { HOUSE_INFO } from '../context/HouseContext'
import { formatDate, formatPrice } from '../lib/format'
import type { HouseId } from '../types/api'
import type { BookDetail as BookDetailType } from '../types/api'

export default function BookDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { add, busy } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()

  const [book, setBook] = useState<BookDetailType | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!slug) return

    setBook(null)
    setQuantity(1)

    api.catalog
      .book(slug)
      .then(setBook)
      .catch(() => navigate('/catalogo', { replace: true }))
  }, [slug, navigate])

  if (!book) return <BrandLoader label="Procurando na estante..." />

  const soldOut = book.stock <= 0

  async function handleAdd() {
    if (!book) return

    if (!user) {
      notify('Entre na sua conta para comprar.', 'info')
      navigate('/login', { state: { from: '/produto/' + book.slug } })
      return
    }

    try {
      await add(book.id, quantity)
      notify(book.title + ' foi para o carrinho.')
    } catch (error) {
      notify(error instanceof ApiError ? error.message : 'Não conseguimos adicionar agora.', 'error')
    }
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault()

    if (!book) return

    if (!user) {
      notify('Entre na sua conta para avaliar.', 'info')
      navigate('/login', { state: { from: '/produto/' + book.slug } })
      return
    }

    if (rating === 0) {
      notify('Escolha de 1 a 5 estrelas.', 'error')
      return
    }

    setSending(true)

    try {
      await api.reviews.upsert(book.slug, { rating, comment: comment || undefined })
      const refreshed = await api.catalog.book(book.slug)

      setBook(refreshed)
      setRating(0)
      setComment('')
      notify('Avaliação publicada. Obrigado por contar o que achou!')
    } catch (error) {
      notify(error instanceof ApiError ? error.message : 'Não conseguimos publicar agora.', 'error')
    } finally {
      setSending(false)
    }
  }

  const totalReviews = book.rating.count

  return (
    <>
      {/* Faixa na cor da casa, igual às outras páginas. */}
      <section className="relative overflow-hidden bg-house-deep pb-16 pt-32 lg:pt-36">
        <EnchantedSky embers={16} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          {/* Breadcrumb em vez de um botão "voltar" solto: com sete
              departamentos, é preciso saber em qual deles se está. */}
          <nav
            aria-label="Você está aqui"
            className="mb-10 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-white/55"
          >
            <Link to="/" className="hover:text-house-accent">
              Início
            </Link>
            <ChevronRight size={12} aria-hidden />
            <Link to="/catalogo" className="hover:text-house-accent">
              Loja
            </Link>
            <ChevronRight size={12} aria-hidden />
            <Link to={'/catalogo?departamento=' + book.department} className="hover:text-house-accent">
              {book.genre}
            </Link>
            <ChevronRight size={12} aria-hidden />
            <span className="normal-case tracking-normal text-white/80">{book.title}</span>
          </nav>

          <Link
            to="/catalogo"
            className="mb-8 inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-white/65 transition hover:text-house-accent lg:hidden"
          >
            <ArrowLeft size={15} aria-hidden /> Voltar à loja
          </Link>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr]">
            <div className="rise-in relative mx-auto w-full max-w-xs lg:mx-0">
              <div className="absolute -inset-6 rounded-full bg-house-accent/20 blur-3xl" aria-hidden />
              <img
                src={book.coverUrl}
                alt={'Capa de ' + book.title}
                className="relative w-full rounded-lg shadow-book"
                fetchPriority="high"
              />
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <p className="eyebrow">{book.brand ?? book.genre}</p>

                {book.house && (
                  <Link
                    to={'/catalogo?house=' + book.house}
                    className="rounded-full border border-white/25 px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-white/75 transition hover:border-house-accent hover:text-house-accent"
                  >
                    {HOUSE_INFO[book.house as HouseId].name}
                  </Link>
                )}

                {book.discount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-600 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white">
                    <Tag size={11} aria-hidden />
                    {book.discount}% de desconto
                  </span>
                )}
              </div>

              <h1 className="rise-in font-display text-4xl text-white sm:text-5xl">{book.title}</h1>

              <p className="mt-3 text-white/70">
                {[book.author?.name, book.publisher?.name].filter(Boolean).join(' · ') ||
                  [book.brand, book.character].filter(Boolean).join(' · ') ||
                  'Artigo do mundo bruxo'}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Stars value={book.rating.average} size={18} />
                <span className="text-sm text-white/65">
                  {totalReviews === 0
                    ? 'Ainda sem avaliações'
                    : book.rating.average.toFixed(1).replace('.', ',') +
                      ' · ' +
                      totalReviews +
                      (totalReviews === 1 ? ' avaliação' : ' avaliações')}
                </span>
              </div>

              <p className="mt-8 max-w-2xl leading-relaxed text-white/80">{book.synopsis}</p>

              {book.excerpt && (
                <blockquote className="mt-6 max-w-2xl border-l-2 border-house-accent pl-5">
                  <p className="font-serif text-xl italic text-white/85">{book.excerpt}</p>
                </blockquote>
              )}

              <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-5 border-t border-white/15 pt-8 sm:grid-cols-4">
                {/* A ficha muda conforme o produto. Varinha não tem página nem
                    idioma, então esses campos simplesmente não aparecem. */}
                {book.pages ? (
                  <Detail icon={BookOpen} label="Páginas" value={String(book.pages)} />
                ) : (
                  <Detail icon={Tag} label="Tipo" value={book.genre} />
                )}

                {book.publisher ? (
                  <Detail icon={Globe} label="Idioma" value={book.language} />
                ) : (
                  <Detail icon={Star} label="Personagem" value={book.character ?? '-'} />
                )}
                <Detail
                  icon={Building2}
                  label={book.publisher ? 'Editora' : 'Marca'}
                  value={book.publisher?.name ?? book.brand ?? '-'}
                />
                <Detail
                  icon={Package}
                  label="Estoque"
                  value={soldOut ? 'Esgotado' : book.stock + ' un.'}
                />
              </dl>

              <div className="mt-10 flex flex-wrap items-center gap-6 rounded-2xl border border-white/15 bg-black/25 p-6">
                <div>
                  <p className="text-[0.66rem] uppercase tracking-[0.2em] text-white/50">Preço</p>

                  <div className="flex flex-wrap items-baseline gap-3">
                    <p className="font-display text-4xl text-house-accent">{formatPrice(book.price * quantity)}</p>
                    {book.compareAtPrice && book.compareAtPrice > book.price && (
                      <p className="text-sm text-white/50 line-through">
                        {formatPrice(book.compareAtPrice * quantity)}
                      </p>
                    )}
                  </div>

                  {/* parcelamento */}
                  {book.price * quantity >= 60 && (
                    <p className="mt-1 text-xs text-white/60">
                      ou {Math.min(6, Math.floor((book.price * quantity) / 30))}x de{' '}
                      {formatPrice((book.price * quantity) / Math.min(6, Math.floor((book.price * quantity) / 30)))}{' '}
                      sem juros
                    </p>
                  )}

                  {book.publishedAt && (
                    <p className="mt-1 text-xs text-white/45">Publicado em {formatDate(book.publishedAt)}</p>
                  )}
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-white/25 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      aria-label="Diminuir quantidade"
                      className="rounded-full p-2 text-white transition hover:bg-white/10"
                    >
                      <Minus size={15} aria-hidden />
                    </button>
                    <span className="w-8 text-center text-white" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.min(Math.max(book.stock, 1), value + 1))}
                      aria-label="Aumentar quantidade"
                      className="rounded-full p-2 text-white transition hover:bg-white/10"
                    >
                      <Plus size={15} aria-hidden />
                    </button>
                  </div>

                  <Button onClick={handleAdd} loading={busy} disabled={soldOut} size="lg" variant="house">
                    {soldOut ? 'Esgotado' : 'Adicionar ao carrinho'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10" aria-labelledby="reviews-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,22rem)]">
          <div>
            <h2 id="reviews-title" className="font-display text-3xl text-chalk-50">
              {book.publisher ? 'O que os leitores acharam' : 'O que os clientes acharam'}
            </h2>

            {book.reviews.length === 0 ? (
              <p className="mt-6 text-chalk-200/85">
                Ninguém avaliou ainda. Se você já levou este, seja o primeiro a contar.
              </p>
            ) : (
              <ul className="mt-8 space-y-5">
                {book.reviews.map((review) => (
                  <li key={review.id} className="surface-paper rounded-2xl p-6 shadow-stone">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display text-lg">{review.user.name}</span>
                      <Stars value={review.rating} size={14} />
                      {review.verifiedPurchase && (
                        <span className="rounded-full bg-mandrake-600/15 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-mandrake-600">
                          Compra verificada
                        </span>
                      )}
                      <span className="ml-auto text-xs text-stone-800/50">{formatDate(review.createdAt)}</span>
                    </div>

                    {review.comment && <p className="mt-3 leading-relaxed text-stone-800/85">{review.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-chalk-100/15 bg-house-surface p-6">
              <p className="eyebrow mb-4">As notas</p>

              <div className="flex items-end gap-3">
                <span className="font-display text-5xl text-house-accent">
                  {book.rating.average.toFixed(1).replace('.', ',')}
                </span>
                <span className="pb-2 text-sm text-chalk-200/85">de 5</span>
              </div>

              <ul className="mt-5 space-y-2">
                {book.ratingDistribution.map((row) => {
                  const percentage = totalReviews === 0 ? 0 : (row.count / totalReviews) * 100

                  return (
                    <li key={row.star} className="flex items-center gap-3 text-xs text-chalk-200/88">
                      <span className="flex w-8 items-center gap-1">
                        {row.star}
                        <Star size={11} className="text-house-accent" fill="currentColor" aria-hidden />
                      </span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-chalk-100/10">
                        <motion.span
                          className="block h-full rounded-full bg-house-accent"
                          initial={{ width: 0 }}
                          whileInView={{ width: percentage + '%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </span>
                      <span className="w-6 text-right">{row.count}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <form onSubmit={submitReview} className="surface-paper rounded-2xl p-6 shadow-stone">
              <p className="mb-4 font-display text-xl">Deixe a sua avaliação</p>

              <StarPicker value={rating} onChange={setRating} />

              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Conte o que você achou da leitura (opcional)."
                maxLength={1500}
                className="mt-5 min-h-28 w-full rounded-lg border border-stone-800/15 bg-chalk-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-800/40 focus:border-house-mid focus:outline-none"
              />

              <Button type="submit" loading={sending} className="mt-4 w-full">
                Publicar avaliação
              </Button>

              {!user && (
                <p className="mt-3 text-center text-xs text-stone-800/60">
                  Você precisa estar logado para avaliar.
                </p>
              )}
            </form>
          </aside>
        </div>
      </section>

      {book.related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-10 font-display text-3xl text-chalk-50">
            Quem leu este, levou também
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {book.related.map((related, index) => (
              <ProductCard key={related.id} book={related} index={index} compact />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-chalk-200/85">
        <Icon size={13} aria-hidden /> {label}
      </dt>
      <dd className="mt-1.5 text-sm text-chalk-100">{value}</dd>
    </div>
  )
}
