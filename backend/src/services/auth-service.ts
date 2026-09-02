import { randomBytes } from 'node:crypto'
import type { Role } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../errors/index.js'
import { hashPassword, verifyPassword } from '../utils/password.js'

interface RegisterInput {
  name: string
  email: string
  password: string
  role: Role
}

export class RegisterUserService {
  // O site antigo tinha uma página de cadastro para cada papel (usuário,
  // fornecedor e suporte), então o papel vem junto no cadastro.
  async execute({ name, email, password, role }: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      throw new ConflictError('Já existe uma conta com este e-mail.')
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        passwordHash: await hashPassword(password),
        cart: { create: {} },
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    return user
  }
}

interface AuthenticateInput {
  email: string
  password: string
}

export class AuthenticateUserService {
  async execute({ email, password }: AuthenticateInput) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) throw new UnauthorizedError('E-mail ou senha incorretos.')

    const matches = await verifyPassword(password, user.passwordHash)

    if (!matches) throw new UnauthorizedError('E-mail ou senha incorretos.')

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    }
  }
}

export class RequestPasswordResetService {
  // Responde igual mesmo quando o e-mail não existe. Se respondesse diferente,
  // daria para usar essa rota para descobrir quem tem conta.
  async execute(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) return { token: null }

    const token = randomBytes(32).toString('hex')

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 1000 * 60 * 30) },
    })

    return { token }
  }
}

interface ResetPasswordInput {
  token: string
  password: string
}

export class ResetPasswordService {
  async execute({ token, password }: ResetPasswordInput) {
    const reset = await prisma.passwordReset.findUnique({ where: { token } })

    if (!reset) throw new NotFoundError('Token')
    if (reset.usedAt) throw new BadRequestError('Este link já foi utilizado.')
    if (reset.expiresAt < new Date()) throw new BadRequestError('Este link expirou.')

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash: await hashPassword(password) },
      }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    ])

    return { success: true }
  }
}
