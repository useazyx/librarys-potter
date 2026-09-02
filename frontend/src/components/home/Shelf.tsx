import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { Book } from '../../types/api'
import { ProductCard } from '../catalog/ProductCard'
import { ButtonLink } from '../ui/Button'

interface ShelfProps {
  title: string
  eyebrow: string
  description: string
  books: Book[]
  /** Destino do botão no fim da faixa. Por padrão vai para o catálogo. */
  to?: string
  /** Texto desse botão. */
  cta?: string
  /** Identificador do título, para o `aria-labelledby` da seção. */
  id?: string
}

// Prateleira que arrasta com o mouse ou o dedo, com inércia.
export function Shelf({ title, eyebrow, description, books, to = '/catalogo', cta = 'Ver o catálogo completo', id = 'shelf-title' }: ShelfProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps',
  })

  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  if (books.length === 0) return null

  return (
    <section className="py-20 lg:py-24" aria-labelledby={id}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">{eyebrow}</p>
            <h2 id={id} className="font-display text-4xl text-chalk-50 sm:text-5xl">
              {title}
            </h2>
            <p className="mt-4 max-w-xl text-chalk-200/85">{description}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              aria-label="Livros anteriores"
              className="rounded-full border border-chalk-100/25 p-3 text-chalk-100 transition hover:border-house-accent hover:text-house-accent disabled:opacity-25"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Próximos livros"
              className="rounded-full border border-chalk-100/25 p-3 text-chalk-100 transition hover:border-house-accent hover:text-house-accent disabled:opacity-25"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-6 flex touch-pan-y">
            {books.map((book, index) => (
              <div key={book.id} className="min-w-0 flex-[0_0_78%] pl-6 sm:flex-[0_0_46%] lg:flex-[0_0_30%] xl:flex-[0_0_24%]">
                <ProductCard book={book} index={index} compact />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <ButtonLink
            to={to}
            variant="secondary"
            className="border-chalk-100/40 text-chalk-100 hover:border-house-accent hover:text-house-accent"
          >
            {cta}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
