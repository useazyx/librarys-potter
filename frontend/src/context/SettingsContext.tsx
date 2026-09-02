import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

// Preferências de leitura do visitante: daltonismo, contraste, tamanho de
// texto, movimento, fonte e som. Ficam no localStorage, então valem na próxima
// visita.
//
// O provider não pinta nada: escreve atributos no <html> e deixa o CSS
// trabalhar, igual ao HouseProvider com data-house. A exceção é reducedMotion,
// que os componentes leem em JavaScript porque o framer-motion anima por style
// inline e não enxerga o bloco CSS.

export type VisionMode = 'padrao' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monocromatico'
export type ContrastMode = 'normal' | 'alto'
export type ColorMode = 'escuro' | 'claro'
export type TextScale = 'pequeno' | 'normal' | 'grande' | 'enorme'
export type MotionMode = 'sistema' | 'completo' | 'reduzido'

export interface Settings {
  /** Modo de visão de cores. Redefine as paletas das quatro casas. */
  vision: VisionMode
  contrast: ContrastMode
  mode: ColorMode
  text: TextScale
  motion: MotionMode
  /** Sublinha todo link, para quem não distingue a cor de destaque. */
  underlineLinks: boolean
  /** Anel de foco grosso e amarelo, para quem navega só por teclado. */
  strongFocus: boolean
  /** Troca as três fontes por fontes de leitura mais fácil. */
  readableFont: boolean
  /** Trilha de fundo. Começa desligada de propósito. */
  sound: boolean
  /** Feitiços digitados no teclado. Dá para desligar por causa do leitor de tela. */
  spells: boolean
  /** Faíscas que seguem o ponteiro. */
  sparks: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  vision: 'padrao',
  contrast: 'normal',
  mode: 'escuro',
  text: 'normal',
  motion: 'sistema',
  underlineLinks: false,
  strongFocus: false,
  readableFont: false,
  sound: false,
  spells: true,
  sparks: true,
}

export const VISION_LABELS: Record<VisionMode, { name: string; hint: string }> = {
  padrao: { name: 'Cores originais', hint: 'As quatro casas nas cores de sempre.' },
  protanopia: {
    name: 'Protanopia',
    hint: 'Pouca ou nenhuma sensibilidade ao vermelho. Grifinória vira âmbar e Sonserina, azul-ciano.',
  },
  deuteranopia: {
    name: 'Deuteranopia',
    hint: 'A mais comum. Vermelho e verde se separam por âmbar, ciano, violeta e amarelo.',
  },
  tritanopia: {
    name: 'Tritanopia',
    hint: 'Pouca sensibilidade ao azul. Corvinal vira magenta e Lufa-Lufa, creme.',
  },
  monocromatico: {
    name: 'Sem cor',
    hint: 'As casas se separam só pela claridade. Funciona também para impressão.',
  },
}

export const TEXT_LABELS: Record<TextScale, string> = {
  pequeno: 'Pequeno',
  normal: 'Normal',
  grande: 'Grande',
  enorme: 'Enorme',
}

const STORAGE_KEY = 'librarys-potter:preferencias'

function readStored(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS

    // Só entram as chaves conhecidas, senão um localStorage antigo ou mexido
    // planta um valor que o CSS não sabe interpretar.
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

interface SettingsContextValue {
  settings: Settings
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  reset: () => void
  /**
   * True quando o visitante pediu menos movimento, pelo sistema ou pelas
   * configurações. Quem anima com framer-motion tem que ler daqui, porque o
   * bloco CSS de movimento reduzido não alcança style inline.
   */
  reducedMotion: boolean
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      return readStored()
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  const [systemReducedMotion, setSystemReducedMotion] = useState(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setSystemReducedMotion(query.matches)

    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Um atributo por preferência, todos no <html>. O valor padrão de cada uma é
  // escrito como ausência do atributo, assim o CSS base continua valendo sem
  // precisar de um seletor a mais.
  useEffect(() => {
    const root = document.documentElement

    const attribute = (name: string, value: string | null) => {
      if (value) root.setAttribute(name, value)
      else root.removeAttribute(name)
    }

    attribute('data-vision', settings.vision === 'padrao' ? null : settings.vision)
    attribute('data-contrast', settings.contrast === 'normal' ? null : settings.contrast)
    attribute('data-mode', settings.mode === 'escuro' ? null : settings.mode)
    attribute('data-text', settings.text === 'normal' ? null : settings.text)
    attribute('data-links', settings.underlineLinks ? 'sublinhado' : null)
    attribute('data-focus', settings.strongFocus ? 'reforcado' : null)
    attribute('data-font', settings.readableFont ? 'legivel' : null)

    // Em "sistema" o atributo não é escrito e o @media do CSS decide sozinho.
    // Em "completo" também não, porque forçar animação em quem pediu o
    // contrário seria pior do que não ter a opção.
    attribute('data-motion', settings.motion === 'reduzido' ? 'reduzido' : null)

    // Avisa o navegador do tema, para os formulários e as barras de rolagem
    // nativas ficarem claros ou escuros junto com o site.
    root.style.colorScheme = settings.mode === 'claro' ? 'light' : 'dark'
  }, [settings])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Aba anônima bloqueia o localStorage. A escolha vale só pela sessão.
    }
  }, [settings])

  const set = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }, [])

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  const reducedMotion =
    settings.motion === 'reduzido' || (settings.motion === 'sistema' && systemReducedMotion)

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, set, reset, reducedMotion }),
    [settings, set, reset, reducedMotion],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings precisa estar dentro de SettingsProvider')
  return context
}
