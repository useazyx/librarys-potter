import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'

let app: FastifyInstance

const account = {
  name: 'Leitor de Teste',
  email: 'leitor.' + Date.now() + '@example.com',
  password: 'expelliarmus1',
}

beforeAll(async () => {
  app = await buildApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

describe('autenticação', () => {
  it('cadastra um leitor, devolve token e grava o cookie de sessão', async () => {
    const response = await app.inject({ method: 'POST', url: '/auth/register', payload: account })
    const body = response.json()

    expect(response.statusCode).toBe(201)
    expect(body.user.role).toBe('CUSTOMER')
    expect(body.token).toBeTruthy()
    expect(response.cookies.some((cookie) => cookie.name === 'token' && cookie.httpOnly)).toBe(true)
  })

  it('cadastra nos três papéis do site antigo', async () => {
    const supplier = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { ...account, email: 'forn.' + Date.now() + '@example.com', role: 'SUPPLIER' },
    })

    const support = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { ...account, email: 'sup.' + Date.now() + '@example.com', role: 'SUPPORT' },
    })

    expect(supplier.json().user.role).toBe('SUPPLIER')
    expect(support.json().user.role).toBe('SUPPORT')
  })

  it('recusa um papel inventado', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { ...account, email: 'root.' + Date.now() + '@example.com', role: 'ADMIN' },
    })

    expect(response.statusCode).toBe(400)
  })

  it('recusa e-mail repetido com 409', async () => {
    const response = await app.inject({ method: 'POST', url: '/auth/register', payload: account })

    expect(response.statusCode).toBe(409)
    expect(response.json().code).toBe('CONFLICT')
  })

  it('nunca devolve o hash da senha', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: account.email, password: account.password },
    })

    expect(response.statusCode).toBe(200)
    expect(JSON.stringify(response.json())).not.toContain('passwordHash')
  })

  it('recusa senha errada sem dizer qual campo falhou', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: account.email, password: 'alohomora' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().error).toBe('E-mail ou senha incorretos.')
  })

  it('bloqueia /auth/me sem token', async () => {
    const response = await app.inject({ method: 'GET', url: '/auth/me' })

    expect(response.statusCode).toBe(401)
  })

  it('devolve o perfil com estatísticas do leitor semeado', async () => {
    const login = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'agostinhocarrara@gmail.com', password: 'libraryspotter' },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: 'Bearer ' + login.json().token },
    })

    const { user } = response.json()

    expect(user.name).toBe('Agostinho Carrara')
    expect(user.stats.orders).toBe(1)
    expect(user.stats.reviews).toBe(1)
    expect(user.stats.tickets).toBe(1)
    expect(user.stats.totalSpent).toBe(900)
  })

  it('redefine a senha pelo fluxo de token e recusa reutilizar o link', async () => {
    const forgot = await app.inject({
      method: 'POST',
      url: '/auth/forgot-password',
      payload: { email: account.email },
    })

    const { token } = forgot.json()
    expect(token).toBeTruthy()

    const reset = await app.inject({
      method: 'POST',
      url: '/auth/reset-password',
      payload: { token, password: 'wingardiumleviosa' },
    })

    expect(reset.statusCode).toBe(200)

    const login = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: account.email, password: 'wingardiumleviosa' },
    })

    expect(login.statusCode).toBe(200)

    const reuse = await app.inject({
      method: 'POST',
      url: '/auth/reset-password',
      payload: { token, password: 'outrasenha123' },
    })

    expect(reuse.statusCode).toBe(400)
  })

  it('não revela se um e-mail desconhecido existe', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/forgot-password',
      payload: { email: 'ninguem@example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().token).toBeNull()
  })
})
