import type { FastifyInstance } from 'fastify'
import { adminRoutes } from './admin-routes.js'
import { authRoutes } from './auth-routes.js'
import { cartRoutes } from './cart-routes.js'
import { catalogRoutes } from './catalog-routes.js'
import { orderRoutes } from './order-routes.js'
import { profileRoutes } from './profile-routes.js'
import { reviewRoutes } from './review-routes.js'
import { supportRoutes } from './support-routes.js'

export async function registerRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ status: 'ok', service: 'librarys-potter-api' }))

  app.register(authRoutes, { prefix: '/auth' })
  app.register(catalogRoutes, { prefix: '/catalog' })
  app.register(cartRoutes, { prefix: '/cart' })
  app.register(orderRoutes, { prefix: '/orders' })
  app.register(reviewRoutes, { prefix: '/reviews' })
  app.register(supportRoutes, { prefix: '/support' })
  app.register(profileRoutes, { prefix: '/profile' })
  app.register(adminRoutes, { prefix: '/admin' })
}
