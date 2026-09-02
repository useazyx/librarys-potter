import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HouseCrest } from '../components/house/HouseCrest'
import { ButtonLink } from '../components/ui/Button'
import { EnchantedSky } from '../components/ui/EnchantedSky'
import { HOUSES, HOUSE_INFO, useHouse, type House } from '../context/HouseContext'
import { useSettings } from '../context/SettingsContext'

// A cerimônia do Chapéu Seletor: sete perguntas e o anúncio da casa.
//
// Antes escolher a casa era clicar num de quatro blocos coloridos, o que é
// pouco para uma decisão que pinta o site inteiro. Quem já sabe a casa ainda
// pode dizer direto, no fim da página.
//
// A contagem é simples: cada resposta distribui pontos entre as quatro casas e
// ganha a maior soma. Empate é resolvido pela última pergunta, que é o que o
// próprio Chapéu faz com o Harry.

type Weights = Partial<Record<House, number>>

interface Question {
  id: string
  text: string
  /** O que o Chapéu murmura enquanto a pessoa pensa. */
  murmur: string
  options: Array<{ label: string; weights: Weights }>
}

const QUESTIONS: Question[] = [
  {
    id: 'corredor',
    text: 'É meia-noite no castelo e você ouve um barulho no corredor proibido. O que faz?',
    murmur: 'Curioso... muito curioso.',
    options: [
      { label: 'Vou ver o que é, agora.', weights: { grifinoria: 3, sonserina: 1 } },
      { label: 'Vou, mas primeiro descubro o que costuma haver ali.', weights: { corvinal: 3, grifinoria: 1 } },
      { label: 'Acordo alguém para ir junto.', weights: { 'lufa-lufa': 3, grifinoria: 1 } },
      { label: 'Fico anotando quem passa. Uma hora isso vale alguma coisa.', weights: { sonserina: 3, corvinal: 1 } },
    ],
  },
  {
    id: 'espelho',
    text: 'O Espelho de Ojesed mostra o seu desejo mais fundo. O que você vê?',
    murmur: 'Ah, isto sempre diz mais do que a pessoa quer.',
    options: [
      { label: 'Eu, fazendo a coisa certa quando ninguém mais fez.', weights: { grifinoria: 3, 'lufa-lufa': 1 } },
      { label: 'Eu, sabendo a resposta que ninguém sabia.', weights: { corvinal: 3, sonserina: 1 } },
      { label: 'Eu, com o nome finalmente respeitado.', weights: { sonserina: 3, grifinoria: 1 } },
      { label: 'Todo mundo que eu amo, na mesma sala, bem.', weights: { 'lufa-lufa': 3, corvinal: 1 } },
    ],
  },
  {
    id: 'materia',
    text: 'Qual aula você não perderia por nada?',
    murmur: 'Diga-me onde sua cabeça vai sozinha.',
    options: [
      { label: 'Defesa Contra as Artes das Trevas.', weights: { grifinoria: 3, sonserina: 1 } },
      { label: 'Poções, onde a precisão é o encanto.', weights: { sonserina: 2, corvinal: 2 } },
      { label: 'Feitiços, pela engenharia da coisa.', weights: { corvinal: 3, 'lufa-lufa': 1 } },
      { label: 'Herbologia. Planta não mente nem finge.', weights: { 'lufa-lufa': 3, corvinal: 1 } },
    ],
  },
  {
    id: 'bicho-papao',
    text: 'O bicho-papão abre o armário. Que forma ele toma?',
    murmur: 'Todos temem alguma coisa. Ninguém teme a mesma.',
    options: [
      { label: 'Eu, parado, sem fazer nada enquanto era preciso.', weights: { grifinoria: 3, 'lufa-lufa': 1 } },
      { label: 'Uma pergunta que eu não consigo responder.', weights: { corvinal: 3, sonserina: 1 } },
      { label: 'Ser esquecido. Passar sem deixar marca.', weights: { sonserina: 3, corvinal: 1 } },
      { label: 'Alguém que confiava em mim, decepcionado.', weights: { 'lufa-lufa': 3, grifinoria: 1 } },
    ],
  },
  {
    id: 'torneio',
    text: 'O Torneio Tribruxo abre inscrições. Você põe o nome no Cálice?',
    murmur: 'Glória é uma palavra que pesa diferente em cada boca.',
    options: [
      { label: 'Ponho. Não vou ficar de fora disso.', weights: { grifinoria: 3, sonserina: 2 } },
      { label: 'Ponho, e passo o ano estudando cada tarefa possível.', weights: { corvinal: 3, sonserina: 1 } },
      { label: 'Ponho se for a melhor jogada para o que eu quero.', weights: { sonserina: 3, corvinal: 1 } },
      { label: 'Não. Prefiro estar na arquibancada com os meus.', weights: { 'lufa-lufa': 3 } },
    ],
  },
  {
    id: 'segredo',
    text: 'Você descobre um segredo capaz de derrubar alguém poderoso. E então?',
    murmur: 'O que se faz com poder diz quase tudo.',
    options: [
      { label: 'Conto na hora, doa a quem doer.', weights: { grifinoria: 3, corvinal: 1 } },
      { label: 'Confiro tudo três vezes antes de abrir a boca.', weights: { corvinal: 3, 'lufa-lufa': 1 } },
      { label: 'Guardo. Segredo guardado é segredo que serve.', weights: { sonserina: 3 } },
      { label: 'Levo a quem é justo e deixo com quem sabe conduzir.', weights: { 'lufa-lufa': 3, grifinoria: 1 } },
    ],
  },
  {
    id: 'desejo',
    text: 'E você, o que gostaria de ser lembrado por ser?',
    murmur: 'Nunca me esqueço de perguntar. O pedido de vocês conta.',
    options: [
      { label: 'Corajoso.', weights: { grifinoria: 4 } },
      { label: 'Sábio.', weights: { corvinal: 4 } },
      { label: 'Determinado.', weights: { sonserina: 4 } },
      { label: 'Leal.', weights: { 'lufa-lufa': 4 } },
    ],
  },
]

// Tempo que o Chapéu fica pensando antes de anunciar, em ms.
const THINKING_MS = 2200

export default function SortingHat() {
  const { house, setHouse } = useHouse()
  const { reducedMotion } = useSettings()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Weights[]>([])
  const [thinking, setThinking] = useState(false)
  const [result, setResult] = useState<House | null>(null)

  const totals = useMemo(() => {
    const scores: Record<House, number> = { grifinoria: 0, sonserina: 0, corvinal: 0, 'lufa-lufa': 0 }

    for (const answer of answers) {
      for (const [id, points] of Object.entries(answer)) scores[id as House] += points ?? 0
    }

    return scores
  }, [answers])

  function choose(weights: Weights) {
    const next = [...answers, weights]
    setAnswers(next)

    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1)
      return
    }

    // Última resposta: o Chapéu pensa e anuncia.
    const scores: Record<House, number> = { grifinoria: 0, sonserina: 0, corvinal: 0, 'lufa-lufa': 0 }
    for (const answer of next) {
      for (const [id, points] of Object.entries(answer)) scores[id as House] += points ?? 0
    }

    // Empate é resolvido pela última pergunta, o pedido do próprio aluno.
    const wish = Object.entries(next[next.length - 1]).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] as
      | House
      | undefined

    const winner = (Object.keys(scores) as House[]).reduce((best, id) => {
      if (scores[id] > scores[best]) return id
      if (scores[id] === scores[best] && id === wish) return id
      return best
    }, 'grifinoria' as House)

    setThinking(true)

    // O anúncio sai por timer, nunca pelo fim de uma animação, senão uma
    // animação travada deixa a cerimônia parada.
    window.setTimeout(
      () => {
        setThinking(false)
        setResult(winner)
        setHouse(winner)
      },
      reducedMotion ? 300 : THINKING_MS,
    )
  }

  function restart() {
    setStep(0)
    setAnswers([])
    setResult(null)
    setThinking(false)
  }

  const question = QUESTIONS[step]
  const progress = Math.round((answers.length / QUESTIONS.length) * 100)

  return (
    <>
      <header className="relative overflow-hidden bg-house-deep pb-14 pt-32 lg:pt-36">
        <EnchantedSky embers={18} />

        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <p className="rise-in text-[0.66rem] uppercase tracking-[0.4em] text-house-accent">A cerimônia</p>

          <h1 className="rise-in mt-5 font-display text-5xl text-white sm:text-6xl" style={{ animationDelay: '0.1s' }}>
            O Chapéu Seletor
          </h1>

          <p className="rise-in mx-auto mt-5 max-w-xl text-white/70" style={{ animationDelay: '0.2s' }}>
            Sete perguntas e o velho chapéu decide. A casa escolhida veste a loja inteira (fundo, superfícies e
            realces) e continua vestida na sua próxima visita.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-20">
        {/* anúncio da casa */}
        {result ? (
          <div className="rounded-3xl border border-house-accent/40 bg-house-surface p-10 text-center">
            <p className="eyebrow">O Chapéu decidiu</p>

            <HouseCrest
              house={result}
              animate
              className="house-crest mx-auto mt-8 h-40 w-auto drop-shadow-[0_14px_36px_rgba(0,0,0,0.6)]"
            />

            <h2 className="mt-8 font-display text-5xl text-house-accent">{HOUSE_INFO[result].name}</h2>
            <p className="mt-3 text-sm uppercase tracking-[0.22em] text-chalk-300">{HOUSE_INFO[result].trait}</p>

            <p className="mx-auto mt-7 max-w-md font-serif text-xl italic leading-snug text-chalk-100">
              {HOUSE_INFO[result].shelf}
            </p>

            {/* a contagem fica à mostra */}
            <dl className="mx-auto mt-10 grid max-w-md grid-cols-4 gap-3">
              {HOUSES.map((id) => (
                <div key={id} className="rounded-xl border border-chalk-100/15 px-2 py-3">
                  <dt className="text-[0.6rem] uppercase tracking-[0.14em] text-chalk-300">{HOUSE_INFO[id].name}</dt>
                  <dd
                    className={
                      'mt-1 font-display text-2xl ' + (id === result ? 'text-house-accent' : 'text-chalk-200/70')
                    }
                  >
                    {totals[id]}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <ButtonLink to={'/catalogo?house=' + result} variant="house" size="lg">
                Ver o que é da minha casa
              </ButtonLink>

              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-2 rounded-full border border-chalk-100/30 px-6 py-3 text-[0.78rem] uppercase tracking-[0.2em] text-chalk-100 transition-colors hover:border-house-accent hover:text-house-accent"
              >
                <RotateCcw size={15} aria-hidden />
                Pedir de novo
              </button>
            </div>
          </div>
        ) : thinking ? (
          /* o Chapéu pensando */
          <div className="rounded-3xl border border-chalk-100/15 bg-house-surface p-14 text-center" aria-live="polite">
            <p className="eyebrow">Hmm...</p>
            <p className="mx-auto mt-6 max-w-md font-serif text-2xl italic leading-snug text-chalk-100">
              Difícil. Muito difícil. Vejo coragem, sim, e uma cabeça que não para. Onde ponho você?
            </p>

            <div className="mx-auto mt-10 flex max-w-xs items-center gap-2" aria-hidden>
              {HOUSES.map((id, index) => (
                <span
                  key={id}
                  className="candle h-1.5 flex-1 rounded-full bg-house-accent/70"
                  style={{ animationDelay: index * 0.22 + 's' }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* as perguntas */
          <div>
            <div className="mb-8 flex items-center justify-between gap-6">
              <p className="text-[0.66rem] uppercase tracking-[0.22em] text-chalk-300">
                Pergunta {step + 1} de {QUESTIONS.length}
              </p>

              <div
                className="h-1 flex-1 overflow-hidden rounded-full bg-chalk-100/15"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progresso da cerimônia"
              >
                <div
                  className="h-full rounded-full bg-house-accent transition-[width] duration-500"
                  style={{ width: progress + '%' }}
                />
              </div>
            </div>

            <div key={question.id} className="page-enter">
              <p className="font-serif text-lg italic text-house-accent">{question.murmur}</p>

              <h2 className="mt-4 text-balance font-display text-3xl leading-snug text-chalk-50 sm:text-4xl">
                {question.text}
              </h2>

              <ul className="mt-9 space-y-3">
                {question.options.map((option, index) => (
                  <li key={option.label}>
                    <button
                      type="button"
                      onClick={() => choose(option.weights)}
                      className="glow-follow w-full rounded-2xl border border-chalk-100/15 bg-house-surface px-6 py-5 text-left text-chalk-100 transition-colors hover:border-house-accent/60 hover:text-house-accent"
                    >
                      <span className="mr-3 font-display text-sm text-house-accent">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStep(step - 1)
                  setAnswers(answers.slice(0, -1))
                }}
                className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-chalk-300 transition-colors hover:text-house-accent"
              >
                <ArrowLeft size={14} aria-hidden />
                Voltar uma pergunta
              </button>
            )}
          </div>
        )}
      </section>

      {/* atalho para quem já sabe a casa */}
      <section className="border-t border-chalk-100/15 bg-house-surface py-14" aria-labelledby="ja-sei">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <h2 id="ja-sei" className="font-display text-2xl text-chalk-50">
            Já sabe a sua casa?
          </h2>
          <p className="mt-2 text-sm text-chalk-300">
            Diga direto. O Chapéu leva o pedido em conta, sempre levou.
          </p>

          <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HOUSES.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => {
                    setHouse(id)
                    setResult(id)
                    setAnswers([])
                    setStep(0)
                  }}
                  aria-pressed={house === id}
                  className={
                    'flex w-full flex-col items-center gap-3 rounded-2xl border px-4 py-6 transition-colors ' +
                    (house === id
                      ? 'border-house-accent text-house-accent'
                      : 'border-chalk-100/15 text-chalk-200 hover:border-house-accent/60')
                  }
                >
                  <HouseCrest house={id} className="house-crest h-16 w-auto" />
                  <span className="font-display text-sm">{HOUSE_INFO[id].name}</span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs text-chalk-300">
            Prefere o castelo neutro, sem cor de casa?{' '}
            <button
              type="button"
              onClick={() => {
                setHouse(null)
                setResult(null)
              }}
              className="link-underline text-house-accent"
            >
              Tirar as cores
            </button>
            . Se enxergar cor for um problema, a{' '}
            <Link to="/configuracoes" className="link-underline text-house-accent">
              aba de acessibilidade
            </Link>{' '}
            tem paletas para daltonismo.
          </p>
        </div>
      </section>
    </>
  )
}
