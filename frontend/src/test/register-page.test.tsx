import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
import Register from '../pages/Register'

const registerCall = vi.fn(async () => ({
  token: 'jwt-de-teste',
  user: { id: 'u1', name: 'Nova Pessoa', email: 'nova@example.com', role: 'CUSTOMER' },
}))

const meCall = vi.fn(async () => ({
  id: 'u1',
  name: 'Nova Pessoa',
  email: 'nova@example.com',
  role: 'CUSTOMER',
  avatarUrl: null,
  memberSince: '2026-08-19T00:00:00.000Z',
  stats: { orders: 0, reviews: 0, tickets: 0, booksBought: 0, totalSpent: 0 },
}))

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')

  return {
    ...actual,
    api: {
      auth: {
        register: (...args: unknown[]) => registerCall(...(args as [])),
        me: () => meCall(),
      },
    },
  }
})

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <ToastProvider>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  registerCall.mockClear()
  meCall.mockClear()
})

describe('Register page', () => {
  it('offers the three doors of the old menu_registrar', () => {
    renderRegister()

    expect(screen.getByRole('radio', { name: /leitor/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /fornecedor/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /suporte/i })).toBeInTheDocument()
  })

  it('registers a reader with the default role', async () => {
    renderRegister()

    await userEvent.type(screen.getByLabelText(/seu nome completo/i), 'Nova Pessoa')
    await userEvent.type(screen.getByLabelText(/seu e-mail/i), 'nova@example.com')
    await userEvent.type(screen.getByLabelText(/^senha$/i), 'libraryspotter')
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() =>
      expect(registerCall).toHaveBeenCalledWith({
        name: 'Nova Pessoa',
        email: 'nova@example.com',
        password: 'libraryspotter',
        role: 'CUSTOMER',
      }),
    )
  })

  it('sends the chosen role when the visitor signs up as a supplier', async () => {
    renderRegister()

    await userEvent.click(screen.getByRole('radio', { name: /fornecedor/i }))

    await userEvent.type(screen.getByLabelText(/seu nome completo/i), 'Japa Livros')
    await userEvent.type(screen.getByLabelText(/seu e-mail/i), 'japa@example.com')
    await userEvent.type(screen.getByLabelText(/^senha$/i), 'libraryspotter')
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() =>
      expect(registerCall).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'SUPPLIER', email: 'japa@example.com' }),
      ),
    )
  })

  it('shows the server complaint when the e-mail is already taken', async () => {
    const { ApiError } = await import('../lib/api')

    registerCall.mockRejectedValueOnce(new ApiError('Esse e-mail já está cadastrado.', 409))

    renderRegister()

    await userEvent.type(screen.getByLabelText(/seu nome completo/i), 'Nova Pessoa')
    await userEvent.type(screen.getByLabelText(/seu e-mail/i), 'agostinhocarrara@gmail.com')
    await userEvent.type(screen.getByLabelText(/^senha$/i), 'libraryspotter')
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/já está cadastrado/i))
  })
})
