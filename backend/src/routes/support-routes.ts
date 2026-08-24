import type { FastifyInstance } from 'fastify'
import {
  CreateTicketController,
  ListMyTicketsController,
  ListTicketsController,
  SupportSummaryController,
  UpdateTicketController,
} from '../controllers/support-controller.js'

export async function supportRoutes(app: FastifyInstance) {
  // Anyone can report a problem, exactly like the old "Ajuda" page.
  app.post('/tickets', (request, reply) => new CreateTicketController().handle(request, reply))

  app.get('/tickets/me', { onRequest: [app.authenticate] }, (request, reply) =>
    new ListMyTicketsController().handle(request, reply),
  )

  const supportOnly = { onRequest: [app.authorize(['SUPPORT'])] }

  app.get('/tickets', supportOnly, (request, reply) => new ListTicketsController().handle(request, reply))
  app.get('/summary', supportOnly, (request, reply) => new SupportSummaryController().handle(request, reply))
  app.patch('/tickets/:id', supportOnly, (request, reply) =>
    new UpdateTicketController().handle(request, reply),
  )
}
