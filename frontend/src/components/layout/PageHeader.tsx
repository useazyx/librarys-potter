import type { ReactNode } from 'react'
import { EnchantedSky } from '../ui/EnchantedSky'

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
 * A entrada usa `.rise-in`, cujo estado de repouso é o visível; o céu encantado
 * atrás é decoração e fica atrás do conteúdo.
 */
export function PageHeader({ eyebrow, title, description, aside }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-house-deep pb-14 pt-32 lg:pt-36">
      <EnchantedSky embers={14} />

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
