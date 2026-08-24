import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  title: string
  subtitle: string
  image: string
  children: ReactNode
}

/** Split screen shared by login, cadastro e redefinição de senha. */
export function AuthLayout({ title, subtitle, image, children }: AuthLayoutProps) {
  return (
    <section className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <motion.img
          src={image}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
          initial={{ scale: 1.14 }}
          animate={{ scale: 1 }}
          transition={{ duration: 7, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/55 to-stone-900/30" />

        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="font-display text-4xl text-house-accent">Library&apos;s Potter</p>
          <p className="mt-4 max-w-sm font-serif text-lg italic text-chalk-200/85">
            &ldquo;Nunca confie em nada que possa pensar por si mesmo, se você não puder ver onde ele guarda o
            cérebro.&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-stone-900 px-6 py-32 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-house-accent/50 font-display text-xs text-house-accent">
              LP
            </span>
            <span className="text-[0.66rem] uppercase tracking-[0.3em] text-chalk-300/70">
              Library&apos;s Potter
            </span>
          </Link>

          <h1 className="font-display text-4xl text-chalk-50">{title}</h1>
          <p className="mb-10 mt-3 text-chalk-200/75">{subtitle}</p>

          <div className="surface-paper rounded-2xl p-8 shadow-book">{children}</div>
        </motion.div>
      </div>
    </section>
  )
}
