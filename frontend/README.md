# Library's Potter (frontend)

React 19 + TypeScript + Vite + Tailwind v4. As animações usam Framer Motion (microinterações),
GSAP ScrollTrigger (a linha do tempo da saga), Embla (carrosséis) e Lenis (rolagem suave).

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm test         # vitest run
```

O `dev` faz proxy de `/api` para `http://localhost:3334`, então o backend precisa estar rodando
(veja o `README.md` da raiz). `VITE_API_URL` no `.env` aponta para outro host, se precisar.

## Estrutura

```
src/
├── components/
│   ├── layout/     Header, Footer, Layout, PageHeader, AuthLayout
│   ├── ui/         Button, Field, Modal, Stars, Loaders, Embers, EnchantedSky
│   ├── home/       Hero, Shelf, Mosaic
│   ├── catalog/    ProductCard
│   ├── house/      HouseCrest, HouseSwitch, HouseInvite, SortingCeremony
│   ├── library/    Book3D
│   ├── magic/      MagicLayer
│   └── settings/   SettingsControls, SettingsDrawer
├── context/        Settings, House, Auth, Cart, Toast
├── hooks/          useReveal, useSmoothScroll, usePointerGlow, useAmbience
├── lib/            api.ts (cliente tipado + ApiError), format.ts (pt-BR)
├── pages/          uma por rota, todas com lazy()
├── test/           Vitest + Testing Library
└── types/          contratos da API
```

Os cinco contextos são aninhados em `main.tsx` nesta ordem: Settings, House, Toast, Auth, Cart. O
Settings fica por fora do House porque a paleta para daltonismo precisa valer antes de existir
uma casa escolhida.

## Rotas

| Rota | Página | Acesso |
|---|---|---|
| `/` | Home | público |
| `/catalogo` | Catálogo, com os filtros na URL | público |
| `/produto/:slug` | Detalhe do produto | público |
| `/saga` | A saga | público |
| `/chapeu-seletor` | Quiz que escolhe a casa | público |
| `/oficina-de-varinhas` | Configurador de varinha | público |
| `/biblioteca` | Estantes em perspectiva | público |
| `/feiticos` | Lista dos feitiços do teclado | público |
| `/configuracoes` | Acessibilidade | público |
| `/carrinho` | Carrinho | público |
| `/ajuda` | Central de ajuda | público |
| `/login`, `/cadastro`, `/redefinir-senha` | Autenticação | público |
| `/checkout` | Checkout | logado |
| `/perfil` | Perfil (`?aba=pedidos\|avaliacoes\|chamados\|conta`) | logado |
| `/painel` | Painel (`?aba=catalogo\|autores\|vendas\|chamados\|usuarios`) | `SUPPLIER` ou `SUPPORT` |

Perfil e painel guardam a aba aberta na URL, então dá para mandar o link direto da fila de
chamados ou das próprias avaliações. O catálogo faz o mesmo com os filtros: `?departamento=`,
`?marca=`, `?house=`, `?genero=`, `?precoMax=`, `?estoque=`, `?promocao=`, `?busca=` e `?ordem=`.

## Tema

A base do site é neutra e a cor vem da casa que o visitante escolhe. `--house-deep`,
`--house-mid`, `--house-accent`, `--house-ink`, `--house-bg` e `--house-surface` são variáveis de
tempo de execução, redefinidas por `[data-house='...']`. Um bloco `@theme inline` expõe cada uma
como utilitário do Tailwind (`bg-house-mid`, `text-house-accent` e por aí) apontando para a
variável em vez de resolvê-la, então trocar o `data-house` no `<html>` repinta o site inteiro sem
duplicar classe. Quem escreve o atributo é o `HouseProvider`, que guarda a escolha no
`localStorage`.

Dentro de `.surface-paper` o próprio `--house-accent` é reescrito para a cor profunda da casa.
Como variável CSS cascateia, o mesmo `text-house-accent` sai dourado sobre o fundo escuro e
vermelho-escuro sobre o cartão claro, sem o componente saber onde está.

Fontes: Cinzel nos títulos, EB Garamond nas citações e Inter no texto.

## Acessibilidade

O `SettingsProvider` guarda as preferências no `localStorage` e escreve um atributo por
preferência no `<html>`: `data-vision`, `data-contrast`, `data-mode`, `data-text`, `data-motion`,
`data-links`, `data-focus` e `data-font`. O CSS pende desses atributos, do mesmo jeito que pende
do `data-house`, então nenhum componente ganha classe condicional. O valor padrão de cada
preferência é a ausência do atributo.

Os cinco modos de visão de cores redefinem as quatro paletas de casa, e não só um detalhe:
Grifinória é vermelha e Sonserina é verde, que é o par que some no daltonismo mais comum, e a casa
pinta o site inteiro. Cada modo escolhe um eixo que aquela visão preserva e afasta as quatro casas
também em luminosidade.

Fora isso: foco de teclado sempre visível, `prefers-reduced-motion` desliga as animações, imagens
abaixo da dobra com `loading="lazy"` e diálogos com foco preso e fechamento pelo Esc.

Uma armadilha que vale lembrar: o bloco CSS de movimento reduzido não alcança o style inline que o
framer-motion escreve. Quem anima com framer-motion tem que ler `reducedMotion` do `useSettings()`
em JavaScript.

## Animações

Elemento que começa invisível e depende de JS para aparecer tem que aparecer mesmo se a animação
não rodar. O padrão está em `.page-turn` e `.page-enter`, no fim do `index.css`: o estado de
repouso da regra é o visível, e a metade escondida vem do preenchimento do keyframe. Quem cobre a
tela é desmontado por `setTimeout`, nunca pelo fim da animação.
