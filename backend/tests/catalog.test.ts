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

  it('lista o acervo inteiro com preço numérico', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books' })
    const { books } = response.json()

    expect(response.statusCode).toBe(200)
    expect(books).toHaveLength(21)
    expect(typeof books[0].price).toBe('number')
    expect(books[0].author.name).toBe('J. K. Rowling')
  })

  it('separa o acervo por tipo, e artigo de fã vem sem autor', async () => {
    const pedido = (kind: string) => app.inject({ method: 'GET', url: '/catalog/books?kind=' + kind })

    const livros = await pedido('BOOK')
    const caixas = await pedido('BOX_SET')
    const especiais = await pedido('SPECIAL_EDITION')
    const fa = await pedido('COLLECTIBLE')

    // A saga fechou em sete volumes.
    expect(livros.json().books).toHaveLength(7)
    expect(caixas.json().books).toHaveLength(2)
    expect(especiais.json().books).toHaveLength(5)
    expect(fa.json().books).toHaveLength(7)

    expect(livros.json().books.every((b: { kind: string }) => b.kind === 'BOOK')).toBe(true)

    // Uma varinha não tem autor, editora nem ISBN — e o contrato diz isso.
    const varinha = fa.json().books.find((b: { slug: string }) => b.slug === 'varinha-de-harry-potter')
    expect(varinha.author).toBeNull()
    expect(varinha.publisher).toBeNull()
    expect(varinha.isbn).toBeNull()
  })

  it('recusa um tipo que não existe', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books?kind=VARINHA' })
    expect(response.statusCode).toBe(400)
  })

  it('busca por título, por autor e por ISBN', async () => {
    const byTitle = await app.inject({ method: 'GET', url: '/catalog/books?search=azkaban' })
    const byAuthor = await app.inject({ method: 'GET', url: '/catalog/books?search=rowling' })
    const byIsbn = await app.inject({ method: 'GET', url: '/catalog/books?search=9781234567890' })

    // Dois: o volume avulso e a caixa cuja sinopse cita o Prisioneiro de Azkaban.
    const titulos = byTitle.json().books.map((b: { title: string }) => b.title)
    expect(titulos).toHaveLength(2)
    expect(titulos).toContain('Harry Potter e o Prisioneiro de Azkaban')
    // Autora entra em livros, caixas e edições especiais, mas não nos artigos de fã.
    expect(byAuthor.json().books).toHaveLength(14)
    expect(byIsbn.json().books[0].title).toBe('Harry Potter e a Pedra Filosofal')
  })

  it('filtra por faixa de preço e ordena', async () => {
    const cheap = await app.inject({ method: 'GET', url: '/catalog/books?maxPrice=300' })
    const ordered = await app.inject({ method: 'GET', url: '/catalog/books?sort=price-desc' })

    expect(cheap.json().books.every((book: { price: number }) => book.price <= 300)).toBe(true)
    // O item mais caro do acervo passou a ser a coleção completa.
    expect(ordered.json().books[0].price).toBe(1900)
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

    // A autora assina livros, caixas e edições especiais — não os artigos de fã.
    expect(authors.json().authors[0].bookCount).toBe(14)
    expect(publishers.json().publishers[0].name).toBe('Editora Rocco')

    const generos: Array<{ genre: string; count: number }> = genres.json().genres
    expect(generos.find((g) => g.genre === 'Fantasia')).toEqual({ genre: 'Fantasia', count: 7 })
    expect(generos.find((g) => g.genre === 'Artigo de fã')).toEqual({ genre: 'Artigo de fã', count: 7 })
    expect(generos.find((g) => g.genre === 'Edição especial')).toEqual({ genre: 'Edição especial', count: 5 })
  })
})
