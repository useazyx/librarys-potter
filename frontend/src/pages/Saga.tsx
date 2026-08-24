import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { ButtonLink } from '../components/ui/Button'

gsap.registerPlugin(ScrollTrigger)

const CHAPTERS = [
  {
    year: '1997',
    title: 'A carta que mudou tudo',
    text: 'Um armário sob a escada, onze anos sem festa de aniversário e uma coruja com um convite. A Pedra Filosofal apresentou Hogwarts ao mundo — e vendeu 500 exemplares na primeira tiragem.',
    image: '/img/books/pedra-filosofal.webp',
  },
  {
    year: '1998',
    title: 'A voz nas paredes',
    text: 'Na Câmara Secreta, a escola deixa de ser só um lugar seguro. Mensagens aparecem nas paredes, alunos são petrificados e o passado do castelo cobra a sua parte.',
    image: '/img/books/camara-secreta.webp',
  },
  {
    year: '1999',
    title: 'O fugitivo e os dementadores',
    text: 'O Prisioneiro de Azkaban traz o livro mais adulto até então: um padrinho, um mapa, um vira-tempo e a lição de que a felicidade existe mesmo nas horas mais sombrias.',
    image: '/img/books/prisioneiro-de-azkaban.webp',
  },
  {
    year: '2000',
    title: 'O torneio e o fim da infância',
    text: 'O Cálice de Fogo cospe um quarto nome. Entre dragões e labirintos, a saga escolhe entre o que é certo e o que é fácil — e nada volta a ser como antes.',
    image: '/img/books/calice-de-fogo.webp',
  },
  {
    year: '2005',
    title: 'O príncipe e as memórias',
    text: 'No Enigma do Príncipe, o medo já anda à luz do dia. Um livro de Poções anotado à mão e as lembranças de um garoto chamado Tom Riddle preparam o desfecho.',
    image: '/img/books/enigma-do-principe.webp',
  },
]

const NUMBERS = [
  { value: '7', label: 'livros na saga' },
  { value: '450mi', label: 'exemplares vendidos' },
  { value: '78', label: 'idiomas' },
]

export default function Saga() {
  const timelineRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !timelineRef.current) return

    const context = gsap.context(() => {
      // The gold rule is drawn as the reader walks down the saga.
      gsap.fromTo(
        '.saga-progress',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: { trigger: timelineRef.current, start: 'top 60%', end: 'bottom 75%', scrub: 0.6 },
        },
      )

      gsap.utils.toArray<HTMLElement>('.saga-entry').forEach((entry) => {
        // `fromTo` com `immediateRender: false` em vez de `from`: assim o estado
        // invisível só é aplicado quando o ScrollTrigger dispara. Um `from`
        // esconde a entrada na hora e a deixa escondida para sempre se o gatilho
        // não vier — a mesma armadilha da transição de página.
        gsap.fromTo(
          entry,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: { trigger: entry, start: 'top 82%' },
          },
        )
      })
    }, timelineRef)

    return () => context.revert()
  }, [])

  return (
    <>
      <header className="relative flex min-h-[70vh] items-end overflow-hidden">
        <img
          src="/img/scenes/coruja.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/75 to-stone-900/45" aria-hidden />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="eyebrow mb-4">
            A saga
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl text-balance font-display text-5xl text-chalk-50 drop-shadow-[0_4px_28px_rgba(3,3,6,0.9)] sm:text-6xl"
          >
            Sete livros, uma geração inteira
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.9 }}
            className="mt-6 max-w-2xl font-serif text-xl italic text-chalk-200/85"
          >
            J. K. Rowling criou a aventura que se tornou o maior fenômeno editorial de todos os tempos — e que
            ainda chega a cada leitor pela primeira vez.
          </motion.p>
        </div>
      </header>

      <section ref={timelineRef} className="relative py-24 lg:py-32" aria-labelledby="chapters-title">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <h2 id="chapters-title" className="sr-only">
            Linha do tempo da saga
          </h2>

          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-px bg-chalk-100/12 lg:left-1/2" aria-hidden />
            <div
              className="saga-progress absolute left-4 top-0 h-full w-px origin-top bg-house-accent lg:left-1/2"
              aria-hidden
            />

            <ol className="space-y-20">
              {CHAPTERS.map((chapter, index) => (
                <li
                  key={chapter.year}
                  className={
                    'saga-entry relative grid gap-8 pl-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pl-0 ' +
                    (index % 2 === 1 ? 'lg:[&>figure]:order-2' : '')
                  }
                >
                  <span
                    className="absolute left-[9px] top-2 h-3.5 w-3.5 rounded-full bg-house-accent ring-4 ring-stone-900 lg:left-1/2 lg:-translate-x-1/2"
                    aria-hidden
                  />

                  <figure className="overflow-hidden rounded-xl">
                    <img
                      src={chapter.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="mx-auto w-48 rounded-lg shadow-book transition-transform duration-[1.4s] hover:scale-105 lg:w-56"
                    />
                  </figure>

                  <div className={index % 2 === 1 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}>
                    <p className="font-display text-4xl text-house-accent">{chapter.year}</p>
                    <h3 className="mt-3 font-display text-2xl text-chalk-50">{chapter.title}</h3>
                    <p className="mt-4 leading-relaxed text-chalk-200/80">{chapter.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-masonry py-20">
        <dl className="mx-auto grid max-w-4xl gap-10 px-6 text-center sm:grid-cols-3">
          {NUMBERS.map((number) => (
            <motion.div
              key={number.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <dt className="font-display text-5xl text-house-accent">{number.value}</dt>
              <dd className="mt-2 text-[0.68rem] uppercase tracking-[0.2em] text-chalk-300/70">
                {number.label}
              </dd>
            </motion.div>
          ))}
        </dl>
      </section>

      <section className="py-24 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <p className="font-serif text-3xl italic text-house-accent">
            &ldquo;Ajuda sempre será dada em Hogwarts a quem pedir.&rdquo;
          </p>
          <p className="mt-6 text-chalk-200/80">
            Comece — ou recomece — a leitura pela edição que estava faltando na sua estante.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink to="/catalogo" size="lg" variant="house">
              Ver o catálogo
            </ButtonLink>
            <ButtonLink
              to="/ajuda"
              size="lg"
              variant="secondary"
              className="border-chalk-100/40 text-chalk-100 hover:border-house-accent hover:text-house-accent"
            >
              Falar com a livraria
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
