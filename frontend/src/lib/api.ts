import type {
  ProductKind,
  Author,
  Book,
  BookDetail,
  Cart,
  MyReview,
  Order,
  Profile,
  Publisher,
  Role,
  SalesReport,
  StaffUser,
  SupportTicket,
  TicketStatus,
  TicketUrgency,
} from '../types/api'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_KEY = 'librarys-potter:token'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly issues?: Record<string, string[]>

  constructor(message: string, status: number, code?: string, issues?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.issues = issues
  }

  /** First validation message for a field, ready to sit under an input. */
  issueFor(field: string): string | undefined {
    return this.issues?.[field]?.[0]
  }
}

export const tokenStorage = {
  get: () => (typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = tokenStorage.get()

  const response = await fetch(BASE_URL + path, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: 'include',
    signal: options.signal,
  })

  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(
      payload.error ?? 'A coruja não conseguiu entregar o recado. Tente novamente.',
      response.status,
      payload.code,
      payload.issues,
    )
  }

  return payload as T
}

export type BookFilters = {
  search?: string
  kind?: ProductKind
  genre?: string
  author?: string
  publisher?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  inStock?: boolean
  sort?: 'relevance' | 'price-asc' | 'price-desc' | 'title' | 'newest' | 'rating'
}

function toQuery(filters: Record<string, unknown>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }

  const query = params.toString()
  return query ? '?' + query : ''
}

export const api = {
  catalog: {
    books: (filters: BookFilters = {}, signal?: AbortSignal) =>
      request<{ books: Book[] }>('/catalog/books' + toQuery(filters), { signal }).then((r) => r.books),
    book: (slug: string) => request<{ book: BookDetail }>('/catalog/books/' + slug).then((r) => r.book),
    authors: () => request<{ authors: Author[] }>('/catalog/authors').then((r) => r.authors),
    publishers: () => request<{ publishers: Publisher[] }>('/catalog/publishers').then((r) => r.publishers),
    genres: () =>
      request<{ genres: Array<{ genre: string; count: number }> }>('/catalog/genres').then((r) => r.genres),
  },

  auth: {
    register: (body: { name: string; email: string; password: string; role?: Role }) =>
      request<{ user: Profile; token: string }>('/auth/register', { method: 'POST', body }),
    login: (body: { email: string; password: string }) =>
      request<{ user: Profile; token: string }>('/auth/login', { method: 'POST', body }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    me: () => request<{ user: Profile }>('/auth/me').then((r) => r.user),
    forgotPassword: (email: string) =>
      request<{ message: string; token?: string | null }>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      }),
    resetPassword: (body: { token: string; password: string }) =>
      request<{ success: boolean }>('/auth/reset-password', { method: 'POST', body }),
  },

  cart: {
    get: () => request<{ cart: Cart }>('/cart').then((r) => r.cart),
    add: (bookId: string, quantity = 1) =>
      request<{ cart: Cart }>('/cart/items', { method: 'POST', body: { bookId, quantity } }).then((r) => r.cart),
    update: (itemId: string, quantity: number) =>
      request<{ cart: Cart }>('/cart/items/' + itemId, { method: 'PATCH', body: { quantity } }).then(
        (r) => r.cart,
      ),
    remove: (itemId: string) =>
      request<{ cart: Cart }>('/cart/items/' + itemId, { method: 'DELETE' }).then((r) => r.cart),
    clear: () => request<{ cart: Cart }>('/cart', { method: 'DELETE' }).then((r) => r.cart),
  },

  orders: {
    create: (body: { recipient: string; address: string; city: string; state: string; zipCode: string }) =>
      request<{ order: Order }>('/orders', { method: 'POST', body }).then((r) => r.order),
    list: () => request<{ orders: Order[] }>('/orders').then((r) => r.orders),
    get: (id: string) => request<{ order: Order }>('/orders/' + id).then((r) => r.order),
    cancel: (id: string) =>
      request<{ order: Order }>('/orders/' + id + '/cancel', { method: 'PATCH' }).then((r) => r.order),
  },

  reviews: {
    upsert: (slug: string, body: { rating: number; comment?: string }) =>
      request<{ review: unknown }>('/reviews/books/' + slug, { method: 'POST', body }),
    mine: () => request<{ reviews: MyReview[] }>('/reviews/me').then((r) => r.reviews),
    remove: (id: string) => request<void>('/reviews/' + id, { method: 'DELETE' }),
  },

  support: {
    createTicket: (body: {
      name: string
      email: string
      subject: string
      description: string
      urgency: TicketUrgency
    }) => request<{ ticket: SupportTicket }>('/support/tickets', { method: 'POST', body }).then((r) => r.ticket),
    mine: () => request<{ tickets: SupportTicket[] }>('/support/tickets/me').then((r) => r.tickets),
    queue: (filters: { status?: TicketStatus; urgency?: TicketUrgency } = {}) =>
      request<{ tickets: SupportTicket[] }>('/support/tickets' + toQuery(filters)).then((r) => r.tickets),
    summary: () =>
      request<{ summary: { open: number; inProgress: number; resolved: number; total: number } }>(
        '/support/summary',
      ).then((r) => r.summary),
    update: (id: string, body: { status: TicketStatus; resolution?: string }) =>
      request<{ ticket: SupportTicket }>('/support/tickets/' + id, { method: 'PATCH', body }).then(
        (r) => r.ticket,
      ),
  },

  profile: {
    get: () => request<{ profile: Profile }>('/profile').then((r) => r.profile),
    update: (body: { name?: string }) =>
      request<{ profile: Profile }>('/profile', { method: 'PATCH', body }).then((r) => r.profile),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      request<{ success: boolean }>('/profile/password', { method: 'PATCH', body }),
  },

  admin: {
    createBook: (body: Record<string, unknown>) =>
      request<{ book: Book }>('/admin/books', { method: 'POST', body }).then((r) => r.book),
    updateBook: (id: string, body: Record<string, unknown>) =>
      request<{ book: Book }>('/admin/books/' + id, { method: 'PATCH', body }).then((r) => r.book),
    deleteBook: (id: string) =>
      request<{ success: boolean; softDeleted: boolean }>('/admin/books/' + id, { method: 'DELETE' }),

    createAuthor: (body: { name: string; nationality: string; bio?: string }) =>
      request<{ author: Author }>('/admin/authors', { method: 'POST', body }).then((r) => r.author),
    updateAuthor: (id: string, body: { name?: string; nationality?: string; bio?: string }) =>
      request<{ author: Author }>('/admin/authors/' + id, { method: 'PATCH', body }).then((r) => r.author),
    deleteAuthor: (id: string) => request<void>('/admin/authors/' + id, { method: 'DELETE' }),

    createPublisher: (body: { name: string; city: string; founded?: number }) =>
      request<{ publisher: Publisher }>('/admin/publishers', { method: 'POST', body }).then((r) => r.publisher),
    updatePublisher: (id: string, body: { name?: string; city?: string; founded?: number }) =>
      request<{ publisher: Publisher }>('/admin/publishers/' + id, { method: 'PATCH', body }).then(
        (r) => r.publisher,
      ),
    deletePublisher: (id: string) => request<void>('/admin/publishers/' + id, { method: 'DELETE' }),

    sales: () => request<SalesReport>('/admin/sales'),
    users: () => request<{ users: StaffUser[] }>('/admin/users').then((r) => r.users),
  },
}
