import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { HOUSE_INFO } from '../../context/HouseContext'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../context/ToastContext'
import { usePointerGlow } from '../../hooks/usePointerGlow'
import { formatPrice } from '../../lib/format'
import type { Book, HouseId } from '../../types/api'
import { Stars } from '../ui/Stars'

// Card de produto do catálogo. A ordem das informações é sempre a mesma:
// foto, marca, nome, avaliação, preço e botão.
//
// A foto usa object-contain numa moldura de proporção fixa. Com cover, metade
// da caixa de LEGO ficava fora do quadro, porque livro e caixa têm formatos
// bem diferentes. A sinopse não entra no card: ocupava muito espaço e não
// ajuda a escolher entre doze produtos lado a lado.

const KIND_LABEL: Record<Book['kind'], string> = {
  BOOK: 'Livro',
  BOX_SET: 'Caixa de coleção',
  SPECIAL_EDITION: 'Edição especial',
  COLLECTIBLE: 'Réplica',
  WAND: 'Varinha',
  FIGURE: 'Colecionável',
  APPAREL: 'Vestuário',
  ACCESSORY: 'Acessório',
  STATIONERY: 'Papelaria',
  GAME: 'Jogos e blocos',
  HOME: 'Casa',
}

// Parcelamento anunciado: máximo de parcelas e valor mínimo de cada uma.
const MAX_INSTALLMENTS = 6
const MIN_INSTALLMENT = 30

function installments(price: number) {
  const times = Math.min(MAX_INSTALLMENTS, Math.floor(price / MIN_INSTALLMENT))
  if (times < 2) return null
  return { times, value: price / times }
}

interface ProductCardProps {
  book: Book
  index?: number
  /** Versão menor, usada nas faixas horizontais da home. */
  compact?: boolean
}

export function ProductCard({ book, index = 0, compact = false }: ProductCardProps) {
  const { user } = useAuth()
  const { add, busy } = useCart()
  const { notify } = useToast()
  const { reducedMotion } = useSettings()
  const navigate = useNavigate()
  const onPointerGlow = usePointerGlow()

  const soldOut = book.stock <= 0
  const parcela = installments(book.price)
  const isNew = book.tags.includes('novidade')
  const bestSeller = book.tags.includes('mais-vendido')

  async function handleAdd(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      notify('Entre na sua conta para montar o pedido.', 'info')
      navigate('/login', { state: { from: '/catalogo' } })
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
    <motion.article
      layout
      // Anima no mount, e não no whileInView. Quando o IntersectionObserver não
      // disparava, o card ficava invisível.
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index, 10) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={onPointerGlow}
      className="glow-follow group flex h-full flex-col rounded-2xl border border-chalk-100/15 bg-house-surface transition-colors duration-500 hover:border-house-accent/45"
    >
      {/* foto */}
      <Link
        to={'/produto/' + book.slug}
        className="relative block overflow-hidden rounded-t-2xl bg-chalk-50/5 p-4"
        aria-label={'Ver ' + book.title}
      >
        <div className={'flex items-center justify-center ' + (compact ? 'h-40' : 'h-52')}>
          <img
            src={book.coverUrl}
            alt={book.title}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)] transition-transform duration-700 group-hover:scale-[1.06]"
          />
        </div>

        {/* No máximo duas etiquetas, e sempre com texto: cor sozinha não basta. */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {book.discount > 0 && (
            <span className="rounded-full bg-ember-600 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white">
              −{book.discount}%
            </span>
          )}
          {isNew && (
            <span className="rounded-full bg-house-accent px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.12em] text-stone-950">
              Novidade
            </span>
          )}
          {!isNew && bestSeller && (
            <span className="rounded-full border border-house-accent/60 bg-house-bg/85 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.12em] text-house-accent">
              Mais vendido
            </span>
          )}
        </div>

        {book.house && (
          <span
            className="absolute right-3 top-3 rounded-full border border-chalk-100/25 bg-house-bg/85 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.12em] text-chalk-200"
            title={'Artigo da ' + HOUSE_INFO[book.house as HouseId].name}
          >
            {HOUSE_INFO[book.house as HouseId].name}
          </span>
        )}

        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-stone-950/85 py-2 text-center text-[0.65rem] uppercase tracking-[0.2em] text-chalk-200">
            Esgotado
          </span>
        )}
      </Link>

      {/* dados do produto */}
      <div className="flex flex-1 flex-col p-5 pt-4">
        <p className="text-[0.62rem] uppercase tracking-[0.18em] text-chalk-300">
          {book.brand ?? book.author?.name ?? KIND_LABEL[book.kind]}
        </p>

        <h3 className="mt-1.5 line-clamp-2 font-display text-base leading-snug text-chalk-50">
          <Link to={'/produto/' + book.slug} className="link-underline">
            {book.title}
          </Link>
        </h3>

        <div className="mt-2.5 flex items-center gap-2">
          <Stars value={book.rating.average} size={13} />
          <span className="text-[0.68rem] text-chalk-300">
            {book.rating.count === 0 ? 'sem avaliações' : '(' + book.rating.count + ')'}
          </span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl text-house-accent">{formatPrice(book.price)}</span>
            {book.compareAtPrice && book.compareAtPrice > book.price && (
              <span className="text-xs text-chalk-300 line-through">{formatPrice(book.compareAtPrice)}</span>
            )}
          </div>

          {parcela && (
            <p className="mt-1 text-[0.68rem] text-chalk-300">
              ou {parcela.times}x de {formatPrice(parcela.value)} sem juros
            </p>
          )}

          {!soldOut && book.stock <= 8 && (
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] text-ember-400">
              últimas {book.stock} unidades
            </p>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={busy || soldOut}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-house-mid px-4 py-3 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-chalk-50 transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} aria-hidden />
            {soldOut ? 'Esgotado' : 'Adicionar'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
