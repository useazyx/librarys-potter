import type { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { BadRequestError, NotFoundError } from '../errors/index.js'
import { generateOrderCode } from '../utils/codes.js'
import { round2, toMoney } from '../utils/money.js'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from './cart-service.js'

const ORDER_INCLUDE = { items: true } as const

type OrderRecord = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>

export function serializeOrder(order: OrderRecord) {
  return {
    id: order.id,
    code: order.code,
    status: order.status,
    subtotal: toMoney(order.subtotal),
    shipping: toMoney(order.shipping),
    total: toMoney(order.total),
    createdAt: order.createdAt,
    delivery: {
      recipient: order.recipient,
      address: order.address,
      city: order.city,
      state: order.state,
      zipCode: order.zipCode,
    },
    items: order.items.map((item) => ({
      id: item.id,
      bookId: item.bookId,
      title: item.title,
      coverUrl: item.coverUrl,
      unitPrice: toMoney(item.unitPrice),
      quantity: item.quantity,
      lineTotal: round2(toMoney(item.unitPrice) * item.quantity),
    })),
  }
}

interface CreateOrderInput {
  userId: string
  recipient: string
  address: string
  city: string
  state: string
  zipCode: string
}

export class CreateOrderService {
  async execute({ userId, recipient, address, city, state, zipCode }: CreateOrderInput) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { book: true } } },
    })

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Seu carrinho está vazio.')
    }

    // O preço vem sempre do banco, nunca do que o cliente mandou.
    const subtotal = round2(
      cart.items.reduce((sum, item) => sum + toMoney(item.book.price) * item.quantity, 0),
    )

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    const total = round2(subtotal + shipping)

    const order = await prisma.$transaction(async (tx) => {
      // Confere e baixa o estoque dentro da transação. Sem isso, dois pedidos ao
      // mesmo tempo vendem o mesmo último exemplar.
      for (const item of cart.items) {
        const updated = await tx.book.updateMany({
          where: { id: item.bookId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })

        if (updated.count === 0) {
          throw new BadRequestError('"' + item.book.title + '" não tem estoque suficiente.')
        }
      }

      const created = await tx.order.create({
        data: {
          code: generateOrderCode(),
          userId,
          subtotal,
          shipping,
          total,
          recipient,
          address,
          city,
          state: state.toUpperCase(),
          zipCode,
          items: {
            create: cart.items.map((item) => ({
              bookId: item.bookId,
              title: item.book.title,
              coverUrl: item.book.coverUrl,
              unitPrice: item.book.price,
              quantity: item.quantity,
            })),
          },
        },
        include: ORDER_INCLUDE,
      })

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return created
    })

    return serializeOrder(order)
  }
}

export class ListOrdersService {
  async execute(userId: string) {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })

    return orders.map(serializeOrder)
  }
}

export class GetOrderService {
  async execute(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId }, include: ORDER_INCLUDE })

    if (!order) throw new NotFoundError('Pedido')

    return serializeOrder(order)
  }
}

const CANCELLABLE: string[] = ['PENDING', 'PAID']

export class CancelOrderService {
  async execute(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: ORDER_INCLUDE,
    })

    if (!order) throw new NotFoundError('Pedido')

    if (!CANCELLABLE.includes(order.status)) {
      throw new BadRequestError('Este pedido já foi enviado e não pode mais ser cancelado.')
    }

    const cancelled = await prisma.$transaction(async (tx) => {
      // Cancelar devolve os itens para o estoque.
      for (const item of order.items) {
        if (item.bookId) {
          await tx.book.update({
            where: { id: item.bookId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }

      return tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
        include: ORDER_INCLUDE,
      })
    })

    return serializeOrder(cancelled)
  }
}
