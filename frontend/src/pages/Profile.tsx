import { AnimatePresence, motion } from 'framer-motion'
import {
  BookMarked,
  LifeBuoy,
  LogOut,
  Package,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Button, ButtonLink } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { Stars } from '../components/ui/Stars'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError, api } from '../lib/api'
import {
  ORDER_STATUS_LABELS,
  ROLE_LABELS,
  TICKET_STATUS_LABELS,
  URGENCY_LABELS,
  formatDate,
  formatDateTime,
  formatPrice,
} from '../lib/format'
import type { MyReview, Order, SupportTicket } from '../types/api'

type TabId = 'pedidos' | 'avaliacoes' | 'chamados' | 'conta'

const TABS: Array<{ id: TabId; label: string; icon: typeof Package }> = [
  { id: 'pedidos', label: 'Pedidos', icon: Package },
  { id: 'avaliacoes', label: 'Minhas avaliações', icon: BookMarked },
  { id: 'chamados', label: 'Meus chamados', icon: LifeBuoy },
  { id: 'conta', label: 'Dados da conta', icon: UserRound },
]

const ORDER_TONES: Record<string, string> = {
  PENDING: 'bg-house-accent/20 text-house-accent',
  PAID: 'bg-mandrake-400/25 text-mandrake-600',
  SHIPPED: 'bg-ember-600/20 text-ember-600',
  DELIVERED: 'bg-mandrake-600/20 text-mandrake-600',
  CANCELLED: 'bg-stone-800/10 text-stone-700',
}

const TICKET_TONES: Record<string, string> = {
  OPEN: 'bg-ember-600/20 text-ember-600',
  IN_PROGRESS: 'bg-house-accent/20 text-house-accent',
  RESOLVED: 'bg-mandrake-600/20 text-mandrake-600',
}

// Só dá para cancelar pedido que ainda não foi enviado.
const CANCELLABLE = new Set(['PENDING', 'PAID'])

export default function Profile() {
  const { user, logout, refresh } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  // A aba aberta vai para a URL, para dar para salvar o link de "meus chamados".
  const [params, setParams] = useSearchParams()
  const requested = params.get('aba') as TabId | null
  const tab: TabId = TABS.some((item) => item.id === requested) ? requested! : 'pedidos'
  const setTab = (next: TabId) => setParams(next === 'pedidos' ? {} : { aba: next }, { replace: true })

  const [orders, setOrders] = useState<Order[]>([])
  const [reviews, setReviews] = useState<MyReview[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])

  useEffect(() => {
    void Promise.allSettled([api.orders.list(), api.reviews.mine(), api.support.mine()]).then(
      ([ordersResult, reviewsResult, ticketsResult]) => {
        if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value)
        if (reviewsResult.status === 'fulfilled') setReviews(reviewsResult.value)
        if (ticketsResult.status === 'fulfilled') setTickets(ticketsResult.value)
      },
    )
  }, [])

  async function cancelOrder(id: string) {
    try {
      const updated = await api.orders.cancel(id)

      setOrders((current) => current.map((order) => (order.id === id ? updated : order)))
      notify('Pedido cancelado. Os exemplares voltaram para a estante.', 'info')
      await refresh()
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'Não foi possível cancelar.', 'error')
    }
  }

  async function removeReview(id: string) {
    try {
      await api.reviews.remove(id)

      setReviews((current) => current.filter((review) => review.id !== id))
      notify('Avaliação apagada.', 'info')
      await refresh()
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'Não foi possível apagar.', 'error')
    }
  }

  if (!user) return null

  return (
    <>
      <PageHeader
        eyebrow={(ROLE_LABELS[user.role] ?? 'Leitor') + ' da casa'}
        title={'Olá, ' + user.name.split(' ')[0] + '!'}
        description={'Na biblioteca desde ' + formatDate(user.memberSince) + ' · ' + user.email}
        aside={
          <div className="flex flex-wrap gap-3">
            {user.role !== 'CUSTOMER' && (
              <ButtonLink to="/painel" variant="house" size="sm">
                Ir para o painel
              </ButtonLink>
            )}

            <Button
              variant="secondary"
              size="sm"
              className="border-white/40 text-white hover:border-house-accent hover:text-house-accent"
              onClick={async () => {
                await logout()
                notify('Até a próxima leitura!', 'info')
                navigate('/')
              }}
            >
              <LogOut size={15} aria-hidden />
              Sair
            </Button>
          </div>
        }
      />

      {/* resumo da conta */}
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Pedidos feitos" value={String(user.stats.orders)} />
          <Stat label="Livros comprados" value={String(user.stats.booksBought)} />
          <Stat label="Avaliações escritas" value={String(user.stats.reviews)} />
          <Stat label="Total investido" value={formatPrice(user.stats.totalSpent)} />
        </dl>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <nav className="mb-10 flex flex-wrap gap-2" aria-label="Seções do perfil">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={
                  'relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.16em] transition-colors ' +
                  (active ? 'text-chalk-50' : 'text-chalk-200/85 hover:text-house-accent')
                }
              >
                {active && (
                  <motion.span
                    layoutId="profile-tab"
                    className="absolute inset-0 rounded-full bg-house-deep"
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon size={15} aria-hidden />
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'pedidos' && (
              <div className="space-y-5">
                {orders.length === 0 && (
                  <Empty text="Você ainda não fez nenhum pedido." to="/catalogo" action="Ver o catálogo" />
                )}

                {orders.map((order) => (
                  <article key={order.id} className="surface-paper rounded-2xl p-6 shadow-stone sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-2xl">{order.code}</p>
                        <p className="mt-1 text-sm text-stone-700/75">{formatDateTime(order.createdAt)}</p>
                      </div>

                      <span
                        className={
                          'rounded-full px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] ' +
                          (ORDER_TONES[order.status] ?? 'bg-stone-800/10 text-stone-700')
                        }
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>

                    <ul className="mt-6 flex flex-wrap gap-5">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.coverUrl}
                            alt=""
                            className="h-20 w-14 rounded object-cover shadow-stone"
                            loading="lazy"
                          />
                          <span className="text-sm">
                            <span className="block max-w-48 leading-snug">{item.title}</span>
                            <span className="text-stone-700/70">
                              {item.quantity}× {formatPrice(item.unitPrice)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-800/10 pt-5">
                      <p className="text-sm text-stone-700/80">
                        Entrega para {order.delivery.recipient} · {order.delivery.city}/{order.delivery.state}
                        <br />
                        Frete {order.shipping === 0 ? 'grátis' : formatPrice(order.shipping)}
                      </p>

                      <div className="flex items-center gap-5">
                        <span className="font-display text-2xl text-house-deep">
                          {formatPrice(order.total)}
                        </span>

                        {CANCELLABLE.has(order.status) && (
                          <Button variant="ghost" size="sm" onClick={() => cancelOrder(order.id)}>
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {tab === 'avaliacoes' && (
              <div className="grid gap-5 sm:grid-cols-2">
                {reviews.length === 0 && (
                  <Empty
                    text="Você ainda não avaliou nenhum livro."
                    to="/catalogo"
                    action="Escolher uma leitura"
                  />
                )}

                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="surface-paper flex gap-5 rounded-2xl p-6 shadow-stone"
                  >
                    <Link to={'/produto/' + review.book.slug} className="shrink-0">
                      <img
                        src={review.book.coverUrl}
                        alt={'Capa de ' + review.book.title}
                        className="h-32 w-22 rounded object-cover shadow-book"
                        loading="lazy"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          to={'/produto/' + review.book.slug}
                          className="link-underline font-display text-xl leading-snug"
                        >
                          {review.book.title}
                        </Link>

                        <button
                          type="button"
                          onClick={() => removeReview(review.id)}
                          aria-label={'Apagar avaliação de ' + review.book.title}
                          className="rounded-full p-2 text-stone-700/60 transition hover:bg-house-deep/10 hover:text-house-deep"
                        >
                          <Trash2 size={16} aria-hidden />
                        </button>
                      </div>

                      <Stars value={review.rating} className="mt-2" />

                      {review.comment && (
                        <p className="mt-3 font-serif text-lg italic leading-snug text-stone-700">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      )}

                      <p className="mt-3 text-[0.68rem] uppercase tracking-[0.14em] text-stone-700/55">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {tab === 'chamados' && (
              <div className="space-y-5">
                {tickets.length === 0 && (
                  <Empty text="Nenhum chamado aberto, esperamos que continue assim." to="/ajuda" action="Central de ajuda" />
                )}

                {tickets.map((ticket) => (
                  <article key={ticket.id} className="surface-paper rounded-2xl p-6 shadow-stone sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-xl">{ticket.subject}</p>
                        <p className="mt-1 text-sm text-stone-700/75">
                          {ticket.code} · {formatDateTime(ticket.createdAt)} · urgência{' '}
                          {URGENCY_LABELS[ticket.urgency].toLowerCase()}
                        </p>
                      </div>

                      <span
                        className={
                          'rounded-full px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] ' +
                          (TICKET_TONES[ticket.status] ?? 'bg-stone-800/10 text-stone-700')
                        }
                      >
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-stone-700">{ticket.description}</p>

                    {ticket.resolution && (
                      <div className="mt-5 rounded-xl border-l-4 border-mandrake-600 bg-mandrake-400/10 p-5">
                        <p className="text-[0.66rem] uppercase tracking-[0.18em] text-mandrake-600">
                          Resposta do suporte
                          {ticket.handledBy ? ' · ' + ticket.handledBy.name : ''}
                        </p>
                        <p className="mt-2 text-sm text-stone-800">{ticket.resolution}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            {tab === 'conta' && <AccountTab />}
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  )
}

function AccountTab() {
  const { user, refresh } = useAuth()
  const { notify } = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  async function saveName(event: FormEvent) {
    event.preventDefault()
    setNameError('')
    setSavingName(true)

    try {
      await api.profile.update({ name })
      await refresh()
      notify('Nome atualizado.')
    } catch (caught) {
      setNameError(caught instanceof ApiError ? caught.message : 'Não foi possível salvar.')
    } finally {
      setSavingName(false)
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordErrors({})
    setSavingPassword(true)

    try {
      await api.profile.changePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '' })
      notify('Senha trocada com sucesso.')
    } catch (caught) {
      if (caught instanceof ApiError) {
        setPasswordErrors(
          caught.issues
            ? Object.fromEntries(Object.entries(caught.issues).map(([field, messages]) => [field, messages[0]]))
            : { form: caught.message },
        )
      }
    } finally {
      setSavingPassword(false)
    }
  }

  if (!user) return null

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveName} className="surface-paper rounded-2xl p-8 shadow-stone" noValidate>
        <h2 className="font-display text-2xl">Seus dados</h2>
        <p className="mt-2 text-sm text-stone-700/80">
          O e-mail e o papel de acesso são fixos. Fale com o suporte se precisar mudar.
        </p>

        <Input
          label="Nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={nameError}
          autoComplete="name"
          className="mt-6"
          required
        />

        <Input label="E-mail" value={user.email} className="mt-5" disabled readOnly />

        <Input label="Papel de acesso" value={ROLE_LABELS[user.role] ?? user.role} className="mt-5" disabled readOnly />

        <Button type="submit" loading={savingName} className="mt-8 w-full" disabled={name === user.name}>
          Salvar alterações
        </Button>
      </form>

      <form onSubmit={savePassword} className="surface-paper rounded-2xl p-8 shadow-stone" noValidate>
        <h2 className="font-display text-2xl">Trocar a senha</h2>
        <p className="mt-2 text-sm text-stone-700/80">
          Confirme a senha atual antes de escolher a nova. Se esqueceu, use a página de redefinição.
        </p>

        <Input
          label="Senha atual"
          type="password"
          value={passwords.currentPassword}
          onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
          error={passwordErrors.currentPassword}
          autoComplete="current-password"
          className="mt-6"
          required
        />

        <Input
          label="Nova senha"
          type="password"
          value={passwords.newPassword}
          onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
          error={passwordErrors.newPassword}
          hint="Pelo menos 8 caracteres."
          autoComplete="new-password"
          className="mt-5"
          required
        />

        {passwordErrors.form && (
          <p className="mt-5 rounded-lg bg-house-deep/10 px-4 py-3 text-sm text-house-deep" role="alert">
            {passwordErrors.form}
          </p>
        )}

        <Button type="submit" loading={savingPassword} className="mt-8 w-full">
          Trocar senha
        </Button>
      </form>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-chalk-200/15 bg-chalk-200/5 p-6">
      <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-chalk-200/65">{label}</dt>
      <dd className="mt-2 font-display text-3xl text-house-accent">{value}</dd>
    </div>
  )
}

function Empty({ text, to, action }: { text: string; to?: string; action?: string }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-chalk-200/25 p-12 text-center">
      <UserRound size={32} className="mx-auto mb-4 text-chalk-200/40" aria-hidden />
      <p className="text-chalk-200/88">{text}</p>

      {to && action && (
        <div className="mt-6">
          <ButtonLink to={to} variant="secondary" size="sm" className="border-chalk-200/40 text-chalk-100">
            {action}
          </ButtonLink>
        </div>
      )}
    </div>
  )
}
