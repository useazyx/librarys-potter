import type { FastifyInstance } from 'fastify'
import {
  CreateAuthorController,
  CreateBookController,
  CreatePublisherController,
  DeleteAuthorController,
  DeleteBookController,
  DeletePublisherController,
  ListUsersController,
  SalesReportController,
  UpdateAuthorController,
  UpdateBookController,
  UpdatePublisherController,
} from '../controllers/admin-controller.js'

/**
 * The back office of the original site. A fornecedor keeps the catalogue and
 * sees the sales; only o suporte can delete records or list the readers.
 */
export async function adminRoutes(app: FastifyInstance) {
  const staff = { onRequest: [app.authorize(['SUPPLIER', 'SUPPORT'])] }
  const supportOnly = { onRequest: [app.authorize(['SUPPORT'])] }

  app.post('/books', staff, (request, reply) => new CreateBookController().handle(request, reply))
  app.patch('/books/:id', staff, (request, reply) => new UpdateBookController().handle(request, reply))
  app.delete('/books/:id', supportOnly, (request, reply) => new DeleteBookController().handle(request, reply))

  app.post('/authors', staff, (request, reply) => new CreateAuthorController().handle(request, reply))
  app.patch('/authors/:id', staff, (request, reply) => new UpdateAuthorController().handle(request, reply))
  app.delete('/authors/:id', supportOnly, (request, reply) =>
    new DeleteAuthorController().handle(request, reply),
  )

  app.post('/publishers', staff, (request, reply) => new CreatePublisherController().handle(request, reply))
  app.patch('/publishers/:id', staff, (request, reply) =>
    new UpdatePublisherController().handle(request, reply),
  )
  app.delete('/publishers/:id', supportOnly, (request, reply) =>
    new DeletePublisherController().handle(request, reply),
  )

  app.get('/sales', staff, (request, reply) => new SalesReportController().handle(request, reply))
  app.get('/users', supportOnly, (request, reply) => new ListUsersController().handle(request, reply))
}
