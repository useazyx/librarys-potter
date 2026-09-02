import { prisma } from '../config/prisma.js'
import { ConflictError, NotFoundError } from '../errors/index.js'
import { round2, toMoney } from '../utils/money.js'

// Monta o slug que vai na URL do produto.
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

interface BookInput {
  title: string
  isbn: string
  authorId: string
  publisherId: string
  price: number
  stock: number
  genre: string
  synopsis: string
  excerpt?: string
  coverUrl: string
  pages?: number
  language?: string
  featured?: boolean
  publishedAt?: string
}

export class CreateBookService {
  async execute(input: BookInput) {
    const existing = await prisma.book.findUnique({ where: { isbn: input.isbn } })

    if (existing) throw new ConflictError('Já existe um livro com este ISBN.')

    const author = await prisma.author.findUnique({ where: { id: input.authorId } })
    if (!author) throw new NotFoundError('Autor')

    const publisher = await prisma.publisher.findUnique({ where: { id: input.publisherId } })
    if (!publisher) throw new NotFoundError('Editora')

    return prisma.book.create({
      data: {
        ...input,
        slug: await uniqueBookSlug(input.title),
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      },
    })
  }
}

// Dois produtos podem ter o mesmo título, mas não o mesmo slug.
async function uniqueBookSlug(title: string): Promise<string> {
  const base = slugify(title)
  let candidate = base
  let suffix = 2

  while (await prisma.book.findUnique({ where: { slug: candidate } })) {
    candidate = base + '-' + suffix
    suffix += 1
  }

  return candidate
}

export class UpdateBookService {
  async execute(bookId: string, input: Partial<BookInput>) {
    const book = await prisma.book.findUnique({ where: { id: bookId } })

    if (!book) throw new NotFoundError('Livro')

    if (input.isbn && input.isbn !== book.isbn) {
      const clash = await prisma.book.findUnique({ where: { isbn: input.isbn } })
      if (clash) throw new ConflictError('Já existe um livro com este ISBN.')
    }

    return prisma.book.update({
      where: { id: book.id },
      data: {
        ...input,
        ...(input.publishedAt ? { publishedAt: new Date(input.publishedAt) } : {}),
      },
    })
  }
}

export class DeleteBookService {
  async execute(bookId: string) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { _count: { select: { orderItems: true } } },
    })

    if (!book) throw new NotFoundError('Livro')

    // Produto já vendido não sai do banco, senão quebra o histórico dos pedidos.
    if (book._count.orderItems > 0) {
      await prisma.book.update({ where: { id: book.id }, data: { stock: 0 } })
      return { success: true, softDeleted: true }
    }

    await prisma.book.delete({ where: { id: book.id } })

    return { success: true, softDeleted: false }
  }
}

interface AuthorInput {
  name: string
  nationality: string
  bio?: string
  photoUrl?: string
}

export class CreateAuthorService {
  async execute(input: AuthorInput) {
    return prisma.author.create({ data: { ...input, slug: slugify(input.name) } })
  }
}

export class UpdateAuthorService {
  async execute(authorId: string, input: Partial<AuthorInput>) {
    const author = await prisma.author.findUnique({ where: { id: authorId } })

    if (!author) throw new NotFoundError('Autor')

    return prisma.author.update({
      where: { id: author.id },
      data: { ...input, ...(input.name ? { slug: slugify(input.name) } : {}) },
    })
  }
}

export class DeleteAuthorService {
  async execute(authorId: string) {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      include: { _count: { select: { books: true } } },
    })

    if (!author) throw new NotFoundError('Autor')

    if (author._count.books > 0) {
      throw new ConflictError('Este autor ainda tem livros no catálogo.')
    }

    await prisma.author.delete({ where: { id: author.id } })

    return { success: true }
  }
}

interface PublisherInput {
  name: string
  city: string
  founded?: number
}

export class CreatePublisherService {
  async execute(input: PublisherInput) {
    return prisma.publisher.create({ data: { ...input, slug: slugify(input.name) } })
  }
}

export class UpdatePublisherService {
  async execute(publisherId: string, input: Partial<PublisherInput>) {
    const publisher = await prisma.publisher.findUnique({ where: { id: publisherId } })

    if (!publisher) throw new NotFoundError('Editora')

    return prisma.publisher.update({
      where: { id: publisher.id },
      data: { ...input, ...(input.name ? { slug: slugify(input.name) } : {}) },
    })
  }
}

export class DeletePublisherService {
  async execute(publisherId: string) {
    const publisher = await prisma.publisher.findUnique({
      where: { id: publisherId },
      include: { _count: { select: { books: true } } },
    })

    if (!publisher) throw new NotFoundError('Editora')

    if (publisher._count.books > 0) {
      throw new ConflictError('Esta editora ainda tem livros no catálogo.')
    }

    await prisma.publisher.delete({ where: { id: publisher.id } })

    return { success: true }
  }
}

export class SalesReportService {
  // Relatório de vendas. É a tela consultavendas do site antigo, com mais números.
  async execute() {
    const orders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: { items: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const revenue = round2(orders.reduce((sum, order) => sum + toMoney(order.total), 0))
    const unitsSold = orders.reduce(
      (sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0),
      0,
    )

    const byBook = new Map<string, { title: string; quantity: number; revenue: number }>()

    for (const order of orders) {
      for (const item of order.items) {
        const key = item.bookId ?? item.title
        const current = byBook.get(key) ?? { title: item.title, quantity: 0, revenue: 0 }

        current.quantity += item.quantity
        current.revenue = round2(current.revenue + toMoney(item.unitPrice) * item.quantity)
        byBook.set(key, current)
      }
    }

    const lowStock = await prisma.book.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, title: true, stock: true, coverUrl: true },
      orderBy: { stock: 'asc' },
      take: 10,
    })

    return {
      summary: {
        orders: orders.length,
        revenue,
        unitsSold,
        averageTicket: orders.length === 0 ? 0 : round2(revenue / orders.length),
      },
      bestSellers: [...byBook.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10),
      lowStock,
      orders: orders.slice(0, 30).map((order) => ({
        id: order.id,
        code: order.code,
        status: order.status,
        total: toMoney(order.total),
        createdAt: order.createdAt,
        customer: order.user,
        items: order.items.length,
      })),
    }
  }
}

export class ListUsersService {
  // Lista de usuários, só para o suporte. Nunca devolve o hash da senha.
  async execute() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true, tickets: true } },
      },
    })

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      stats: { orders: user._count.orders, reviews: user._count.reviews, tickets: user._count.tickets },
    }))
  }
}
