import { useCallback } from 'react'
import type { MouseEvent } from 'react'

/**
 * Escreve a posição do ponteiro no elemento, em `--mx`/`--my`, para o brilho de
 * `.glow-follow` (ver `index.css`) segui-lo.
 *
 * Escreve direto no estilo do nó em vez de guardar em estado: o ponteiro se move
 * a cada quadro, e um `setState` por movimento re-renderizaria a árvore inteira.
 * Sem JS o brilho fica centralizado e imóvel, que é um estado apresentável.
 */
export function usePointerGlow() {
  return useCallback((event: MouseEvent<HTMLElement>) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()

    target.style.setProperty('--mx', event.clientX - rect.left + 'px')
    target.style.setProperty('--my', event.clientY - rect.top + 'px')
  }, [])
}
