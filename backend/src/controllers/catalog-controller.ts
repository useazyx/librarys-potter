import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import {
  GetBookService,
  ListAuthorsService,
  ListBooksService,
  ListGenresService,
  ListPublishersService,
} from '../services/catalog-service.js'

const listBooksQuerySchema = z.object({
  search: z.string().min(1).max(120).optional(),
  genre: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  publisher: z.string().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  featured: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z.enum(['relevance', 'price-asc', 'price-desc', 'title', 'newest', 'rating']).optional(),
})

export class ListBooksController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = listBooksQuerySchema.parse(request.query)

      return reply.status(200).send({ books: await new ListBooksService().execute(filters) })
    } catch (error) {
      return handleError(error, reply, 'list-books')
    }
  }
}

export class GetBookController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params)

      return reply.status(200).send({ book: await new GetBookService().execute(slug) })
    } catch (error) {
      return handleError(error, reply, 'get-book')
    }
  }
}

export class ListAuthorsController {
  async handle(_request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ authors: await new ListAuthorsService().execute() })
    } catch (error) {
      return handleError(error, reply, 'list-authors')
    }
  }
}

export class ListPublishersController {
  async handle(_request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ publishers: await new ListPublishersService().execute() })
    } catch (error) {
      return handleError(error, reply, 'list-publishers')
    }
  }
}

export class ListGenresController {
  async handle(_request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ genres: await new ListGenresService().execute() })
    } catch (error) {
      return handleError(error, reply, 'list-genres')
    }
  }
}
