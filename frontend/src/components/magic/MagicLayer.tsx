import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HOUSE_INFO, useHouse, type House } from '../../context/HouseContext'
import { useSettings } from '../../context/SettingsContext'
import { useAmbience } from '../../hooks/useAmbience'

// Camada de efeitos: feitiços digitados, faíscas do ponteiro e a trilha do
// castelo. Fica dentro do Layout, por cima de tudo, e não captura clique.
// Nada aqui mostra conteúdo, então se travar some só o efeito.
//
// Os feitiços funcionam em qualquer página, tipo código de videogame: o
// listener junta as letras num buffer e compara o fim dele com a lista. Não
// escuta enquanto o foco está num campo de texto, senão digitar "nox" numa
// busca apagaria a tela.

export interface Spell {
  /** O que digitar. Sempre minúsculo e sem acento. */
  incantation: string
  /** Como aparece na página de feitiços. */
  name: string
  /** O que o feitiço faz, em uma linha. */
  effect: string
}

export const SPELLS: Spell[] = [
  { incantation: 'lumos', name: 'Lumos', effect: 'Acende o castelo: o site passa para o modo pergaminho, claro.' },
  { incantation: 'nox', name: 'Nox', effect: 'Apaga as luzes e devolve a pedra escura.' },
  { incantation: 'alohomora', name: 'Alohomora', effect: 'Abre a gaveta de configurações e acessibilidade.' },
  { incantation: 'accio', name: 'Accio', effect: 'Chama o acervo: leva direto ao catálogo.' },
  { incantation: 'revelio', name: 'Revelio', effect: 'Revela a biblioteca animada, com as estantes em profundidade.' },
  { incantation: 'expecto patronum', name: 'Expecto Patronum', effect: 'Conjura um patrono de faíscas na tela.' },
  { incantation: 'wingardium leviosa', name: 'Wingardium Leviosa', effect: 'Levita a página de volta ao topo.' },
  { incantation: 'sonorus', name: 'Sonorus', effect: 'Liga a trilha do castelo.' },
  { incantation: 'quietus', name: 'Quietus', effect: 'Silencia a trilha.' },
  { incantation: 'juro solenemente', name: 'Juro solenemente', effect: 'Abre o Mapa do Maroto: a lista de feitiços do site.' },
  { incantation: 'malfeito feito', name: 'Malfeito feito', effect: 'Fecha o mapa e desliga os feitiços e as faíscas.' },
  { incantation: 'grifinoria', name: 'Grifinória', effect: 'Veste o site de escarlate e ouro.' },
  { incantation: 'sonserina', name: 'Sonserina', effect: 'Veste o site de verde e prata.' },
  { incantation: 'corvinal', name: 'Corvinal', effect: 'Veste o site de azul e bronze.' },
  { incantation: 'lufa lufa', name: 'Lufa-Lufa', effect: 'Veste o site de amarelo e preto.' },
  { incantation: 'avada kedavra', name: 'Avada Kedavra', effect: 'Não. Aqui não.' },
]

// Tempo de vida de cada faísca. Igual ao .spark do index.css.
const SPARK_MS = 750

interface Spark {
  id: number
  x: number
  y: number
  drift: number
}

interface MagicLayerProps {
  /** Chamado quando um feitiço abre a gaveta de configurações. */
  onOpenSettings: () => void
}

export function MagicLayer({ onOpenSettings }: MagicLayerProps) {
  const { settings, set, reducedMotion } = useSettings()
  const { setHouse } = useHouse()
  const navigate = useNavigate()

  const [sparks, setSparks] = useState<Spark[]>([])
  const [lumos, setLumos] = useState(0)
  const [toast, setToast] = useState<{ id: number; title: string; text: string } | null>(null)

  useAmbience({ enabled: settings.sound })

  const announce = useCallback((title: string, text: string) => {
    setToast({ id: Date.now(), title, text })
  }, [])

  // A faixa do feitiço sai por timer, nunca pelo fim da animação, senão uma
  // animação travada deixa a faixa presa na tela.
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (lumos === 0) return
    const timer = window.setTimeout(() => setLumos(0), 1400)
    return () => window.clearTimeout(timer)
  }, [lumos])

  const burst = useCallback((x: number, y: number, count: number) => {
    const base = Date.now()
    const novas = Array.from({ length: count }, (_, index) => ({
      id: base + index,
      // Posição derivada do índice em vez de Math.random(): sortear no render
      // dá resultado diferente nas duas passagens do StrictMode.
      x: x + Math.cos((index / count) * Math.PI * 2) * (18 + (index % 5) * 12),
      y: y + Math.sin((index / count) * Math.PI * 2) * (18 + (index % 4) * 10),
      drift: ((index % 7) - 3) * 9,
    }))

    setSparks((current) => [...current, ...novas].slice(-90))
    window.setTimeout(() => {
      setSparks((current) => current.filter((spark) => spark.id < base || spark.id >= base + count))
    }, SPARK_MS)
  }, [])

  const cast = useCallback(
    (spell: Spell) => {
      switch (spell.incantation) {
        case 'lumos':
          set('mode', 'claro')
          setLumos(Date.now())
          announce('Lumos', 'A ponta da varinha acende e o castelo clareia.')
          break
        case 'nox':
          set('mode', 'escuro')
          announce('Nox', 'A luz se apaga. Volta a pedra.')
          break
        case 'alohomora':
          onOpenSettings()
          announce('Alohomora', 'A fechadura cede: configurações abertas.')
          break
        case 'accio':
          navigate('/catalogo')
          announce('Accio', 'O acervo vem até você.')
          break
        case 'revelio':
          navigate('/biblioteca')
          announce('Revelio', 'As estantes se revelam.')
          break
        case 'expecto patronum':
          burst(window.innerWidth / 2, window.innerHeight / 2, 48)
          announce('Expecto Patronum', 'Uma forma prateada afasta o frio da sala.')
          break
        case 'wingardium leviosa':
          window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
          announce('Wingardium Leviosa', 'É levi-ô-sa, não levio-sá.')
          break
        case 'sonorus':
          set('sound', true)
          announce('Sonorus', 'A trilha do castelo começa a tocar.')
          break
        case 'quietus':
          set('sound', false)
          announce('Quietus', 'Silêncio no Salão Principal.')
          break
        case 'juro solenemente':
          navigate('/feiticos')
          announce('Juro solenemente', 'Não pretendo fazer nada de bom.')
          break
        case 'malfeito feito':
          set('spells', false)
          set('sparks', false)
          announce('Malfeito, feito', 'O mapa fica em branco. Ligue de novo nas configurações.')
          break
        case 'grifinoria':
        case 'sonserina':
        case 'corvinal':
          setHouse(spell.incantation as House)
          announce(HOUSE_INFO[spell.incantation as House].name, 'A loja se veste com as cores da casa.')
          break
        case 'lufa lufa':
          setHouse('lufa-lufa')
          announce(HOUSE_INFO['lufa-lufa'].name, 'A loja se veste com as cores da casa.')
          break
        case 'avada kedavra':
          announce('Avada Kedavra', 'Não. Aqui não, esta é uma livraria.')
          break
        default:
          break
      }
    },
    [announce, burst, navigate, onOpenSettings, reducedMotion, set, setHouse],
  )

  // feitiços digitados
  const buffer = useRef('')

  useEffect(() => {
    if (!settings.spells) return

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null

      // Nunca dentro de um campo: digitar "nox" numa busca não pode apagar a tela.
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      if (event.ctrlKey || event.metaKey || event.altKey) return

      const key = event.key.toLowerCase()
      if (key !== ' ' && key.length !== 1) return

      buffer.current = (buffer.current + key).slice(-24)

      const hit = SPELLS.find((spell) => buffer.current.endsWith(spell.incantation))
      if (!hit) return

      buffer.current = ''
      cast(hit)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cast, settings.spells])

  // faíscas do ponteiro
  const lastSpark = useRef(0)

  useEffect(() => {
    if (!settings.sparks || reducedMotion) return

    function onMove(event: PointerEvent) {
      // No máximo uma faísca a cada 60 ms, senão o rastro vira uma mancha e o
      // navegador gasta o quadro inteiro criando e removendo nó.
      const now = performance.now()
      if (now - lastSpark.current < 60) return
      lastSpark.current = now

      const id = now
      const spark = { id, x: event.clientX, y: event.clientY, drift: ((id % 7) - 3) * 8 }

      setSparks((current) => [...current, spark].slice(-40))
      window.setTimeout(() => setSparks((current) => current.filter((item) => item.id !== id)), SPARK_MS)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reducedMotion, settings.sparks])

  return (
    <>
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="spark"
          aria-hidden
          style={
            {
              left: spark.x - 3,
              top: spark.y - 3,
              '--spark-drift': spark.drift + 'px',
            } as React.CSSProperties
          }
        />
      ))}

      {lumos !== 0 && !reducedMotion && <div key={lumos} className="lumos-veil" aria-hidden />}

      {/*
        A confirmação do feitiço é anunciada por leitor de tela: quem não vê a
        faixa precisa saber que alguma coisa aconteceu com a página.
      */}
      <div className="pointer-events-none" role="status" aria-live="polite">
        {toast && (
          <div
            key={toast.id}
            className="spell-toast rounded-full border border-house-accent/45 bg-house-surface/95 px-6 py-3 text-center shadow-stone backdrop-blur"
          >
            <p className="font-display text-base text-house-accent">{toast.title}</p>
            <p className="mt-0.5 text-xs text-chalk-200">{toast.text}</p>
          </div>
        )}
      </div>
    </>
  )
}
