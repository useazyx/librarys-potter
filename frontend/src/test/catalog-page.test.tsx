import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { ToastProvider } from '../context/ToastContext'
import Catalog from '../pages/Catalog'
import type { Author, Book, Publisher } from '../types/api'

function makeBook(overrides: Partial<Book> & { id: string; slug: string; title: string }): Book {
  return {
    isbn: '9788532511000',
    price: 300,
    stock: 6,
    genre: 'Fantasia',
    synopsis: 'Mais um ano letivo em Hogwarts.',
    excerpt: null,
    coverUrl: '/img/books/x.webp',
    pages: 300,
    language: 'Português',
    featured: false,
    publishedAt: '1998-07-02',
    author: { id: 'a1', slug: 'j-k-rowling', name: 'J. K. Rowling', nationality: 'Britânica' },
    publisher: { id: 'p1', slug: 'rocco', name: 'Rocco', city: 'Rio de Janeiro' },
    rating: { average: 4, count: 1 },
    ...overrides,
  }
}

const books = [
  makeBook({
    id: '1',
    slug: 'pedra-filosofal',
    title: 'Harry Potter e a Pedra Filosofal',
    isbn: '9788532511010',
    price: 200,
    featured: true,
  }),
  makeBook({
    id: '2',
    slug: 'camara-secreta',
    title: 'Harry Potter e a Câmara Secreta',
    isbn: '9788532511027',
    price: 900,
    stock: 0,
  }),
]

const authors: Author[] = [
  { id: 'a1', slug: 'j-k-rowling', name: 'J. K. Rowling', nationality: 'Britânica', bookCount: 2 },
]

const publishers: Publisher[] = [
  { id: 'p1', slug: 'rocco', name: 'Rocco', city: 'Rio de Janeiro', founded: 1975, bookCount: 2 },
]

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')

  return {
    ...actual,
    api: {
      catalog: {
        books: vi.fn(async () => books),
        authors: vi.fn(async () => authors),
        publishers: vi.fn(async () => publishers),
        genres: vi.fn(async () => [{ genre: 'Fantasia', count: 2 }]),
      },
      auth: { me: vi.fn(async () => null) },
      cart: { get: vi.fn(async () => null) },
    },
  }
})

function renderCatalog() {
  return render(
    <MemoryRouter initialEntries={['/catalogo']}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Catalog />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('Catalog page', () => {
  it('lists every book returned by the API', async () => {
    renderCatalog()

    await waitFor(() =>
      expect(screen.getByText('Harry Potter e a Pedra Filosofal')).toBeInTheDocument(),
    )
    expect(screen.getByText('Harry Potter e a Câmara Secreta')).toBeInTheDocument()
    expect(screen.getByText('2 livros')).toBeInTheDocument()
  })

  it('filters as the visitor types', async () => {
    renderCatalog()

    await waitFor(() =>
      expect(screen.getByText('Harry Potter e a Pedra Filosofal')).toBeInTheDocument(),
    )

    await userEvent.type(screen.getByLabelText('Buscar no catálogo'), 'câmara')

    await waitFor(() =>
      expect(screen.queryByText('Harry Potter e a Pedra Filosofal')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Harry Potter e a Câmara Secreta')).toBeInTheDocument()
    expect(screen.getByText('1 livro')).toBeInTheDocument()
  })

  it('finds a book by its ISBN, like the old consultalivros', async () => {
    renderCatalog()

    await waitFor(() =>
      expect(screen.getByText('Harry Potter e a Pedra Filosofal')).toBeInTheDocument(),
    )

    await userEvent.type(screen.getByLabelText('Buscar no catálogo'), '9788532511010')

    await waitFor(() => expect(screen.getByText('1 livro')).toBeInTheDocument())
  })

  it('shows a friendly message when nothing matches', async () => {
    renderCatalog()

    await waitFor(() =>
      expect(screen.getByText('Harry Potter e a Pedra Filosofal')).toBeInTheDocument(),
    )

    await userEvent.type(screen.getByLabelText('Buscar no catálogo'), 'senhor dos anéis')

    await waitFor(() => expect(screen.getByText(/nenhum livro com esse feitiço/i)).toBeInTheDocument())
  })

  it('opens the filter drawer with the authors and publishers from the API', async () => {
    renderCatalog()

    await waitFor(() =>
      expect(screen.getByText('Harry Potter e a Pedra Filosofal')).toBeInTheDocument(),
    )

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))

    await waitFor(() => expect(screen.getByRole('option', { name: 'J. K. Rowling' })).toBeInTheDocument())
    expect(screen.getByRole('option', { name: 'Rocco' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Fantasia (2)' })).toBeInTheDocument()
  })
})
