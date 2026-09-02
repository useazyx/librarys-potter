import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const HOUSES = ['grifinoria', 'sonserina', 'corvinal', 'lufa-lufa'] as const

export type House = (typeof HOUSES)[number]

export interface HouseInfo {
  id: House
  name: string
  /** Traço que a casa valoriza. */
  trait: string
  /** O tipo de leitura que a loja associa à casa. */
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
  /** null é o tema neutro, de quem ainda não escolheu casa. */
  house: House | null
  info: HouseInfo | null
  setHouse: (house: House | null) => void
  /**
   * Sobe a cada escolha de casa. O Layout observa esse número para tocar a
   * cerimônia. Fica aqui e não no seletor para a cerimônia rodar venha a
   * escolha do cabeçalho ou da home.
   */
  ceremony: { house: House; id: number } | null
}

const HouseContext = createContext<HouseContextValue | undefined>(undefined)

export function HouseProvider({ children }: { children: ReactNode }) {
  const [house, setHouseState] = useState<House | null>(() => {
    // Lê a escolha já no primeiro render. Se lesse depois, o site apareceria
    // um quadro com o tema neutro antes de trocar de cor.
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return isHouse(stored) ? stored : null
    } catch {
      return null
    }
  })

  // O atributo vai no <html> porque o CSS inteiro pende dele, inclusive o das
  // páginas que ainda nem foram baixadas.
  useEffect(() => {
    const root = document.documentElement

    if (house) root.setAttribute('data-house', house)
    else root.removeAttribute('data-house')
  }, [house])

  const [ceremony, setCeremony] = useState<{ house: House; id: number } | null>(null)

  const setHouse = useCallback((next: House | null) => {
    setHouseState(next)
    // Voltar para o tema neutro não conta como escolha, então não tem cerimônia.
    if (next) setCeremony((current) => ({ house: next, id: (current?.id ?? 0) + 1 }))

    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next)
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Aba anônima bloqueia o localStorage. A escolha vale só pela sessão.
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
