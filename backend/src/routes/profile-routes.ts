import type { FastifyInstance } from 'fastify'
import {
  ChangePasswordController,
  GetProfileController,
  UpdateProfileController,
} from '../controllers/profile-controller.js'

export async function profileRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate)

  app.get('/', (request, reply) => new GetProfileController().handle(request, reply))
  app.patch('/', (request, reply) => new UpdateProfileController().handle(request, reply))
  app.patch('/password', (request, reply) => new ChangePasswordController().handle(request, reply))
}
