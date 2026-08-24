import { BookOpen, LifeBuoy, Sparkles, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Hero } from '../components/home/Hero'
import { Mosaic } from '../components/home/Mosaic'
import { Shelf } from '../components/home/Shelf'
import { HousePicker } from '../components/house/HousePicker'
import { ButtonLink } from '../components/ui/Button'
import { useReveal } from '../hooks/useReveal'
import { api } from '../lib/api'
import type { Book } from '../types/api'

const PROMISES = [
  { icon: Truck, title: 'Frete grátis acima de R$ 250', text: 'Para todo o Brasil, embalado como carta de Hogwarts.' },
  { icon: BookOpen, title: 'Edições da Rocco', text: 'As capas que uma geração inteira reconhece de longe.' },
  { icon: Sparkles, title: 'Avaliado por leitores', text: 'Estrelas e comentários de quem já leu — inclusive os sinceros demais.' },
  { icon: LifeBuoy, title: 'Suporte de verdade', text: 'Abra um chamado e acompanhe a resposta do começo ao fim.' },
]

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const revealRef = useReveal<HTMLDivElement>({ stagger: 110 })

  useEffect(() => {
    const controller = new AbortController()

    api.catalog
      .books({ sort: 'relevance' }, controller.signal)
      .then(setBooks)
      .catch(() => undefined)

    return () => controller.abort()
  }, [])

  return (
    <>
      <Hero book={books[0]} />

      {/* Faixa fina de números, colada no hero: separa sem abrir um respiro inteiro. */}
      <section className="border-y border-chalk-100/10 bg-stone-800" aria-label="A saga em números">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-chalk-100/10 px-6 lg:grid-cols-4 lg:px-10">
          {[
            ['7', 'livros na saga'],
            ['450mi', 'exemplares vendidos'],
            ['78', 'idiomas'],
            ['1997', 'a primeira carta'],
          ].map(([value, label], index) => (
            <div key={label} className={'px-5 py-7 ' + (index % 2 === 0 ? 'pl-0 lg:pl-5' : '')}>
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="block font-display text-3xl text-house-accent lg:text-4xl">{value}</span>
                <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.24em] text-chalk-300">
                  {label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <Shelf
        eyebrow="Na prateleira"
        title="Os sete anos em Hogwarts"
        description="Da carta entregue por uma coruja ao duelo final: a saga completa em edições brasileiras."
        books={books}
      />

      <Mosaic />

      <HousePicker />

      {/*
        "Sobre" da home antiga, agora com o texto em duas colunas e um filete da
        casa no topo — não mais foto de um lado e parágrafo do outro. O fundo é
        neutro de propósito: com `surface-house` esta seção ficava da mesma cor da
        coluna escolhida na faixa logo acima, e as duas viravam uma mancha só.
      */}
      <section className="border-t-2 border-house-accent bg-stone-900 py-20 lg:py-28" aria-labelledby="saga-title">
        <div ref={revealRef} className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-chalk-100/12 pb-10">
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

      {/* As quatro promessas, agora em lista horizontal enxuta. */}
      <section className="py-16 lg:py-20" aria-labelledby="promises-title">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 id="promises-title" className="sr-only">
            Por que comprar aqui
          </h2>

          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((promise) => {
              const Icon = promise.icon

              return (
                <li key={promise.title} className="flex gap-4 border-t border-chalk-100/12 pt-6">
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

      {/* Fecho: faixa larga com a foto à direita e o texto à esquerda. */}
      <section className="relative overflow-hidden bg-stone-950" aria-labelledby="cta-title">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <p className="eyebrow mb-4">Sua carta chegou</p>

            <h2 id="cta-title" className="text-balance font-display text-4xl text-chalk-50 sm:text-5xl">
              Crie sua conta e comece a coleção
            </h2>

            <p className="mt-6 max-w-md text-chalk-300">
              Guarde seus pedidos, avalie o que já leu e fale com o suporte sem sair do site.
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
                Só olhar os livros
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
