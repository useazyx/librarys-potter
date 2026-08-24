import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useHouse } from '../../context/HouseContext'
import { HouseCrest } from '../house/HouseCrest'
import { Embers } from '../ui/Embers'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

/**
 * Tela dividida de login, cadastro e redefinição de senha.
 *
 * O painel da esquerda deixou de ser uma fotografia esmaecida: agora é o campo
 * da casa, com o brasão ao centro. Quem já escolheu casa entra na livraria pela
 * porta dela; quem não escolheu vê a pedra neutra do castelo.
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { house, info } = useHouse()

  return (
    <section className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-house-deep lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 54px),repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 108px)',
          }}
          aria-hidden
        />
        <Embers count={20} />

        <div className="relative grid flex-1 place-items-center p-12">
          {house ? (
            <HouseCrest
              house={house}
              animate
              className="h-56 w-auto drop-shadow-[0_18px_44px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <p className="max-w-xs text-center font-display text-3xl leading-tight text-white/85">
              Uma carta, uma coruja e sete anos de escola
            </p>
          )}
        </div>

        <div className="relative p-12">
          <p className="font-display text-3xl text-house-accent">Library&apos;s Potter</p>
          <p className="mt-4 max-w-sm font-serif text-lg italic text-white/75">
            &ldquo;Nunca confie em nada que possa pensar por si mesmo, se você não puder ver onde ele guarda
            o cérebro.&rdquo;
          </p>
          {info && (
            <p className="mt-6 text-[0.62rem] uppercase tracking-[0.3em] text-white/45">
              Vestida de {info.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center bg-stone-900 px-6 py-32 lg:px-16">
        <div className="rise-in w-full max-w-md">
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
        </div>
      </div>
    </section>
  )
}
