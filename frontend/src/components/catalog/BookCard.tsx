import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { usePointerGlow } from '../../hooks/usePointerGlow'
import { formatPrice } from '../../lib/format'
import type { Book } from '../../types/api'
import { Stars } from '../ui/Stars'

/** Onde iria o autor, um artigo de fã mostra o que ele é. */
const KIND_LABEL: Record<Book['kind'], string> = {
  BOOK: 'Livro',
  BOX_SET: 'Caixa de coleção',
  SPECIAL_EDITION: 'Edição especial',
  COLLECTIBLE: 'Artigo de fã',
}

interface BookCardProps {
  book: Book
  index?: number
}

export function BookCard({ book, index = 0 }: BookCardProps) {
  const { user } = useAuth()
  const { add, busy } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()
  const onPointerGlow = usePointerGlow()

  const soldOut = book.stock <= 0

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
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={onPointerGlow}
      className="glow-follow group flex h-full flex-col rounded-2xl border border-chalk-100/15 bg-house-surface p-5 transition-colors duration-500 hover:border-house-accent/45"
    >
      <Link
        to={'/livro/' + book.slug}
        className="relative mb-5 block overflow-hidden rounded-lg [perspective:1200px]"
        aria-label={'Ver ' + book.title}
      >
        <img
          src={book.coverUrl}
          alt={'Capa de ' + book.title}
          loading="lazy"
          decoding="async"
          className="book-3d aspect-[2/3] w-full object-cover shadow-book"
        />

        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-stone-900/85 py-2 text-center text-[0.65rem] uppercase tracking-[0.2em] text-chalk-200">
            Esgotado
          </span>
        )}

        {book.featured && !soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-house-accent px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-stone-900">
            Destaque
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col">
        <p className="text-[0.66rem] uppercase tracking-[0.2em] text-chalk-200/85">{(book.author?.name ?? KIND_LABEL[book.kind])}</p>

        <h3 className="mt-2 font-display text-lg leading-snug text-chalk-50">
          <Link to={'/livro/' + book.slug} className="link-underline">
            {book.title}
          </Link>
        </h3>

        <div className="mt-3 flex items-center gap-2">
          <Stars value={book.rating.average} size={14} />
          <span className="text-xs text-chalk-200/85">
            {book.rating.count === 0
              ? 'sem avaliações'
              : book.rating.count === 1
                ? '1 avaliação'
                : book.rating.count + ' avaliações'}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-chalk-200/85">{book.synopsis}</p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-chalk-100/15 pt-4">
          <div>
            <span className="font-display text-xl text-house-accent">{formatPrice(book.price)}</span>
            {!soldOut && book.stock <= 5 && (
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-ember-400">
                últimos {book.stock}
              </p>
            )}
          </div>

          <motion.button
            type="button"
            onClick={handleAdd}
            disabled={busy || soldOut}
            whileHover={{ scale: soldOut ? 1 : 1.04 }}
            whileTap={{ scale: soldOut ? 1 : 0.96 }}
            className="inline-flex items-center gap-2 rounded-full bg-house-mid px-4 py-2.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-chalk-50 transition-colors hover:bg-house-mid disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} aria-hidden />
            {soldOut ? 'Esgotado' : 'Comprar'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
