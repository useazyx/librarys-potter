import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import {
  CreateTicketService,
  ListMyTicketsService,
  ListTicketsService,
  SupportSummaryService,
  UpdateTicketService,
} from '../services/support-service.js'

const createTicketSchema = z.object({
  name: z.string().min(3, 'Informe seu nome.').max(120),
  email: z.string().email('E-mail inválido.').toLowerCase(),
  subject: z.string().min(3, 'Resuma o problema em poucas palavras.').max(140),
  description: z.string().min(10, 'Conte um pouco mais sobre o que aconteceu.').max(3000),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
})

const listQuerySchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
  resolution: z.string().max(3000).optional(),
})

export class CreateTicketController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createTicketSchema.parse(request.body)

      // Visitors may open a ticket; a signed in reader gets it linked to the account.
      let userId: string | undefined
      try {
        await request.jwtVerify()
        userId = request.user.sub
      } catch {
        userId = undefined
      }

      const ticket = await new CreateTicketService().execute({ ...data, userId })

      return reply.status(201).send({ ticket })
    } catch (error) {
      return handleError(error, reply, 'create-ticket')
    }
  }
}

export class ListMyTicketsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ tickets: await new ListMyTicketsService().execute(request.user.sub) })
    } catch (error) {
      return handleError(error, reply, 'list-my-tickets')
    }
  }
}

export class ListTicketsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = listQuerySchema.parse(request.query)

      return reply.status(200).send({ tickets: await new ListTicketsService().execute(filters) })
    } catch (error) {
      return handleError(error, reply, 'list-tickets')
    }
  }
}

export class UpdateTicketController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
      const data = updateTicketSchema.parse(request.body)

      const ticket = await new UpdateTicketService().execute({
        ticketId: id,
        handledById: request.user.sub,
        ...data,
      })

      return reply.status(200).send({ ticket })
    } catch (error) {
      return handleError(error, reply, 'update-ticket')
    }
  }
}

export class SupportSummaryController {
  async handle(_request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ summary: await new SupportSummaryService().execute() })
    } catch (error) {
      return handleError(error, reply, 'support-summary')
    }
  }
}
