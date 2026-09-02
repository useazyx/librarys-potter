import { motion } from 'framer-motion'
import { ButtonLink } from '../components/ui/Button'

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-8xl text-house-deep"
      >
        404
      </motion.p>

      <h1 className="mt-6 font-display text-4xl">Esta página foi para a Seção Reservada</h1>

      <p className="mt-4 text-stone-700">
        O endereço que você procurou não existe, mas a livraria continua aberta.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <ButtonLink to="/" size="lg">
          Voltar ao início
        </ButtonLink>
        <ButtonLink to="/catalogo" size="lg" variant="secondary">
          Ver o catálogo
        </ButtonLink>
      </div>
    </section>
  )
}
