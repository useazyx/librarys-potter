import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { BookOpen, LifeBuoy, Sparkles, Truck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Hero } from '../components/home/Hero'
import { HousePicker } from '../components/house/HousePicker'
import { Shelf } from '../components/home/Shelf'
import { ButtonLink } from '../components/ui/Button'
import { useReveal } from '../hooks/useReveal'
import { api } from '../lib/api'
import type { Book } from '../types/api'

const PROMISES = [
  { icon: Truck, title: 'Frete grátis acima de R$ 250', text: 'Entregamos para todo o Brasil, embalado como carta de Hogwarts.' },
  { icon: BookOpen, title: 'Edições da Rocco', text: 'As capas que uma geração inteira reconhece de longe.' },
  { icon: Sparkles, title: 'Avaliado por leitores', text: 'Estrelas e comentários de quem já leu — inclusive os sinceros demais.' },
  { icon: LifeBuoy, title: 'Suporte de verdade', text: 'Abra um chamado e acompanhe a resposta do começo ao fim.' },
]

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const storyRef = useRef<HTMLDivElement>(null)
  const revealRef = useReveal<HTMLDivElement>({ stagger: 110 })
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: storyRef, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

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
      <Hero />

      <Shelf
        eyebrow="Na prateleira"
        title="Os sete anos em Hogwarts"
        description="Da carta entregue por uma coruja ao duelo final: a saga completa em edições brasileiras."
        books={books}
      />

      <HousePicker />

      {/* "Sobre" da home antiga, agora com espaço para respirar. */}
      <section className="overflow-hidden bg-masonry py-24 lg:py-32" aria-labelledby="saga-title">
        <div ref={storyRef} className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-book">
              <motion.img
                src="/img/scenes/livros-antigos.webp"
                alt="Livros antigos empilhados ao lado de um castiçal"
                className="h-[28rem] w-full scale-110 object-cover"
                style={{ y: reduceMotion ? undefined : imageY }}
                loading="lazy"
                decoding="async"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-8 -right-2 hidden rounded-2xl bg-house-deep px-8 py-6 text-center text-chalk-50 shadow-book sm:block"
            >
              <p className="font-display text-4xl leading-none text-house-accent">450mi</p>
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.24em]">exemplares vendidos</p>
            </motion.div>
          </div>

          <div ref={revealRef}>
            <p className="eyebrow mb-4" data-reveal>
              A maior saga bruxa de todos os tempos
            </p>

            <h2 id="saga-title" className="text-balance font-display text-4xl text-chalk-50 sm:text-5xl" data-reveal>
              Tudo começou com uma carta entregue por uma coruja
            </h2>

            <p className="mt-6 leading-relaxed text-chalk-200/80" data-reveal>
              A vida do menino Harry Potter não tinha um pingo de magia: ele vivia com os tios, dormia num
              armário sob a escada e nunca havia comemorado um aniversário. Até o dia em que recebeu um convite
              para estudar num lugar chamado Hogwarts.
            </p>

            <p className="mt-4 leading-relaxed text-chalk-200/80" data-reveal>
              Na sua jornada, Harry não enfrenta apenas batalhas e feitiços. Ele precisa superar traições,
              surpresas e, sobretudo, aprender a lidar com os próprios sentimentos. O amor, a amizade e uma boa
              dose de imaginação são os elementos-chave da história.
            </p>

            <div className="mt-10" data-reveal>
              <ButtonLink
                to="/saga"
                variant="secondary"
                className="border-chalk-100/40 text-chalk-100 hover:border-house-accent hover:text-house-accent"
              >
                Ler a história completa
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24" aria-labelledby="promises-title">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 id="promises-title" className="sr-only">
            Por que comprar aqui
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((promise, index) => {
              const Icon = promise.icon

              return (
                <motion.article
                  key={promise.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-chalk-100/10 bg-stone-800/60 p-7"
                >
                  <Icon size={26} className="mb-5 text-house-accent" aria-hidden />
                  <h3 className="font-display text-lg text-chalk-50">{promise.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-chalk-200/70">{promise.text}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-28" aria-labelledby="cta-title">
        <img
          src="/img/scenes/castelo.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-stone-900/40" aria-hidden />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-3xl px-6 text-center"
        >
          <p className="eyebrow mb-4">Sua carta chegou</p>

          <h2 id="cta-title" className="text-balance font-display text-4xl text-chalk-50 sm:text-5xl">
            Crie sua conta e comece a coleção
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-chalk-200/80">
            Guarde seus pedidos, avalie o que já leu e fale com o suporte sem sair do site.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink to="/cadastro" size="lg" variant="house">
              Criar minha conta
            </ButtonLink>
            <ButtonLink
              to="/catalogo"
              size="lg"
              variant="secondary"
              className="border-chalk-100/50 text-chalk-50 hover:border-house-accent hover:text-house-accent"
            >
              Só olhar os livros
            </ButtonLink>
          </div>
        </motion.div>
      </section>
    </>
  )
}
