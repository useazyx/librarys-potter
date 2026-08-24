import { HOUSES, HOUSE_INFO, useHouse } from '../../context/HouseContext'
import { HouseCrest } from './HouseCrest'

/** Cada coluna é pintada com a sua própria casa: as quatro aparecem juntas aqui. */
const PAINT: Record<(typeof HOUSES)[number], string> = {
  grifinoria: 'bg-gryffindor-deep',
  sonserina: 'bg-slytherin-deep',
  corvinal: 'bg-ravenclaw-deep',
  'lufa-lufa': 'bg-hufflepuff-deep',
}

/**
 * Faixa full-bleed das quatro casas: quatro colunas coladas, sem cartão e sem
 * margem, ocupando a largura inteira da tela. A coluna escolhida cresce e as
 * outras recuam — a seleção acontece na própria faixa, não num cartão flutuando
 * no meio da página.
 */
export function HousePicker() {
  const { house, setHouse } = useHouse()

  return (
    <section aria-labelledby="casas-title">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-20 lg:px-10 lg:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">O Chapéu Seletor</p>
            <h2 id="casas-title" className="font-display text-4xl text-chalk-50 sm:text-5xl">
              Escolha a sua casa
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-chalk-300">
            A livraria se veste com as cores da casa escolhida e continua vestida na próxima visita.
            Dá para trocar quando quiser, pelo brasão no topo da página.
          </p>
        </div>
      </div>

      {/* A faixa sangra até as bordas: nenhuma margem lateral, nenhum arredondamento. */}
      <ul className="grid grid-cols-2 lg:grid-cols-4">
        {HOUSES.map((id) => {
          const info = HOUSE_INFO[id]
          const chosen = house === id

          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => setHouse(chosen ? null : id)}
                aria-pressed={chosen}
                className={
                  'group relative flex h-full w-full flex-col items-center px-5 pb-10 pt-12 text-center transition-all duration-500 ' +
                  PAINT[id] +
                  (chosen ? ' lg:pt-8 lg:pb-14' : ' opacity-80 hover:opacity-100')
                }
              >
                {/* Régua superior: cheia na casa escolhida, discreta nas outras. */}
                <span
                  className={
                    'absolute inset-x-0 top-0 h-1 origin-left bg-white transition-transform duration-500 ' +
                    (chosen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')
                  }
                  aria-hidden
                />

                <HouseCrest
                  house={id}
                  animate
                  className={
                    'h-28 w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)] transition-transform duration-700 group-hover:-translate-y-1 ' +
                    (chosen ? 'lg:h-36' : '')
                  }
                />

                <span className="mt-6 font-display text-2xl text-white">{info.name}</span>
                <span className="mt-1.5 text-[0.62rem] uppercase tracking-[0.22em] text-white/50">
                  {info.founder}
                </span>

                <span className="mt-5 max-w-[16rem] font-serif text-lg italic leading-snug text-white/85">
                  {info.shelf}
                </span>

                <span className="mt-auto pt-8 text-[0.64rem] uppercase tracking-[0.24em] text-white/70">
                  {chosen ? 'Sua casa · toque para sair' : 'Vestir a livraria'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
