import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { HouseProvider } from '../context/HouseContext'
import { SettingsProvider } from '../context/SettingsContext'
import { ToastProvider } from '../context/ToastContext'
import Catalog from '../pages/Catalog'
import type { Book, Department } from '../types/api'

function makeBook(overrides: Partial<Book> & { id: string; slug: string; title: string }): Book {
  return {
    kind: 'BOOK',
    isbn: '9788532511000',
    price: 300,
    compareAtPrice: null,
    discount: 0,
    stock: 6,
    genre: 'Fantasia',
    synopsis: 'Mais um ano letivo em Hogwarts.',
    excerpt: null,
    coverUrl: '/img/books/x.webp',
    pages: 300,
    language: 'Português',
    featured: false,
    publishedAt: '1998-07-02',
    department: 'livros',
    brand: 'Rocco',
    house: null,
    character: null,
    tags: [],
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
  makeBook({
    id: '3',
    slug: 'varinha-de-harry-potter',
    title: 'Varinha de Harry Potter',
    kind: 'WAND',
    department: 'varinhas',
    genre: 'Varinha',
    brand: 'Noble Collection',
    house: 'grifinoria',
    isbn: null,
    author: null,
    publisher: null,
    price: 249.9,
    compareAtPrice: 299.9,
    discount: 17,
  }),
]

const departments: Department[] = [
  { slug: 'livros', name: 'Livros', tagline: 'A saga e as edições.', kinds: ['BOOK'], count: 2, minPrice: 200, maxPrice: 900 },
  { slug: 'varinhas', name: 'Varinhas', tagline: 'Réplicas em caixa.', kinds: ['WAND'], count: 1, minPrice: 249.9, maxPrice: 249.9 },
]

/**
 * O catálogo agora filtra no servidor: a página manda os parâmetros e recebe a
 * lista pronta. O dublê imita esse contrato e filtra pelos mesmos campos que a
 * API filtra, em vez de devolver sempre tudo, senão o teste passaria mesmo com
 * a página deixando de mandar o filtro.
 */
const listBooks = vi.fn(async (filters: Record<string, unknown> = {}) => {
  let result = books

  if (filters.department) result = result.filter((book) => book.department === filters.department)
  if (filters.house) result = result.filter((book) => book.house === filters.house)

  if (filters.search) {
    const term = String(filters.search).toLowerCase()
    result = result.filter(
      (book) => book.title.toLowerCase().includes(term) || (book.isbn ?? '').includes(term),
    )
  }

  return result
})

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')

  return {
    ...actual,
    api: {
      catalog: {
        books: (filters: Record<string, unknown>) => listBooks(filters),
        departments: vi.fn(async () => departments),
        brands: vi.fn(async () => [
          { brand: 'Rocco', count: 2 },
          { brand: 'Noble Collection', count: 1 },
        ]),
        genres: vi.fn(async () => [
          { genre: 'Fantasia', count: 2 },
          { genre: 'Varinha', count: 1 },
        ]),
        authors: vi.fn(async () => []),
        publishers: vi.fn(async () => []),
      },
      auth: { me: vi.fn(async () => null) },
      cart: { get: vi.fn(async () => null) },
    },
  }
})

function renderCatalog(entry = '/catalogo') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <SettingsProvider>
        <HouseProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <Catalog />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </HouseProvider>
      </SettingsProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  listBooks.mockClear()
})

describe('Catalog page', () => {
  it('lists every product returned by the API', async () => {
    renderCatalog()

    await waitFor(() => expect(screen.getByText('Harry Potter e a Pedra Filosofal')).toBeInTheDocument())
    expect(screen.getByText('Harry Potter e a Câmara Secreta')).toBeInTheDocument()
    expect(screen.getByText('Varinha de Harry Potter')).toBeInTheDocument()
    expect(screen.getByText('3 produtos')).toBeInTheDocument()
  })

  it('shows the aisle navigation with a count per department', async () => {
    renderCatalog()

    // Cada corredor aparece duas vezes de propósito: na aba do topo e na coluna
    // de facetas. As duas comandam o mesmo parâmetro da URL.
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Livros/ })).toHaveLength(2))
    expect(screen.getAllByRole('button', { name: /Varinhas/ })).toHaveLength(2)
  })

  it('sends the department filter to the API and marks it as a removable chip', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await waitFor(() => expect(screen.getByText('Varinha de Harry Potter')).toBeInTheDocument())

    // O corredor está numa aba e na coluna de facetas; a aba é a do topo.
    await user.click(screen.getAllByRole('button', { name: /Varinhas/ })[0])

    await waitFor(() => expect(listBooks).toHaveBeenCalledWith(expect.objectContaining({ department: 'varinhas' })))
    await waitFor(() => expect(screen.getByText('1 produto')).toBeInTheDocument())

    // Com o filtro em vigor há três controles com esse nome: a aba, a faceta e
    // a etiqueta removível, que é a novidade e é o que desfaz a condição.
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Varinhas/ })).toHaveLength(3))

    const chip = screen.getAllByRole('button', { name: /Varinhas/ })[2]
    await user.click(chip)

    await waitFor(() => expect(screen.getByText('3 produtos')).toBeInTheDocument())
  })

  it('starts already filtered when the department comes in the URL', async () => {
    renderCatalog('/catalogo?departamento=livros')

    await waitFor(() => expect(listBooks).toHaveBeenCalledWith(expect.objectContaining({ department: 'livros' })))
    await waitFor(() => expect(screen.getByText('2 produtos')).toBeInTheDocument())
    expect(screen.queryByText('Varinha de Harry Potter')).not.toBeInTheDocument()
  })

  it('searches on the server after the visitor stops typing', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await waitFor(() => expect(screen.getByText('Harry Potter e a Pedra Filosofal')).toBeInTheDocument())

    await user.type(screen.getByLabelText('Buscar na loja'), 'câmara')

    await waitFor(
      () => expect(listBooks).toHaveBeenCalledWith(expect.objectContaining({ search: 'câmara' })),
      { timeout: 2000 },
    )

    await waitFor(() => expect(screen.getByText('1 produto')).toBeInTheDocument())
    expect(screen.getByText('Harry Potter e a Câmara Secreta')).toBeInTheDocument()
  })

  it('finds a product by its ISBN, like the old consultalivros', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await waitFor(() => expect(screen.getByText('Harry Potter e a Pedra Filosofal')).toBeInTheDocument())

    await user.type(screen.getByLabelText('Buscar na loja'), '9788532511010')

    await waitFor(() => expect(screen.getByText('1 produto')).toBeInTheDocument(), { timeout: 2000 })
  })

  it('shows a friendly message when nothing matches', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await waitFor(() => expect(screen.getByText('Harry Potter e a Pedra Filosofal')).toBeInTheDocument())

    await user.type(screen.getByLabelText('Buscar na loja'), 'senhor dos anéis')

    await waitFor(() => expect(screen.getByText(/nenhum produto com esse feitiço/i)).toBeInTheDocument(), {
      timeout: 2000,
    })
  })

  it('shows the facets open, with brand and house, without a click', async () => {
    renderCatalog()

    await waitFor(() => expect(screen.getByText('Harry Potter e a Pedra Filosofal')).toBeInTheDocument())

    // Marca e casa ficam à mostra na coluna: filtro escondido é filtro que
    // ninguém usa, e foi por isso que a gaveta antiga saiu.
    expect(screen.getAllByRole('button', { name: /Noble Collection/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Grifinória' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('option', { name: 'Varinha (1)' })).toBeInTheDocument()
  })

  it('shows the list price struck through when there is a discount', async () => {
    renderCatalog()

    await waitFor(() => expect(screen.getByText('Varinha de Harry Potter')).toBeInTheDocument())

    // O desconto vem escrito, não só em cor: a etiqueta traz a porcentagem.
    expect(screen.getByText('−17%')).toBeInTheDocument()
  })
})
