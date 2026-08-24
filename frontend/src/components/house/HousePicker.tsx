import { HOUSES, HOUSE_INFO, useHouse } from '../../context/HouseContext'
import { HouseCrest } from './HouseCrest'

/**
 * Cada cartão é pintado com a sua própria casa, fixa — as quatro precisam
 * aparecer juntas aqui, independentemente da casa em vigor no resto do site.
 */
const PAINT: Record<(typeof HOUSES)[number], { panel: string; crest: string; rule: string }> = {
  grifinoria: {
    panel: 'bg-gryffindor-deep',
    crest: 'text-gryffindor-accent',
    rule: 'bg-gryffindor-mid',
  },
  sonserina: {
    panel: 'bg-slytherin-deep',
    crest: 'text-slytherin-accent',
    rule: 'bg-slytherin-mid',
  },
  corvinal: {
    panel: 'bg-ravenclaw-deep',
    crest: 'text-ravenclaw-accent',
    rule: 'bg-ravenclaw-mid',
  },
  'lufa-lufa': {
    panel: 'bg-hufflepuff-deep',
    crest: 'text-hufflepuff-accent',
    rule: 'bg-hufflepuff-mid',
  },
}

/**
 * A seleção: quatro colunas que reagem ao ponteiro e vestem o site inteiro
 * quando escolhidas. O brasão se redesenha na entrada, mas o traço completo é o
 * estado de repouso — se a animação não rodar, o brasão aparece inteiro.
 */
export function HousePicker() {
  const { house, setHouse } = useHouse()

  return (
    <section className="bg-masonry py-24 lg:py-32" aria-labelledby="casas-title">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">O Chapéu Seletor</p>
          <h2 id="casas-title" className="text-balance font-display text-4xl text-chalk-50 sm:text-5xl">
            Escolha a sua casa
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-chalk-300">
            A livraria se veste com as cores da casa que você escolher — e continua vestida na próxima
            visita. Dá para trocar quando quiser, pelo brasão no topo da página.
          </p>
        </div>

        <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOUSES.map((id, index) => {
            const info = HOUSE_INFO[id]
            const paint = PAINT[id]
            const chosen = house === id

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setHouse(chosen ? null : id)}
                  aria-pressed={chosen}
                  className={
                    'group relative flex h-full w-full flex-col items-center overflow-hidden rounded-3xl px-6 py-10 text-center transition-all duration-500 ' +
                    paint.panel +
                    ' ' +
                    (chosen
                      ? 'ring-2 ring-house-accent ring-offset-2 ring-offset-stone-800'
                      : 'ring-1 ring-white/8 hover:-translate-y-2 hover:ring-white/25')
                  }
                >
                  <HouseCrest
                    house={id}
                    animate
                    className={
                      'h-24 w-24 transition-transform duration-700 group-hover:scale-105 ' + paint.crest
                    }
                  />

                  <span className={'mt-7 h-px w-12 ' + paint.rule} aria-hidden />

                  <span className="mt-6 font-display text-2xl text-white">{info.name}</span>
                  <span className="mt-2 text-[0.68rem] uppercase tracking-[0.2em] text-white/55">
                    {info.founder}
                  </span>

                  <span className="mt-5 font-serif text-lg italic leading-snug text-white/85">
                    {info.shelf}
                  </span>

                  <span className="mt-auto pt-7 text-[0.66rem] uppercase tracking-[0.24em] text-white/70">
                    {chosen ? 'Sua casa · toque para sair' : 'Vestir a livraria'}
                  </span>

                  {/* Vela do salão: puro enfeite, nunca carrega conteúdo. */}
                  <span
                    className="candle pointer-events-none absolute -bottom-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-white/12 blur-2xl"
                    style={{ animationDelay: index * 0.6 + 's' }}
                    aria-hidden
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
