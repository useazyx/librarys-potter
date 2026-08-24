import { motion } from 'framer-motion'
import { BookOpen, LifeBuoy, Truck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type { Role } from '../types/api'

/** The three doors of the old menu_registrar.html, now a single form. */
const ROLES: Array<{ id: Role; label: string; description: string; icon: typeof BookOpen }> = [
  {
    id: 'CUSTOMER',
    label: 'Leitor',
    description: 'Comprar livros, avaliar leituras e acompanhar pedidos.',
    icon: BookOpen,
  },
  {
    id: 'SUPPLIER',
    label: 'Fornecedor',
    description: 'Cuidar do catálogo, do estoque e ver o relatório de vendas.',
    icon: Truck,
  },
  {
    id: 'SUPPORT',
    label: 'Suporte',
    description: 'Atender a fila de chamados e administrar os registros da loja.',
    icon: LifeBuoy,
  },
]

const WELCOME: Record<Role, string> = {
  CUSTOMER: 'Sua carteirinha está pronta. Boas leituras!',
  SUPPLIER: 'Conta de fornecedor criada. O catálogo espera por você.',
  SUPPORT: 'Conta de suporte criada. A fila de chamados já está no seu painel.',
}

export default function Register() {
  const { register } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [role, setRole] = useState<Role>('CUSTOMER')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      await register({ ...form, role })

      notify(WELCOME[role])
      navigate(role === 'CUSTOMER' ? '/perfil' : '/painel', { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError) {
        if (caught.issues) {
          setErrors(
            Object.fromEntries(Object.entries(caught.issues).map(([field, messages]) => [field, messages[0]])),
          )
        } else {
          setErrors({ form: caught.message })
        }
      } else {
        setErrors({ form: 'Não conseguimos criar sua conta agora.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Crie a sua conta"
      subtitle="Escolha por qual porta você entra na livraria."
      image="/img/scenes/arcos.webp"
    >
      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend className="mb-3 block text-[0.7rem] font-medium uppercase tracking-[0.22em] text-night-700">
            Eu quero entrar como
          </legend>

          <div className="grid gap-3">
            {ROLES.map((option) => {
              const Icon = option.icon
              const selected = role === option.id

              return (
                <label
                  key={option.id}
                  className={
                    'relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-300 ' +
                    (selected
                      ? 'border-burgundy-600 bg-burgundy-600/5'
                      : 'border-night-800/15 hover:border-burgundy-500/60')
                  }
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.id}
                    checked={selected}
                    onChange={() => setRole(option.id)}
                    className="sr-only"
                  />

                  <span
                    className={
                      'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-300 ' +
                      (selected ? 'bg-burgundy-600 text-parchment-50' : 'bg-night-800/10 text-night-700')
                    }
                  >
                    <Icon size={17} aria-hidden />
                  </span>

                  <span>
                    <span className="block font-display text-lg text-night-800">{option.label}</span>
                    <span className="block text-sm leading-snug text-night-700/80">{option.description}</span>
                  </span>

                  {selected && (
                    <motion.span
                      layoutId="register-role"
                      className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-burgundy-600"
                      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                      aria-hidden
                    />
                  )}
                </label>
              )
            })}
          </div>
        </fieldset>

        <Input
          label="Seu nome completo"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          error={errors.name}
          autoComplete="name"
          className="mt-6"
          required
        />

        <Input
          label="Seu e-mail"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          error={errors.email}
          autoComplete="email"
          className="mt-5"
          required
        />

        <Input
          label="Senha"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          error={errors.password}
          hint="Pelo menos 8 caracteres."
          autoComplete="new-password"
          className="mt-5"
          required
        />

        {errors.form && (
          <p className="mt-5 rounded-lg bg-burgundy-600/10 px-4 py-3 text-sm text-burgundy-600" role="alert">
            {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading} className="mt-8 w-full">
          Criar conta
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-night-700">
        Já tem conta?{' '}
        <Link to="/login" className="link-underline text-burgundy-600">
          Faça login
        </Link>
      </p>
    </AuthLayout>
  )
}
