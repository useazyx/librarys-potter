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

"As quatro casas". O castelo é a base e não tem cor própria: pedra (`stone-*`) para os fundos,
giz (`chalk-*`) para o texto e a folha clara `surface-paper` para formulários e cartões. A cor
vem da casa escolhida pelo leitor.

Como funciona: `--house-deep`, `--house-mid`, `--house-accent` e `--house-ink` são variáveis de
tempo de execução, redefinidas por `[data-house='...']`. Um bloco `@theme inline` as transforma
em utilitários (`bg-house-mid`, `text-house-accent`, ...) que **apontam** para a variável em vez
de resolvê-la, então trocar o atributo `data-house` no `<html>` reveste o site inteiro sem
duplicar uma única classe. Quem escreve o atributo é o `HouseProvider`
(`src/context/HouseContext.tsx`), que guarda a escolha em `localStorage`.

O truque do contraste: dentro de `.surface-paper` o próprio `--house-accent` é reescrito para a
cor *profunda* da casa. Como variável CSS cascateia, o mesmo `text-house-accent` sai dourado
sobre a pedra e vermelho-escuro sobre o papel — nenhum componente precisa saber em que fundo
está.

Fontes: Cinzel (títulos), EB Garamond (citações), Inter (texto).

Acessibilidade: foco de teclado sempre visível, `prefers-reduced-motion` desliga as animações,
imagens abaixo da dobra com `loading="lazy"` e diálogos com foco preso e fechamento por `Esc`.
