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

/** Os tipos de produto que a loja vende. */
export type ProductKind =
  | 'BOOK'
  | 'BOX_SET'
  | 'SPECIAL_EDITION'
  | 'COLLECTIBLE'
  | 'WAND'
  | 'FIGURE'
  | 'APPAREL'
  | 'ACCESSORY'
  | 'STATIONERY'
  | 'GAME'
  | 'HOME'

/** As quatro casas, com os nomes que o HouseContext usa. */
export type HouseId = 'grifinoria' | 'sonserina' | 'corvinal' | 'lufa-lufa'

/** Departamento da loja: o agrupamento de tipos que o backend resolve. */
export interface Department {
  slug: string
  name: string
  tagline: string
  kinds: ProductKind[]
  count: number
  minPrice: number
  maxPrice: number
}

export interface Book {
  kind: ProductKind
  id: string
  slug: string
  title: string
  /** Nulo em artigo de fã. */
  isbn: string | null
  price: number
  /** Preço de tabela, quando o produto está em promoção. */
  compareAtPrice: number | null
  /** Desconto em pontos percentuais, já calculado pelo servidor. */
  discount: number
  stock: number
  genre: string
  synopsis: string
  excerpt: string | null
  coverUrl: string
  pages: number | null
  language: string
  featured: boolean
  publishedAt: string | null
  /** Departamento a que o produto pertence. */
  department: string
  /** Marca ou fabricante: Rocco, LEGO, Noble Collection. */
  brand: string | null
  /** Casa do produto, quando ele tem uma. */
  house: HouseId | null
  character: string | null
  tags: string[]
  /** Nulos em artigo de fã: varinha não tem autor nem editora. */
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
