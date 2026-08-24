import { motion } from 'framer-motion'
import { CheckCircle2, Truck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button, ButtonLink } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { ApiError, api } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { Order } from '../types/api'

export default function Checkout() {
  const { user } = useAuth()
  const { cart, refresh } = useCart()
  const { notify } = useToast()

  const [form, setForm] = useState({
    recipient: user?.name ?? '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState<Order | null>(null)

  async function placeOrder(event: FormEvent) {
    event.preventDefault()
    setErrors({})
    setPlacing(true)

    try {
      const order = await api.orders.create({ ...form, state: form.state.toUpperCase() })

      await refresh()
      setPlaced(order)
      notify('Pedido ' + order.code + ' confirmado!')
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.issues) {
          setErrors(
            Object.fromEntries(Object.entries(error.issues).map(([field, messages]) => [field, messages[0]])),
          )
        } else {
          setErrors({ form: error.message })
        }
      }
    } finally {
      setPlacing(false)
    }
  }

  if (placed) {
    return (
      <section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="mb-8 rounded-full bg-mandrake-600/15 p-6 text-mandrake-400"
        >
          <CheckCircle2 size={54} aria-hidden />
        </motion.div>

        <p className="eyebrow mb-3">A coruja já partiu</p>
        <h1 className="font-display text-4xl text-chalk-50 sm:text-5xl">Pedido {placed.code} confirmado</h1>

        <p className="mt-5 text-chalk-200/80">
          {placed.items.reduce((sum, item) => sum + item.quantity, 0)} livro(s) a caminho de{' '}
          <strong className="text-chalk-50">{placed.delivery.city}</strong>. Total de{' '}
          <strong className="text-house-accent">{formatPrice(placed.total)}</strong>.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/perfil" size="lg" variant="house">
            Acompanhar meus pedidos
          </ButtonLink>
          <ButtonLink
            to="/catalogo"
            size="lg"
            variant="secondary"
            className="border-chalk-100/40 text-chalk-100 hover:border-house-accent hover:text-house-accent"
          >
            Voltar ao catálogo
          </ButtonLink>
        </div>
      </section>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl text-chalk-50">Nada para finalizar</h1>
        <p className="mt-4 text-chalk-200/70">Seu carrinho está vazio.</p>
        <div className="mt-10">
          <ButtonLink to="/catalogo" size="lg" variant="house">
            Ver o catálogo
          </ButtonLink>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-36 lg:px-10">
      <p className="eyebrow mb-3">Último passo</p>
      <h1 className="mb-12 font-display text-4xl text-chalk-50 sm:text-5xl">Finalizar compra</h1>

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <form onSubmit={placeOrder} className="surface-paper rounded-2xl p-8 shadow-book lg:p-10" noValidate>
          <h2 className="mb-6 flex items-center gap-2 font-display text-2xl">
            <Truck size={20} className="text-house-deep" aria-hidden />
            Entrega
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Quem vai receber"
              value={form.recipient}
              onChange={(event) => setForm({ ...form, recipient: event.target.value })}
              error={errors.recipient}
              autoComplete="name"
              className="sm:col-span-2"
              required
            />
            <Input
              label="Endereço completo"
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              error={errors.address}
              placeholder="Rua, número e complemento"
              autoComplete="street-address"
              className="sm:col-span-2"
              required
            />
            <Input
              label="Cidade"
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
              error={errors.city}
              autoComplete="address-level2"
              required
            />
            <Input
              label="Estado"
              value={form.state}
              onChange={(event) => setForm({ ...form, state: event.target.value })}
              error={errors.state}
              placeholder="SP"
              maxLength={2}
              autoComplete="address-level1"
              required
            />
            <Input
              label="CEP"
              value={form.zipCode}
              onChange={(event) => setForm({ ...form, zipCode: event.target.value })}
              error={errors.zipCode}
              placeholder="00000-000"
              autoComplete="postal-code"
              required
            />
          </div>

          {errors.form && (
            <p className="mt-6 rounded-lg bg-house-mid/10 px-4 py-3 text-sm text-house-deep" role="alert">
              {errors.form}
            </p>
          )}

          <Button type="submit" size="lg" loading={placing} className="mt-8 w-full sm:w-auto">
            Confirmar pedido
          </Button>

          <p className="mt-4 text-xs text-stone-800/55">
            O pagamento é simulado: este é um projeto acadêmico e nenhum dado de cartão é solicitado ou
            armazenado.
          </p>
        </form>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl border border-chalk-100/10 bg-stone-800/70 p-8">
            <h2 className="font-display text-2xl text-chalk-50">Seu pedido</h2>

            <ul className="mt-6 space-y-4">
              {cart.items.map((line) => (
                <li key={line.id} className="flex gap-4">
                  <img
                    src={line.book.coverUrl}
                    alt=""
                    className="h-20 w-14 rounded object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-chalk-100">{line.book.title}</p>
                    <p className="text-chalk-300/60">
                      {line.quantity}× {formatPrice(line.book.price)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-chalk-100">{formatPrice(line.lineTotal)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-3 border-t border-chalk-100/10 pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-chalk-300/70">Subtotal</dt>
                <dd className="text-chalk-100">{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-chalk-300/70">Frete</dt>
                <dd className="text-chalk-100">
                  {cart.shipping === 0 ? 'Grátis' : formatPrice(cart.shipping)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-end justify-between border-t border-chalk-100/10 pt-5">
              <span className="text-[0.68rem] uppercase tracking-[0.22em] text-chalk-300/70">Total</span>
              <span className="font-display text-3xl text-house-accent">{formatPrice(cart.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
