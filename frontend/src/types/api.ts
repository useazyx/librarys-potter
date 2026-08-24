export type Role = 'CUSTOMER' | 'SUPPLIER' | 'SUPPORT'

export interface Author {
  id: string
  slug: string
  name: string
  nationality: string
  bio?: string | null
  photoUrl?: string | null
  bookCount: number
}

export interface Publisher {
  id: string
  slug: string
  name: string
  city: string
  founded: number | null
  bookCount: number
}

/** O que a livraria vende. Livro é o centro; o resto orbita. */
export type ProductKind = 'BOOK' | 'BOX_SET' | 'SPECIAL_EDITION' | 'COLLECTIBLE'

export interface Book {
  kind: ProductKind
  id: string
  slug: string
  title: string
  /** Nulo em artigo de fã. */
  isbn: string | null
  price: number
  stock: number
  genre: string
  synopsis: string
  excerpt: string | null
  coverUrl: string
  pages: number | null
  language: string
  featured: boolean
  publishedAt: string | null
  /** Nulos em artigo de fã: uma varinha não tem autor nem editora. */
  author: { id: string; slug: string; name: string; nationality: string } | null
  publisher: { id: string; slug: string; name: string; city: string } | null
  rating: { average: number; count: number }
}

export interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  verifiedPurchase?: boolean
  user: { id: string; name: string }
}

export interface BookDetail extends Book {
  ratingDistribution: Array<{ star: number; count: number }>
  reviews: Review[]
  related: Book[]
}

export interface CartLine {
  id: string
  quantity: number
  lineTotal: number
  book: {
    id: string
    slug: string
    title: string
    price: number
    coverUrl: string
    stock: number
    author: string | null
  }
}

export interface Cart {
  id: string
  items: CartLine[]
  itemCount: number
  subtotal: number
  shipping: number
  total: number
  freeShippingThreshold: number
  missingForFreeShipping: number
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  id: string
  code: string
  status: OrderStatus
  subtotal: number
  shipping: number
  total: number
  createdAt: string
  delivery: {
    recipient: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  items: Array<{
    id: string
    bookId: string | null
    title: string
    coverUrl: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }>
}

export interface Profile {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl: string | null
  memberSince: string
  stats: {
    orders: number
    reviews: number
    tickets: number
    booksBought: number
    totalSpent: number
  }
}

export type TicketUrgency = 'LOW' | 'MEDIUM' | 'HIGH'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

export interface SupportTicket {
  id: string
  code: string
  name: string
  email: string
  subject: string
  description: string
  urgency: TicketUrgency
  status: TicketStatus
  resolution: string | null
  handledBy: { id: string; name: string } | null
  resolvedAt: string | null
  createdAt: string
}

export interface MyReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  book: { id: string; slug: string; title: string; coverUrl: string }
}

export interface SalesReport {
  summary: { orders: number; revenue: number; unitsSold: number; averageTicket: number }
  bestSellers: Array<{ title: string; quantity: number; revenue: number }>
  lowStock: Array<{ id: string; title: string; stock: number; coverUrl: string }>
  orders: Array<{
    id: string
    code: string
    status: OrderStatus
    total: number
    createdAt: string
    customer: { id: string; name: string; email: string }
    items: number
  }>
}

export interface StaffUser {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  stats: { orders: number; reviews: number; tickets: number }
}
