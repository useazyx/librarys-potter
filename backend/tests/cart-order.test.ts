import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'

let app: FastifyInstance
let token: string
let pedraId: string
let azkabanId: string
let varinhaId: string

// Preços lidos do catálogo, para não ter número mágico no teste.
let pedraPrice: number
let azkabanPrice: number
let varinhaStock: number

async function register() {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: {
      name: 'Cliente Carrinho',
      email: 'carrinho.' + Date.now() + Math.random() + '@example.com',
      password: 'expelliarmus1',
    },
  })

  return response.json().token as string
}

function authed() {
  return { authorization: 'Bearer ' + token }
}

beforeAll(async () => {
  app = await buildApp()
  await app.ready()

  token = await register()

  const { books } = (await app.inject({ method: 'GET', url: '/catalog/books' })).json()

  pedraId = books.find((book: { slug: string }) => book.slug === 'harry-potter-e-a-pedra-filosofal').id
  azkabanId = books.find((book: { slug: string }) => book.slug === 'harry-potter-e-o-prisioneiro-de-azkaban').id

  const pedra = books.find((book: { slug: string }) => book.slug === 'harry-potter-e-a-pedra-filosofal')
  const azkaban = books.find((book: { slug: string }) => book.slug === 'harry-potter-e-o-prisioneiro-de-azkaban')
  const varinha = books.find((book: { slug: string }) => book.slug === 'varinha-de-harry-potter')

  pedraPrice = pedra.price
  azkabanPrice = azkaban.price
  varinhaId = varinha.id
  varinhaStock = varinha.stock
})

afterAll(async () => {
  await app.close()
})

describe('carrinho', () => {
  it('exige autenticação', async () => {
    const response = await app.inject({ method: 'GET', url: '/cart' })

    expect(response.statusCode).toBe(401)
  })

  it('começa vazio e sem frete', async () => {
    const { cart } = (await app.inject({ method: 'GET', url: '/cart', headers: authed() })).json()

    expect(cart.items).toHaveLength(0)
    expect(cart.subtotal).toBe(0)
    expect(cart.shipping).toBe(0)
  })

  it('adiciona um livro e cobra o frete abaixo do limite', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: authed(),
      payload: { bookId: pedraId, quantity: 1 },
    })

    const { cart } = response.json()

    expect(response.statusCode).toBe(201)
    expect(cart.subtotal).toBe(pedraPrice)
    expect(cart.shipping).toBe(12.9)
    expect(cart.missingForFreeShipping).toBe(Number((cart.freeShippingThreshold - pedraPrice).toFixed(2)))
  })

  it('soma o mesmo livro na mesma linha e zera o frete acima do limite', async () => {
    const { cart } = (
      await app.inject({
        method: 'POST',
        url: '/cart/items',
        headers: authed(),
        payload: { bookId: pedraId, quantity: 5 },
      })
    ).json()

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].quantity).toBe(6)
    expect(cart.subtotal).toBe(Number((pedraPrice * 6).toFixed(2)))
    // Seis exemplares passam do limite de frete grátis; a soma é a mesma linha.
    expect(cart.subtotal).toBeGreaterThanOrEqual(cart.freeShippingThreshold)
    expect(cart.shipping).toBe(0)
  })

  it('não deixa passar do estoque disponível', async () => {
    // A varinha do Harry tem 55 exemplares e cada requisição soma no máximo 20,
    // então o limite só aparece na terceira tentativa, que é justamente o caso
    // que o carrinho precisa barrar.
    const freshToken = await register()
    const headers = { authorization: 'Bearer ' + freshToken }

    const first = await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers,
      payload: { bookId: varinhaId, quantity: 20 },
    })

    const second = await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers,
      payload: { bookId: varinhaId, quantity: 20 },
    })

    const third = await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers,
      payload: { bookId: varinhaId, quantity: 20 },
    })

    expect(first.statusCode).toBe(201)
    expect(second.json().cart.items[0].quantity).toBe(40)
    expect(third.statusCode).toBe(400)
    expect(third.json().error).toContain(varinhaStock + ' exemplar')
  })

  it('atualiza e remove linhas', async () => {
    const before = (await app.inject({ method: 'GET', url: '/cart', headers: authed() })).json().cart

    const updated = await app.inject({
      method: 'PATCH',
      url: '/cart/items/' + before.items[0].id,
      headers: authed(),
      payload: { quantity: 1 },
    })

    expect(updated.json().cart.items[0].quantity).toBe(1)

    const removed = await app.inject({
      method: 'DELETE',
      url: '/cart/items/' + before.items[0].id,
      headers: authed(),
    })

    expect(removed.json().cart.items).toHaveLength(0)
  })
})

describe('pedidos', () => {
  const delivery = {
    recipient: 'Cliente Carrinho',
    address: 'Rua dos Alfeneiros, 4',
    city: 'Little Whinging',
    state: 'SP',
    zipCode: '12345-678',
  }

  it('recusa fechar pedido com carrinho vazio', async () => {
    const response = await app.inject({ method: 'POST', url: '/orders', headers: authed(), payload: delivery })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe('Seu carrinho está vazio.')
  })

  it('fecha o pedido, baixa o estoque e esvazia o carrinho', async () => {
    const before = (await app.inject({ method: 'GET', url: '/catalog/books/harry-potter-e-o-prisioneiro-de-azkaban' })).json()
      .book.stock

    await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: authed(),
      payload: { bookId: azkabanId, quantity: 6 },
    })

    const response = await app.inject({ method: 'POST', url: '/orders', headers: authed(), payload: delivery })
    const { order } = response.json()

    expect(response.statusCode).toBe(201)
    expect(order.code).toMatch(/^LP-[A-Z2-9]{6}$/)
    expect(order.subtotal).toBe(Number((azkabanPrice * 6).toFixed(2)))
    expect(order.shipping).toBe(0)
    expect(order.delivery.city).toBe('Little Whinging')

    const after = (await app.inject({ method: 'GET', url: '/catalog/books/harry-potter-e-o-prisioneiro-de-azkaban' })).json()
      .book.stock

    expect(after).toBe(before - 6)

    const cart = (await app.inject({ method: 'GET', url: '/cart', headers: authed() })).json().cart
    expect(cart.items).toHaveLength(0)
  })

  it('recusa endereço incompleto com erro por campo', async () => {
    await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: authed(),
      payload: { bookId: pedraId, quantity: 1 },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: authed(),
      payload: { ...delivery, zipCode: '123' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().issues.zipCode).toBeTruthy()
  })

  it('cancela o pedido e devolve os exemplares à prateleira', async () => {
    const orders = (await app.inject({ method: 'GET', url: '/orders', headers: authed() })).json().orders
    const target = orders[0]

    // Quantos exemplares voltam para o estoque é o que o próprio pedido diz. O
    // teste não repete o número escolhido no checkout.
    const devolvidos = target.items
      .filter((item: { title: string }) => item.title === 'Harry Potter e o Prisioneiro de Azkaban')
      .reduce((total: number, item: { quantity: number }) => total + item.quantity, 0)

    const before = (await app.inject({ method: 'GET', url: '/catalog/books/harry-potter-e-o-prisioneiro-de-azkaban' })).json()
      .book.stock

    const cancelled = await app.inject({
      method: 'PATCH',
      url: '/orders/' + target.id + '/cancel',
      headers: authed(),
    })

    expect(cancelled.statusCode).toBe(200)
    expect(cancelled.json().order.status).toBe('CANCELLED')

    const after = (await app.inject({ method: 'GET', url: '/catalog/books/harry-potter-e-o-prisioneiro-de-azkaban' })).json()
      .book.stock

    expect(after).toBe(before + devolvidos)

    const again = await app.inject({
      method: 'PATCH',
      url: '/orders/' + target.id + '/cancel',
      headers: authed(),
    })

    expect(again.statusCode).toBe(400)
  })

  it('nunca expõe o pedido de outro leitor', async () => {
    const otherToken = await register()
    const orders = (await app.inject({ method: 'GET', url: '/orders', headers: authed() })).json().orders

    const response = await app.inject({
      method: 'GET',
      url: '/orders/' + orders[0].id,
      headers: { authorization: 'Bearer ' + otherToken },
    })

    expect(response.statusCode).toBe(404)
  })
})
