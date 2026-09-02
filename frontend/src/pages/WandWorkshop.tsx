import { Check, RotateCcw, Sparkles, Wand2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { HOUSE_INFO, useHouse, type House } from '../context/HouseContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { Book } from '../types/api'

// A oficina de varinhas: o visitante escolhe madeira, núcleo, comprimento e
// flexibilidade e vê a varinha mudar.
//
// A varinha da bancada é feita em CSS (corpo com o veio em gradiente, punho,
// anel e ponta) porque ela muda de cor, de comprimento e de formato a cada
// escolha: não existe foto de uma varinha que ainda não foi feita.
//
// No fim, a varinha fica guardada no navegador e a oficina sugere a varinha do
// catálogo mais parecida com a que saiu da bancada.

interface Wood {
  id: string
  name: string
  /** O que a madeira diz sobre quem a escolhe. */
  temperament: string
  dark: string
  mid: string
  light: string
  affinity: House
}

const WOODS: Wood[] = [
  {
    id: 'azevinho',
    name: 'Azevinho',
    temperament: 'Escolhe quem precisa superar raiva ou medo. Difícil de agradar, leal quando aceita.',
    dark: '#2c1a10',
    mid: '#5f3d21',
    light: '#9b6f3f',
    affinity: 'grifinoria',
  },
  {
    id: 'teixo',
    name: 'Teixo',
    temperament: 'Vive séculos e não aceita meio-termo. Vai para as mãos de quem marca a história, dos dois lados.',
    dark: '#1d1410',
    mid: '#3f2a1c',
    light: '#6d4a2f',
    affinity: 'sonserina',
  },
  {
    id: 'videira',
    name: 'Videira',
    temperament: 'Procura quem tem propósito maior do que aparenta. Reage antes mesmo de ser tocada.',
    dark: '#2a1f14',
    mid: '#584327',
    light: '#8f7141',
    affinity: 'grifinoria',
  },
  {
    id: 'sabugueiro',
    name: 'Sabugueiro',
    temperament: 'A madeira mais azarada e mais poderosa. Poucos bruxos a dominam por muito tempo.',
    dark: '#241d19',
    mid: '#4d413a',
    light: '#877868',
    affinity: 'corvinal',
  },
  {
    id: 'salgueiro',
    name: 'Salgueiro',
    temperament: 'Tem poder de cura e escolhe quem ainda não sabe o próprio tamanho.',
    dark: '#2b2618',
    mid: '#5a5230',
    light: '#928853',
    affinity: 'lufa-lufa',
  },
  {
    id: 'carvalho',
    name: 'Carvalho',
    temperament: 'Firme, boa em feitiços de força. Quer um par que tenha mão firme e coração leal.',
    dark: '#27190d',
    mid: '#52351a',
    light: '#8a6136',
    affinity: 'lufa-lufa',
  },
  {
    id: 'cerejeira',
    name: 'Cerejeira',
    temperament: 'Rara e mal compreendida: reputação sinistra que só quem tem autocontrole desmente.',
    dark: '#301412',
    mid: '#63251f',
    light: '#a04b3c',
    affinity: 'sonserina',
  },
  {
    id: 'nogueira',
    name: 'Nogueira',
    temperament: 'Procura o inventor. Nas mãos certas faz o que nenhuma outra faz; nas erradas, também.',
    dark: '#221710',
    mid: '#4a3220',
    light: '#7e5a35',
    affinity: 'corvinal',
  },
]

interface Core {
  id: string
  name: string
  note: string
  glow: string
}

const CORES: Core[] = [
  {
    id: 'fenix',
    name: 'Pena de fênix',
    note: 'O núcleo mais independente e o mais raro. Aprende sozinho, e às vezes age antes de ser mandado.',
    glow: '#ffb648',
  },
  {
    id: 'dragao',
    name: 'Corda de coração de dragão',
    note: 'O núcleo que aprende mais rápido e conjura com mais força. Também o que troca de dono com mais facilidade.',
    glow: '#ff6b5b',
  },
  {
    id: 'unicornio',
    name: 'Pelo de unicórnio',
    note: 'O mais constante. Não vira para as trevas e sofre quando é maltratado.',
    glow: '#dfe7f5',
  },
  {
    id: 'testralio',
    name: 'Pelo de cauda de testrálio',
    note: 'Só quem já viu a morte consegue arrancar um. Núcleo poderoso e difícil.',
    glow: '#b7a7d8',
  },
  {
    id: 'kelpie',
    name: 'Crina de kelpie',
    note: 'Núcleo de fabricação africana, ágil na água e nas transformações. Pouco visto por aqui.',
    glow: '#7fd3c8',
  },
]

const FLEXES = [
  { id: 'rigida', name: 'Rígida', note: 'Não muda de ideia. Nem você.' },
  { id: 'firme', name: 'Firme', note: 'Cede o necessário e volta ao lugar.' },
  { id: 'equilibrada', name: 'Equilibrada', note: 'O meio-termo que serve a quase tudo.' },
  { id: 'flexivel', name: 'Flexível', note: 'Acompanha quem cresce e muda.' },
  { id: 'macia', name: 'Muito maleável', note: 'Para quem se adapta antes de reclamar.' },
]

const STORAGE_KEY = 'librarys-potter:varinha'

interface WandChoice {
  wood: string
  core: string
  flex: string
  length: number
}

const DEFAULT_CHOICE: WandChoice = { wood: 'azevinho', core: 'fenix', flex: 'equilibrada', length: 28 }

function readStored(): WandChoice {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_CHOICE, ...(JSON.parse(raw) as Partial<WandChoice>) } : DEFAULT_CHOICE
  } catch {
    return DEFAULT_CHOICE
  }
}

export default function WandWorkshop() {
  const { house, setHouse } = useHouse()
  const { user } = useAuth()
  const { add, busy } = useCart()
  const { notify } = useToast()

  const [choice, setChoice] = useState<WandChoice>(() => {
    try {
      return readStored()
    } catch {
      return DEFAULT_CHOICE
    }
  })

  const [sealed, setSealed] = useState(false)
  const [wands, setWands] = useState<Book[]>([])

  useEffect(() => {
    const controller = new AbortController()

    api.catalog
      .books({ department: 'varinhas', inStock: true }, controller.signal)
      .then(setWands)
      .catch(() => undefined)

    return () => controller.abort()
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice))
    } catch {
      // Aba anônima: a varinha vale só pela sessão.
    }
  }, [choice])

  const wood = WOODS.find((item) => item.id === choice.wood) ?? WOODS[0]
  const core = CORES.find((item) => item.id === choice.core) ?? CORES[0]
  const flex = FLEXES.find((item) => item.id === choice.flex) ?? FLEXES[2]

  // A varinha do catálogo mais próxima da que foi moldada: primeiro a da mesma
  // casa que a madeira puxa, depois qualquer uma em estoque.
  const suggestion = useMemo(() => {
    if (wands.length === 0) return null
    return wands.find((item) => item.house === wood.affinity) ?? wands[0]
  }, [wands, wood.affinity])

  /** Converte o comprimento em cm para a largura em tela. */
  const wandWidth = 190 + (choice.length - 23) * 11
  const rings = FLEXES.findIndex((item) => item.id === flex.id) + 1

  function reset() {
    setChoice(DEFAULT_CHOICE)
    setSealed(false)
  }

  async function buySuggestion() {
    if (!suggestion) return

    if (!user) {
      notify('Entre na sua conta para levar a varinha.', 'info')
      return
    }

    try {
      await add(suggestion.id)
      notify(suggestion.title + ' foi para o carrinho.')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Não conseguimos adicionar agora.', 'error')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Olivaras, desde 382 a.C."
        title="A oficina de varinhas"
        description="Escolha a madeira, o núcleo, o comprimento e a flexibilidade. A varinha se monta enquanto você decide e fica guardada neste navegador quando você lacrar a caixa."
        aside={
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[0.66rem] uppercase tracking-[0.2em] text-white/80">
            <Wand2 size={14} aria-hidden />
            {WOODS.length} madeiras · {CORES.length} núcleos
          </span>
        }
      />

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
          {/* a bancada */}
          <div>
            {/* A varinha fica no topo em tela pequena e acompanha a rolagem
                nas grandes, para dar para ver cada escolha acontecendo. */}
            <div className="mb-12 overflow-hidden rounded-3xl border border-chalk-100/15 bg-house-surface p-10">
              <div className="flex min-h-[9rem] items-center justify-center">
                <div
                  className="relative flex items-center transition-all duration-700"
                  style={
                    {
                      width: wandWidth + 'px',
                      '--wand-dark': wood.dark,
                      '--wand-mid': wood.mid,
                      '--wand-light': wood.light,
                    } as React.CSSProperties
                  }
                  role="img"
                  aria-label={
                    'Varinha de ' +
                    wood.name.toLowerCase() +
                    ' com núcleo de ' +
                    core.name.toLowerCase() +
                    ', ' +
                    choice.length +
                    ' centímetros, ' +
                    flex.name.toLowerCase()
                  }
                >
                  {/* punho */}
                  <span className="wand-body relative h-5 w-[26%] shrink-0">
                    {Array.from({ length: rings }).map((_, index) => (
                      <span
                        key={index}
                        className="absolute inset-y-0 w-[3px] bg-black/35"
                        style={{ left: 12 + index * 11 + 'px' }}
                        aria-hidden
                      />
                    ))}
                  </span>

                  {/* corpo, afinando até a ponta */}
                  <span className="wand-body h-3 flex-1" />
                  <span className="wand-body h-1.5 w-[16%]" />

                  {/* ponta */}
                  <span
                    className="wand-tip -ml-1 h-4 w-4 shrink-0 rounded-full"
                    style={{ background: core.glow, boxShadow: '0 0 22px 7px ' + core.glow + '80' }}
                    aria-hidden
                  />
                </div>
              </div>

              <p className="mt-8 text-center font-serif text-lg italic leading-snug text-chalk-200">
                {wood.name}, {core.name.toLowerCase()}, {choice.length} centímetros, {flex.name.toLowerCase()}.
              </p>
            </div>

            {/* as quatro escolhas */}
            <Group title="A madeira" hint="A madeira escolhe o bruxo. Cada uma procura um temperamento.">
              <div className="grid gap-3 sm:grid-cols-2">
                {WOODS.map((item) => (
                  <Option
                    key={item.id}
                    active={item.id === choice.wood}
                    onClick={() => setChoice({ ...choice, wood: item.id })}
                    title={item.name}
                    note={item.temperament}
                    swatch={item.light}
                  />
                ))}
              </div>
            </Group>

            <Group title="O núcleo" hint="É o núcleo que faz a magia; a madeira só decide de quem ela gosta.">
              <div className="grid gap-3 sm:grid-cols-2">
                {CORES.map((item) => (
                  <Option
                    key={item.id}
                    active={item.id === choice.core}
                    onClick={() => setChoice({ ...choice, core: item.id })}
                    title={item.name}
                    note={item.note}
                    swatch={item.glow}
                  />
                ))}
              </div>
            </Group>

            <Group title="O comprimento" hint="Varinhas longas costumam ir para gente de personalidade grande. Nem sempre.">
              <label htmlFor="comprimento" className="mb-3 block text-sm text-chalk-200">
                <span className="font-display text-3xl text-house-accent">{choice.length}</span> centímetros
              </label>
              <input
                id="comprimento"
                type="range"
                min={23}
                max={40}
                step={1}
                value={choice.length}
                onChange={(event) => setChoice({ ...choice, length: Number(event.target.value) })}
                className="w-full accent-[var(--house-accent)]"
              />
              <div className="mt-2 flex justify-between text-[0.65rem] uppercase tracking-[0.16em] text-chalk-300">
                <span>23 cm, curta e precisa</span>
                <span>40 cm, longa e teatral</span>
              </div>
            </Group>

            <Group title="A flexibilidade" hint="Quanto a varinha aceita mudar de ideia junto com quem a segura.">
              <div className="grid gap-3 sm:grid-cols-2">
                {FLEXES.map((item) => (
                  <Option
                    key={item.id}
                    active={item.id === choice.flex}
                    onClick={() => setChoice({ ...choice, flex: item.id })}
                    title={item.name}
                    note={item.note}
                  />
                ))}
              </div>
            </Group>
          </div>

          {/* o certificado */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="surface-paper rounded-2xl p-7">
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-house-accent">Registro de Olivaras</p>

              <h2 className="mt-4 font-display text-2xl leading-snug text-stone-900">
                {wood.name} e {core.name.toLowerCase()}
              </h2>

              <dl className="mt-6 space-y-3 text-sm">
                <Row label="Madeira" value={wood.name} />
                <Row label="Núcleo" value={core.name} />
                <Row label="Comprimento" value={choice.length + ' cm'} />
                <Row label="Flexibilidade" value={flex.name} />
                <Row label="Afinidade" value={HOUSE_INFO[wood.affinity].name} />
              </dl>

              <p className="mt-6 border-t border-stone-800/15 pt-5 text-sm leading-relaxed text-stone-700">
                {wood.temperament} {core.note}
              </p>

              {sealed ? (
                <p className="mt-6 flex items-center gap-2 rounded-xl bg-house-mid/10 px-4 py-3 text-sm text-stone-800">
                  <Check size={16} className="shrink-0 text-house-accent" aria-hidden />
                  Caixa lacrada. Sua varinha fica guardada neste navegador.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSealed(true)
                    if (!house) setHouse(wood.affinity)
                  }}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-house-mid px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.2em] text-white transition hover:brightness-110"
                >
                  <Sparkles size={15} aria-hidden />
                  Lacrar a caixa
                </button>
              )}

              <button
                type="button"
                onClick={reset}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-800/25 px-6 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-stone-700 transition-colors hover:border-house-mid hover:text-house-mid"
              >
                <RotateCcw size={14} aria-hidden />
                Recomeçar
              </button>
            </div>

            {/* a varinha do catálogo mais parecida */}
            {suggestion && (
              <div className="mt-6 rounded-2xl border border-chalk-100/15 bg-house-surface p-6">
                <p className="eyebrow">Da vitrine, hoje</p>

                <div className="mt-4 flex gap-4">
                  <img
                    src={suggestion.coverUrl}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="h-24 w-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-display text-base leading-snug text-chalk-50">
                      <Link to={'/produto/' + suggestion.slug} className="link-underline">
                        {suggestion.title}
                      </Link>
                    </h3>
                    <p className="mt-2 font-display text-lg text-house-accent">{formatPrice(suggestion.price)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={buySuggestion}
                  disabled={busy}
                  className="mt-5 w-full rounded-full bg-house-accent px-5 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-stone-950 transition hover:brightness-110 disabled:opacity-50"
                >
                  Levar esta
                </button>

                <p className="mt-3 text-xs leading-relaxed text-chalk-300">
                  A varinha da bancada é sua e não sai daqui. Esta é a réplica em caixa de colecionador que mais se
                  parece com ela.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  )
}

function Group({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="mb-12 border-t border-chalk-100/15 pt-8">
      <h2 className="font-display text-2xl text-chalk-50">{title}</h2>
      <p className="mb-6 mt-2 text-sm text-chalk-300">{hint}</p>
      {children}
    </section>
  )
}

interface OptionProps {
  active: boolean
  onClick: () => void
  title: string
  note: string
  swatch?: string
}

function Option({ active, onClick, title, note, swatch }: OptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'glow-follow flex h-full gap-3 rounded-2xl border p-4 text-left transition-colors ' +
        (active
          ? 'border-house-accent bg-house-accent/10'
          : 'border-chalk-100/15 bg-house-surface hover:border-house-accent/50')
      }
    >
      {swatch && (
        <span
          className="mt-1 h-4 w-4 shrink-0 rounded-full border border-white/20"
          style={{ background: swatch }}
          aria-hidden
        />
      )}
      <span>
        <span className={'block font-display text-base ' + (active ? 'text-house-accent' : 'text-chalk-50')}>
          {title}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-chalk-300">{note}</span>
      </span>
    </button>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-stone-800/10 pb-2">
      <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-stone-500">{label}</dt>
      <dd className="text-right text-stone-800">{value}</dd>
    </div>
  )
}
