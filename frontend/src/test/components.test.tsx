import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { BookCard } from '../components/catalog/BookCard'
import { Modal } from '../components/ui/Modal'
import { StarPicker, Stars } from '../components/ui/Stars'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { ToastProvider } from '../context/ToastContext'
import { ORDER_STATUS_LABELS, ROLE_LABELS, formatPrice } from '../lib/format'
import type { Book } from '../types/api'

const book: Book = {
  id: 'b3f1c2d4-0000-4000-8000-000000000001',
  slug: 'harry-potter-e-a-pedra-filosofal',
  title: 'Harry Potter e a Pedra Filosofal',
  kind: 'BOOK',
  isbn: '9788532511010',
  price: 200,
  stock: 4,
  genre: 'Fantasia',
  synopsis: 'O menino que sobreviveu descobre, aos onze anos, que é um bruxo.',
  excerpt: null,
  coverUrl: '/img/books/pedra-filosofal.webp',
  pages: 264,
  language: 'Português',
  featured: true,
  publishedAt: '1997-06-26',
  author: { id: 'a1', slug: 'j-k-rowling', name: 'J. K. Rowling', nationality: 'Britânica' },
  publisher: { id: 'p1', slug: 'rocco', name: 'Rocco', city: 'Rio de Janeiro' },
  rating: { average: 4.5, count: 2 },
}

function renderWithProviders(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>{ui}</CartProvider>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('formatters', () => {
  it('formats prices in brazilian currency', () => {
    // The separator before the value is a non-breaking space in pt-BR.
    expect(formatPrice(200).replace(/ /g, ' ')).toBe('R$ 200,00')
  })

  it('translates the roles and order statuses inherited from the old site', () => {
    expect(ROLE_LABELS.CUSTOMER).toBe('Leitor')
    expect(ROLE_LABELS.SUPPLIER).toBe('Fornecedor')
    expect(ROLE_LABELS.SUPPORT).toBe('Suporte')
    expect(ORDER_STATUS_LABELS.CANCELLED).toBe('Cancelado')
  })
})

describe('Stars', () => {
  it('announces the average instead of drawing five silent icons', () => {
    render(<Stars value={4.5} />)

    expect(screen.getByRole('img', { name: '4,5 de 5 estrelas' })).toBeInTheDocument()
  })

  it('lets the reader pick a rating with the keyboard-reachable radios', async () => {
    const onChange = vi.fn()
    render(<StarPicker value={0} onChange={onChange} />)

    await userEvent.click(screen.getByRole('radio', { name: '4 estrelas' }))

    expect(onChange).toHaveBeenCalledWith(4)
  })
})

describe('BookCard', () => {
  it('shows the cover, the price and the buy button', () => {
    renderWithProviders(<BookCard book={book} />)

    expect(screen.getByRole('heading', { name: book.title })).toBeInTheDocument()
    expect(screen.getByAltText('Capa de ' + book.title)).toBeInTheDocument()
    expect(screen.getByText(/200,00/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comprar/i })).toBeEnabled()
  })

  it('warns that the shelf is running low and marks the featured title', () => {
    renderWithProviders(<BookCard book={book} />)

    expect(screen.getByText(/últimos 4/i)).toBeInTheDocument()
    expect(screen.getByText('Destaque')).toBeInTheDocument()
  })

  it('disables the button when the last copy is gone', () => {
    renderWithProviders(<BookCard book={{ ...book, stock: 0 }} />)

    expect(screen.getByRole('button', { name: /esgotado/i })).toBeDisabled()
    expect(screen.getByText('Esgotado', { selector: 'span' })).toBeInTheDocument()
  })

  it('sends a visitor without an account to the login before touching the cart', async () => {
    renderWithProviders(<BookCard book={book} />)

    await userEvent.click(screen.getByRole('button', { name: /comprar/i }))

    await waitFor(() => expect(screen.getByText(/entre na sua conta/i)).toBeInTheDocument())
  })
})

describe('Modal', () => {
  it('exposes a dialog and closes on Escape', async () => {
    const onClose = vi.fn()

    render(
      <Modal open onClose={onClose}>
        <p>Ficha do livro</p>
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')

    await userEvent.keyboard('{Escape}')

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('renders nothing while closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>Invisível</p>
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
