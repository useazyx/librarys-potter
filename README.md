# Library's Potter

Site completo da livraria **Library's Potter**, dedicada à saga Harry Potter, reconstruído a
partir do projeto PHP/MySQL original — o mesmo acervo, os mesmos preços, os mesmos três papéis
de usuário — agora com API tipada, banco relacional, autenticação e carrinho no servidor.

```
g2/
├── backend/     API Fastify + Prisma + PostgreSQL (TypeScript)
├── frontend/    React 19 + TypeScript + Vite + Tailwind v4 (Framer Motion, GSAP, Embla, Lenis)
└── legacy/      O projeto antigo, preservado integralmente (PHP, CSS, imagens e bd.sql)
```

---

## Como rodar

### 1. Pré-requisitos

- Node.js 20+
- PostgreSQL 17 rodando em `localhost:5432`

### 2. Banco de dados

Crie os dois bancos (o segundo é usado só pelos testes):

```bash
psql -U postgres -c "CREATE DATABASE librarys_potter;"
psql -U postgres -c "CREATE DATABASE librarys_potter_test;"
```

Ajuste a `DATABASE_URL` em `backend/.env` se o seu usuário/senha do Postgres for diferente de
`postgres/postgres`.

### 3. Backend

```bash
cd backend
npm install
npx prisma migrate deploy   # cria as tabelas
npm run db:seed             # popula acervo, avaliações, pedidos e chamados de demonstração
npm run dev                 # http://localhost:3334
```

A porta é **3334** de propósito: o projeto irmão (`g`, Casa Fiorelli) usa a 3333, então os dois
rodam ao mesmo tempo.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5174
```

O Vite faz proxy de `/api` para `http://localhost:3334`, então basta abrir
<http://localhost:5174>.

### Contas de demonstração

Senha `libraryspotter` para todas.

| Papel      | E-mail                       | O que enxerga                                   |
|------------|------------------------------|-------------------------------------------------|
| Leitor     | `agostinhocarrara@gmail.com` | Catálogo, carrinho, pedidos, avaliações, chamados |
| Fornecedor | `japalivros@gmail.com`       | \+ painel: catálogo, autores/editoras, vendas    |
| Suporte    | `memphisdepay@gmail.com`     | \+ fila de chamados, usuários e exclusões        |

Também existem `bruna@example.com` e `caio@example.com` (leitores, com avaliações e um pedido a
caminho).

---

## Testes

```bash
cd backend  && npm test    # 43 testes de API (Vitest + app.inject, banco de teste real)
cd frontend && npm test    # 19 testes de componentes, catálogo e cadastro
```

Os testes do backend rodam contra `librarys_potter_test`: o `global-setup` aplica as migrations
com `prisma migrate deploy` e roda o seed (que limpa as tabelas antes de popular). Nenhum comando
destrutivo (`db push --force-reset`) é usado.

---

## O que o site faz

**Público**
- Home com abertura cinematográfica, prateleira dos destaques e chamadas para o acervo
- Catálogo com busca por título/autor/ISBN e filtros de gênero, autor, editora, preço e estoque —
  todos refletidos na URL, então um catálogo filtrado pode ser compartilhado
- Página do livro com sinopse, trecho, distribuição de notas, avaliações com selo de **compra
  verificada** e títulos relacionados
- "A saga": linha do tempo dos sete livros animada por scroll (GSAP ScrollTrigger)
- Central de ajuda com FAQ e abertura de chamado (funciona sem login, como no site antigo)

**Com conta de leitor**
- Cadastro escolhendo o papel (leitor, fornecedor ou suporte), login com JWT e redefinição de
  senha por token
- Carrinho no servidor — os preços são sempre relidos do banco — com frete grátis acima de R$ 250
- Checkout com endereço de entrega; a baixa de estoque acontece **dentro da transação**, então
  dois pedidos simultâneos não vendem o mesmo último exemplar
- Perfil com pedidos (e cancelamento, que devolve os exemplares à estante), minhas avaliações,
  meus chamados e dados da conta
- Uma avaliação por leitor por livro: a segunda edita a primeira

**Painel (`/painel`)**
- **Fornecedor**: cadastro e edição de livros, autores e editoras; relatório de vendas com
  faturamento, ticket médio, mais vendidos, estoque baixo e últimos pedidos
- **Suporte**: tudo isso, mais a fila de chamados (ordenada por status e urgência), a lista de
  usuários e o direito exclusivo de apagar registros

---

## Arquitetura

### Backend (`backend/`)

```
src/
├── config/       env validado com zod, cliente Prisma
├── controllers/  validação zod + resposta HTTP (um handler por operação)
├── errors/       erros de domínio + handleError() com o mapa de status
├── plugins/      auth (JWT, guards authenticate/authorize)
├── routes/       rotas por entidade, registradas em routes/index.ts
├── services/     regras de negócio (única camada que fala com o Prisma)
└── utils/        senha, dinheiro, código do pedido
```

Regra que vale a pena manter: **controller não chama Prisma, service não conhece HTTP.**

11 tabelas: `User`, `PasswordReset`, `Author`, `Publisher`, `Book`, `Review`, `Cart`, `CartItem`,
`Order`, `OrderItem`, `SupportTicket`.

Detalhes de projeto que importam:
- Itens do pedido guardam **snapshot** de título, capa e preço — editar o catálogo não reescreve
  o histórico, e apagar um livro vendido o arquiva em vez de removê-lo.
- Estoque é debitado e devolvido dentro da transação do pedido, nunca depois dela.
- `forgot-password` responde igual para e-mail existente ou não (não vaza cadastro).

### Frontend (`frontend/`)

```
src/
├── components/   layout, ui (Button, Field, Modal, Stars, Loaders), home, catalog
├── context/      Auth, Cart e Toast
├── hooks/        useReveal (IntersectionObserver), useSmoothScroll (Lenis)
├── lib/          cliente de API tipado + formatadores pt-BR
├── pages/        uma por rota, todas com lazy loading
└── types/        contratos da API
```

Design "as quatro casas": a base é o castelo — pedra fria (`stone-*`) e giz (`chalk-*`) — e a cor
entra pela casa que o leitor escolhe. Escolher a casa reveste o site inteiro, e a escolha é
lembrada na próxima visita. Títulos em Cinzel, citações em EB Garamond, texto em Inter. Todas as
animações respeitam `prefers-reduced-motion`, o foco de teclado é visível e as imagens abaixo da
dobra usam `loading="lazy"`.

---

## Imagens

As capas dos livros são **do projeto original**, apenas convertidas para WebP. As fotografias de
cenário vieram do Wikimedia Commons sob licenças que exigem atribuição — os créditos estão em
`frontend/public/CREDITOS-IMAGENS.md`, ligado no rodapé do site.

---

## Detalhe herdado do site antigo

Os preços vêm exatamente do `bd.sql` original: Pedra Filosofal R$ 200, Enigma do Príncipe R$ 300,
**Câmara Secreta R$ 900**, Cálice de Fogo R$ 300, Prisioneiro de Azkaban R$ 400. O valor da
Câmara Secreta parece ter sido um dado de teste do trabalho antigo, mas foi mantido fiel à fonte.
Para ajustar, é uma linha em `backend/prisma/seed.ts`.
