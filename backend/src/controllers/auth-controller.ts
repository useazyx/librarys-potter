import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { env } from '../config/env.js'
import { handleError } from '../errors/index.js'
import {
  AuthenticateUserService,
  RegisterUserService,
  RequestPasswordResetService,
  ResetPasswordService,
} from '../services/auth-service.js'
import { GetProfileService } from '../services/profile-service.js'

const passwordSchema = z
  .string()
  .min(8, 'A senha precisa de pelo menos 8 caracteres.')
  .max(72, 'A senha é longa demais.')

const registerSchema = z.object({
  name: z.string().min(3, 'Informe seu nome completo.').max(120),
  email: z.string().email('E-mail inválido.').toLowerCase(),
  password: passwordSchema,
  // The three sign up doors of the original site.
  role: z.enum(['CUSTOMER', 'SUPPLIER', 'SUPPORT']).default('CUSTOMER'),
})

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.').toLowerCase(),
  password: z.string().min(1, 'Informe sua senha.'),
})

function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export class RegisterController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = registerSchema.parse(request.body)

      const user = await new RegisterUserService().execute(data)
      const token = await reply.jwtSign({ sub: user.id, role: user.role })

      setSessionCookie(reply, token)

      return reply.status(201).send({ user, token })
    } catch (error) {
      return handleError(error, reply, 'register')
    }
  }
}

export class LoginController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = loginSchema.parse(request.body)

      const user = await new AuthenticateUserService().execute(data)
      const token = await reply.jwtSign({ sub: user.id, role: user.role })

      setSessionCookie(reply, token)

      return reply.status(200).send({ user, token })
    } catch (error) {
      return handleError(error, reply, 'login')
    }
  }
}

export class LogoutController {
  async handle(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('token', { path: '/' })

    return reply.status(200).send({ success: true })
  }
}

export class MeController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const profile = await new GetProfileService().execute(request.user.sub)

      return reply.status(200).send({ user: profile })
    } catch (error) {
      return handleError(error, reply, 'me')
    }
  }
}

export class ForgotPasswordController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = z
        .object({ email: z.string().email('E-mail inválido.').toLowerCase() })
        .parse(request.body)

      const { token } = await new RequestPasswordResetService().execute(email)

      // No mail provider is wired up: outside production the token comes back so
      // the flow can be finished end to end.
      return reply.status(200).send({
        message: 'Se o e-mail estiver cadastrado, enviaremos o link de redefinição.',
        ...(env.NODE_ENV === 'production' ? {} : { token }),
      })
    } catch (error) {
      return handleError(error, reply, 'forgot-password')
    }
  }
}

export class ResetPasswordController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = z.object({ token: z.string().min(10), password: passwordSchema }).parse(request.body)

      await new ResetPasswordService().execute(data)

      return reply.status(200).send({ success: true })
    } catch (error) {
      return handleError(error, reply, 'reset-password')
    }
  }
}
