import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useRef } from 'react'
import { useHouse } from '../../context/HouseContext'
import { ButtonLink } from '../ui/Button'

const TITLE = ["Library's", 'Potter']

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { info } = useHouse()

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })

  // The hall drifts slower than the text: depth without a jump.
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '45%'])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      <motion.div className="absolute inset-0" style={{ y: reduceMotion ? undefined : imageY }}>
        <motion.img
          src="/img/scenes/salao-biblioteca.webp"
          alt="Salão de uma biblioteca antiga, com estantes de madeira até o teto"
          className="h-[116%] w-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 9, ease: 'easeOut' }}
          fetchPriority="high"
        />
      </motion.div>

      {/* Keeps the title legible over the photograph and hands the page to the castle below. */}
      <div className="absolute inset-0 bg-stone-950/70" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-b from-stone-950/85 via-house-deep/45 to-stone-900"
        aria-hidden
      />

      {/*
        Todo o texto abaixo entra por `.rise-in`, e não pelo framer-motion: o
        estado de repouso da regra já é o visível, então uma animação que não
        rode deixa o leitor com o título na tela em vez de um hero vazio.
      */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-32 text-center"
        style={{ y: reduceMotion ? undefined : contentY }}
      >
        <p
          className="rise-in mb-6 text-[0.68rem] uppercase tracking-[0.42em] text-house-accent"
          style={{ animationDelay: '0.15s' }}
        >
          A livraria da saga · sete livros · uma geração
        </p>

        <h1
          id="hero-title"
          className="font-display text-5xl text-chalk-50 drop-shadow-[0_4px_28px_rgba(3,3,6,0.9)] sm:text-7xl lg:text-8xl"
        >
          {TITLE.map((word, index) => (
            <span
              key={word}
              className="rise-in mr-[0.25em] inline-block"
              style={{ animationDelay: 0.25 + index * 0.12 + 's', ['--rise' as string]: '40px' }}
            >
              {word}
            </span>
          ))}
        </h1>

        <p
          className="rise-in mx-auto mt-8 max-w-xl text-balance font-serif text-xl italic text-chalk-200/90"
          style={{ animationDelay: '0.7s' }}
        >
          &ldquo;Não faz bem viver de sonhos e esquecer de viver.&rdquo; Aqui, os dois cabem na mesma
          prateleira.
        </p>

        <div
          className="rise-in mt-12 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: '0.9s' }}
        >
          <ButtonLink to="/catalogo" size="lg" variant="house">
            Ver o catálogo
          </ButtonLink>
          <ButtonLink
            to="/saga"
            size="lg"
            variant="secondary"
            className="border-chalk-100/50 text-chalk-50 hover:border-house-accent hover:text-house-accent"
          >
            Conhecer a saga
          </ButtonLink>
        </div>

        {info && (
          <p
            className="rise-in mt-10 text-[0.66rem] uppercase tracking-[0.28em] text-house-accent/80"
            style={{ animationDelay: '1.1s' }}
          >
            A livraria está vestida de {info.name}
          </p>
        )}
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-chalk-100/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ opacity: { delay: 1.5 }, y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
        aria-hidden
      >
        <ChevronDown size={28} aria-hidden />
      </motion.div>
    </section>
  )
}
