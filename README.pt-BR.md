# Library's Potter

Livraria e loja do mundo bruxo da saga Harry Potter. É a reconstrução do trabalho antigo em
PHP/MySQL com API própria, banco relacional, autenticação e carrinho no servidor. Os três papéis
de usuário do site original continuam aqui: leitor, fornecedor e suporte.

São 142 produtos em sete departamentos (livros, varinhas, colecionáveis, vestuário, papelaria,
jogos e casa e decoração), com filtros na URL, avaliações, pedidos, fila de chamados e um painel
administrativo.

```
librarys-potter/
├── backend/     API em Fastify + Prisma + PostgreSQL (TypeScript)
└── frontend/    Interface em React + Vite + Tailwind (TypeScript)
```

## Requisitos do trabalho

| Requisito     | Onde está                                                                          |
|---------------|------------------------------------------------------------------------------------|
| API           | `backend/src/routes/`: 44 endpoints REST em 8 grupos, mais `/health`      |
| Banco de dados| PostgreSQL modelado em `backend/prisma/schema.prisma`: 11 tabelas com relações      |
| Interface     | `frontend/src/pages/`: 17 telas em React, consumindo a API                          |
| Arquitetura   | MVC: modelo no Prisma, controllers no backend, views no frontend (detalhado abaixo) |
| Testes        | `backend/tests/` e `frontend/src/test/`: 54 testes de API e 44 de interface         |

## Como rodar

Precisa de Node 20+ e PostgreSQL 17 rodando em `localhost:5432`.

**1. Criar os bancos** (o segundo é usado só pelos testes):

```bash
psql -U postgres -c "CREATE DATABASE librarys_potter;"
psql -U postgres -c "CREATE DATABASE librarys_potter_test;"
```

Se o seu usuário e senha do Postgres forem diferentes de `postgres/postgres`, ajuste a
`DATABASE_URL` em `backend/.env`.

**2. Backend:**

```bash
cd backend
npm install
npx prisma migrate deploy   # cria as tabelas
npm run db:seed             # popula o banco
npm run dev                 # http://localhost:3334
```

**3. Frontend:**

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5174
```

O Vite faz proxy de `/api` para a porta 3334, então basta abrir <http://localhost:5174>.

A porta 3334 é de propósito: outro projeto meu usa a 3333 e assim os dois rodam ao mesmo tempo.

### Contas para testar

Todas com a senha `libraryspotter`.

| Papel      | E-mail                       | O que enxerga                                     |
|------------|------------------------------|---------------------------------------------------|
| Leitor     | `agostinhocarrara@gmail.com` | Catálogo, carrinho, pedidos, avaliações, chamados  |
| Fornecedor | `japalivros@gmail.com`       | O mesmo, mais o painel de catálogo e vendas        |
| Suporte    | `memphisdepay@gmail.com`     | O mesmo, mais a fila de chamados e os usuários     |

O seed grava 26 usuários, 71 avaliações, 39 pedidos e 12 chamados, então as telas de painel e de
perfil já abrem com dado de verdade.

## Arquitetura

O projeto segue MVC com a camada de apresentação separada do servidor:

**Model.** As entidades e as relações estão em `backend/prisma/schema.prisma`. O Prisma gera o
cliente tipado, e só a camada de serviços fala com ele. São 11 tabelas: `users`,
`password_resets`, `authors`, `publishers`, `books`, `reviews`, `carts`, `cart_items`, `orders`,
`order_items` e `support_tickets`.

**Controller.** `backend/src/controllers/` recebe a requisição, valida a entrada com zod e devolve
a resposta HTTP. A regra de negócio fica em `backend/src/services/`, que é a única camada que usa
o Prisma. `backend/src/routes/` só liga rota a controller e aplica os guards de papel.

**View.** `frontend/src/pages/`, uma página por rota, consumindo a API pelo cliente tipado de
`frontend/src/lib/api.ts`. Nenhuma página fala com o banco: tudo passa pela API.

```
backend/src/
├── config/       env validado com zod, cliente Prisma
├── controllers/  validação e resposta HTTP
├── errors/       erros de domínio e o mapa para status HTTP
├── plugins/      autenticação JWT e os guards de papel
├── routes/       rota -> controller, registradas em routes/index.ts
├── services/     regras de negócio (única camada que usa o Prisma)
└── utils/        senha, dinheiro e geração de código de pedido

frontend/src/
├── components/   layout, ui, catálogo, casas, configurações
├── context/      Settings, House, Auth, Cart e Toast
├── hooks/        rolagem suave, reveal, som ambiente
├── lib/          cliente da API e formatadores pt-BR
├── pages/        uma por rota, com carregamento sob demanda
└── types/        os contratos da API
```

Duas regras que o código segue em todo lugar: controller não chama o Prisma, e serviço não conhece
HTTP.

### Endpoints

| Grupo       | Rotas                                                                     |
|-------------|---------------------------------------------------------------------------|
| `/auth`     | cadastro, login, logout, esqueci a senha, redefinir senha, perfil atual    |
| `/catalog`  | produtos, produto por slug, autores, editoras, gêneros, marcas, departamentos |
| `/cart`     | ver, adicionar, alterar quantidade, remover, esvaziar                     |
| `/orders`   | fechar pedido, listar, ver um, cancelar                                   |
| `/reviews`  | minhas avaliações, avaliar um produto, apagar                             |
| `/support`  | abrir chamado, meus chamados, fila, resumo, atender                       |
| `/profile`  | dados da conta e troca de senha                                           |
| `/admin`    | CRUD de produtos, autores e editoras, relatório de vendas, usuários       |

### Decisões de projeto que valem citar

- Os itens do pedido guardam uma cópia do título, do preço e da capa. Editar o catálogo depois não
  reescreve o histórico de quem já comprou, e apagar um produto vendido zera o estoque em vez de
  remover a linha.
- A baixa de estoque acontece dentro da transação do checkout, e o cancelamento devolve os itens na
  mesma transação. Sem isso, dois pedidos ao mesmo tempo venderiam o mesmo último exemplar. Existe
  teste para esse caso.
- Preço é `Decimal` no banco e sempre vira `number` na resposta. O total do pedido é recalculado no
  servidor a partir do preço do banco, nunca do que o cliente mandou.
- O `forgot-password` responde a mesma coisa para e-mail cadastrado e não cadastrado, senão a rota
  vira uma forma de descobrir quem tem conta.
- Os filtros do catálogo vivem na URL, então um catálogo filtrado pode ser compartilhado e
  sobrevive ao recarregar a página.

## Testes

```bash
cd backend  && npm test    # 54 testes de API
cd frontend && npm test    # 44 testes de interface
```

Os testes do backend sobem a aplicação com `buildApp()` e usam `app.inject()`, sem abrir porta.
Eles rodam contra o banco `librarys_potter_test`: o `global-setup` aplica as migrations com
`prisma migrate deploy` e roda o seed, que limpa as tabelas antes de popular. Como as suítes
compartilham o mesmo banco, elas não rodam em paralelo.

Os testes do frontend usam Testing Library com a API mockada.

## O que o site faz

**Sem login**
- Home com destaques, departamentos e as páginas temáticas
- Catálogo com busca e filtros por departamento, marca, casa, gênero, preço, estoque e promoção
- Página do produto com sinopse, ficha, distribuição de notas, avaliações com selo de compra
  verificada e produtos relacionados
- Linha do tempo da saga, quiz do Chapéu Seletor e biblioteca em perspectiva
- Central de ajuda com abertura de chamado, que funciona sem conta como no site antigo
- Página de acessibilidade com paletas para daltonismo, alto contraste, tema claro, tamanho de
  texto, fonte de leitura fácil e movimento reduzido

**Com conta de leitor**
- Cadastro escolhendo o papel, login com JWT e redefinição de senha por token
- Carrinho no servidor, com frete grátis acima de R$ 250
- Checkout com endereço de entrega
- Perfil com pedidos e cancelamento, minhas avaliações, meus chamados e dados da conta

**Painel (`/painel`)**
- Fornecedor: cadastro e edição de produtos, autores e editoras, e o relatório de vendas com
  faturamento, ticket médio, mais vendidos, estoque baixo e últimos pedidos
- Suporte: tudo isso, mais a fila de chamados ordenada por status e urgência, a lista de usuários e
  o direito exclusivo de apagar registros

## Imagens

As capas dos cinco primeiros livros vieram do material do projeto antigo, convertidas para WebP. O
resto veio do Open Library (capas), do Rebrickable (caixas de LEGO) e do Wikimedia Commons (fotos
de produto, brasões e cenários). Os créditos e as licenças estão em
`frontend/public/CREDITOS-IMAGENS.md`, que o rodapé do site linka.
