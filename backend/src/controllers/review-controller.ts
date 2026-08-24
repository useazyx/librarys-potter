import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import { DeleteReviewService, ListMyReviewsService, UpsertReviewService } from '../services/review-service.js'

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Dê de 1 a 5 estrelas.').max(5, 'Dê de 1 a 5 estrelas.'),
  comment: z.string().max(1500).optional(),
})

export class UpsertReviewController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params)
      const data = reviewSchema.parse(request.body)

      const review = await new UpsertReviewService().execute({
        userId: request.user.sub,
        bookSlug: slug,
        ...data,
      })

      return reply.status(201).send({ review })
    } catch (error) {
      return handleError(error, reply, 'upsert-review')
    }
  }
}

export class ListMyReviewsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ reviews: await new ListMyReviewsService().execute(request.user.sub) })
    } catch (error) {
      return handleError(error, reply, 'list-my-reviews')
    }
  }
}

export class DeleteReviewController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

      await new DeleteReviewService().execute(request.user.sub, id)

      return reply.status(204).send()
    } catch (error) {
      return handleError(error, reply, 'delete-review')
    }
  }
}
