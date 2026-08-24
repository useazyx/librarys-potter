import { prisma } from '../config/prisma.js'
import { NotFoundError, UnauthorizedError } from '../errors/index.js'
import { round2, toMoney } from '../utils/money.js'
import { hashPassword, verifyPassword } from '../utils/password.js'

export class GetProfileService {
  async execute(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true, tickets: true } },
      },
    })

    if (!user) throw new NotFoundError('Usuário')

    const orders = await prisma.order.findMany({
      where: { userId, status: { not: 'CANCELLED' } },
      select: { total: true, items: { select: { quantity: true } } },
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      memberSince: user.createdAt,
      stats: {
        orders: user._count.orders,
        reviews: user._count.reviews,
        tickets: user._count.tickets,
        booksBought: orders.reduce(
          (sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0),
          0,
        ),
        totalSpent: round2(orders.reduce((sum, order) => sum + toMoney(order.total), 0)),
      },
    }
  }
}

interface UpdateProfileInput {
  userId: string
  name?: string
  avatarUrl?: string | null
}

export class UpdateProfileService {
  async execute({ userId, name, avatarUrl }: UpdateProfileInput) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name === undefined ? {} : { name }),
        ...(avatarUrl === undefined ? {} : { avatarUrl }),
      },
    })

    return new GetProfileService().execute(userId)
  }
}

interface ChangePasswordInput {
  userId: string
  currentPassword: string
  newPassword: string
}

export class ChangePasswordService {
  async execute({ userId, currentPassword, newPassword }: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) throw new NotFoundError('Usuário')

    const matches = await verifyPassword(currentPassword, user.passwordHash)

    if (!matches) throw new UnauthorizedError('Senha atual incorreta.')

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(newPassword) },
    })

    return { success: true }
  }
}
