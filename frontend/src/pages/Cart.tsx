import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { PageHeader } from '../components/layout/PageHeader'
import { formatPrice } from '../lib/format'

export default function CartPage() {
  const { user, loading } = useAuth()
  const { cart, busy, update, remove, clear } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()

  if (loading) return <div className="min-h-[60vh]" />

  if (!user) {
    return (
      <EmptyState
        title="Entre para ver o seu carrinho"
        text="Sua conta guarda os livros escolhidos enquanto você continua navegando."
        action={
          <ButtonLink to="/login" size="lg" variant="house">
            Entrar na minha conta
          </ButtonLink>
        }
      />
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Seu carrinho está vazio"
        text="A estante está logo ali — e a primeira carta de Hogwarts também."
        action={
          <ButtonLink to="/catalogo" size="lg" variant="house">
            Ver o catálogo
          </ButtonLink>
        }
      />
    )
  }

  const progress = Math.min(100, (cart.subtotal / cart.freeShippingThreshold) * 100)

  return (
    <>
      <PageHeader
        eyebrow="Sua sacola"
        title="Carrinho de compras"
        aside={
          <button
            type="button"
            onClick={async () => {
              await clear()
              notify('Carrinho esvaziado.', 'info')
            }}
            className="text-[0.7rem] uppercase tracking-[0.18em] text-white/70 transition hover:text-house-accent"
          >
            Esvaziar carrinho
          </button>
        }
      />

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="space-y-5">
          <AnimatePresence mode="popLayout">
            {cart.items.map((line) => (
              <motion.li
                key={line.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-5 overflow-hidden rounded-2xl border border-chalk-100/10 bg-stone-800/70 p-5"
              >
                <Link to={'/livro/' + line.book.slug} className="shrink-0">
                  <img
                    src={line.book.coverUrl}
                    alt={line.book.title}
                    className="h-36 w-24 rounded object-cover shadow-book"
                    loading="lazy"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-display text-lg text-chalk-50">
                        <Link to={'/livro/' + line.book.slug} className="link-underline">
                          {line.book.title}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm text-chalk-300/70">{line.book.author}</p>
                      <p className="mt-2 text-xs text-chalk-300/50">
                        {formatPrice(line.book.price)} a unidade
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      aria-label={'Remover ' + line.book.title}
                      className="shrink-0 rounded-full p-2 text-chalk-300/60 transition hover:bg-house-mid/15 hover:text-house-mid"
                    >
                      <Trash2 size={17} aria-hidden />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                    <div className="flex items-center gap-1 rounded-full border border-chalk-100/15 p-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => update(line.id, line.quantity - 1)}
                        aria-label="Diminuir quantidade"
                        className="rounded-full p-1.5 text-chalk-100 transition hover:bg-chalk-100/10 disabled:opacity-40"
                      >
                        <Minus size={14} aria-hidden />
                      </button>
                      <span className="w-8 text-center text-sm text-chalk-100">{line.quantity}</span>
                      <button
                        type="button"
                        disabled={busy || line.quantity >= line.book.stock}
                        onClick={() => update(line.id, line.quantity + 1)}
                        aria-label="Aumentar quantidade"
                        className="rounded-full p-1.5 text-chalk-100 transition hover:bg-chalk-100/10 disabled:opacity-40"
                      >
                        <Plus size={14} aria-hidden />
                      </button>
                    </div>

                    <p className="font-display text-xl text-house-accent">{formatPrice(line.lineTotal)}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="surface-paper rounded-2xl p-8 shadow-book">
            <h2 className="font-display text-2xl">Resumo do pedido</h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-800/70">Subtotal</dt>
                <dd>{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-800/70">Frete</dt>
                <dd>{cart.shipping === 0 ? 'Grátis' : formatPrice(cart.shipping)}</dd>
              </div>
            </dl>

            {cart.missingForFreeShipping > 0 && (
              <div className="mt-6">
                <p className="text-xs text-stone-800/70">
                  Faltam <strong className="text-house-deep">{formatPrice(cart.missingForFreeShipping)}</strong>{' '}
                  para o frete sair por nossa conta.
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-800/10">
                  <motion.div
                    className="h-full rounded-full bg-house-accent"
                    initial={{ width: 0 }}
                    animate={{ width: progress + '%' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-end justify-between border-t border-stone-800/10 pt-6">
              <span className="text-[0.68rem] uppercase tracking-[0.22em] text-stone-800/60">Total</span>
              <span className="font-display text-3xl text-house-deep">{formatPrice(cart.total)}</span>
            </div>

            <Button onClick={() => navigate('/checkout')} size="lg" className="mt-8 w-full">
              Finalizar compra
            </Button>

            <Link
              to="/catalogo"
              className="mt-4 block text-center text-[0.7rem] uppercase tracking-[0.18em] text-stone-800/60 transition hover:text-house-deep"
            >
              Continuar comprando
            </Link>
          </div>
        </aside>
      </div>
      </section>
    </>
  )
}

function EmptyState({ title, text, action }: { title: string; text: string; action: React.ReactNode }) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-8 rounded-full border border-chalk-100/15 p-6 text-chalk-200/70">
        <ShoppingBag size={44} aria-hidden />
      </div>
      <h1 className="font-display text-4xl text-chalk-50">{title}</h1>
      <p className="mt-4 text-chalk-200/70">{text}</p>
      <div className="mt-10">{action}</div>
    </section>
  )
}
