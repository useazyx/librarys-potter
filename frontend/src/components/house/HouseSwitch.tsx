import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HOUSES, HOUSE_INFO, useHouse } from '../../context/HouseContext'
import { HouseCrest } from './HouseCrest'

/** Cor fixa de cada casa no menu: ali as quatro aparecem lado a lado. */
const SWATCH: Record<(typeof HOUSES)[number], string> = {
  grifinoria: 'text-gryffindor-accent',
  sonserina: 'text-slytherin-accent',
  corvinal: 'text-ravenclaw-accent',
  'lufa-lufa': 'text-hufflepuff-accent',
}

/**
 * O Chapéu Seletor em miniatura, no cabeçalho. Trocar a casa reveste o site
 * inteiro — o `HouseProvider` escreve `data-house` no `<html>` e o CSS pende dali.
 */
export function HouseSwitch() {
  const { house, info, setHouse } = useHouse()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={info ? 'Casa escolhida: ' + info.name + '. Trocar de casa' : 'Escolher uma casa'}
        title={info ? info.name : 'Escolher uma casa'}
        className="rounded-full p-2 text-house-accent transition-colors hover:bg-chalk-100/10"
      >
        {house ? (
          <HouseCrest house={house} className="h-6 w-6" />
        ) : (
          <span className="grid h-6 w-6 place-items-center rounded-full border border-current text-[0.6rem]">
            ?
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-chalk-100/12 bg-stone-800 shadow-book"
        >
          <p className="border-b border-chalk-100/10 px-4 py-3 text-[0.62rem] uppercase tracking-[0.28em] text-chalk-300">
            O Chapéu Seletor
          </p>

          {HOUSES.map((id) => (
            <button
              key={id}
              type="button"
              role="menuitemradio"
              aria-checked={house === id}
              onClick={() => {
                setHouse(id)
                setOpen(false)
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-chalk-100/8"
            >
              <HouseCrest house={id} className={'h-7 w-7 shrink-0 ' + SWATCH[id]} />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm text-chalk-50">{HOUSE_INFO[id].name}</span>
                <span className="block truncate text-[0.7rem] text-chalk-300">{HOUSE_INFO[id].trait}</span>
              </span>
              {house === id && <Check size={16} className="shrink-0 text-house-accent" aria-hidden />}
            </button>
          ))}

          <button
            type="button"
            role="menuitemradio"
            aria-checked={house === null}
            onClick={() => {
              setHouse(null)
              setOpen(false)
            }}
            className="w-full border-t border-chalk-100/10 px-4 py-3 text-left text-[0.7rem] uppercase tracking-[0.2em] text-chalk-300 transition-colors hover:bg-chalk-100/8 hover:text-chalk-100"
          >
            Voltar ao castelo neutro
          </button>
        </div>
      )}
    </div>
  )
}
