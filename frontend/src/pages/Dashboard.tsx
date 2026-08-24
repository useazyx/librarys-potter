import { AnimatePresence, motion } from 'framer-motion'
import {
  BookCopy,
  Building2,
  LifeBuoy,
  Pencil,
  Plus,
  TrendingUp,
  Trash2,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
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
import type {
  Author,
  Book,
  Publisher,
  SalesReport,
  StaffUser,
  SupportTicket,
  TicketStatus,
} from '../types/api'

type TabId = 'catalogo' | 'autores' | 'vendas' | 'chamados' | 'usuarios'

const TABS: Array<{ id: TabId; label: string; icon: typeof BookCopy; supportOnly?: boolean }> = [
  { id: 'catalogo', label: 'Catálogo', icon: BookCopy },
  { id: 'autores', label: 'Autores e editoras', icon: Building2 },
  { id: 'vendas', label: 'Vendas', icon: TrendingUp },
  { id: 'chamados', label: 'Chamados', icon: LifeBuoy, supportOnly: true },
  { id: 'usuarios', label: 'Usuários', icon: Users, supportOnly: true },
]

const TICKET_TONES: Record<string, string> = {
  OPEN: 'bg-copper-500/20 text-copper-500',
  IN_PROGRESS: 'bg-gold-500/20 text-gold-500',
  RESOLVED: 'bg-sage-600/20 text-sage-600',
}

const EMPTY_BOOK = {
  title: '',
  isbn: '',
  authorId: '',
  publisherId: '',
  price: '',
  stock: '0',
  genre: 'Fantasia',
  synopsis: '',
  excerpt: '',
  coverUrl: '/img/books/',
  pages: '',
  language: 'Português',
  featured: false,
  publishedAt: '',
}

type BookForm = typeof EMPTY_BOOK

export default function Dashboard() {
  const { user } = useAuth()
  const { notify } = useToast()

  const isSupport = user?.role === 'SUPPORT'
  const tabs = useMemo(() => TABS.filter((tab) => !tab.supportOnly || isSupport), [isSupport])

  // The open section lives in the URL: the fila de chamados is a link worth sharing.
  const [params, setParams] = useSearchParams()
  const requested = params.get('aba') as TabId | null
  const tab: TabId = tabs.some((item) => item.id === requested) ? requested! : 'catalogo'
  const setTab = (next: TabId) => setParams(next === 'catalogo' ? {} : { aba: next }, { replace: true })

  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [sales, setSales] = useState<SalesReport | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [users, setUsers] = useState<StaffUser[]>([])
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')

  const [editing, setEditing] = useState<{ book: Book | null; form: BookForm } | null>(null)
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [resolving, setResolving] = useState<SupportTicket | null>(null)

  const reloadCatalog = useCallback(async () => {
    setBooks(await api.catalog.books({ sort: 'title' }))
  }, [])

  useEffect(() => {
    void Promise.allSettled([
      api.catalog.books({ sort: 'title' }),
      api.catalog.authors(),
      api.catalog.publishers(),
      api.admin.sales(),
    ]).then(([booksResult, authorsResult, publishersResult, salesResult]) => {
      if (booksResult.status === 'fulfilled') setBooks(booksResult.value)
      if (authorsResult.status === 'fulfilled') setAuthors(authorsResult.value)
      if (publishersResult.status === 'fulfilled') setPublishers(publishersResult.value)
      if (salesResult.status === 'fulfilled') setSales(salesResult.value)
    })
  }, [])

  useEffect(() => {
    if (!isSupport) return

    void Promise.allSettled([api.support.queue(), api.admin.users()]).then(
      ([queueResult, usersResult]) => {
        if (queueResult.status === 'fulfilled') setTickets(queueResult.value)
        if (usersResult.status === 'fulfilled') setUsers(usersResult.value)
      },
    )
  }, [isSupport])

  function openCreate() {
    setFormErrors({})
    setEditing({
      book: null,
      form: {
        ...EMPTY_BOOK,
        authorId: authors[0]?.id ?? '',
        publisherId: publishers[0]?.id ?? '',
      },
    })
  }

  function openEdit(book: Book) {
    setFormErrors({})
    setEditing({
      book,
      form: {
        title: book.title,
        isbn: book.isbn,
        authorId: book.author.id,
        publisherId: book.publisher.id,
        price: String(book.price),
        stock: String(book.stock),
        genre: book.genre,
        synopsis: book.synopsis,
        excerpt: book.excerpt ?? '',
        coverUrl: book.coverUrl,
        pages: book.pages ? String(book.pages) : '',
        language: book.language,
        featured: book.featured,
        publishedAt: book.publishedAt ? book.publishedAt.slice(0, 10) : '',
      },
    })
  }

  async function saveBook(event: FormEvent) {
    event.preventDefault()
    if (!editing) return

    setFormErrors({})
    setSaving(true)

    const { form } = editing
    const payload = {
      title: form.title,
      isbn: form.isbn,
      authorId: form.authorId,
      publisherId: form.publisherId,
      price: Number(form.price),
      stock: Number(form.stock),
      genre: form.genre,
      synopsis: form.synopsis,
      coverUrl: form.coverUrl,
      language: form.language,
      featured: form.featured,
      // The schema rejects empty strings, so optional fields go out only when filled.
      ...(form.excerpt ? { excerpt: form.excerpt } : {}),
      ...(form.pages ? { pages: Number(form.pages) } : {}),
      ...(form.publishedAt ? { publishedAt: form.publishedAt } : {}),
    }

    try {
      if (editing.book) {
        await api.admin.updateBook(editing.book.id, payload)
        notify('Livro atualizado.')
      } else {
        await api.admin.createBook(payload)
        notify('Livro adicionado à estante.')
      }

      await reloadCatalog()
      setEditing(null)
    } catch (caught) {
      if (caught instanceof ApiError) {
        setFormErrors(
          caught.issues
            ? Object.fromEntries(Object.entries(caught.issues).map(([field, messages]) => [field, messages[0]]))
            : { form: caught.message },
        )
      }
    } finally {
      setSaving(false)
    }
  }

  async function deleteBook(book: Book) {
    if (!window.confirm('Apagar "' + book.title + '" do catálogo?')) return

    try {
      const result = await api.admin.deleteBook(book.id)

      await reloadCatalog()
      notify(
        result.softDeleted
          ? 'O livro já tem histórico de vendas, então foi apenas arquivado.'
          : 'Livro apagado.',
        'info',
      )
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'Não foi possível apagar.', 'error')
    }
  }

  async function updateTicket(id: string, status: TicketStatus, resolution?: string) {
    try {
      const updated = await api.support.update(id, { status, ...(resolution ? { resolution } : {}) })

      setTickets((current) => current.map((ticket) => (ticket.id === id ? updated : ticket)))
      setResolving(null)
      notify('Chamado ' + updated.code + ' agora está "' + TICKET_STATUS_LABELS[status] + '".')
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'Não foi possível atualizar.', 'error')
    }
  }

  if (!user) return null

  const visibleTickets = statusFilter
    ? tickets.filter((ticket) => ticket.status === statusFilter)
    : tickets

  return (
    <>
      <header className="relative overflow-hidden pb-16 pt-40">
        <img
          src="/img/scenes/estantes.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-900/85 to-night-900" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <p className="eyebrow mb-4">Painel · {ROLE_LABELS[user.role]}</p>
          <h1 className="font-display text-5xl text-parchment-50 sm:text-6xl">Os bastidores da livraria</h1>
          <p className="mt-5 max-w-2xl text-parchment-200/80">
            {isSupport
              ? 'Catálogo, vendas, fila de chamados e cadastro de usuários — tudo o que o antigo menu de administração fazia, em uma tela só.'
              : 'Cuide do catálogo e acompanhe como as vendas estão indo. Apagar registros é atribuição do suporte.'}
          </p>

          {sales && (
            <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Pedidos" value={String(sales.summary.orders)} />
              <Stat label="Faturamento" value={formatPrice(sales.summary.revenue)} />
              <Stat label="Exemplares vendidos" value={String(sales.summary.unitsSold)} />
              <Stat label="Ticket médio" value={formatPrice(sales.summary.averageTicket)} />
            </dl>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <nav className="mb-10 flex flex-wrap gap-2" aria-label="Seções do painel">
          {tabs.map((item) => {
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
                  (active ? 'text-parchment-50' : 'text-parchment-200/70 hover:text-gold-400')
                }
              >
                {active && (
                  <motion.span
                    layoutId="dashboard-tab"
                    className="absolute inset-0 rounded-full bg-burgundy-600"
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
            {tab === 'catalogo' && (
              <div className="surface-paper overflow-hidden rounded-2xl shadow-book">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-night-800/10 p-6 sm:p-8">
                  <div>
                    <h2 className="font-display text-2xl">Estante</h2>
                    <p className="mt-1 text-sm text-night-700/75">
                      {books.length} {books.length === 1 ? 'título' : 'títulos'} no catálogo.
                    </p>
                  </div>

                  <Button size="sm" onClick={openCreate} disabled={authors.length === 0}>
                    <Plus size={15} aria-hidden />
                    Novo livro
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-3xl text-left text-sm">
                    <thead className="bg-parchment-200/60 text-[0.66rem] uppercase tracking-[0.16em] text-night-700">
                      <tr>
                        <th scope="col" className="px-6 py-4 font-medium">Livro</th>
                        <th scope="col" className="px-6 py-4 font-medium">Autor</th>
                        <th scope="col" className="px-6 py-4 font-medium">Editora</th>
                        <th scope="col" className="px-6 py-4 text-right font-medium">Preço</th>
                        <th scope="col" className="px-6 py-4 text-right font-medium">Estoque</th>
                        <th scope="col" className="px-6 py-4 text-right font-medium">Ações</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-night-800/10">
                      {books.map((book) => (
                        <tr key={book.id} className="transition-colors hover:bg-parchment-200/40">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={book.coverUrl}
                                alt=""
                                className="h-14 w-10 rounded object-cover shadow-warm"
                                loading="lazy"
                              />
                              <span>
                                <span className="block font-medium leading-snug">{book.title}</span>
                                <span className="text-xs text-night-700/70">{book.isbn}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-night-700">{book.author.name}</td>
                          <td className="px-6 py-4 text-night-700">{book.publisher.name}</td>
                          <td className="px-6 py-4 text-right font-medium">{formatPrice(book.price)}</td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={
                                'rounded-full px-2.5 py-1 text-xs ' +
                                (book.stock === 0
                                  ? 'bg-burgundy-600/15 text-burgundy-600'
                                  : book.stock <= 3
                                    ? 'bg-gold-500/20 text-gold-500'
                                    : 'bg-sage-600/15 text-sage-600')
                              }
                            >
                              {book.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(book)}
                                aria-label={'Editar ' + book.title}
                                className="rounded-full p-2 text-night-700/60 transition hover:bg-night-800/10 hover:text-night-800"
                              >
                                <Pencil size={15} aria-hidden />
                              </button>

                              {isSupport && (
                                <button
                                  type="button"
                                  onClick={() => deleteBook(book)}
                                  aria-label={'Apagar ' + book.title}
                                  className="rounded-full p-2 text-night-700/60 transition hover:bg-burgundy-600/10 hover:text-burgundy-600"
                                >
                                  <Trash2 size={15} aria-hidden />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'autores' && (
              <PeopleTab
                authors={authors}
                publishers={publishers}
                canDelete={isSupport}
                onAuthorsChange={setAuthors}
                onPublishersChange={setPublishers}
              />
            )}

            {tab === 'vendas' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="surface-paper rounded-2xl p-8 shadow-warm">
                  <h2 className="font-display text-2xl">Mais vendidos</h2>

                  <ol className="mt-6 space-y-4">
                    {sales?.bestSellers.length === 0 && (
                      <p className="text-sm text-night-700/75">Nenhuma venda registrada ainda.</p>
                    )}

                    {sales?.bestSellers.map((entry, index) => (
                      <li key={entry.title} className="flex items-center gap-4">
                        <span className="font-display text-2xl text-gold-500">{index + 1}</span>
                        <span className="flex-1">
                          <span className="block leading-snug">{entry.title}</span>
                          <span className="text-sm text-night-700/70">
                            {entry.quantity} {entry.quantity === 1 ? 'exemplar' : 'exemplares'}
                          </span>
                        </span>
                        <span className="font-medium text-burgundy-600">{formatPrice(entry.revenue)}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="surface-paper rounded-2xl p-8 shadow-warm">
                  <h2 className="font-display text-2xl">Estoque baixo</h2>
                  <p className="mt-1 text-sm text-night-700/75">Títulos que pedem reposição.</p>

                  <ul className="mt-6 space-y-4">
                    {sales?.lowStock.length === 0 && (
                      <p className="text-sm text-night-700/75">Todas as estantes estão bem servidas.</p>
                    )}

                    {sales?.lowStock.map((entry) => (
                      <li key={entry.id} className="flex items-center gap-4">
                        <img
                          src={entry.coverUrl}
                          alt=""
                          className="h-14 w-10 rounded object-cover shadow-warm"
                          loading="lazy"
                        />
                        <span className="flex-1 leading-snug">{entry.title}</span>
                        <span className="rounded-full bg-burgundy-600/15 px-3 py-1 text-xs text-burgundy-600">
                          {entry.stock} restantes
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="surface-paper overflow-hidden rounded-2xl shadow-warm lg:col-span-2">
                  <h2 className="border-b border-night-800/10 p-8 pb-6 font-display text-2xl">Últimos pedidos</h2>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-2xl text-left text-sm">
                      <thead className="bg-parchment-200/60 text-[0.66rem] uppercase tracking-[0.16em] text-night-700">
                        <tr>
                          <th scope="col" className="px-6 py-4 font-medium">Pedido</th>
                          <th scope="col" className="px-6 py-4 font-medium">Cliente</th>
                          <th scope="col" className="px-6 py-4 font-medium">Data</th>
                          <th scope="col" className="px-6 py-4 font-medium">Status</th>
                          <th scope="col" className="px-6 py-4 text-right font-medium">Total</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-night-800/10">
                        {sales?.orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 font-medium">{order.code}</td>
                            <td className="px-6 py-4 text-night-700">
                              {order.customer.name}
                              <span className="block text-xs text-night-700/65">{order.customer.email}</span>
                            </td>
                            <td className="px-6 py-4 text-night-700">{formatDateTime(order.createdAt)}</td>
                            <td className="px-6 py-4 text-night-700">{ORDER_STATUS_LABELS[order.status]}</td>
                            <td className="px-6 py-4 text-right font-medium">{formatPrice(order.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'chamados' && isSupport && (
              <div>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  {([['', 'Todos'], ['OPEN', 'Abertos'], ['IN_PROGRESS', 'Em atendimento'], ['RESOLVED', 'Resolvidos']] as const).map(
                    ([value, label]) => (
                      <button
                        key={value || 'all'}
                        type="button"
                        onClick={() => setStatusFilter(value as TicketStatus | '')}
                        className={
                          'rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-[0.14em] transition-colors ' +
                          (statusFilter === value
                            ? 'border-gold-400 text-gold-400'
                            : 'border-parchment-200/25 text-parchment-200/70 hover:border-gold-400/60')
                        }
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>

                <div className="space-y-5">
                  {visibleTickets.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-parchment-200/25 p-12 text-center text-parchment-200/70">
                      Nenhum chamado nessa situação.
                    </p>
                  )}

                  {visibleTickets.map((ticket) => (
                    <article key={ticket.id} className="surface-paper rounded-2xl p-6 shadow-warm sm:p-8">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-xl">{ticket.subject}</p>
                          <p className="mt-1 text-sm text-night-700/75">
                            {ticket.code} · {ticket.name} · {ticket.email}
                          </p>
                          <p className="text-sm text-night-700/75">
                            {formatDateTime(ticket.createdAt)} · urgência{' '}
                            {URGENCY_LABELS[ticket.urgency].toLowerCase()}
                          </p>
                        </div>

                        <span
                          className={
                            'rounded-full px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] ' +
                            (TICKET_TONES[ticket.status] ?? 'bg-night-800/10 text-night-700')
                          }
                        >
                          {TICKET_STATUS_LABELS[ticket.status]}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-night-700">{ticket.description}</p>

                      {ticket.resolution && (
                        <div className="mt-5 rounded-xl border-l-4 border-sage-600 bg-sage-400/10 p-5">
                          <p className="text-[0.66rem] uppercase tracking-[0.18em] text-sage-600">
                            Resposta {ticket.handledBy ? '· ' + ticket.handledBy.name : ''}
                            {ticket.resolvedAt ? ' · ' + formatDate(ticket.resolvedAt) : ''}
                          </p>
                          <p className="mt-2 text-sm text-night-800">{ticket.resolution}</p>
                        </div>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3 border-t border-night-800/10 pt-5">
                        {ticket.status === 'OPEN' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateTicket(ticket.id, 'IN_PROGRESS')}
                          >
                            Assumir chamado
                          </Button>
                        )}

                        {ticket.status !== 'RESOLVED' && (
                          <Button size="sm" onClick={() => setResolving(ticket)}>
                            Resolver
                          </Button>
                        )}

                        {ticket.status === 'RESOLVED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateTicket(ticket.id, 'IN_PROGRESS')}
                          >
                            Reabrir
                          </Button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {tab === 'usuarios' && isSupport && (
              <div className="surface-paper overflow-hidden rounded-2xl shadow-book">
                <h2 className="border-b border-night-800/10 p-8 pb-6 font-display text-2xl">
                  Quem frequenta a livraria
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-3xl text-left text-sm">
                    <thead className="bg-parchment-200/60 text-[0.66rem] uppercase tracking-[0.16em] text-night-700">
                      <tr>
                        <th scope="col" className="px-6 py-4 font-medium">Nome</th>
                        <th scope="col" className="px-6 py-4 font-medium">E-mail</th>
                        <th scope="col" className="px-6 py-4 font-medium">Papel</th>
                        <th scope="col" className="px-6 py-4 font-medium">Desde</th>
                        <th scope="col" className="px-6 py-4 text-right font-medium">Pedidos</th>
                        <th scope="col" className="px-6 py-4 text-right font-medium">Avaliações</th>
                        <th scope="col" className="px-6 py-4 text-right font-medium">Chamados</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-night-800/10">
                      {users.map((staffUser) => (
                        <tr key={staffUser.id} className="transition-colors hover:bg-parchment-200/40">
                          <td className="px-6 py-4 font-medium">{staffUser.name}</td>
                          <td className="px-6 py-4 text-night-700">{staffUser.email}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-night-800/10 px-3 py-1 text-xs text-night-700">
                              {ROLE_LABELS[staffUser.role] ?? staffUser.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-night-700">{formatDate(staffUser.createdAt)}</td>
                          <td className="px-6 py-4 text-right">{staffUser.stats.orders}</td>
                          <td className="px-6 py-4 text-right">{staffUser.stats.reviews}</td>
                          <td className="px-6 py-4 text-right">{staffUser.stats.tickets}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <Modal open={editing !== null} onClose={() => setEditing(null)} labelledBy="book-form-title">
        {editing && (
          <form onSubmit={saveBook} className="p-8 sm:p-10" noValidate>
            <h2 id="book-form-title" className="font-display text-3xl text-night-800">
              {editing.book ? 'Editar livro' : 'Novo livro'}
            </h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Input
                label="Título"
                value={editing.form.title}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, title: event.target.value } })
                }
                error={formErrors.title}
                className="sm:col-span-2"
                required
              />

              <Input
                label="ISBN"
                value={editing.form.isbn}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, isbn: event.target.value } })
                }
                error={formErrors.isbn}
                required
              />

              <Input
                label="Gênero"
                value={editing.form.genre}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, genre: event.target.value } })
                }
                error={formErrors.genre}
                required
              />

              <Select
                label="Autor"
                value={editing.form.authorId}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, authorId: event.target.value } })
                }
                error={formErrors.authorId}
                required
              >
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Editora"
                value={editing.form.publisherId}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, publisherId: event.target.value } })
                }
                error={formErrors.publisherId}
                required
              >
                {publishers.map((publisher) => (
                  <option key={publisher.id} value={publisher.id}>
                    {publisher.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Preço (R$)"
                type="number"
                min="0"
                step="0.01"
                value={editing.form.price}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, price: event.target.value } })
                }
                error={formErrors.price}
                required
              />

              <Input
                label="Estoque"
                type="number"
                min="0"
                step="1"
                value={editing.form.stock}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, stock: event.target.value } })
                }
                error={formErrors.stock}
                required
              />

              <Input
                label="Capa"
                value={editing.form.coverUrl}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, coverUrl: event.target.value } })
                }
                error={formErrors.coverUrl}
                hint="Caminho da imagem, por exemplo /img/books/pedra-filosofal.webp"
                required
              />

              <Input
                label="Idioma"
                value={editing.form.language}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, language: event.target.value } })
                }
                error={formErrors.language}
              />

              <Input
                label="Páginas"
                type="number"
                min="1"
                step="1"
                value={editing.form.pages}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, pages: event.target.value } })
                }
                error={formErrors.pages}
              />

              <Input
                label="Publicado em"
                type="date"
                value={editing.form.publishedAt}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, publishedAt: event.target.value } })
                }
                error={formErrors.publishedAt}
              />

              <Textarea
                label="Sinopse"
                value={editing.form.synopsis}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, synopsis: event.target.value } })
                }
                error={formErrors.synopsis}
                className="sm:col-span-2"
                required
              />

              <Textarea
                label="Trecho"
                value={editing.form.excerpt}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, excerpt: event.target.value } })
                }
                error={formErrors.excerpt}
                className="sm:col-span-2"
              />

              <label className="flex items-center gap-3 text-sm text-night-800 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={editing.form.featured}
                  onChange={(event) =>
                    setEditing({ ...editing, form: { ...editing.form, featured: event.target.checked } })
                  }
                  className="h-4 w-4 accent-burgundy-600"
                />
                Destacar na página inicial
              </label>
            </div>

            {formErrors.form && (
              <p className="mt-6 rounded-lg bg-burgundy-600/10 px-4 py-3 text-sm text-burgundy-600" role="alert">
                {formErrors.form}
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                {editing.book ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={resolving !== null} onClose={() => setResolving(null)} labelledBy="resolve-title">
        {resolving && <ResolveForm ticket={resolving} onSubmit={updateTicket} />}
      </Modal>
    </>
  )
}

function ResolveForm({
  ticket,
  onSubmit,
}: {
  ticket: SupportTicket
  onSubmit: (id: string, status: TicketStatus, resolution?: string) => Promise<void>
}) {
  const [resolution, setResolution] = useState(ticket.resolution ?? '')
  const [saving, setSaving] = useState(false)

  return (
    <form
      className="p-8 sm:p-10"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault()
        setSaving(true)
        await onSubmit(ticket.id, 'RESOLVED', resolution)
        setSaving(false)
      }}
    >
      <h2 id="resolve-title" className="font-display text-3xl text-night-800">
        Resolver {ticket.code}
      </h2>
      <p className="mt-2 text-night-700">{ticket.subject}</p>

      <Textarea
        label="O que foi feito"
        value={resolution}
        onChange={(event) => setResolution(event.target.value)}
        className="mt-8"
        placeholder="Explique para o leitor como o problema foi resolvido."
        required
      />

      <div className="mt-8 flex justify-end">
        <Button type="submit" loading={saving}>
          Marcar como resolvido
        </Button>
      </div>
    </form>
  )
}

interface PeopleTabProps {
  authors: Author[]
  publishers: Publisher[]
  canDelete: boolean
  onAuthorsChange: (authors: Author[]) => void
  onPublishersChange: (publishers: Publisher[]) => void
}

function PeopleTab({ authors, publishers, canDelete, onAuthorsChange, onPublishersChange }: PeopleTabProps) {
  const { notify } = useToast()

  const [author, setAuthor] = useState({ name: '', nationality: '' })
  const [publisher, setPublisher] = useState({ name: '', city: '', founded: '' })
  const [savingAuthor, setSavingAuthor] = useState(false)
  const [savingPublisher, setSavingPublisher] = useState(false)

  async function addAuthor(event: FormEvent) {
    event.preventDefault()
    setSavingAuthor(true)

    try {
      await api.admin.createAuthor(author)
      onAuthorsChange(await api.catalog.authors())
      setAuthor({ name: '', nationality: '' })
      notify('Autor cadastrado.')
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'Não foi possível cadastrar.', 'error')
    } finally {
      setSavingAuthor(false)
    }
  }

  async function addPublisher(event: FormEvent) {
    event.preventDefault()
    setSavingPublisher(true)

    try {
      await api.admin.createPublisher({
        name: publisher.name,
        city: publisher.city,
        ...(publisher.founded ? { founded: Number(publisher.founded) } : {}),
      })
      onPublishersChange(await api.catalog.publishers())
      setPublisher({ name: '', city: '', founded: '' })
      notify('Editora cadastrada.')
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'Não foi possível cadastrar.', 'error')
    } finally {
      setSavingPublisher(false)
    }
  }

  async function removeAuthor(target: Author) {
    if (!window.confirm('Apagar o autor ' + target.name + '?')) return

    try {
      await api.admin.deleteAuthor(target.id)
      onAuthorsChange(authors.filter((entry) => entry.id !== target.id))
      notify('Autor apagado.', 'info')
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'Não foi possível apagar.', 'error')
    }
  }

  async function removePublisher(target: Publisher) {
    if (!window.confirm('Apagar a editora ' + target.name + '?')) return

    try {
      await api.admin.deletePublisher(target.id)
      onPublishersChange(publishers.filter((entry) => entry.id !== target.id))
      notify('Editora apagada.', 'info')
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'Não foi possível apagar.', 'error')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="surface-paper rounded-2xl p-8 shadow-warm">
        <h2 className="font-display text-2xl">Autores</h2>

        <ul className="mt-6 divide-y divide-night-800/10">
          {authors.map((entry) => (
            <li key={entry.id} className="flex items-center gap-4 py-3">
              <span className="flex-1">
                <span className="block leading-snug">{entry.name}</span>
                <span className="text-sm text-night-700/70">
                  {entry.nationality} · {entry.bookCount} {entry.bookCount === 1 ? 'livro' : 'livros'}
                </span>
              </span>

              {canDelete && (
                <button
                  type="button"
                  onClick={() => removeAuthor(entry)}
                  aria-label={'Apagar ' + entry.name}
                  className="rounded-full p-2 text-night-700/60 transition hover:bg-burgundy-600/10 hover:text-burgundy-600"
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={addAuthor} className="mt-8 border-t border-night-800/10 pt-6" noValidate>
          <h3 className="font-display text-lg">Cadastrar autor</h3>

          <Input
            label="Nome"
            value={author.name}
            onChange={(event) => setAuthor({ ...author, name: event.target.value })}
            className="mt-4"
            required
          />

          <Input
            label="Nacionalidade"
            value={author.nationality}
            onChange={(event) => setAuthor({ ...author, nationality: event.target.value })}
            className="mt-4"
            required
          />

          <Button type="submit" size="sm" loading={savingAuthor} className="mt-6">
            <Plus size={15} aria-hidden />
            Cadastrar
          </Button>
        </form>
      </div>

      <div className="surface-paper rounded-2xl p-8 shadow-warm">
        <h2 className="font-display text-2xl">Editoras</h2>

        <ul className="mt-6 divide-y divide-night-800/10">
          {publishers.map((entry) => (
            <li key={entry.id} className="flex items-center gap-4 py-3">
              <span className="flex-1">
                <span className="block leading-snug">{entry.name}</span>
                <span className="text-sm text-night-700/70">
                  {entry.city}
                  {entry.founded ? ' · desde ' + entry.founded : ''} · {entry.bookCount}{' '}
                  {entry.bookCount === 1 ? 'livro' : 'livros'}
                </span>
              </span>

              {canDelete && (
                <button
                  type="button"
                  onClick={() => removePublisher(entry)}
                  aria-label={'Apagar ' + entry.name}
                  className="rounded-full p-2 text-night-700/60 transition hover:bg-burgundy-600/10 hover:text-burgundy-600"
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={addPublisher} className="mt-8 border-t border-night-800/10 pt-6" noValidate>
          <h3 className="font-display text-lg">Cadastrar editora</h3>

          <Input
            label="Nome"
            value={publisher.name}
            onChange={(event) => setPublisher({ ...publisher, name: event.target.value })}
            className="mt-4"
            required
          />

          <Input
            label="Cidade"
            value={publisher.city}
            onChange={(event) => setPublisher({ ...publisher, city: event.target.value })}
            className="mt-4"
            required
          />

          <Input
            label="Fundada em"
            type="number"
            min="1400"
            max={String(new Date().getFullYear())}
            value={publisher.founded}
            onChange={(event) => setPublisher({ ...publisher, founded: event.target.value })}
            className="mt-4"
          />

          <Button type="submit" size="sm" loading={savingPublisher} className="mt-6">
            <Plus size={15} aria-hidden />
            Cadastrar
          </Button>
        </form>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-parchment-200/15 bg-parchment-200/5 p-6">
      <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-parchment-200/65">{label}</dt>
      <dd className="mt-2 font-display text-3xl text-gold-400">{value}</dd>
    </div>
  )
}
