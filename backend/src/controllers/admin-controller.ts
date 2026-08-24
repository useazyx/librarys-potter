import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import {
  CreateAuthorService,
  CreateBookService,
  CreatePublisherService,
  DeleteAuthorService,
  DeleteBookService,
  DeletePublisherService,
  ListUsersService,
  SalesReportService,
  UpdateAuthorService,
  UpdateBookService,
  UpdatePublisherService,
} from '../services/admin-service.js'

const bookSchema = z.object({
  title: z.string().min(2, 'Informe o título.').max(200),
  isbn: z.string().min(10, 'ISBN inválido.').max(20),
  authorId: z.string().uuid('Escolha um autor.'),
  publisherId: z.string().uuid('Escolha uma editora.'),
  price: z.coerce.number().positive('O preço precisa ser maior que zero.'),
  stock: z.coerce.number().int().min(0),
  genre: z.string().min(2).max(60),
  synopsis: z.string().min(10, 'Escreva uma sinopse.').max(4000),
  excerpt: z.string().max(1000).optional(),
  coverUrl: z.string().min(1, 'Informe a capa.'),
  pages: z.coerce.number().int().positive().optional(),
  language: z.string().max(40).optional(),
  featured: z.boolean().optional(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato AAAA-MM-DD.').optional(),
})

const authorSchema = z.object({
  name: z.string().min(2, 'Informe o nome.').max(160),
  nationality: z.string().min(2, 'Informe a nacionalidade.').max(60),
  bio: z.string().max(2000).optional(),
  photoUrl: z.string().max(300).optional(),
})

const publisherSchema = z.object({
  name: z.string().min(2, 'Informe o nome.').max(160),
  city: z.string().min(2, 'Informe a cidade.').max(80),
  founded: z.coerce.number().int().min(1400).max(new Date().getFullYear()).optional(),
})

const idParams = z.object({ id: z.string().uuid() })

export class CreateBookController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const book = await new CreateBookService().execute(bookSchema.parse(request.body))

      return reply.status(201).send({ book })
    } catch (error) {
      return handleError(error, reply, 'create-book')
    }
  }
}

export class UpdateBookController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = idParams.parse(request.params)
      const book = await new UpdateBookService().execute(id, bookSchema.partial().parse(request.body))

      return reply.status(200).send({ book })
    } catch (error) {
      return handleError(error, reply, 'update-book')
    }
  }
}

export class DeleteBookController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = idParams.parse(request.params)
      const result = await new DeleteBookService().execute(id)

      return reply.status(200).send(result)
    } catch (error) {
      return handleError(error, reply, 'delete-book')
    }
  }
}

export class CreateAuthorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const author = await new CreateAuthorService().execute(authorSchema.parse(request.body))

      return reply.status(201).send({ author })
    } catch (error) {
      return handleError(error, reply, 'create-author')
    }
  }
}

export class UpdateAuthorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = idParams.parse(request.params)
      const author = await new UpdateAuthorService().execute(id, authorSchema.partial().parse(request.body))

      return reply.status(200).send({ author })
    } catch (error) {
      return handleError(error, reply, 'update-author')
    }
  }
}

export class DeleteAuthorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = idParams.parse(request.params)

      await new DeleteAuthorService().execute(id)

      return reply.status(204).send()
    } catch (error) {
      return handleError(error, reply, 'delete-author')
    }
  }
}

export class CreatePublisherController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const publisher = await new CreatePublisherService().execute(publisherSchema.parse(request.body))

      return reply.status(201).send({ publisher })
    } catch (error) {
      return handleError(error, reply, 'create-publisher')
    }
  }
}

export class UpdatePublisherController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = idParams.parse(request.params)
      const publisher = await new UpdatePublisherService().execute(
        id,
        publisherSchema.partial().parse(request.body),
      )

      return reply.status(200).send({ publisher })
    } catch (error) {
      return handleError(error, reply, 'update-publisher')
    }
  }
}

export class DeletePublisherController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = idParams.parse(request.params)

      await new DeletePublisherService().execute(id)

      return reply.status(204).send()
    } catch (error) {
      return handleError(error, reply, 'delete-publisher')
    }
  }
}

export class SalesReportController {
  async handle(_request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send(await new SalesReportService().execute())
    } catch (error) {
      return handleError(error, reply, 'sales-report')
    }
  }
}

export class ListUsersController {
  async handle(_request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ users: await new ListUsersService().execute() })
    } catch (error) {
      return handleError(error, reply, 'list-users')
    }
  }
}
