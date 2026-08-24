import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'

let app: FastifyInstance

beforeAll(async () => {
  app = await buildApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

describe('catálogo', () => {
  it('responde ao health check', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json().service).toBe('librarys-potter-api')
  })

  it('lista os cinco livros da casa com preço numérico', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books' })
    const { books } = response.json()

    expect(response.statusCode).toBe(200)
    expect(books).toHaveLength(5)
    expect(typeof books[0].price).toBe('number')
    expect(books[0].author.name).toBe('J. K. Rowling')
  })

  it('busca por título, por autor e por ISBN', async () => {
    const byTitle = await app.inject({ method: 'GET', url: '/catalog/books?search=azkaban' })
    const byAuthor = await app.inject({ method: 'GET', url: '/catalog/books?search=rowling' })
    const byIsbn = await app.inject({ method: 'GET', url: '/catalog/books?search=9781234567890' })

    expect(byTitle.json().books).toHaveLength(1)
    expect(byAuthor.json().books).toHaveLength(5)
    expect(byIsbn.json().books[0].title).toBe('Harry Potter e a Pedra Filosofal')
  })

  it('filtra por faixa de preço e ordena', async () => {
    const cheap = await app.inject({ method: 'GET', url: '/catalog/books?maxPrice=300' })
    const ordered = await app.inject({ method: 'GET', url: '/catalog/books?sort=price-desc' })

    expect(cheap.json().books.every((book: { price: number }) => book.price <= 300)).toBe(true)
    expect(ordered.json().books[0].price).toBe(400)
  })

  it('devolve o livro com sinopse, estrelas e recomendações', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books/harry-potter-e-a-pedra-filosofal' })
    const { book } = response.json()

    expect(response.statusCode).toBe(200)
    expect(book.price).toBe(200)
    expect(book.synopsis).toContain('armário sob a escada')
    expect(book.rating.count).toBe(2)
    expect(book.rating.average).toBe(5)
    expect(book.reviews).toHaveLength(2)
    expect(book.related.length).toBeGreaterThan(0)
    expect(book.ratingDistribution).toHaveLength(5)
  })

  it('404 para um livro que não existe', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books/senhor-dos-aneis' })

    expect(response.statusCode).toBe(404)
    expect(response.json().code).toBe('NOT_FOUND')
  })

  it('lista autores, editoras e gêneros com contagem', async () => {
    const authors = await app.inject({ method: 'GET', url: '/catalog/authors' })
    const publishers = await app.inject({ method: 'GET', url: '/catalog/publishers' })
    const genres = await app.inject({ method: 'GET', url: '/catalog/genres' })

    expect(authors.json().authors[0].bookCount).toBe(5)
    expect(publishers.json().publishers[0].name).toBe('Editora Rocco')
    expect(genres.json().genres[0]).toEqual({ genre: 'Fantasia', count: 5 })
  })
})
