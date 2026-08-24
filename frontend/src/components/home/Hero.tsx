import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useRef } from 'react'
import { ButtonLink } from '../ui/Button'

const TITLE = ["Library's", 'Potter']

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

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

      {/* Keeps the title legible over the photograph and hands the page to the night below. */}
      <div className="absolute inset-0 bg-night-900/72" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-b from-night-900/85 via-night-900/35 to-night-900"
        aria-hidden
      />

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-32 text-center"
        style={{ y: reduceMotion ? undefined : contentY }}
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mb-6 text-[0.68rem] uppercase tracking-[0.42em] text-gold-400"
        >
          A livraria da saga · sete livros · uma geração
        </motion.p>

        <h1
          id="hero-title"
          className="font-display text-5xl text-parchment-50 drop-shadow-[0_4px_28px_rgba(5,8,14,0.85)] sm:text-7xl lg:text-8xl"
        >
          {TITLE.map((word, index) => (
            <motion.span
              key={word}
              className="mr-[0.25em] inline-block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="mx-auto mt-8 max-w-xl text-balance font-serif text-xl italic text-parchment-200/90"
        >
          &ldquo;Não faz bem viver de sonhos e esquecer de viver.&rdquo; Aqui, os dois cabem na mesma
          prateleira.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <ButtonLink to="/catalogo" size="lg" variant="gold">
            Ver o catálogo
          </ButtonLink>
          <ButtonLink
            to="/saga"
            size="lg"
            variant="secondary"
            className="border-parchment-100/50 text-parchment-50 hover:border-gold-400 hover:text-gold-400"
          >
            Conhecer a saga
          </ButtonLink>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-parchment-100/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ opacity: { delay: 1.5 }, y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
        aria-hidden
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  )
}
