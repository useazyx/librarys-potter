import type { FastifyInstance } from 'fastify'
import {
  DeleteReviewController,
  ListMyReviewsController,
  UpsertReviewController,
} from '../controllers/review-controller.js'

export async function reviewRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate)

  app.get('/me', (request, reply) => new ListMyReviewsController().handle(request, reply))
  app.post('/books/:slug', (request, reply) => new UpsertReviewController().handle(request, reply))
  app.delete('/:id', (request, reply) => new DeleteReviewController().handle(request, reply))
}
