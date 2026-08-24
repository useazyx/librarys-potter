import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import {
  CancelOrderService,
  CreateOrderService,
  GetOrderService,
  ListOrdersService,
} from '../services/order-service.js'

const createOrderSchema = z.object({
  recipient: z.string().min(3, 'Informe quem vai receber.').max(120),
  address: z.string().min(5, 'Informe o endereço completo.').max(200),
  city: z.string().min(2).max(80),
  state: z.string().length(2, 'Use a sigla do estado, como SP.'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido.'),
})

const orderParamsSchema = z.object({ orderId: z.string().uuid() })

export class CreateOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createOrderSchema.parse(request.body)

      const order = await new CreateOrderService().execute({ userId: request.user.sub, ...data })

      return reply.status(201).send({ order })
    } catch (error) {
      return handleError(error, reply, 'create-order')
    }
  }
}

export class ListOrdersController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ orders: await new ListOrdersService().execute(request.user.sub) })
    } catch (error) {
      return handleError(error, reply, 'list-orders')
    }
  }
}

export class GetOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { orderId } = orderParamsSchema.parse(request.params)

      return reply.status(200).send({ order: await new GetOrderService().execute(request.user.sub, orderId) })
    } catch (error) {
      return handleError(error, reply, 'get-order')
    }
  }
}

export class CancelOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { orderId } = orderParamsSchema.parse(request.params)

      const order = await new CancelOrderService().execute(request.user.sub, orderId)

      return reply.status(200).send({ order })
    } catch (error) {
      return handleError(error, reply, 'cancel-order')
    }
  }
}
