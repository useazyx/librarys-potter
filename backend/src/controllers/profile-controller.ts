import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import {
  ChangePasswordService,
  GetProfileService,
  UpdateProfileService,
} from '../services/profile-service.js'

const updateProfileSchema = z.object({
  name: z.string().min(3).max(120).optional(),
  avatarUrl: z.string().url().nullable().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe sua senha atual.'),
  newPassword: z.string().min(8, 'A nova senha precisa de pelo menos 8 caracteres.').max(72),
})

export class GetProfileController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ profile: await new GetProfileService().execute(request.user.sub) })
    } catch (error) {
      return handleError(error, reply, 'get-profile')
    }
  }
}

export class UpdateProfileController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = updateProfileSchema.parse(request.body)

      const profile = await new UpdateProfileService().execute({ userId: request.user.sub, ...data })

      return reply.status(200).send({ profile })
    } catch (error) {
      return handleError(error, reply, 'update-profile')
    }
  }
}

export class ChangePasswordController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = changePasswordSchema.parse(request.body)

      await new ChangePasswordService().execute({ userId: request.user.sub, ...data })

      return reply.status(200).send({ success: true })
    } catch (error) {
      return handleError(error, reply, 'change-password')
    }
  }
}
