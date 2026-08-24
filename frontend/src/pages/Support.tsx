import { motion } from 'framer-motion'
import { CheckCircle2, LifeBuoy, Send } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError, api } from '../lib/api'
import { formatDateTime, TICKET_STATUS_LABELS, URGENCY_LABELS } from '../lib/format'
import type { SupportTicket, TicketUrgency } from '../types/api'

const FAQ = [
  {
    question: 'Quanto tempo demora a entrega?',
    answer:
      'De 3 a 8 dias úteis, dependendo da região. Pedidos acima de R$ 250 saem com frete por nossa conta.',
  },
  {
    question: 'Posso trocar um livro que chegou danificado?',
    answer:
      'Pode. Abra um chamado com o código do pedido e uma foto do livro; a troca é feita sem custo em até 7 dias.',
  },
  {
    question: 'Como avalio um livro que comprei?',
    answer:
      'Na página do livro, escolha de 1 a 5 estrelas e escreva o que achou. Quem comprou aqui ganha o selo de compra verificada.',
  },
  {
    question: 'Como acompanho meu chamado?',
    answer: 'Estando logado, os seus chamados aparecem aqui nesta página com o status atualizado pelo suporte.',
  },
]

const STATUS_TONES: Record<string, string> = {
  OPEN: 'bg-ember-600/20 text-ember-400',
  IN_PROGRESS: 'bg-house-accent/20 text-house-accent',
  RESOLVED: 'bg-mandrake-600/20 text-mandrake-400',
}

export default function Support() {
  const { user } = useAuth()
  const { notify } = useToast()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    subject: '',
    description: '',
    urgency: 'MEDIUM' as TicketUrgency,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<SupportTicket | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])

  useEffect(() => {
    if (!user) {
      setTickets([])
      return
    }

    setForm((current) => ({ ...current, name: current.name || user.name, email: current.email || user.email }))
    api.support.mine().then(setTickets).catch(() => undefined)
  }, [user])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})
    setSending(true)

    try {
      const ticket = await api.support.createTicket(form)

      setSent(ticket)
      setForm({ ...form, subject: '', description: '', urgency: 'MEDIUM' })
      notify('Chamado ' + ticket.code + ' aberto. Vamos responder em breve!')

      if (user) setTickets(await api.support.mine())
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.issues) {
          setErrors(
            Object.fromEntries(Object.entries(error.issues).map(([field, messages]) => [field, messages[0]])),
          )
        }
        notify(error.message, 'error')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <header className="relative overflow-hidden pb-16 pt-40">
        <img
          src="/img/scenes/poltrona.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/85 to-stone-900" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <p className="eyebrow mb-4">Central de ajuda</p>
          <h1 className="font-display text-5xl text-chalk-50 sm:text-6xl">Relatar um problema</h1>
          <p className="mt-5 max-w-2xl text-chalk-200/80">
            Pedido atrasado, livro danificado, dúvida sobre uma edição: abra um chamado e acompanhe a resposta
            por aqui mesmo.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.2fr_1fr] lg:px-10">
        <form onSubmit={handleSubmit} className="surface-paper rounded-2xl p-8 shadow-book lg:p-10" noValidate>
          <h2 className="mb-6 flex items-center gap-2 font-display text-2xl">
            <LifeBuoy size={20} className="text-house-deep" aria-hidden />
            Abrir chamado
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Seu nome"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              error={errors.name}
              autoComplete="name"
              required
            />
            <Input
              label="Seu e-mail"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              error={errors.email}
              autoComplete="email"
              required
            />
          </div>

          <Input
            label="Assunto"
            value={form.subject}
            onChange={(event) => setForm({ ...form, subject: event.target.value })}
            error={errors.subject}
            placeholder="Resuma em poucas palavras"
            className="mt-5"
            required
          />

          <Select
            label="Urgência"
            value={form.urgency}
            onChange={(event) => setForm({ ...form, urgency: event.target.value as TicketUrgency })}
            className="mt-5"
          >
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
          </Select>

          <Textarea
            label="O que aconteceu?"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            error={errors.description}
            placeholder="Conte com detalhes: número do pedido, título do livro, o que deu errado…"
            className="mt-5"
            required
          />

          <Button type="submit" size="lg" loading={sending} className="mt-8">
            <Send size={16} aria-hidden />
            Enviar chamado
          </Button>

          {sent && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center gap-2 text-sm text-mandrake-600"
              role="status"
            >
              <CheckCircle2 size={16} aria-hidden />
              Chamado <strong>{sent.code}</strong> registrado. Guarde este número.
            </motion.p>
          )}
        </form>

        <aside className="space-y-6">
          {user && (
            <div className="rounded-2xl border border-chalk-100/10 bg-stone-800/70 p-7">
              <p className="eyebrow mb-5">Meus chamados</p>

              {tickets.length === 0 ? (
                <p className="text-sm text-chalk-200/70">Você ainda não abriu nenhum chamado.</p>
              ) : (
                <ul className="space-y-4">
                  {tickets.map((ticket) => (
                    <li key={ticket.id} className="border-l-2 border-chalk-100/15 pl-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-chalk-50">{ticket.code}</span>
                        <span
                          className={
                            'rounded-full px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.14em] ' +
                            STATUS_TONES[ticket.status]
                          }
                        >
                          {TICKET_STATUS_LABELS[ticket.status]}
                        </span>
                        <span className="ml-auto text-[0.65rem] text-chalk-300/50">
                          {formatDateTime(ticket.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm text-chalk-100">{ticket.subject}</p>
                      <p className="text-xs text-chalk-300/60">
                        Urgência {URGENCY_LABELS[ticket.urgency].toLowerCase()}
                      </p>

                      {ticket.resolution && (
                        <p className="mt-2 rounded-lg bg-mandrake-600/10 px-3 py-2 text-xs text-mandrake-400">
                          {ticket.resolution}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-chalk-100/10 bg-stone-800/70 p-7">
            <p className="eyebrow mb-5">Perguntas frequentes</p>

            <dl className="space-y-5">
              {FAQ.map((item) => (
                <div key={item.question}>
                  <dt className="font-display text-chalk-50">{item.question}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-chalk-200/70">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </section>
    </>
  )
}
