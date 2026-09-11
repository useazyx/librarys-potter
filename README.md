# Library's Potter

A bookstore and shop for the Harry Potter universe. It started as a PHP/MySQL college
assignment (kept untouched in `legacy/`) and was rebuilt as a full TypeScript application with
its own REST API, a relational database, JWT authentication and a server-side cart.

142 products across seven departments (books, wands, collectibles, clothing, stationery, games
and home decor), filters that live in the URL, reviews, orders, a support ticket queue and an
admin dashboard. The three roles from the original site are still here: reader, supplier and
support.

![Home page](docs/img/desktop-home.png)

Leia em português: [README.pt-BR.md](README.pt-BR.md)

## Stack

- **Backend:** Node.js, Fastify, TypeScript, Prisma, PostgreSQL, Zod, JWT
- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Tests:** Vitest on both sides, Testing Library on the frontend

```
librarys-potter/
├── backend/     Fastify + Prisma API
├── frontend/    React + Vite app
├── docs/        requirements, architecture and test plan (pt-BR)
└── legacy/      the original PHP project, as it was
```

## Running it locally

You need Node 20+ and PostgreSQL running on `localhost:5432`.

Create the databases (the second one is only used by the tests):

```bash
psql -U postgres -c "CREATE DATABASE librarys_potter;"
psql -U postgres -c "CREATE DATABASE librarys_potter_test;"
```

If your Postgres user isn't `postgres/postgres`, change `DATABASE_URL` in `backend/.env`
(copy it from `backend/.env.example`).

```bash
cd backend
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev          # http://localhost:3334
```

```bash
cd frontend
npm install
npm run dev          # http://localhost:5174
```

Vite proxies `/api` to port 3334, so opening <http://localhost:5174> is enough. The API runs on
3334 instead of 3333 so it doesn't clash with another project of mine.

### Test accounts

All of them use the password `libraryspotter`.

| Role     | Email                        | What they see                                     |
|----------|------------------------------|---------------------------------------------------|
| Reader   | `agostinhocarrara@gmail.com` | catalog, cart, orders, reviews, tickets            |
| Supplier | `japalivros@gmail.com`       | the same, plus the catalog and sales dashboard     |
| Support  | `memphisdepay@gmail.com`     | the same, plus the ticket queue and user list      |

The seed creates 26 users, 71 reviews, 39 orders and 12 tickets, so the dashboards open with
real-looking data.

## How it's built

The project follows MVC with the presentation layer split from the server.

**Model.** Entities and relations live in `backend/prisma/schema.prisma` (11 tables). Only the
service layer talks to Prisma.

**Controller.** `backend/src/controllers/` validates input with Zod and shapes the HTTP response.
Business rules sit in `backend/src/services/`. `backend/src/routes/` just wires routes to
controllers and applies the role guards.

**View.** `frontend/src/pages/`, one page per route, all going through the typed client in
`frontend/src/lib/api.ts`.

Two rules hold everywhere: controllers never call Prisma, and services know nothing about HTTP.

Some decisions worth mentioning:

- Order items store a copy of the title, price and cover. Editing the catalog later doesn't
  rewrite anyone's purchase history, and deleting a product that was already sold zeroes its
  stock instead of removing the row.
- Stock is decremented inside the checkout transaction and returned inside the cancel
  transaction. Otherwise two simultaneous orders could sell the same last copy. There's a test
  for exactly that.
- The order total is recalculated on the server from database prices, never from what the
  client sent.
- `forgot-password` answers the same way for registered and unregistered emails, so the route
  can't be used to find out who has an account.

### API

| Group      | Routes                                                                  |
|------------|-------------------------------------------------------------------------|
| `/auth`    | sign up, login, logout, forgot password, reset password, current user   |
| `/catalog` | products, product by slug, authors, publishers, genres, brands, departments |
| `/cart`    | view, add, change quantity, remove, clear                               |
| `/orders`  | checkout, list, get one, cancel                                         |
| `/reviews` | my reviews, review a product, delete                                    |
| `/support` | open ticket, my tickets, queue, summary, handle                         |
| `/profile` | account data and password change                                        |
| `/admin`   | products, authors and publishers CRUD, sales report, users              |

## Tests

```bash
cd backend  && npm test    # 54 API tests
cd frontend && npm test    # 44 UI tests
```

Backend tests build the app with `buildApp()` and hit it through `app.inject()`, without opening a
port. They run against `librarys_potter_test`, which the global setup migrates and seeds before
the suites run.

## What you can do on the site

- Browse the catalog with search and filters (department, brand, house, genre, price, stock,
  sale), open a product page with ratings breakdown and verified-purchase reviews
- Take the Sorting Hat quiz and switch houses, which repaints the whole site
- Follow the saga timeline and walk through the library in perspective
- Open a support ticket without an account, like on the original site
- Tune accessibility: color-blind palettes, high contrast, light theme, text size, an easy-read
  font and reduced motion
- With an account: server-side cart with free shipping over R$ 250, checkout, order history and
  cancellation, reviews and tickets
- Supplier and support dashboards at `/painel`: product management, sales report (revenue,
  average ticket, best sellers, low stock) and the ticket queue sorted by status and urgency

## Team

Built by Arthur Roberto Weege Pontes, Guilherme Silveira and Lucas Alves as a college project.

## Images

The covers of the first five books come from the original project. Everything else comes from
Open Library, Rebrickable and Wikimedia Commons, with credits and licenses in
`frontend/public/CREDITOS-IMAGENS.md` (linked in the site footer).
