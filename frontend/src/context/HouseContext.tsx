import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const HOUSES = ['grifinoria', 'sonserina', 'corvinal', 'lufa-lufa'] as const

export type House = (typeof HOUSES)[number]

export interface HouseInfo {
  id: House
  name: string
  /** Traço que a casa valoriza, usado como convite de leitura. */
  trait: string
  /** Como a livraria traduz a casa em prateleira. */
  shelf: string
  founder: string
}

export const HOUSE_INFO: Record<House, HouseInfo> = {
  grifinoria: {
    id: 'grifinoria',
    name: 'Grifinória',
    trait: 'Coragem, ousadia e cavalheirismo',
    shelf: 'Para quem abre o livro pelo capítulo mais difícil.',
    founder: 'Godrico Gryffindor',
  },
  sonserina: {
    id: 'sonserina',
    name: 'Sonserina',
    trait: 'Ambição, astúcia e determinação',
    shelf: 'Para quem lê o final antes e finge que não leu.',
    founder: 'Salazar Slytherin',
  },
  corvinal: {
    id: 'corvinal',
    name: 'Corvinal',
    trait: 'Sabedoria, criatividade e engenho',
    shelf: 'Para quem anota nas margens e discute a tradução.',
    founder: 'Rowena Ravenclaw',
  },
  'lufa-lufa': {
    id: 'lufa-lufa',
    name: 'Lufa-Lufa',
    trait: 'Lealdade, paciência e trabalho',
    shelf: 'Para quem relê a saga inteira toda vez, do começo.',
    founder: 'Helga Hufflepuff',
  },
}

const STORAGE_KEY = 'librarys-potter:casa'

function isHouse(value: unknown): value is House {
  return typeof value === 'string' && (HOUSES as readonly string[]).includes(value)
}

interface HouseContextValue {
  /** `null` é o castelo neutro: quem ainda não escolheu casa. */
  house: House | null
  info: HouseInfo | null
  setHouse: (house: House | null) => void
  /**
   * Sobe a cada seleção de casa. O `Layout` observa para tocar a cerimônia do
   * Chapéu Seletor — fica aqui, e não no seletor, para que a cerimônia aconteça
   * venha a escolha do cabeçalho ou da faixa da home.
   */
  ceremony: { house: House; id: number } | null
}

const HouseContext = createContext<HouseContextValue | undefined>(undefined)

export function HouseProvider({ children }: { children: ReactNode }) {
  const [house, setHouseState] = useState<House | null>(() => {
    // A escolha é lida no primeiro render para o site já nascer vestido: ler
    // depois pintaria o castelo neutro por um quadro antes de trocar de cor.
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return isHouse(stored) ? stored : null
    } catch {
      return null
    }
  })

  // O atributo mora no <html>: o CSS inteiro pende dele, inclusive as páginas
  // que ainda nem foram baixadas.
  useEffect(() => {
    const root = document.documentElement

    if (house) root.setAttribute('data-house', house)
    else root.removeAttribute('data-house')
  }, [house])

  const [ceremony, setCeremony] = useState<{ house: House; id: number } | null>(null)

  const setHouse = useCallback((next: House | null) => {
    setHouseState(next)
    // Voltar ao castelo neutro não é uma seleção: não há cerimônia.
    if (next) setCeremony((current) => ({ house: next, id: (current?.id ?? 0) + 1 }))

    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next)
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Navegação privada bloqueia o armazenamento; a escolha vale pela sessão.
    }
  }, [])

  const value = useMemo<HouseContextValue>(
    () => ({ house, info: house ? HOUSE_INFO[house] : null, setHouse, ceremony }),
    [house, ceremony, setHouse],
  )

  return <HouseContext.Provider value={value}>{children}</HouseContext.Provider>
}

export function useHouse() {
  const context = useContext(HouseContext)
  if (!context) throw new Error('useHouse precisa estar dentro de HouseProvider')
  return context
}
