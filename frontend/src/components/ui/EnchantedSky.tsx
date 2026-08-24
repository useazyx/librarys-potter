import { Embers } from './Embers'

/**
 * O teto encantado do Salão Principal, usado atrás das faixas na cor da casa.
 *
 * Três camadas empilhadas: a névoa que anda devagar, a poeira de estrelas e uma
 * segunda leva de estrelas que pisca fora de fase — mais as brasas de vela. Tudo
 * é `aria-hidden` e fica atrás do conteúdo; nada aqui pode esconder texto.
 *
 * Substituiu o padrão quadriculado que havia antes, que em faixa grande lia
 * como grade de planilha em vez de cantaria e quebrava a imersão.
 */
export function EnchantedSky({ embers = 16 }: { embers?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="sky-nebula absolute inset-0" />
      <div className="sky-stars absolute inset-0 opacity-70" />
      <div className="sky-stars sky-twinkle absolute inset-0 -translate-x-12 translate-y-8 opacity-60" />
      {embers > 0 && <Embers count={embers} />}
    </div>
  )
}
