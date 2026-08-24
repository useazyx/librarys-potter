import { prisma } from '../config/prisma.js'
import { BadRequestError, NotFoundError } from '../errors/index.js'
import { round2, toMoney } from '../utils/money.js'

export const SHIPPING_FEE = 12.9
export const FREE_SHIPPING_THRESHOLD = 250

async function loadCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
        include: { book: { include: { author: true } } },
      },
    },
  })
}

type LoadedCart = Awaited<ReturnType<typeof loadCart>>

export function serializeCart(cart: LoadedCart) {
  const items = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    lineTotal: round2(toMoney(item.book.price) * item.quantity),
    book: {
      id: item.book.id,
      slug: item.book.slug,
      title: item.book.title,
      price: toMoney(item.book.price),
      coverUrl: item.book.coverUrl,
      stock: item.book.stock,
      author: item.book.author?.name ?? null,
    },
  }))

  const subtotal = round2(items.reduce((sum, item) => sum + item.lineTotal, 0))
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    shipping,
    total: round2(subtotal + shipping),
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    missingForFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : round2(FREE_SHIPPING_THRESHOLD - subtotal),
  }
}

export class GetCartService {
  async execute(userId: string) {
    return serializeCart(await loadCart(userId))
  }
}

interface AddCartItemInput {
  userId: string
  bookId: string
  quantity: number
}

export class AddCartItemService {
  async execute({ userId, bookId, quantity }: AddCartItemInput) {
    const book = await prisma.book.findUnique({ where: { id: bookId } })

    if (!book) throw new NotFoundError('Livro')
    if (book.stock <= 0) throw new BadRequestError('Este livro está esgotado.')

    const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} })
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_bookId: { cartId: cart.id, bookId } },
    })

    const desired = (existing?.quantity ?? 0) + quantity

    // The cart never holds more copies than the shelf has.
    if (desired > book.stock) {
      throw new BadRequestError('Temos apenas ' + book.stock + ' exemplar(es) em estoque.')
    }

    await prisma.cartItem.upsert({
      where: { cartId_bookId: { cartId: cart.id, bookId } },
      create: { cartId: cart.id, bookId, quantity },
      update: { quantity: desired },
    })

    return serializeCart(await loadCart(userId))
  }
}

interface UpdateCartItemInput {
  userId: string
  itemId: string
  quantity: number
}

export class UpdateCartItemService {
  async execute({ userId, itemId, quantity }: UpdateCartItemInput) {
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: { book: true },
    })

    if (!item) throw new NotFoundError('Item do carrinho')

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } })
    } else {
      if (quantity > item.book.stock) {
        throw new BadRequestError('Temos apenas ' + item.book.stock + ' exemplar(es) em estoque.')
      }

      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } })
    }

    return serializeCart(await loadCart(userId))
  }
}

export class RemoveCartItemService {
  async execute(userId: string, itemId: string) {
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } } })

    if (!item) throw new NotFoundError('Item do carrinho')

    await prisma.cartItem.delete({ where: { id: item.id } })

    return serializeCart(await loadCart(userId))
  }
}

export class ClearCartService {
  async execute(userId: string) {
    const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} })

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    return serializeCart(await loadCart(userId))
  }
}
