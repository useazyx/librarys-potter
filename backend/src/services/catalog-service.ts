import type { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { NotFoundError } from '../errors/index.js'
import { round2, toMoney } from '../utils/money.js'

const BOOK_INCLUDE = { author: true, publisher: true } as const

type BookRecord = Prisma.BookGetPayload<{ include: typeof BOOK_INCLUDE }>

function serializeBook(book: BookRecord, rating?: { average: number; count: number }) {
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    isbn: book.isbn,
    price: toMoney(book.price),
    stock: book.stock,
    genre: book.genre,
    synopsis: book.synopsis,
    excerpt: book.excerpt,
    coverUrl: book.coverUrl,
    pages: book.pages,
    language: book.language,
    featured: book.featured,
    publishedAt: book.publishedAt,
    author: { id: book.author.id, slug: book.author.slug, name: book.author.name, nationality: book.author.nationality },
    publisher: { id: book.publisher.id, slug: book.publisher.slug, name: book.publisher.name, city: book.publisher.city },
    rating: rating ?? { average: 0, count: 0 },
  }
}

export type SerializedBook = ReturnType<typeof serializeBook>

/** One grouped query feeds the star average of every book on the page. */
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

export type BookSort = 'relevance' | 'price-asc' | 'price-desc' | 'title' | 'newest' | 'rating'

interface ListBooksInput {
  search?: string
  genre?: string
  author?: string
  publisher?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  inStock?: boolean
  sort?: BookSort
}

export class ListBooksService {
  async execute(filters: ListBooksInput) {
    const where: Prisma.BookWhereInput = {
      ...(filters.genre ? { genre: filters.genre } : {}),
      ...(filters.author ? { author: { slug: filters.author } } : {}),
      ...(filters.publisher ? { publisher: { slug: filters.publisher } } : {}),
      ...(filters.featured === undefined ? {} : { featured: filters.featured }),
      ...(filters.inStock ? { stock: { gt: 0 } } : {}),
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

    // Sorting by rating needs the aggregate, so it happens after serialization.
    if (filters.sort === 'rating') {
      serialized.sort((a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count)
    }

    return serialized
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

    // A reader who actually bought the book earns the "compra verificada" badge.
    const buyerIds = await prisma.orderItem.findMany({
      where: { bookId: book.id, order: { userId: { in: reviews.map((review) => review.userId) } } },
      select: { order: { select: { userId: true } } },
    })

    const verified = new Set(buyerIds.map((item) => item.order.userId))

    const related = await prisma.book.findMany({
      where: { id: { not: book.id }, OR: [{ authorId: book.authorId }, { genre: book.genre }] },
      include: BOOK_INCLUDE,
      orderBy: { position: 'asc' },
      take: 4,
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
