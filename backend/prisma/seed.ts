/**
 * Seeds Library's Potter with the catalogue of the original project: the same
 * five books, prices and stock levels of bd.sql, and the same cast of users
 * (Agostinho, Japa e Memphis) in their three roles.
 * Synopses and excerpts are new copy — the old database had none.
 *
 * One deliberate departure from bd.sql: A Câmara Secreta is priced R$ 300 here
 * and not the R$ 900 of the old dump. That row carried preço 900, estoque 900
 * and a sale of quantidade 999 — someone filling the form with mashed digits,
 * not a real price. `legacy/bd.sql` keeps the original number, as it must.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const BOOKS = [
  {
    slug: 'harry-potter-e-a-pedra-filosofal',
    title: 'Harry Potter e a Pedra Filosofal',
    isbn: '9781234567890',
    price: 200,
    stock: 50,
    cover: 'pedra-filosofal',
    pages: 264,
    publishedAt: '1997-06-26',
    featured: true,
    synopsis:
      'A vida do menino Harry Potter não tem um pingo de magia. Ele vive com os tios e o primo, que não gostam nem um pouco dele. O quarto de Harry é, na verdade, um armário sob a escada, e ele nunca comemorou um aniversário sequer em onze anos. Até que, um dia, Harry recebe uma carta misteriosa, entregue por uma coruja: um convite para estudar num lugar incrível chamado Escola de Magia e Bruxaria Hogwarts.',
    excerpt:
      '"O senhor é um bruxo, Harry." Foi assim, numa cabana no meio do mar, que o menino descobriu quem sempre tinha sido.',
  },
  {
    slug: 'harry-potter-e-o-enigma-do-principe',
    title: 'Harry Potter e o Enigma do Príncipe',
    isbn: '9781234567891',
    price: 300,
    stock: 80,
    cover: 'enigma-do-principe',
    pages: 528,
    publishedAt: '2005-07-16',
    featured: true,
    synopsis:
      'O mundo bruxo já não finge que está tudo bem: Voldemort agiu à luz do dia e o medo voltou a atravessar as ruas. Em Hogwarts, Harry recebe um livro de Poções cheio de anotações de um antigo aluno que assina como Príncipe Mestiço, e passa o ano dividido entre as aulas particulares de Dumbledore e a lembrança de um garoto chamado Tom Riddle.',
    excerpt:
      'É preciso muita coragem para enfrentar os inimigos, mas é preciso ainda mais para enfrentar os amigos.',
  },
  {
    slug: 'harry-potter-e-a-camara-secreta',
    title: 'Harry Potter e a Câmara Secreta',
    isbn: '9781234567892',
    // R$ 900 no bd.sql; ver a nota no topo do arquivo.
    price: 300,
    stock: 900,
    cover: 'camara-secreta',
    pages: 288,
    publishedAt: '1998-07-02',
    synopsis:
      'De volta a Hogwarts para o segundo ano, Harry começa a ouvir uma voz que ninguém mais escuta e mensagens aparecem escritas nas paredes do castelo. A lenda da Câmara Secreta, aberta por um herdeiro de Sonserina, deixa de ser história antiga quando os alunos começam a ser petrificados um a um.',
    excerpt:
      'São as nossas escolhas, Harry, que revelam o que realmente somos, muito mais do que as nossas qualidades.',
  },
  {
    slug: 'harry-potter-e-o-calice-de-fogo',
    title: 'Harry Potter e o Cálice de Fogo',
    isbn: '9781234567893',
    price: 300,
    stock: 800,
    cover: 'calice-de-fogo',
    pages: 640,
    publishedAt: '2000-07-08',
    featured: true,
    synopsis:
      'Hogwarts recebe o Torneio Tribruxo e, com ele, delegações de outras escolas de magia. O Cálice de Fogo escolhe três campeões — e, contra todas as regras, cospe um quarto nome: Harry Potter. Entre dragões, sereianos e um labirinto, o ano em que a infância termina.',
    excerpt:
      'Vem aí um tempo em que teremos de escolher entre o que é certo e o que é fácil.',
  },
  {
    slug: 'harry-potter-e-o-prisioneiro-de-azkaban',
    title: 'Harry Potter e o Prisioneiro de Azkaban',
    isbn: '9781234567894',
    price: 400,
    stock: 700,
    cover: 'prisioneiro-de-azkaban',
    pages: 352,
    publishedAt: '1999-07-08',
    synopsis:
      'Sirius Black fugiu de Azkaban e, segundo dizem, vem atrás de Harry. Dementadores cercam a escola, o passado dos pais de Harry volta à tona e um mapa antigo mostra que nem tudo em Hogwarts é o que parece. Um livro sobre tempo, medo e sobre aprender a conjurar a própria luz.',
    excerpt:
      'A felicidade pode ser encontrada mesmo nas horas mais sombrias, se a pessoa lembrar de acender a luz.',
  },
]

async function main() {
  console.log('Limpando dados anteriores...')

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.review.deleteMany()
  await prisma.supportTicket.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.user.deleteMany()
  await prisma.book.deleteMany()
  await prisma.author.deleteMany()
  await prisma.publisher.deleteMany()

  console.log('Semeando autora e editora...')

  const rowling = await prisma.author.create({
    data: {
      slug: 'j-k-rowling',
      name: 'J. K. Rowling',
      nationality: 'Britânica',
      bio: 'Criou em sete livros a maior saga bruxa de todos os tempos: mais de 450 milhões de exemplares vendidos, traduções em 78 idiomas e uma série de filmes inesquecíveis.',
      photoUrl: '/img/scenes/autora.webp',
    },
  })

  const rocco = await prisma.publisher.create({
    data: { slug: 'rocco', name: 'Editora Rocco', city: 'Rio de Janeiro', founded: 1975 },
  })

  console.log('Semeando catálogo...')

  await prisma.book.createMany({
    data: BOOKS.map((book, index) => ({
      slug: book.slug,
      title: book.title,
      isbn: book.isbn,
      authorId: rowling.id,
      publisherId: rocco.id,
      price: book.price,
      stock: book.stock,
      genre: 'Fantasia',
      synopsis: book.synopsis,
      excerpt: book.excerpt,
      coverUrl: '/img/books/' + book.cover + '.webp',
      pages: book.pages,
      language: 'Português',
      featured: book.featured ?? false,
      publishedAt: new Date(book.publishedAt),
      position: index + 1,
    })),
  })

  console.log('Semeando usuários...')

  const passwordHash = await bcrypt.hash('libraryspotter', 10)

  // The three accounts of bd.sql, one per role.
  const agostinho = await prisma.user.create({
    data: {
      name: 'Agostinho Carrara',
      email: 'agostinhocarrara@gmail.com',
      passwordHash,
      role: 'CUSTOMER',
      cart: { create: {} },
    },
  })

  const japa = await prisma.user.create({
    data: { name: 'Japa', email: 'japalivros@gmail.com', passwordHash, role: 'SUPPLIER', cart: { create: {} } },
  })

  const memphis = await prisma.user.create({
    data: {
      name: 'Memphis Depay',
      email: 'memphisdepay@gmail.com',
      passwordHash,
      role: 'SUPPORT',
      cart: { create: {} },
    },
  })

  const bruna = await prisma.user.create({
    data: { name: 'Bruna Almeida', email: 'bruna@example.com', passwordHash, role: 'CUSTOMER', cart: { create: {} } },
  })

  const caio = await prisma.user.create({
    data: { name: 'Caio Nogueira', email: 'caio@example.com', passwordHash, role: 'CUSTOMER', cart: { create: {} } },
  })

  console.log('Semeando avaliações...')

  const pedra = await prisma.book.findUniqueOrThrow({ where: { slug: 'harry-potter-e-a-pedra-filosofal' } })
  const camara = await prisma.book.findUniqueOrThrow({ where: { slug: 'harry-potter-e-a-camara-secreta' } })
  const azkaban = await prisma.book.findUniqueOrThrow({
    where: { slug: 'harry-potter-e-o-prisioneiro-de-azkaban' },
  })

  await prisma.review.createMany({
    data: [
      // A avaliação original do banco antigo, preservada.
      { bookId: camara.id, userId: agostinho.id, rating: 3, comment: 'um lixo' },
      {
        bookId: pedra.id,
        userId: bruna.id,
        rating: 5,
        comment: 'Reli pela quarta vez e continua sendo o começo perfeito. A edição da Rocco é linda.',
      },
      {
        bookId: pedra.id,
        userId: caio.id,
        rating: 5,
        comment: 'Comprei para o meu sobrinho e acabei lendo antes de entregar. Chegou rápido e bem embalado.',
      },
      {
        bookId: azkaban.id,
        userId: bruna.id,
        rating: 4,
        comment: 'O melhor da saga na minha opinião. Só achei o preço um pouco salgado.',
      },
    ],
  })

  console.log('Semeando pedidos...')

  await prisma.order.create({
    data: {
      code: 'LP-4K7M2P',
      userId: agostinho.id,
      status: 'DELIVERED',
      subtotal: 300,
      shipping: 0,
      total: 300,
      recipient: 'Agostinho Carrara',
      address: 'Rua do Catete, 1010',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22220-000',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21),
      items: {
        create: [
          { bookId: camara.id, title: camara.title, coverUrl: camara.coverUrl, unitPrice: camara.price, quantity: 1 },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      code: 'LP-9T3X8B',
      userId: bruna.id,
      status: 'SHIPPED',
      subtotal: 600,
      shipping: 0,
      total: 600,
      recipient: 'Bruna Almeida',
      address: 'Avenida Paulista, 900, apto 71',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
      items: {
        create: [
          { bookId: pedra.id, title: pedra.title, coverUrl: pedra.coverUrl, unitPrice: pedra.price, quantity: 1 },
          { bookId: azkaban.id, title: azkaban.title, coverUrl: azkaban.coverUrl, unitPrice: azkaban.price, quantity: 1 },
        ],
      },
    },
  })

  console.log('Semeando chamados de suporte...')

  await prisma.supportTicket.createMany({
    data: [
      {
        // O chamado original do bd.sql, preservado.
        code: '#A7K2M',
        userId: agostinho.id,
        name: 'Agostinho Carrara',
        email: 'agostinhocarrara@gmail.com',
        subject: 'Dúvida sobre o site',
        description: 'como faço pra fazer um site bom igual esse?',
        urgency: 'HIGH',
        status: 'OPEN',
      },
      {
        code: '#B4N9Q',
        userId: bruna.id,
        name: 'Bruna Almeida',
        email: 'bruna@example.com',
        subject: 'Pedido chegou com a capa amassada',
        description:
          'O pedido LP-9T3X8B chegou hoje, mas a capa do Prisioneiro de Azkaban veio amassada no canto. Gostaria de trocar.',
        urgency: 'MEDIUM',
        status: 'IN_PROGRESS',
        handledById: memphis.id,
      },
      {
        code: '#C2P5R',
        name: 'Visitante',
        email: 'visitante@example.com',
        subject: 'Vocês têm a edição de capa dura?',
        description: 'Procuro a edição comemorativa de capa dura da Pedra Filosofal. Vocês trabalham com ela?',
        urgency: 'LOW',
        status: 'RESOLVED',
        handledById: memphis.id,
        resolution: 'Respondido por e-mail: no momento trabalhamos apenas com as edições de capa comum da Rocco.',
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
    ],
  })

  console.log('Seed concluído.')
  console.log('  leitor:     ' + agostinho.email + ' / libraryspotter')
  console.log('  fornecedor: ' + japa.email + ' / libraryspotter')
  console.log('  suporte:    ' + memphis.email + ' / libraryspotter')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
