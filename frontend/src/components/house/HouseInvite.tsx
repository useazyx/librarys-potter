import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HOUSES, HOUSE_INFO, useHouse } from '../../context/HouseContext'
import { ButtonLink } from '../ui/Button'
import { EnchantedSky } from '../ui/EnchantedSky'
import { HouseCrest } from './HouseCrest'

// Faixa da home que convida para a cerimônia do Chapéu Seletor.
//
// Antes eram quatro colunas, cada uma pintada com a cor de uma casa. Ficava
// ruim no meio de uma página inteira vestida com uma casa só. Agora é uma faixa
// única, na cor da casa atual, com os quatro brasões pequenos em fila para quem
// já sabe a casa e só quer trocar.
export function HouseInvite() {
  const { house, info, setHouse } = useHouse()

  return (
    <section className="relative overflow-hidden bg-house-deep" aria-labelledby="casas-title">
      <EnchantedSky embers={18} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-10 lg:py-28">
        <div>
          <p className="eyebrow mb-4">O Chapéu Seletor</p>

          <h2 id="casas-title" className="text-balance font-display text-4xl leading-tight text-white sm:text-5xl">
            {info ? 'Você é da ' + info.name + '.' : 'Ainda não sabe a sua casa?'}
          </h2>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
            {info
              ? 'A loja está vestida com as cores da sua casa: fundo, superfícies e realces. Pode pedir ao Chapéu de novo quando quiser, ele muda de ideia com o tempo.'
              : 'Sete perguntas e o velho chapéu decide por você. A casa escolhida veste a loja inteira e continua vestida na próxima visita. Não é um detalhe de cor, é o tema do site.'}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <ButtonLink to="/chapeu-seletor" size="lg" variant="house">
              <Sparkles size={16} aria-hidden />
              {info ? 'Refazer a cerimônia' : 'Começar a cerimônia'}
            </ButtonLink>

            {info && (
              <Link
                to={'/catalogo?house=' + info.id}
                className="link-underline inline-flex items-center gap-2 text-[0.74rem] uppercase tracking-[0.22em] text-white/80 transition-colors hover:text-house-accent"
              >
                <span data-active={false}>Ver o que é da minha casa</span>
                <ArrowRight size={15} aria-hidden />
              </Link>
            )}
          </div>

          {/* atalho para quem já sabe a casa */}
          <div className="mt-12 border-t border-white/15 pt-7">
            <p className="mb-4 text-[0.62rem] uppercase tracking-[0.24em] text-white/45">
              Ou diga direto qual é a sua
            </p>

            <ul className="flex flex-wrap gap-3">
              {HOUSES.map((id) => {
                const chosen = house === id

                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setHouse(chosen ? null : id)}
                      aria-pressed={chosen}
                      className={
                        'flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs transition-colors ' +
                        (chosen
                          ? 'border-house-accent bg-house-accent/15 text-house-accent'
                          : 'border-white/25 text-white/75 hover:border-house-accent hover:text-house-accent')
                      }
                    >
                      <HouseCrest house={id} className="house-crest h-7 w-auto" />
                      {HOUSE_INFO[id].name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* brasão da casa atual */}
        <div className="flex items-center justify-center">
          {info ? (
            <div className="text-center">
              <HouseCrest
                house={info.id}
                animate
                className="house-crest mx-auto h-52 w-auto drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)] lg:h-64"
              />
              <p className="mt-7 font-display text-2xl text-house-accent">{info.trait}</p>
              <p className="mx-auto mt-3 max-w-xs font-serif text-lg italic leading-snug text-white/80">
                {info.shelf}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-black/25 p-9 text-center backdrop-blur-sm">
              <p className="font-serif text-2xl italic leading-snug text-white/90">
                "Hmm... difícil. Muito difícil. Vejo coragem, sim. E uma cabeça que não para. Onde ponho você?"
              </p>
              <p className="mt-6 text-[0.62rem] uppercase tracking-[0.24em] text-white/50">O Chapéu Seletor</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
