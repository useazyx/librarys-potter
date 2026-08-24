import type { ReactNode } from 'react'
import { Embers } from '../ui/Embers'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  /** Canto direito: uma contagem, um selo, um botão de ação. */
  aside?: ReactNode
}

/**
 * Cabeçalho de página: faixa cheia na cor da casa, texto à esquerda e um canto
 * livre à direita. Substitui o padrão antigo — fotografia esmaecida atrás de um
 * título centralizado —, que era o mesmo do projeto de referência e se repetia
 * igual em cinco páginas.
 *
 * A entrada usa `.rise-in`, cujo estado de repouso é o visível; as brasas são
 * decoração e somem sozinhas sob movimento reduzido.
 */
export function PageHeader({ eyebrow, title, description, aside }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-house-deep pb-14 pt-32 lg:pt-36">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 54px),repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 108px)',
        }}
        aria-hidden
      />
      <Embers count={14} />

      <div className="relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6 lg:px-10">
        <div>
          <p className="rise-in text-[0.66rem] uppercase tracking-[0.4em] text-house-accent">{eyebrow}</p>

          <h1 className="rise-in mt-5 font-display text-5xl text-white sm:text-6xl" style={{ animationDelay: '0.1s' }}>
            {title}
          </h1>

          {description && (
            <p className="rise-in mt-5 max-w-xl text-white/70" style={{ animationDelay: '0.2s' }}>
              {description}
            </p>
          )}
        </div>

        {aside && (
          <div className="rise-in" style={{ animationDelay: '0.28s' }}>
            {aside}
          </div>
        )}
      </div>
    </header>
  )
}
