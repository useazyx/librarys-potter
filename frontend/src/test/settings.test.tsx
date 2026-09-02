import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { SettingsControls } from '../components/settings/SettingsControls'
import { HouseProvider } from '../context/HouseContext'
import { SettingsProvider } from '../context/SettingsContext'

/**
 * As preferências de leitura funcionam do mesmo jeito que o sistema de casas:
 * o provedor escreve um atributo no `<html>` e o CSS inteiro reage. Por isso os
 * testes olham para o atributo, e não para classe de componente nenhuma. É o
 * atributo que é o contrato.
 */
function renderControls(ui: ReactNode = <SettingsControls />) {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <HouseProvider>{ui}</HouseProvider>
      </SettingsProvider>
    </MemoryRouter>,
  )
}

const root = () => document.documentElement

beforeEach(() => {
  window.localStorage.clear()
  for (const attribute of ['data-vision', 'data-contrast', 'data-mode', 'data-text', 'data-motion', 'data-links', 'data-focus', 'data-font']) {
    root().removeAttribute(attribute)
  }
})

describe('preferências de acessibilidade', () => {
  it('começa sem atributo nenhum: o padrão é o CSS base', () => {
    renderControls()

    expect(root().hasAttribute('data-vision')).toBe(false)
    expect(root().hasAttribute('data-contrast')).toBe(false)
    expect(root().hasAttribute('data-mode')).toBe(false)
  })

  it('escreve o modo de visão no <html>, que é o que repinta as quatro casas', async () => {
    const user = userEvent.setup()
    renderControls()

    await user.click(screen.getByRole('button', { name: 'Deuteranopia' }))

    expect(root().getAttribute('data-vision')).toBe('deuteranopia')
  })

  it('acende o modo pergaminho e devolve a pedra', async () => {
    const user = userEvent.setup()
    renderControls()

    await user.click(screen.getByRole('button', { name: /Pergaminho/ }))
    expect(root().getAttribute('data-mode')).toBe('claro')
    expect(root().style.colorScheme).toBe('light')

    await user.click(screen.getByRole('button', { name: /Pedra/ }))
    // Voltar ao padrão apaga o atributo em vez de escrever "escuro": assim o
    // CSS base continua valendo sem precisar de um seletor a mais.
    expect(root().hasAttribute('data-mode')).toBe(false)
  })

  it('liga o alto contraste e o texto grande', async () => {
    const user = userEvent.setup()
    renderControls()

    await user.click(screen.getByRole('button', { name: 'Alto contraste' }))
    await user.click(screen.getByRole('button', { name: 'Grande' }))

    expect(root().getAttribute('data-contrast')).toBe('alto')
    expect(root().getAttribute('data-text')).toBe('grande')
  })

  it('liga o movimento reduzido por escolha, e não só pelo sistema', async () => {
    const user = userEvent.setup()
    renderControls()

    await user.click(screen.getByRole('button', { name: 'Reduzido' }))
    expect(root().getAttribute('data-motion')).toBe('reduzido')

    // "Seguir o sistema" tira o atributo e devolve a decisão à media query.
    await user.click(screen.getByRole('button', { name: 'Seguir o sistema' }))
    expect(root().hasAttribute('data-motion')).toBe(false)
  })

  it('liga os interruptores de fonte legível, sublinhado e foco reforçado', async () => {
    const user = userEvent.setup()
    renderControls()

    await user.click(screen.getByRole('checkbox', { name: /Fonte de leitura fácil/ }))
    await user.click(screen.getByRole('checkbox', { name: /Sublinhar os links/ }))
    await user.click(screen.getByRole('checkbox', { name: /Realce de foco reforçado/ }))

    expect(root().getAttribute('data-font')).toBe('legivel')
    expect(root().getAttribute('data-links')).toBe('sublinhado')
    expect(root().getAttribute('data-focus')).toBe('reforcado')
  })

  it('nasce com a trilha desligada: som que começa sozinho é hostil', () => {
    renderControls()

    expect(screen.getByRole('checkbox', { name: /Trilha do castelo/ })).not.toBeChecked()
  })

  it('guarda a escolha para a próxima visita', async () => {
    const user = userEvent.setup()
    renderControls()

    await user.click(screen.getByRole('button', { name: 'Tritanopia' }))

    const stored = JSON.parse(window.localStorage.getItem('librarys-potter:preferencias') ?? '{}')
    expect(stored.vision).toBe('tritanopia')
  })

  it('retoma a preferência guardada e a aplica antes de qualquer clique', () => {
    window.localStorage.setItem(
      'librarys-potter:preferencias',
      JSON.stringify({ vision: 'monocromatico', contrast: 'alto' }),
    )

    renderControls()

    expect(root().getAttribute('data-vision')).toBe('monocromatico')
    expect(root().getAttribute('data-contrast')).toBe('alto')
  })

  it('ignora um armazenamento corrompido em vez de derrubar a loja', () => {
    window.localStorage.setItem('librarys-potter:preferencias', 'isto não é json')

    renderControls()

    expect(root().hasAttribute('data-vision')).toBe(false)
  })

  it('devolve tudo ao padrão de uma vez', async () => {
    const user = userEvent.setup()
    renderControls()

    await user.click(screen.getByRole('button', { name: 'Alto contraste' }))
    await user.click(screen.getByRole('button', { name: 'Protanopia' }))
    await user.click(screen.getByRole('button', { name: /Voltar ao padrão/ }))

    expect(root().hasAttribute('data-contrast')).toBe(false)
    expect(root().hasAttribute('data-vision')).toBe(false)
  })
})
