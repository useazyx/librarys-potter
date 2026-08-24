# Library's Potter — frontend

React 19 + TypeScript + Vite + Tailwind v4. Animações com Framer Motion (microinterações e
transições), GSAP ScrollTrigger (a linha do tempo da saga), Embla (carrosséis) e Lenis (scroll
suave).

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm test         # vitest run
```

O `dev` faz proxy de `/api` para `http://localhost:3334`, então o backend precisa estar rodando
(veja o `README.md` da raiz). `VITE_API_URL` em `.env` sobrescreve a base da API se você quiser
apontar para outro host.

## Estrutura

```
src/
├── components/
│   ├── layout/     Header, Footer, Layout (transição de página), AuthLayout
│   ├── ui/         Button, Field (Input/Textarea/Select), Modal, Stars, Loaders
│   ├── home/       Hero, Shelf
│   └── catalog/    BookCard
├── context/        AuthContext, CartContext, ToastContext
├── hooks/          useReveal, useSmoothScroll
├── lib/            api.ts (cliente tipado + ApiError), format.ts (pt-BR)
├── pages/          uma por rota, todas com lazy()
├── test/           Vitest + Testing Library
└── types/          contratos da API
```

## Rotas

| Rota | Página | Acesso |
|---|---|---|
| `/` | Home | público |
| `/catalogo` | Catálogo (filtros na URL) | público |
| `/livro/:slug` | Detalhe do livro | público |
| `/saga` | A saga | público |
| `/carrinho` | Carrinho | público |
| `/ajuda` | Central de ajuda | público |
| `/login`, `/cadastro`, `/redefinir-senha` | Autenticação | público |
| `/checkout` | Checkout | logado |
| `/perfil` | Perfil (`?aba=pedidos\|avaliacoes\|chamados\|conta`) | logado |
| `/painel` | Painel (`?aba=catalogo\|autores\|vendas\|chamados\|usuarios`) | `SUPPLIER` ou `SUPPORT` |

As duas últimas guardam a aba aberta na URL, então dá para mandar o link direto da fila de
chamados ou das próprias avaliações.

## Tema

"Biblioteca à meia-noite": fundo `night-900`, cartões `surface-paper` (pergaminho), dourado de
lombada (`gold-*`) e o bordô das capas da Rocco (`burgundy-*`). Os tokens ficam no bloco
`@theme` de `src/index.css`. Fontes: Cinzel (títulos), EB Garamond (citações), Inter (texto).

Acessibilidade: foco de teclado sempre visível, `prefers-reduced-motion` desliga as animações,
imagens abaixo da dobra com `loading="lazy"` e diálogos com foco preso e fechamento por `Esc`.
