import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookCard } from '../components/catalog/BookCard'
import { EnchantedSky } from '../components/ui/EnchantedSky'
import { BookSkeletonGrid } from '../components/ui/Loaders'
import { api, type BookFilters } from '../lib/api'
import type { Author, Book, Publisher } from '../types/api'

const SORTS: Array<{ value: NonNullable<BookFilters['sort']>; label: string }> = [
  { value: 'relevance', label: 'Ordem da saga' },
  { value: 'title', label: 'Título (A–Z)' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'newest', label: 'Lançamento' },
]

export default function Catalog() {
  const [params, setParams] = useSearchParams()

  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [genres, setGenres] = useState<Array<{ genre: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState(params.get('search') ?? '')

  // The URL is the single source of truth for the filters, so a filtered
  // catalogue can be shared or reloaded without losing the selection.
  const filters = useMemo<BookFilters>(
    () => ({
      genre: params.get('genre') ?? undefined,
      author: params.get('author') ?? undefined,
      publisher: params.get('publisher') ?? undefined,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      inStock: params.get('inStock') === 'true' ? true : undefined,
      sort: (params.get('sort') as BookFilters['sort']) ?? 'relevance',
    }),
    [params],
  )

  useEffect(() => {
    void Promise.allSettled([api.catalog.authors(), api.catalog.publishers(), api.catalog.genres()]).then(
      ([authorsResult, publishersResult, genresResult]) => {
        if (authorsResult.status === 'fulfilled') setAuthors(authorsResult.value)
        if (publishersResult.status === 'fulfilled') setPublishers(publishersResult.value)
        if (genresResult.status === 'fulfilled') setGenres(genresResult.value)
      },
    )
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    api.catalog
      .books(filters, controller.signal)
      .then(setBooks)
      .catch(() => undefined)
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [filters])

  function updateParam(key: string, value?: string) {
    const next = new URLSearchParams(params)

    if (!value) next.delete(key)
    else next.set(key, value)

    setParams(next, { replace: true })
  }

  // The catalogue is small and already loaded, so typing filters instantly.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return books

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.synopsis.toLowerCase().includes(term) ||
        (book.isbn ?? '').includes(term) ||
        (book.author?.name ?? '').toLowerCase().includes(term),
    )
  }, [books, search])

  const activeFilters = ['genre', 'author', 'publisher', 'maxPrice', 'inStock'].filter((key) => params.get(key))

  return (
    <>
      {/*
        Cabeçalho em faixa da casa, no mesmo ritmo da home: cor cheia, texto à
        esquerda e a contagem do acervo à direita — não mais uma fotografia
        esmaecida atrás de um título centralizado.
      */}
      <header className="relative overflow-hidden bg-house-deep pb-14 pt-32 lg:pt-36">
        <EnchantedSky embers={14} />

        <div className="relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6 lg:px-10">
          <div>
            <p className="rise-in text-[0.66rem] uppercase tracking-[0.4em] text-house-accent">O acervo</p>

            <h1
              className="rise-in mt-5 font-display text-5xl text-white sm:text-6xl"
              style={{ animationDelay: '0.1s' }}
            >
              Todos os livros
            </h1>

            <p className="rise-in mt-5 max-w-xl text-white/70" style={{ animationDelay: '0.2s' }}>
              Filtre por autor, editora, preço ou disponibilidade — e leve para casa a edição que faltava
              na sua estante.
            </p>
          </div>

          <p
            className="rise-in font-display text-6xl leading-none text-house-accent/90"
            style={{ animationDelay: '0.28s' }}
            aria-hidden
          >
            {books.length}
          </p>
        </div>
      </header>

      <div className="sticky top-[72px] z-30 border-y border-chalk-100/10 bg-stone-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-4 lg:px-10">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-300/50"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, autor ou ISBN"
              aria-label="Buscar no catálogo"
              className="w-full rounded-full border border-chalk-100/15 bg-stone-800 py-2.5 pl-10 pr-9 text-sm text-chalk-100 placeholder:text-chalk-300/40 focus:border-house-accent focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-chalk-300/60 hover:text-house-accent"
              >
                <X size={15} aria-hidden />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            aria-expanded={showFilters}
            className={
              'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.16em] transition ' +
              (activeFilters.length > 0
                ? 'border-house-accent text-house-accent'
                : 'border-chalk-100/20 text-chalk-100/80 hover:border-house-accent')
            }
          >
            <SlidersHorizontal size={14} aria-hidden />
            Filtros
            {activeFilters.length > 0 && (
              <span className="rounded-full bg-house-accent px-1.5 text-[0.62rem] text-stone-900">
                {activeFilters.length}
              </span>
            )}
          </button>

          <select
            value={filters.sort}
            onChange={(event) => updateParam('sort', event.target.value)}
            aria-label="Ordenar por"
            className="ml-auto rounded-full border border-chalk-100/15 bg-stone-800 px-4 py-2.5 text-sm text-chalk-100 focus:border-house-accent focus:outline-none"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-chalk-100/10"
            >
              <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
                <FilterSelect
                  label="Gênero"
                  value={params.get('genre') ?? ''}
                  onChange={(value) => updateParam('genre', value)}
                  options={genres.map((genre) => ({ value: genre.genre, label: genre.genre + ' (' + genre.count + ')' }))}
                />

                <FilterSelect
                  label="Autor"
                  value={params.get('author') ?? ''}
                  onChange={(value) => updateParam('author', value)}
                  options={authors.map((author) => ({ value: author.slug, label: author.name }))}
                />

                <FilterSelect
                  label="Editora"
                  value={params.get('publisher') ?? ''}
                  onChange={(value) => updateParam('publisher', value)}
                  options={publishers.map((publisher) => ({ value: publisher.slug, label: publisher.name }))}
                />

                <div>
                  <label
                    htmlFor="maxPrice"
                    className="mb-2 block text-[0.66rem] uppercase tracking-[0.2em] text-chalk-300/70"
                  >
                    Até R$ {params.get('maxPrice') ?? '1000'}
                  </label>
                  <input
                    id="maxPrice"
                    type="range"
                    min={100}
                    max={1000}
                    step={50}
                    value={params.get('maxPrice') ?? '1000'}
                    onChange={(event) =>
                      updateParam('maxPrice', event.target.value === '1000' ? undefined : event.target.value)
                    }
                    className="w-full accent-[var(--house-accent)]"
                  />

                  <label className="mt-4 flex items-center gap-2 text-sm text-chalk-200/80">
                    <input
                      type="checkbox"
                      checked={params.get('inStock') === 'true'}
                      onChange={(event) => updateParam('inStock', event.target.checked ? 'true' : undefined)}
                      className="accent-[var(--house-accent)]"
                    />
                    Somente em estoque
                  </label>
                </div>

                {activeFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setParams(new URLSearchParams(), { replace: true })}
                    className="justify-self-start text-[0.7rem] uppercase tracking-[0.18em] text-house-accent lg:col-span-4"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {loading ? (
          <BookSkeletonGrid />
        ) : visible.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-chalk-50">Nenhum livro com esse feitiço.</p>
            <p className="mt-3 text-chalk-200/70">Tente outro termo ou limpe os filtros.</p>
          </div>
        ) : (
          <>
            <p className="mb-8 text-[0.68rem] uppercase tracking-[0.2em] text-chalk-300/60" aria-live="polite">
              {visible.length} {visible.length === 1 ? 'livro' : 'livros'}
            </p>

            <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {visible.map((book, index) => (
                  <BookCard key={book.id} book={book} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </section>
    </>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  onChange: (value?: string) => void
  options: Array<{ value: string; label: string }>
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-[0.66rem] uppercase tracking-[0.2em] text-chalk-300/70">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="w-full rounded-lg border border-chalk-100/15 bg-stone-800 px-4 py-2.5 text-sm text-chalk-100 focus:border-house-accent focus:outline-none"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
