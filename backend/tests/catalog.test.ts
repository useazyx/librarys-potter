import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { CATALOG } from '../prisma/catalog.js'
import { buildApp } from '../src/app.js'

let app: FastifyInstance

/**
 * As contagens saem do próprio catálogo semeado, e não de números fixos: o
 * acervo cresce a cada sessão de trabalho, e um teste que trava o total em "21"
 * quebra sozinho no dia seguinte sem ter achado bug nenhum.
 */
const countKind = (kind: string) => CATALOG.filter((item) => item.kind === kind).length

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
    // "Pelo menos", e não "exatamente": a suíte do painel cadastra um livro
    // novo, e a ordem entre os arquivos de teste não é garantida.
    expect(books.length).toBeGreaterThanOrEqual(CATALOG.length)
    expect(typeof books[0].price).toBe('number')
    expect(books[0].author.name).toBe('J. K. Rowling')
  })

  it('separa o acervo por tipo, e artigo de fã vem sem autor', async () => {
    const pedido = (kind: string) => app.inject({ method: 'GET', url: '/catalog/books?kind=' + kind })

    const livros = await pedido('BOOK')
    const caixas = await pedido('BOX_SET')
    const varinhas = await pedido('WAND')

    expect(livros.json().books.length).toBeGreaterThanOrEqual(countKind('BOOK'))
    expect(caixas.json().books).toHaveLength(countKind('BOX_SET'))
    expect(varinhas.json().books).toHaveLength(countKind('WAND'))

    expect(livros.json().books.every((b: { kind: string }) => b.kind === 'BOOK')).toBe(true)

    // Varinha não tem autor, editora nem ISBN, e o contrato diz isso.
    const varinha = varinhas.json().books.find((b: { slug: string }) => b.slug === 'varinha-de-harry-potter')
    expect(varinha.author).toBeNull()
    expect(varinha.publisher).toBeNull()
    expect(varinha.isbn).toBeNull()
  })

  it('agrupa os tipos em departamentos', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/departments' })
    const { departments } = response.json()

    expect(response.statusCode).toBe(200)
    expect(departments).toHaveLength(7)

    // "Pelo menos" porque a suite do painel cadastra um livro e pode rodar antes desta.
    const livros = departments.find((d: { slug: string }) => d.slug === 'livros')
    expect(livros.count).toBeGreaterThanOrEqual(countKind('BOOK') + countKind('BOX_SET') + countKind('SPECIAL_EDITION'))
    expect(livros.minPrice).toBeLessThanOrEqual(livros.maxPrice)

    // A soma dos corredores tem de dar o acervo: nenhum tipo pode ficar de fora.
    const total = departments.reduce((sum: number, d: { count: number }) => sum + d.count, 0)
    const acervo = (await app.inject({ method: 'GET', url: '/catalog/books' })).json().books.length
    expect(total).toBe(acervo)
  })

  it('filtra por departamento, e o produto já vem sabendo o seu', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books?department=varinhas' })
    const { books } = response.json()

    expect(books).toHaveLength(countKind('WAND'))
    expect(books.every((book: { department: string }) => book.department === 'varinhas')).toBe(true)
  })

  it('cruza departamento e tipo sem se contradizer', async () => {
    // Tipo dentro do departamento: estreita.
    const dentro = await app.inject({ method: 'GET', url: '/catalog/books?department=livros&kind=BOX_SET' })
    expect(dentro.json().books).toHaveLength(countKind('BOX_SET'))

    // Tipo fora do departamento: nada satisfaz os dois, e a resposta é vazia.
    const fora = await app.inject({ method: 'GET', url: '/catalog/books?department=varinhas&kind=BOOK' })
    expect(fora.json().books).toHaveLength(0)
  })

  it('filtra por casa e por marca', async () => {
    const sonserina = await app.inject({ method: 'GET', url: '/catalog/books?house=sonserina' })
    const lego = await app.inject({ method: 'GET', url: '/catalog/books?brand=LEGO' })

    expect(sonserina.json().books.length).toBeGreaterThan(0)
    expect(sonserina.json().books.every((b: { house: string }) => b.house === 'sonserina')).toBe(true)

    expect(lego.json().books).toHaveLength(CATALOG.filter((item) => item.brand === 'LEGO').length)
    expect(lego.json().books.every((b: { brand: string }) => b.brand === 'LEGO')).toBe(true)
  })

  it('lista as marcas com contagem', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/brands' })
    const { brands } = response.json()

    expect(response.statusCode).toBe(200)
    expect(brands.length).toBeGreaterThan(3)
    // Vem da maior para a menor.
    expect(brands[0].count).toBeGreaterThanOrEqual(brands[brands.length - 1].count)
  })

  it('calcula o desconto a partir do preço de tabela', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books?onSale=true&sort=discount' })
    const { books } = response.json()

    expect(books.length).toBeGreaterThan(0)

    for (const book of books) {
      expect(book.compareAtPrice).toBeGreaterThan(book.price)
      expect(book.discount).toBe(Math.round(((book.compareAtPrice - book.price) / book.compareAtPrice) * 100))
    }

    // Ordenado por desconto: o primeiro nunca desconta menos que o último.
    expect(books[0].discount).toBeGreaterThanOrEqual(books[books.length - 1].discount)
  })

  it('produto sem promoção não inventa desconto', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books/harry-potter-e-a-camara-secreta' })
    const { book } = response.json()

    expect(book.compareAtPrice).toBeNull()
    expect(book.discount).toBe(0)
  })

  it('recusa um tipo que não existe', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books?kind=VARINHA' })
    expect(response.statusCode).toBe(400)
  })

  it('busca por título, por autor e por ISBN', async () => {
    const byTitle = await app.inject({ method: 'GET', url: '/catalog/books?search=azkaban' })
    const byAuthor = await app.inject({ method: 'GET', url: '/catalog/books?search=rowling' })
    const byIsbn = await app.inject({ method: 'GET', url: '/catalog/books?search=9788532530783' })
    const byBrand = await app.inject({ method: 'GET', url: '/catalog/books?search=lego' })

    const titulos = byTitle.json().books.map((b: { title: string }) => b.title)
    expect(titulos).toContain('Harry Potter e o Prisioneiro de Azkaban')

    // A autora assina só o que tem ficha bibliográfica.
    expect(byAuthor.json().books.length).toBeGreaterThanOrEqual(CATALOG.filter((item) => item.biblio).length)
    expect(byIsbn.json().books[0].title).toBe('Harry Potter e a Pedra Filosofal')
    // A busca agora alcança a marca: procurar "lego" acha as caixas de montar.
    expect(byBrand.json().books.length).toBeGreaterThanOrEqual(CATALOG.filter((i) => i.brand === 'LEGO').length)
  })

  it('filtra por faixa de preço e ordena', async () => {
    const cheap = await app.inject({ method: 'GET', url: '/catalog/books?maxPrice=100' })
    const ordered = await app.inject({ method: 'GET', url: '/catalog/books?sort=price-desc' })

    expect(cheap.json().books.every((book: { price: number }) => book.price <= 100)).toBe(true)

    const precos = ordered.json().books.map((book: { price: number }) => book.price)
    expect(precos[0]).toBeGreaterThanOrEqual(Math.max(...CATALOG.map((item) => item.price)))
    expect([...precos].sort((a: number, b: number) => b - a)).toEqual(precos)
  })

  it('limita a quantidade quando a vitrine pede pouco', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books?limit=6' })
    expect(response.json().books).toHaveLength(6)
  })

  it('devolve o livro com sinopse, estrelas e recomendações', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books/harry-potter-e-a-pedra-filosofal' })
    const { book } = response.json()

    expect(response.statusCode).toBe(200)
    expect(book.price).toBe(44.9)
    expect(book.synopsis).toContain('armário sob a escada')
    expect(book.rating.count).toBe(2)
    expect(book.rating.average).toBe(5)
    expect(book.reviews).toHaveLength(2)
    expect(book.related.length).toBeGreaterThan(0)
    expect(book.ratingDistribution).toHaveLength(5)
  })

  it('recomenda dentro do mesmo corredor da loja', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalog/books/varinha-de-harry-potter' })
    const { book } = response.json()

    expect(book.department).toBe('varinhas')
    expect(book.related.length).toBeGreaterThan(0)
    // Uma varinha puxava livro de fantasia antes de o corredor entrar na conta.
    expect(book.related.some((item: { department: string }) => item.department === 'varinhas')).toBe(true)
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

    // A autora assina só o que tem ficha bibliográfica, nunca uma varinha.
    expect(authors.json().authors[0].bookCount).toBeGreaterThanOrEqual(CATALOG.filter((item) => item.biblio).length)
    expect(publishers.json().publishers[0].name).toBe('Editora Rocco')

    const generos: Array<{ genre: string; count: number }> = genres.json().genres
    const esperado = (genre: string) => CATALOG.filter((item) => item.genre === genre).length

    // Fantasia é o gênero que a suíte do painel usa para cadastrar; por isso
    // aqui a comparação é "pelo menos". Varinha ninguém mexe, e vale exata.
    expect(generos.find((g) => g.genre === 'Fantasia')!.count).toBeGreaterThanOrEqual(esperado('Fantasia'))
    expect(generos.find((g) => g.genre === 'Varinha')).toEqual({ genre: 'Varinha', count: esperado('Varinha') })
  })
})
