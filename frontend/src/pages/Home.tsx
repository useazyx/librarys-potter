import { BookOpen, LibraryBig, LifeBuoy, Sparkles, Truck, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Hero } from '../components/home/Hero'
import { Mosaic } from '../components/home/Mosaic'
import { Shelf } from '../components/home/Shelf'
import { HouseInvite } from '../components/house/HouseInvite'
import { ButtonLink } from '../components/ui/Button'
import { EnchantedSky } from '../components/ui/EnchantedSky'
import { useReveal } from '../hooks/useReveal'
import { api } from '../lib/api'
import type { Book, Department } from '../types/api'

const PROMISES = [
  { icon: Truck, title: 'Frete grátis acima de R$ 250', text: 'Para todo o Brasil, embalado como carta de Hogwarts.' },
  { icon: BookOpen, title: 'Do livro à varinha', text: 'Sete corredores: livros, varinhas, colecionáveis, vestuário, papelaria, jogos e casa.' },
  { icon: Sparkles, title: 'Avaliado por leitores', text: 'Estrelas e comentários de quem já comprou, inclusive os sinceros demais.' },
  { icon: LifeBuoy, title: 'Suporte de verdade', text: 'Abra um chamado e acompanhe a resposta do começo ao fim.' },
]

// As três páginas temáticas do site: o quiz do Chapéu, a oficina de varinhas e
// a biblioteca em perspectiva.
const DOORS = [
  {
    to: '/chapeu-seletor',
    icon: Sparkles,
    eyebrow: 'Sete perguntas',
    title: 'O Chapéu Seletor',
    text: 'Responda e descubra a sua casa. A escolha veste a loja inteira, do fundo ao realce.',
    image: '/img/products/chapeu-seletor.jpg',
  },
  {
    to: '/oficina-de-varinhas',
    icon: Wand2,
    eyebrow: 'Olivaras',
    title: 'A oficina de varinhas',
    text: 'Madeira, núcleo, comprimento e flexibilidade: molde a sua e veja a varinha se montar.',
    image: '/img/products/loja-olivaras.jpg',
  },
  {
    to: '/biblioteca',
    icon: LibraryBig,
    eyebrow: 'Ala proibida',
    title: 'A biblioteca animada',
    text: 'Estantes em profundidade. Tire um volume da fileira e gire o livro na mão.',
    image: '/img/scenes/salao-biblioteca.webp',
  },
]

// Uma foto por departamento, para o menu visual da home.
const DEPARTMENT_IMAGE: Record<string, string> = {
  livros: '/img/scenes/estantes.webp',
  varinhas: '/img/products/varinhas-draco-bellatrix.jpg',
  colecionaveis: '/img/products/vira-tempo.jpg',
  vestuario: '/img/products/manto-hogwarts.jpg',
  papelaria: '/img/products/pena-e-tinteiro.jpg',
  jogos: '/img/products/lego-castelo-hogwarts.jpg',
  casa: '/img/products/estandarte-grifinoria.jpg',
}

export default function Home() {
  const [featured, setFeatured] = useState<Book[]>([])
  const [novelties, setNovelties] = useState<Book[]>([])
  const [deals, setDeals] = useState<Book[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const revealRef = useReveal<HTMLDivElement>({ stagger: 110 })

  useEffect(() => {
    const controller = new AbortController()

    void Promise.allSettled([
      api.catalog.books({ featured: true, inStock: true, limit: 12 }, controller.signal),
      api.catalog.books({ tag: 'novidade', inStock: true, limit: 12 }, controller.signal),
      api.catalog.books({ onSale: true, sort: 'discount', limit: 12 }, controller.signal),
      api.catalog.departments(controller.signal),
    ]).then(([featuredResult, noveltiesResult, dealsResult, departmentsResult]) => {
      if (featuredResult.status === 'fulfilled') setFeatured(featuredResult.value)
      if (noveltiesResult.status === 'fulfilled') setNovelties(noveltiesResult.value)
      if (dealsResult.status === 'fulfilled') setDeals(dealsResult.value)
      if (departmentsResult.status === 'fulfilled') setDepartments(departmentsResult.value)
    })

    return () => controller.abort()
  }, [])

  const total = departments.reduce((sum, item) => sum + item.count, 0)

  return (
    <>
      <Hero book={featured[0]} />

      {/* faixa de números, logo abaixo do hero */}
      <section className="border-y border-chalk-100/15 bg-house-surface" aria-label="A loja em números">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-chalk-100/10 px-6 lg:grid-cols-4 lg:px-10">
          {[
            [total > 0 ? String(total) : '140+', 'produtos no acervo'],
            ['7', 'corredores'],
            ['450mi', 'exemplares vendidos'],
            ['1997', 'a primeira carta'],
          ].map(([value, label], index) => (
            <div key={label} className={'px-5 py-7 ' + (index % 2 === 0 ? 'pl-0 lg:pl-5' : '')}>
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="block font-display text-3xl text-house-accent lg:text-4xl">{value}</span>
                <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.24em] text-chalk-300">{label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* departamentos */}
      <section className="py-20 lg:py-24" aria-labelledby="corredores-title">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-3">Por onde começar</p>
              <h2 id="corredores-title" className="font-display text-4xl text-chalk-50 sm:text-5xl">
                Sete corredores
              </h2>
              <p className="mt-4 max-w-xl text-chalk-200/85">
                O livro continua sendo o centro da casa. Em volta dele, tudo o que o mundo bruxo produziu desde
                que a primeira coruja bateu na janela.
              </p>
            </div>

            <ButtonLink
              to="/catalogo"
              variant="secondary"
              className="border-chalk-100/40 text-chalk-100 hover:border-house-accent hover:text-house-accent"
            >
              Ver a loja inteira
            </ButtonLink>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((department, index) => (
              <li
                key={department.slug}
                className={index === 0 ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : undefined}
              >
                <Link
                  to={'/catalogo?departamento=' + department.slug}
                  className="group relative block h-full min-h-[11rem] overflow-hidden rounded-2xl border border-chalk-100/15"
                >
                  <img
                    src={DEPARTMENT_IMAGE[department.slug] ?? '/img/scenes/estantes.webp'}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-house-deep via-house-deep/70 to-house-deep/25" aria-hidden />

                  <div className="relative flex h-full flex-col justify-end p-6">
                    <p className="text-[0.6rem] uppercase tracking-[0.22em] text-house-accent">
                      {department.count} {department.count === 1 ? 'produto' : 'produtos'}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-white">{department.name}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/70">{department.tagline}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Shelf
        id="destaques-title"
        eyebrow="Na vitrine"
        title="O que a loja destaca"
        description="Da coleção completa ao chapéu que decide a sua casa: o que mais sai da prateleira nesta semana."
        books={featured}
      />

      {/* as três páginas temáticas */}
      <section className="relative overflow-hidden border-y border-chalk-100/15 bg-house-surface py-20 lg:py-24" aria-labelledby="magia-title">
        <EnchantedSky embers={10} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <p className="eyebrow mb-3">Não é só uma loja</p>
          <h2 id="magia-title" className="max-w-2xl text-balance font-display text-4xl text-chalk-50 sm:text-5xl">
            Três coisas para fazer aqui que não dão para fazer em outra loja
          </h2>

          <ul className="mt-14 grid gap-6 lg:grid-cols-3">
            {DOORS.map((door) => {
              const Icon = door.icon

              return (
                <li key={door.to}>
                  <Link
                    to={door.to}
                    className="group relative flex h-full min-h-[19rem] flex-col justify-end overflow-hidden rounded-2xl border border-chalk-100/15"
                  >
                    <img
                      src={door.image}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover opacity-45 transition-all duration-[1.2s] group-hover:scale-105 group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-house-deep via-house-deep/85 to-transparent" aria-hidden />

                    <div className="relative p-7">
                      <Icon size={22} className="text-house-accent" aria-hidden />
                      <p className="mt-4 text-[0.6rem] uppercase tracking-[0.22em] text-house-accent">{door.eyebrow}</p>
                      <h3 className="mt-2 font-display text-2xl text-white">{door.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/75">{door.text}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>

          <p className="mt-10 text-sm text-chalk-300">
            E, em qualquer página, experimente digitar{' '}
            <code className="rounded bg-house-bg px-1.5 py-0.5 font-mono text-house-accent">lumos</code>. A lista
            inteira está em{' '}
            <Link to="/feiticos" className="link-underline text-house-accent">
              Feitiços
            </Link>
            .
          </p>
        </div>
      </section>

      {novelties.length > 0 && (
        <Shelf
          id="novidades-title"
          eyebrow="Chegou agora"
          title="Novidades na prateleira"
          description="O que entrou no acervo neste mês, de páginas em 3D a canecas que mudam com o calor."
          books={novelties}
          to="/catalogo?tag=novidade"
          cta="Ver todas as novidades"
        />
      )}

      <HouseInvite />

      {deals.length > 0 && (
        <Shelf
          id="ofertas-title"
          eyebrow="Preço de tabela riscado"
          title="Em promoção esta semana"
          description="Produtos com desconto de verdade: o preço cheio fica à mostra, riscado ao lado."
          books={deals}
          to="/catalogo?promocao=true"
          cta="Ver tudo em promoção"
        />
      )}

      <Mosaic />

      {/* O "sobre" da home, em duas colunas. O fundo aqui é neutro de
          propósito: com surface-house ficava da mesma cor da faixa de cima e
          as duas viravam uma mancha só. */}
      <section className="border-t-2 border-house-accent bg-house-bg py-20 lg:py-28" aria-labelledby="saga-title">
        <div ref={revealRef} className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-chalk-100/16 pb-10">
            <h2
              id="saga-title"
              className="max-w-2xl text-balance font-display text-4xl leading-tight text-chalk-50 sm:text-5xl"
              data-reveal
            >
              Tudo começou com uma carta entregue por uma coruja
            </h2>

            <div data-reveal>
              <ButtonLink
                to="/saga"
                variant="secondary"
                className="border-chalk-100/40 text-chalk-100 hover:border-house-accent hover:text-house-accent"
              >
                Ler a história completa
              </ButtonLink>
            </div>
          </div>

          <div className="mt-10 grid gap-x-14 gap-y-6 md:grid-cols-2">
            <p className="text-lg leading-relaxed text-chalk-200/85" data-reveal>
              A vida do menino Harry Potter não tinha um pingo de magia: ele vivia com os tios, dormia num
              armário sob a escada e nunca havia comemorado um aniversário. Até o dia em que recebeu um
              convite para estudar num lugar chamado Hogwarts.
            </p>

            <p className="text-lg leading-relaxed text-chalk-200/85" data-reveal>
              Na sua jornada, Harry não enfrenta apenas batalhas e feitiços. Ele precisa superar traições,
              surpresas e, sobretudo, aprender a lidar com os próprios sentimentos. O amor, a amizade e uma
              boa dose de imaginação são os elementos-chave da história.
            </p>
          </div>
        </div>
      </section>

      {/* as quatro promessas da loja */}
      <section className="py-16 lg:py-20" aria-labelledby="promises-title">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 id="promises-title" className="sr-only">
            Por que comprar aqui
          </h2>

          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((promise) => {
              const Icon = promise.icon

              return (
                <li key={promise.title} className="flex gap-4 border-t border-chalk-100/16 pt-6">
                  <Icon size={20} className="mt-1 shrink-0 text-house-accent" aria-hidden />
                  <div>
                    <h3 className="font-display text-base text-chalk-50">{promise.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-chalk-300">{promise.text}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* fecho da página */}
      <section className="relative overflow-hidden bg-house-bg" aria-labelledby="cta-title">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <p className="eyebrow mb-4">Sua carta chegou</p>

            <h2 id="cta-title" className="text-balance font-display text-4xl text-chalk-50 sm:text-5xl">
              Crie sua conta e comece a coleção
            </h2>

            <p className="mt-6 max-w-md text-chalk-300">
              Guarde seus pedidos, avalie o que já comprou e fale com o suporte sem sair do site.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink to="/cadastro" size="lg" variant="house">
                Criar minha conta
              </ButtonLink>
              <ButtonLink
                to="/catalogo"
                size="lg"
                variant="secondary"
                className="border-chalk-100/40 text-chalk-100 hover:border-house-accent hover:text-house-accent"
              >
                Só olhar a loja
              </ButtonLink>
            </div>
          </div>

          <div className="relative h-64 overflow-hidden rounded-xl lg:h-80">
            <img
              src="/img/scenes/castelo.webp"
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-house-deep/35" aria-hidden />
          </div>
        </div>
      </section>
    </>
  )
}
