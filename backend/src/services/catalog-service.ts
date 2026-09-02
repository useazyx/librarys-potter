import type { Prisma, ProductKind } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { NotFoundError } from '../errors/index.js'
import { round2, toMoney } from '../utils/money.js'

const BOOK_INCLUDE = { author: true, publisher: true } as const

type BookRecord = Prisma.BookGetPayload<{ include: typeof BOOK_INCLUDE }>

// Agrupa os tipos do enum nos departamentos que aparecem na loja. Esse mapa só
// existe aqui: o frontend recebe o departamento pronto em cada produto e a
// lista em /catalog/departments.
export const DEPARTMENTS = [
  {
    slug: 'livros',
    name: 'Livros',
    tagline: 'A saga, os complementares e as edições de colecionador.',
    kinds: ['BOOK', 'BOX_SET', 'SPECIAL_EDITION'] as ProductKind[],
  },
  {
    slug: 'varinhas',
    name: 'Varinhas',
    tagline: 'Réplicas em caixa de colecionador, uma para cada mão.',
    kinds: ['WAND'] as ProductKind[],
  },
  {
    slug: 'colecionaveis',
    name: 'Colecionáveis',
    tagline: 'Réplicas de objetos do mundo bruxo e miniaturas.',
    kinds: ['COLLECTIBLE', 'FIGURE'] as ProductKind[],
  },
  {
    slug: 'vestuario',
    name: 'Vestuário',
    tagline: 'Mantos, cachecóis e o uniforme da sua casa.',
    kinds: ['APPAREL', 'ACCESSORY'] as ProductKind[],
  },
  {
    slug: 'papelaria',
    name: 'Papelaria',
    tagline: 'Cadernos, penas e o que se escreve à mão.',
    kinds: ['STATIONERY'] as ProductKind[],
  },
  {
    slug: 'jogos',
    name: 'Jogos e blocos',
    tagline: 'Para montar, jogar e ocupar a mesa da sala.',
    kinds: ['GAME'] as ProductKind[],
  },
  {
    slug: 'casa',
    name: 'Casa e decoração',
    tagline: 'A sala vestida com as cores da casa.',
    kinds: ['HOME'] as ProductKind[],
  },
] as const

export type DepartmentSlug = (typeof DEPARTMENTS)[number]['slug']

const DEPARTMENT_OF = new Map<ProductKind, DepartmentSlug>()
for (const department of DEPARTMENTS) {
  for (const kind of department.kinds) DEPARTMENT_OF.set(kind, department.slug)
}

export function departmentOf(kind: ProductKind): DepartmentSlug {
  return DEPARTMENT_OF.get(kind) ?? 'colecionaveis'
}

function kindsOfDepartment(slug: string): ProductKind[] {
  return [...(DEPARTMENTS.find((department) => department.slug === slug)?.kinds ?? [])]
}

function serializeBook(book: BookRecord, rating?: { average: number; count: number }) {
  const price = toMoney(book.price)
  const compareAtPrice = book.compareAtPrice === null ? null : toMoney(book.compareAtPrice)

  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    isbn: book.isbn,
    price,
    compareAtPrice,
    // desconto em %, arredondado, para a etiqueta do card
    discount:
      compareAtPrice && compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0,
    stock: book.stock,
    genre: book.genre,
    synopsis: book.synopsis,
    excerpt: book.excerpt,
    coverUrl: book.coverUrl,
    pages: book.pages,
    language: book.language,
    featured: book.featured,
    publishedAt: book.publishedAt,
    kind: book.kind,
    department: departmentOf(book.kind),
    brand: book.brand,
    house: book.house,
    character: book.character,
    tags: book.tags,
    // Produto que não é livro não tem autor nem editora, então vai null.
    author: book.author
      ? { id: book.author.id, slug: book.author.slug, name: book.author.name, nationality: book.author.nationality }
      : null,
    publisher: book.publisher
      ? { id: book.publisher.id, slug: book.publisher.slug, name: book.publisher.name, city: book.publisher.city }
      : null,
    rating: rating ?? { average: 0, count: 0 },
  }
}

export type SerializedBook = ReturnType<typeof serializeBook>

// Uma query só traz a média das estrelas de todos os produtos da página.
async function ratingsFor(bookIds: string[]) {
  if (bookIds.length === 0) return new Map<string, { average: number; count: number }>()

  const rows = await prisma.review.groupBy({
    by: ['bookId'],
    where: { bookId: { in: bookIds } },
    _avg: { rating: true },
    _count: { rating: true },
  })

  return new Map(
    rows.map((row) => [
      row.bookId,
      { average: round2(row._avg.rating ?? 0), count: row._count.rating },
    ]),
  )
}

export type BookSort = 'relevance' | 'price-asc' | 'price-desc' | 'title' | 'newest' | 'rating' | 'discount'

interface ListBooksInput {
  search?: string
  genre?: string
  kind?: ProductKind
  department?: string
  brand?: string
  house?: string
  character?: string
  tag?: string
  author?: string
  publisher?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  inStock?: boolean
  onSale?: boolean
  sort?: BookSort
  limit?: number
}

export class ListBooksService {
  async execute(filters: ListBooksInput) {
    // Dá para mandar departamento e tipo juntos: um estreita o outro.
    const departmentKinds = filters.department ? kindsOfDepartment(filters.department) : null

    const kindWhere =
      filters.kind && departmentKinds
        ? departmentKinds.includes(filters.kind)
          ? { kind: filters.kind }
          : // Tipo fora do departamento pedido: nenhum produto satisfaz os dois.
            { kind: { in: [] as ProductKind[] } }
        : filters.kind
          ? { kind: filters.kind }
          : departmentKinds
            ? { kind: { in: departmentKinds } }
            : {}

    const where: Prisma.BookWhereInput = {
      ...kindWhere,
      ...(filters.genre ? { genre: filters.genre } : {}),
      ...(filters.brand ? { brand: filters.brand } : {}),
      ...(filters.house ? { house: filters.house } : {}),
      ...(filters.character ? { character: filters.character } : {}),
      ...(filters.tag ? { tags: { has: filters.tag } } : {}),
      ...(filters.author ? { author: { slug: filters.author } } : {}),
      ...(filters.publisher ? { publisher: { slug: filters.publisher } } : {}),
      ...(filters.featured === undefined ? {} : { featured: filters.featured }),
      ...(filters.inStock ? { stock: { gt: 0 } } : {}),
      ...(filters.onSale ? { compareAtPrice: { not: null } } : {}),
      ...(filters.minPrice === undefined && filters.maxPrice === undefined
        ? {}
        : {
            price: {
              ...(filters.minPrice === undefined ? {} : { gte: filters.minPrice }),
              ...(filters.maxPrice === undefined ? {} : { lte: filters.maxPrice }),
            },
          }),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' as const } },
              { synopsis: { contains: filters.search, mode: 'insensitive' as const } },
              { brand: { contains: filters.search, mode: 'insensitive' as const } },
              { character: { contains: filters.search, mode: 'insensitive' as const } },
              { isbn: { contains: filters.search } },
              { author: { name: { contains: filters.search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    }

    const orderBy: Prisma.BookOrderByWithRelationInput[] =
      filters.sort === 'price-asc'
        ? [{ price: 'asc' }]
        : filters.sort === 'price-desc'
          ? [{ price: 'desc' }]
          : filters.sort === 'title'
            ? [{ title: 'asc' }]
            : filters.sort === 'newest'
              ? [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
              : [{ position: 'asc' }, { title: 'asc' }]

    const books = await prisma.book.findMany({ where, include: BOOK_INCLUDE, orderBy })
    const ratings = await ratingsFor(books.map((book) => book.id))

    const serialized = books.map((book) => serializeBook(book, ratings.get(book.id)))

    // Nota e desconto só dá para ordenar depois de serializar, porque são calculados.
    if (filters.sort === 'rating') {
      serialized.sort((a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count)
    }

    if (filters.sort === 'discount') {
      serialized.sort((a, b) => b.discount - a.discount || a.price - b.price)
    }

    return filters.limit ? serialized.slice(0, filters.limit) : serialized
  }
}

export class GetBookService {
  async execute(slug: string) {
    const book = await prisma.book.findUnique({ where: { slug }, include: BOOK_INCLUDE })

    if (!book) throw new NotFoundError('Livro')

    const ratings = await ratingsFor([book.id])

    const reviews = await prisma.review.findMany({
      where: { bookId: book.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Quem comprou o produto ganha o selo de compra verificada.
    const buyerIds = await prisma.orderItem.findMany({
      where: { bookId: book.id, order: { userId: { in: reviews.map((review) => review.userId) } } },
      select: { order: { select: { userId: true } } },
    })

    const verified = new Set(buyerIds.map((item) => item.order.userId))

    // Relacionados: primeiro o mesmo departamento, depois o mesmo autor ou gênero.
    const related = await prisma.book.findMany({
      where: {
        id: { not: book.id },
        stock: { gt: 0 },
        OR: [
          { kind: { in: kindsOfDepartment(departmentOf(book.kind)) } },
          ...(book.house ? [{ house: book.house }] : []),
          ...(book.character ? [{ character: book.character }] : []),
          ...(book.authorId ? [{ authorId: book.authorId }] : []),
        ],
      },
      include: BOOK_INCLUDE,
      orderBy: { position: 'asc' },
      take: 8,
    })

    const distribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { bookId: book.id },
      _count: { rating: true },
    })

    return {
      ...serializeBook(book, ratings.get(book.id)),
      ratingDistribution: [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: distribution.find((row) => row.rating === star)?._count.rating ?? 0,
      })),
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        verifiedPurchase: verified.has(review.userId),
        user: { id: review.user.id, name: review.user.name },
      })),
      related: related.map((item) => serializeBook(item)),
    }
  }
}

export class ListAuthorsService {
  async execute() {
    const authors = await prisma.author.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { books: true } } },
    })

    return authors.map((author) => ({
      id: author.id,
      slug: author.slug,
      name: author.name,
      nationality: author.nationality,
      bio: author.bio,
      photoUrl: author.photoUrl,
      bookCount: author._count.books,
    }))
  }
}

export class ListPublishersService {
  async execute() {
    const publishers = await prisma.publisher.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { books: true } } },
    })

    return publishers.map((publisher) => ({
      id: publisher.id,
      slug: publisher.slug,
      name: publisher.name,
      city: publisher.city,
      founded: publisher.founded,
      bookCount: publisher._count.books,
    }))
  }
}

export class ListGenresService {
  async execute() {
    const rows = await prisma.book.groupBy({ by: ['genre'], _count: { genre: true } })

    return rows
      .map((row) => ({ genre: row.genre, count: row._count.genre }))
      .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre))
  }
}

// As marcas com a contagem de produtos, para o filtro do catálogo.
export class ListBrandsService {
  async execute() {
    const rows = await prisma.book.groupBy({
      by: ['brand'],
      where: { brand: { not: null } },
      _count: { brand: true },
    })

    return rows
      .filter((row): row is typeof row & { brand: string } => row.brand !== null)
      .map((row) => ({ brand: row.brand, count: row._count.brand }))
      .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand))
  }
}

// Os departamentos com a contagem e a faixa de preço. Alimenta o menu do
// cabeçalho e as abas do catálogo.
export class ListDepartmentsService {
  async execute() {
    const rows = await prisma.book.groupBy({
      by: ['kind'],
      _count: { kind: true },
      _min: { price: true },
      _max: { price: true },
    })

    return DEPARTMENTS.map((department) => {
      const mine = rows.filter((row) => department.kinds.includes(row.kind))
      const prices = mine.flatMap((row) => [row._min.price, row._max.price]).filter((price) => price !== null)

      return {
        slug: department.slug,
        name: department.name,
        tagline: department.tagline,
        kinds: department.kinds,
        count: mine.reduce((total, row) => total + row._count.kind, 0),
        minPrice: prices.length === 0 ? 0 : Math.min(...prices.map((price) => toMoney(price))),
        maxPrice: prices.length === 0 ? 0 : Math.max(...prices.map((price) => toMoney(price))),
      }
    })
  }
}
