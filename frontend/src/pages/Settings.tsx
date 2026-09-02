import { Accessibility } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { SettingsControls } from '../components/settings/SettingsControls'
import { HOUSES, HOUSE_INFO, useHouse } from '../context/HouseContext'
import { VISION_LABELS, useSettings } from '../context/SettingsContext'

// Página de acessibilidade. Usa o mesmo componente de controles da gaveta do
// cabeçalho e acrescenta o que não cabe numa gaveta: a explicação de cada opção
// e uma amostra ao vivo das quatro casas na paleta escolhida, para o visitante
// conferir se consegue distinguir uma da outra.
export default function SettingsPage() {
  const { settings } = useSettings()
  const { house, setHouse } = useHouse()

  return (
    <>
      <PageHeader
        eyebrow="Sala Precisa"
        title="Acessibilidade"
        description="A loja se ajusta a você. Cor, contraste, tamanho do texto, movimento, som e os feitiços do teclado, tudo guardado neste navegador."
        aside={
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[0.66rem] uppercase tracking-[0.2em] text-white/80">
            <Accessibility size={14} aria-hidden />
            {VISION_LABELS[settings.vision].name}
          </span>
        }
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_20rem] lg:px-10 lg:py-20">
        <section aria-labelledby="preferencias">
          <h2 id="preferencias" className="sr-only">
            Preferências de leitura
          </h2>

          <div className="rounded-3xl border border-chalk-100/15 bg-house-surface p-7 lg:p-9">
            <SettingsControls />
          </div>

          <div className="mt-10 space-y-6 text-sm leading-relaxed text-chalk-300">
            <div>
              <h3 className="font-display text-lg text-chalk-50">Por que a cor precisa mudar de eixo</h3>
              <p className="mt-2">
                A identidade deste site é a casa escolhida: ela pinta o fundo, as superfícies e os realces de todas
                as páginas. Grifinória é vermelha e Sonserina é verde, justamente o par que desaparece para quem tem
                deuteranopia ou protanopia, as deficiências de cor mais comuns. Não bastaria escrever o nome da casa
                em algum canto: as duas versões do site inteiro ficariam parecidas.
              </p>
              <p className="mt-2">
                Por isso, em cada modo de visão as quatro paletas são redesenhadas em torno de um eixo que aquela
                visão preserva (âmbar, ciano, violeta e amarelo para vermelho-verde; vermelho, verde e magenta para
                azul-amarelo) e as quatro também se afastam em claridade, o que faz o sistema funcionar até sem
                cor nenhuma.
              </p>
            </div>

            <div>
              <h3 className="font-display text-lg text-chalk-50">O que o movimento reduzido desliga</h3>
              <p className="mt-2">
                As brasas, as estrelas do teto encantado, o reflexo de vela, as faíscas do ponteiro e as entradas
                animadas. O que ele <strong>não</strong> desliga é o conteúdo: toda animação de entrada do site
                repousa no estado visível, então uma página sem animação nenhuma continua sendo uma página inteira.
                Esta é a regra mais cara que o projeto aprendeu.
              </p>
            </div>

            <div>
              <h3 className="font-display text-lg text-chalk-50">Onde mais isso aparece</h3>
              <p className="mt-2">
                O site tem pulo para o conteúdo na primeira tecla Tab, anel de foco visível em tudo que recebe foco,
                rótulo em cada campo e imagem, contagem de resultados anunciada por leitor de tela e nenhuma
                informação transmitida só por cor: desconto, esgotado e casa vêm sempre acompanhados de texto.
              </p>
            </div>
          </div>
        </section>

        {/* amostra das quatro casas */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-chalk-100/15 bg-house-surface p-6">
            <p className="eyebrow">Confira com os seus olhos</p>
            <h2 className="mt-3 font-display text-xl text-chalk-50">As quatro casas agora</h2>
            <p className="mt-2 text-xs leading-relaxed text-chalk-300">
              Se você não distinguir duas destas faixas, troque o modo de visão ao lado. Clique numa delas para
              vestir a loja.
            </p>

            <ul className="mt-6 space-y-2">
              {HOUSES.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setHouse(house === id ? null : id)}
                    aria-pressed={house === id}
                    data-house={id}
                    className="flex w-full items-center gap-3 rounded-xl border border-chalk-100/15 p-3 text-left transition-colors hover:border-house-accent/60"
                  >
                    {/* Cada linha tem o seu próprio data-house, então é
                        pintada pela paleta daquela casa no modo de visão em
                        vigor. É amostra de verdade, não cor fixa. */}
                    <span className="house-swatch h-10 w-10 shrink-0 rounded-lg bg-house-mid ring-1 ring-house-accent/60" aria-hidden />
                    <span>
                      <span className="block font-display text-sm text-chalk-50">{HOUSE_INFO[id].name}</span>
                      <span className="block text-[0.68rem] text-chalk-300">{HOUSE_INFO[id].trait}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setHouse(null)}
              className="mt-5 w-full rounded-full border border-chalk-100/25 px-4 py-2.5 text-[0.66rem] uppercase tracking-[0.16em] text-chalk-200 transition hover:border-house-accent hover:text-house-accent"
            >
              Castelo neutro, sem casa
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
