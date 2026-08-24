import type { FastifyInstance } from 'fastify'
import {
  GetBookController,
  ListAuthorsController,
  ListBooksController,
  ListGenresController,
  ListPublishersController,
} from '../controllers/catalog-controller.js'

export async function catalogRoutes(app: FastifyInstance) {
  app.get('/books', (request, reply) => new ListBooksController().handle(request, reply))
  app.get('/books/:slug', (request, reply) => new GetBookController().handle(request, reply))
  app.get('/authors', (request, reply) => new ListAuthorsController().handle(request, reply))
  app.get('/publishers', (request, reply) => new ListPublishersController().handle(request, reply))
  app.get('/genres', (request, reply) => new ListGenresController().handle(request, reply))
}
