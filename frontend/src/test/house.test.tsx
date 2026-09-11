import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { HouseInvite } from '../components/house/HouseInvite'
import { HouseSwitch } from '../components/house/HouseSwitch'
import { SortingCeremony } from '../components/house/SortingCeremony'
import { HouseProvider } from '../context/HouseContext'
import { SettingsProvider } from '../context/SettingsContext'

function renderWithHouse(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <HouseProvider>{ui}</HouseProvider>
      </SettingsProvider>
    </MemoryRouter>,
  )
}

describe('sistema de casas', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-house')
  })

  it('começa no castelo neutro, sem casa no <html>', () => {
    renderWithHouse(<HouseInvite />)
    expect(document.documentElement.hasAttribute('data-house')).toBe(false)
  })

  it('veste o site inteiro ao escolher uma casa', async () => {
    const user = userEvent.setup()
    renderWithHouse(<HouseInvite />)

    await user.click(screen.getByRole('button', { name: /Grifinória/ }))

    // É o atributo no <html> que faz o CSS inteiro trocar de cor.
    expect(document.documentElement.getAttribute('data-house')).toBe('grifinoria')
    expect(window.localStorage.getItem('librarys-potter:casa')).toBe('grifinoria')
  })

  it('despe a livraria quando a casa escolhida é tocada de novo', async () => {
    const user = userEvent.setup()
    renderWithHouse(<HouseInvite />)

    const gryffindor = screen.getByRole('button', { name: /Grifinória/ })
    await user.click(gryffindor)
    await user.click(gryffindor)

    expect(document.documentElement.hasAttribute('data-house')).toBe(false)
    expect(window.localStorage.getItem('librarys-potter:casa')).toBeNull()
  })

  it('retoma a casa guardada da visita anterior', () => {
    window.localStorage.setItem('librarys-potter:casa', 'corvinal')
    renderWithHouse(<HouseInvite />)
    expect(document.documentElement.getAttribute('data-house')).toBe('corvinal')
  })

  it('ignora um valor inválido no armazenamento', () => {
    window.localStorage.setItem('librarys-potter:casa', 'grifinoria-falsa')
    renderWithHouse(<HouseInvite />)
    expect(document.documentElement.hasAttribute('data-house')).toBe(false)
  })

  it('o seletor do cabeçalho troca a casa e fecha o menu', async () => {
    const user = userEvent.setup()
    renderWithHouse(<HouseSwitch />)

    await user.click(screen.getByRole('button', { name: /Escolher uma casa/ }))
    await user.click(screen.getByRole('menuitemradio', { name: /Sonserina/ }))

    expect(document.documentElement.getAttribute('data-house')).toBe('sonserina')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})

describe('cerimônia de escolha de casa', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-house')
  })

  it('cobre a tela ao escolher a casa e sai sozinha depois', async () => {
    const user = userEvent.setup()
    renderWithHouse(
      <>
        <HouseInvite />
        <SortingCeremony />
      </>,
    )

    await user.click(screen.getByRole('button', { name: /Corvinal/ }))

    const veil = document.querySelector('.ceremony')
    expect(veil).not.toBeNull()
    expect(veil).toHaveTextContent('Corvinal')

    // Quem tira a cerimônia é o setTimeout do componente, não o fim da
    // animação, que o jsdom nem roda.
    await waitForElementToBeRemoved(veil, { timeout: 4000 })
  })

  it('não faz cerimônia para voltar ao castelo neutro', async () => {
    const user = userEvent.setup()
    renderWithHouse(
      <>
        <HouseSwitch />
        <SortingCeremony />
      </>,
    )

    await user.click(screen.getByRole('button', { name: /Escolher uma casa/ }))
    await user.click(screen.getByRole('menuitemradio', { name: /castelo neutro/ }))

    expect(document.documentElement.hasAttribute('data-house')).toBe(false)
    expect(document.querySelector('.ceremony')).toBeNull()
  })
})
