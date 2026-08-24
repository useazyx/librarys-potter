import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'

let app: FastifyInstance
let customerToken: string
let supplierToken: string
let supportToken: string

async function login(email: string) {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, password: 'libraryspotter' },
  })

  return response.json().token as string
}

const bearer = (token: string) => ({ authorization: 'Bearer ' + token })

beforeAll(async () => {
  app = await buildApp()
  await app.ready()

  customerToken = await login('caio@example.com')
  supplierToken = await login('japalivros@gmail.com')
  supportToken = await login('memphisdepay@gmail.com')
})

afterAll(async () => {
  await app.close()
})

describe('avaliações', () => {
  it('cria a avaliação de um leitor e depois a edita em vez de duplicar', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/reviews/books/harry-potter-e-o-calice-de-fogo',
      headers: bearer(customerToken),
      payload: { rating: 4, comment: 'O torneio tribruxo é puro nervosismo.' },
    })

    expect(created.statusCode).toBe(201)
    expect(created.json().review.rating).toBe(4)

    const edited = await app.inject({
      method: 'POST',
      url: '/reviews/books/harry-potter-e-o-calice-de-fogo',
      headers: bearer(customerToken),
      payload: { rating: 5, comment: 'Reli e subi a nota.' },
    })

    expect(edited.statusCode).toBe(201)

    const book = (await app.inject({ method: 'GET', url: '/catalog/books/harry-potter-e-o-calice-de-fogo' })).json().book

    expect(book.rating.count).toBe(1)
    expect(book.rating.average).toBe(5)
  })

  it('recusa nota fora da escala de estrelas', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/reviews/books/harry-potter-e-a-camara-secreta',
      headers: bearer(customerToken),
      payload: { rating: 9 },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().issues.rating).toBeTruthy()
  })

  it('marca compra verificada de quem realmente comprou', async () => {
    const book = (await app.inject({ method: 'GET', url: '/catalog/books/harry-potter-e-a-camara-secreta' })).json().book
    const review = book.reviews.find((entry: { comment: string }) => entry.comment === 'um lixo')

    expect(review.verifiedPurchase).toBe(true)
  })

  it('lista e apaga as avaliações do próprio leitor', async () => {
    const mine = await app.inject({ method: 'GET', url: '/reviews/me', headers: bearer(customerToken) })
    const reviews = mine.json().reviews

    expect(reviews.length).toBeGreaterThan(0)

    const deleted = await app.inject({
      method: 'DELETE',
      url: '/reviews/' + reviews[0].id,
      headers: bearer(customerToken),
    })

    expect(deleted.statusCode).toBe(204)
  })
})

describe('suporte', () => {
  it('aceita chamado de visitante sem conta', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/support/tickets',
      payload: {
        name: 'Visitante Anônimo',
        email: 'anon@example.com',
        subject: 'Prazo de entrega para Taubaté',
        description: 'Quanto tempo demora a entrega para o interior de São Paulo?',
        urgency: 'LOW',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().ticket.code).toMatch(/^#[A-Z2-9]{5}$/)
    expect(response.json().ticket.status).toBe('OPEN')
  })

  it('recusa descrição curta demais', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/support/tickets',
      payload: { name: 'Visitante', email: 'anon@example.com', subject: 'Oi', description: 'ajuda' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().issues.description).toBeTruthy()
  })

  it('liga o chamado à conta de quem está logado', async () => {
    await app.inject({
      method: 'POST',
      url: '/support/tickets',
      headers: bearer(customerToken),
      payload: {
        name: 'Caio Nogueira',
        email: 'caio@example.com',
        subject: 'Nota fiscal do pedido',
        description: 'Preciso da nota fiscal do meu último pedido para reembolso.',
        urgency: 'MEDIUM',
      },
    })

    const mine = await app.inject({ method: 'GET', url: '/support/tickets/me', headers: bearer(customerToken) })

    expect(mine.json().tickets).toHaveLength(1)
  })

  it('só o suporte enxerga e resolve a fila', async () => {
    const asCustomer = await app.inject({ method: 'GET', url: '/support/tickets', headers: bearer(customerToken) })
    const asSupplier = await app.inject({ method: 'GET', url: '/support/tickets', headers: bearer(supplierToken) })
    const asSupport = await app.inject({ method: 'GET', url: '/support/tickets', headers: bearer(supportToken) })

    expect(asCustomer.statusCode).toBe(403)
    expect(asSupplier.statusCode).toBe(403)
    expect(asSupport.statusCode).toBe(200)

    const queue = asSupport.json().tickets

    // Abertos primeiro e, dentro deles, os mais urgentes no topo.
    expect(queue[0].status).toBe('OPEN')
    expect(queue[0].urgency).toBe('HIGH')

    const resolved = await app.inject({
      method: 'PATCH',
      url: '/support/tickets/' + queue[0].id,
      headers: bearer(supportToken),
      payload: { status: 'RESOLVED', resolution: 'Respondido com um tutorial de HTML e café.' },
    })

    expect(resolved.statusCode).toBe(200)
    expect(resolved.json().ticket.handledBy.name).toBe('Memphis Depay')
    expect(resolved.json().ticket.resolvedAt).toBeTruthy()

    const summary = await app.inject({ method: 'GET', url: '/support/summary', headers: bearer(supportToken) })
    expect(summary.json().summary.resolved).toBeGreaterThan(0)
  })
})

describe('bastidores', () => {
  it('bloqueia o leitor comum no back office', async () => {
    const response = await app.inject({ method: 'GET', url: '/admin/sales', headers: bearer(customerToken) })

    expect(response.statusCode).toBe(403)
  })

  it('deixa o fornecedor cadastrar e atualizar um livro', async () => {
    const authors = (await app.inject({ method: 'GET', url: '/catalog/authors' })).json().authors
    const publishers = (await app.inject({ method: 'GET', url: '/catalog/publishers' })).json().publishers

    const created = await app.inject({
      method: 'POST',
      url: '/admin/books',
      headers: bearer(supplierToken),
      payload: {
        title: 'Animais Fantásticos e Onde Habitam',
        isbn: '9780000000001',
        authorId: authors[0].id,
        publisherId: publishers[0].id,
        price: 89.9,
        stock: 12,
        genre: 'Fantasia',
        synopsis: 'O livro didático de Newt Scamander, obrigatório para todo aluno do primeiro ano.',
        coverUrl: '/img/books/pedra-filosofal.webp',
      },
    })

    expect(created.statusCode).toBe(201)
    expect(created.json().book.slug).toBe('animais-fantasticos-e-onde-habitam')

    const updated = await app.inject({
      method: 'PATCH',
      url: '/admin/books/' + created.json().book.id,
      headers: bearer(supplierToken),
      payload: { stock: 3 },
    })

    expect(updated.statusCode).toBe(200)
    expect(updated.json().book.stock).toBe(3)
  })

  it('recusa ISBN repetido', async () => {
    const authors = (await app.inject({ method: 'GET', url: '/catalog/authors' })).json().authors
    const publishers = (await app.inject({ method: 'GET', url: '/catalog/publishers' })).json().publishers

    const response = await app.inject({
      method: 'POST',
      url: '/admin/books',
      headers: bearer(supplierToken),
      payload: {
        title: 'Cópia com ISBN repetido',
        isbn: '9781234567890',
        authorId: authors[0].id,
        publisherId: publishers[0].id,
        price: 10,
        stock: 1,
        genre: 'Fantasia',
        synopsis: 'Sinopse suficientemente longa para passar na validação.',
        coverUrl: '/img/books/pedra-filosofal.webp',
      },
    })

    expect(response.statusCode).toBe(409)
  })

  it('só o suporte apaga registros', async () => {
    const books = (await app.inject({ method: 'GET', url: '/catalog/books?search=Animais' })).json().books

    const asSupplier = await app.inject({
      method: 'DELETE',
      url: '/admin/books/' + books[0].id,
      headers: bearer(supplierToken),
    })

    const asSupport = await app.inject({
      method: 'DELETE',
      url: '/admin/books/' + books[0].id,
      headers: bearer(supportToken),
    })

    expect(asSupplier.statusCode).toBe(403)
    expect(asSupport.statusCode).toBe(200)
  })

  it('protege autores e editoras que ainda têm livros', async () => {
    const authors = (await app.inject({ method: 'GET', url: '/catalog/authors' })).json().authors

    const response = await app.inject({
      method: 'DELETE',
      url: '/admin/authors/' + authors[0].id,
      headers: bearer(supportToken),
    })

    expect(response.statusCode).toBe(409)
  })

  it('entrega o relatório de vendas com campeões e estoque baixo', async () => {
    const response = await app.inject({ method: 'GET', url: '/admin/sales', headers: bearer(supplierToken) })
    const report = response.json()

    expect(response.statusCode).toBe(200)
    expect(report.summary.orders).toBeGreaterThan(0)
    expect(report.summary.revenue).toBeGreaterThan(0)
    expect(report.bestSellers.length).toBeGreaterThan(0)
    expect(Array.isArray(report.lowStock)).toBe(true)
  })

  it('lista leitores apenas para o suporte e sem senha', async () => {
    const asSupplier = await app.inject({ method: 'GET', url: '/admin/users', headers: bearer(supplierToken) })
    const asSupport = await app.inject({ method: 'GET', url: '/admin/users', headers: bearer(supportToken) })

    expect(asSupplier.statusCode).toBe(403)
    expect(asSupport.statusCode).toBe(200)
    expect(JSON.stringify(asSupport.json())).not.toContain('passwordHash')
    expect(asSupport.json().users.length).toBeGreaterThanOrEqual(5)
  })
})
