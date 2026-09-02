import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/catalog/ProductCard'
import { EnchantedSky } from '../components/ui/EnchantedSky'
import { BookSkeletonGrid } from '../components/ui/Loaders'
import { HOUSES, HOUSE_INFO } from '../context/HouseContext'
import { api, type BookFilters, type BookSort } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { Book, Department } from '../types/api'

// O catálogo da loja.
//
// Antes era uma prateleira só, com quatro abas de tipo e os filtros escondidos
// atrás de um botão. Funcionava com vinte e um produtos; com mais de cento e
// quarenta em sete departamentos, virou rolagem.
//
// Agora: os departamentos ficam no topo com a contagem de cada um, os filtros
// ficam abertos numa coluna à esquerda, o que está filtrado vira etiqueta
// removível e toda escolha vai para a URL, então dá para compartilhar a busca
// e ela sobrevive ao reload.

const SORTS: Array<{ value: BookSort; label: string }> = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'newest', label: 'Lançamentos' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'discount', label: 'Maior desconto' },
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'title', label: 'Título (A-Z)' },
]

// Teto do controle de preço. O produto mais caro do acervo é uma caixa de LEGO.
const PRICE_CEILING = 3000

export default function Catalog() {
  const [params, setParams] = useSearchParams()

  const [books, setBooks] = useState<Book[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [brands, setBrands] = useState<Array<{ brand: string; count: number }>>([])
  const [genres, setGenres] = useState<Array<{ genre: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [typed, setTyped] = useState(params.get('busca') ?? '')

  const department = params.get('departamento') ?? ''
  const search = params.get('busca') ?? ''

  const filters = useMemo<BookFilters>(
    () => ({
      search: search || undefined,
      department: department || undefined,
      brand: params.get('marca') ?? undefined,
      house: params.get('house') ?? params.get('casa') ?? undefined,
      genre: params.get('genero') ?? undefined,
      character: params.get('personagem') ?? undefined,
      tag: params.get('tag') ?? undefined,
      minPrice: params.get('precoMin') ? Number(params.get('precoMin')) : undefined,
      maxPrice: params.get('precoMax') ? Number(params.get('precoMax')) : undefined,
      inStock: params.get('estoque') === 'true' ? true : undefined,
      onSale: params.get('promocao') === 'true' ? true : undefined,
      sort: (params.get('ordem') as BookSort) ?? 'relevance',
    }),
    [params, department, search],
  )

  useEffect(() => {
    void Promise.allSettled([api.catalog.departments(), api.catalog.brands(), api.catalog.genres()]).then(
      ([departmentsResult, brandsResult, genresResult]) => {
        if (departmentsResult.status === 'fulfilled') setDepartments(departmentsResult.value)
        if (brandsResult.status === 'fulfilled') setBrands(brandsResult.value)
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

  // A busca só vai para a URL depois de uma pausa na digitação. Sem isso cada
  // letra vira uma requisição e uma entrada no histórico.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (typed === search) return
      updateParam('busca', typed || undefined)
    }, 350)

    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed])

  function updateParam(key: string, value?: string) {
    const next = new URLSearchParams(params)

    if (!value) next.delete(key)
    else next.set(key, value)

    setParams(next, { replace: true })
  }

  // Os filtros ativos já virados em etiqueta. É essa lista que aparece embaixo
  // da barra e é ela que o botão de limpar percorre, para não ter que lembrar
  // em três lugares quais parâmetros são filtro e quais são ordenação.
  const chips = useMemo(() => {
    const items: Array<{ key: string; label: string }> = []
    const add = (key: string, label: string) => items.push({ key, label })

    const departmentName = departments.find((item) => item.slug === department)?.name
    if (departmentName) add('departamento', departmentName)

    if (params.get('marca')) add('marca', params.get('marca')!)

    const house = params.get('house') ?? params.get('casa')
    if (house && house in HOUSE_INFO) add('house', HOUSE_INFO[house as keyof typeof HOUSE_INFO].name)

    if (params.get('genero')) add('genero', params.get('genero')!)
    if (params.get('personagem')) add('personagem', params.get('personagem')!)
    if (params.get('tag')) add('tag', params.get('tag')!)
    if (params.get('precoMin')) add('precoMin', 'a partir de ' + formatPrice(Number(params.get('precoMin'))))
    if (params.get('precoMax')) add('precoMax', 'até ' + formatPrice(Number(params.get('precoMax'))))
    if (params.get('estoque') === 'true') add('estoque', 'em estoque')
    if (params.get('promocao') === 'true') add('promocao', 'em promoção')
    if (search) add('busca', '"' + search + '"')

    return items
  }, [departments, params, department, search])

  function clearAll() {
    const next = new URLSearchParams()
    const ordem = params.get('ordem')
    if (ordem) next.set('ordem', ordem)

    setParams(next, { replace: true })
    setTyped('')
  }

  const current = departments.find((item) => item.slug === department)
  const total = departments.reduce((sum, item) => sum + item.count, 0)

  const facets = (
    <Facets
      params={params}
      departments={departments}
      brands={brands}
      genres={genres}
      onChange={updateParam}
      onClear={clearAll}
      hasFilters={chips.length > 0}
    />
  )

  return (
    <>
      {/* cabeçalho */}
      <header className="relative overflow-hidden bg-house-deep pb-12 pt-32 lg:pt-36">
        <EnchantedSky embers={14} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <nav aria-label="Você está aqui" className="rise-in flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.2em] text-white/55">
            <Link to="/" className="hover:text-house-accent">
              Início
            </Link>
            <ChevronRight size={12} aria-hidden />
            <Link to="/catalogo" className="hover:text-house-accent">
              Loja
            </Link>
            {current && (
              <>
                <ChevronRight size={12} aria-hidden />
                <span className="text-house-accent">{current.name}</span>
              </>
            )}
          </nav>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="rise-in font-display text-5xl text-white sm:text-6xl" style={{ animationDelay: '0.1s' }}>
                {current ? current.name : 'A loja inteira'}
              </h1>

              <p className="rise-in mt-4 max-w-xl text-white/70" style={{ animationDelay: '0.2s' }}>
                {current
                  ? current.tagline
                  : 'Livros, varinhas, colecionáveis, vestuário, papelaria, jogos e casa: o mundo bruxo em sete corredores.'}
              </p>
            </div>

            <p
              className="rise-in font-display text-6xl leading-none text-house-accent/90"
              style={{ animationDelay: '0.28s' }}
              aria-hidden
            >
              {current ? current.count : total}
            </p>
          </div>
        </div>
      </header>

      {/* departamentos */}
      <nav className="border-b border-chalk-100/15 bg-house-surface" aria-label="Departamentos">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 lg:px-10">
          <DepartmentTab active={department === ''} onClick={() => updateParam('departamento', undefined)} label="Tudo" count={total} />

          {departments.map((item) => (
            <DepartmentTab
              key={item.slug}
              active={department === item.slug}
              onClick={() => updateParam('departamento', item.slug)}
              label={item.name}
              count={item.count}
            />
          ))}
        </div>
      </nav>

      {/* busca e ordenação */}
      <div className="sticky top-[72px] z-30 border-b border-chalk-100/15 bg-house-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-4 lg:px-10">
          <div className="relative flex-1 sm:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-300/80"
              aria-hidden
            />
            <input
              type="search"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder="Buscar por produto, marca, personagem ou ISBN"
              aria-label="Buscar na loja"
              className="w-full rounded-full border border-chalk-100/15 bg-house-surface py-2.5 pl-10 pr-9 text-sm text-chalk-100 placeholder:text-chalk-300/50 focus:border-house-accent focus:outline-none"
            />
            {typed && (
              <button
                type="button"
                onClick={() => setTyped('')}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-chalk-200/85 hover:text-house-accent"
              >
                <X size={15} aria-hidden />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="inline-flex items-center gap-2 rounded-full border border-chalk-100/20 px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.16em] text-chalk-100/85 transition hover:border-house-accent lg:hidden"
          >
            <SlidersHorizontal size={14} aria-hidden />
            Filtros
            {chips.length > 0 && (
              <span className="rounded-full bg-house-accent px-1.5 text-[0.62rem] text-stone-950">{chips.length}</span>
            )}
          </button>

          <label className="ml-auto flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-chalk-300">
            <span className="hidden sm:inline">Ordenar</span>
            <select
              value={filters.sort}
              onChange={(event) => updateParam('ordem', event.target.value)}
              aria-label="Ordenar por"
              className="rounded-full border border-chalk-100/15 bg-house-surface px-4 py-2.5 text-sm normal-case tracking-normal text-chalk-100 focus:border-house-accent focus:outline-none"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* etiquetas dos filtros ativos */}
        {chips.length > 0 && (
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 pb-4 lg:px-10">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => {
                  if (chip.key === 'busca') setTyped('')
                  updateParam(chip.key, undefined)
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-house-accent/50 bg-house-accent/10 px-3 py-1.5 text-xs text-house-accent transition hover:bg-house-accent/20"
              >
                {chip.label}
                <X size={12} aria-hidden />
                <span className="sr-only">Remover filtro</span>
              </button>
            ))}

            <button
              type="button"
              onClick={clearAll}
              className="ml-1 text-[0.68rem] uppercase tracking-[0.16em] text-chalk-300 underline-offset-4 hover:text-house-accent hover:underline"
            >
              Limpar tudo
            </button>
          </div>
        )}
      </div>

      {/* filtros e grade de produtos */}
      <div className="mx-auto max-w-7xl gap-10 px-6 py-12 lg:flex lg:px-10">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-44 max-h-[calc(100vh-13rem)] overflow-y-auto pr-2">{facets}</div>
        </aside>

        <section className="min-w-0 flex-1">
          {loading ? (
            <BookSkeletonGrid />
          ) : books.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-3xl text-chalk-50">Nenhum produto com esse feitiço.</p>
              <p className="mt-3 text-chalk-200/85">Tente outro termo ou remova alguma condição.</p>
              {chips.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-6 rounded-full border border-house-accent px-6 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-house-accent transition hover:bg-house-accent hover:text-stone-950"
                >
                  Limpar os filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="mb-6 text-[0.68rem] uppercase tracking-[0.2em] text-chalk-300" aria-live="polite">
                {books.length} {books.length === 1 ? 'produto' : 'produtos'}
              </p>

              <motion.div layout className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {books.map((book, index) => (
                    <ProductCard key={book.id} book={book} index={index} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </section>
      </div>

      {/* gaveta de filtros do celular */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-[100] bg-stone-950/70 backdrop-blur-sm lg:hidden"
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 z-[101] max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-house-accent/30 bg-house-bg p-6 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl text-chalk-50">Filtros</h2>
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  aria-label="Fechar filtros"
                  className="rounded-full p-2 text-chalk-200 hover:text-house-accent"
                >
                  <X size={20} aria-hidden />
                </button>
              </div>

              {facets}

              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="mt-8 w-full rounded-full bg-house-accent px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.2em] text-stone-950"
              >
                Ver {books.length} {books.length === 1 ? 'produto' : 'produtos'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function DepartmentTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={
        'relative shrink-0 px-5 py-4 text-[0.72rem] uppercase tracking-[0.14em] transition-colors ' +
        (active ? 'text-house-accent' : 'text-chalk-200/85 hover:text-chalk-50')
      }
    >
      {label}
      <span className="ml-1.5 text-[0.62rem] text-chalk-300">{count}</span>
      <span
        className={
          'absolute inset-x-3 bottom-0 h-0.5 origin-center bg-house-accent transition-transform duration-500 ' +
          (active ? 'scale-x-100' : 'scale-x-0')
        }
        aria-hidden
      />
    </button>
  )
}

interface FacetsProps {
  params: URLSearchParams
  departments: Department[]
  brands: Array<{ brand: string; count: number }>
  genres: Array<{ genre: string; count: number }>
  onChange: (key: string, value?: string) => void
  onClear: () => void
  hasFilters: boolean
}

// A coluna de filtros. A mesma no desktop e dentro da gaveta do celular.
function Facets({ params, departments, brands, genres, onChange, hasFilters, onClear }: FacetsProps) {
  const house = params.get('house') ?? params.get('casa') ?? ''
  const maxPrice = params.get('precoMax') ?? String(PRICE_CEILING)

  return (
    <div className="space-y-7">
      <Group title="Corredor">
        <ul className="space-y-1.5">
          {departments.map((item) => (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() =>
                  onChange('departamento', params.get('departamento') === item.slug ? undefined : item.slug)
                }
                className={
                  'flex w-full items-baseline justify-between gap-2 text-left text-sm transition-colors ' +
                  (params.get('departamento') === item.slug
                    ? 'text-house-accent'
                    : 'text-chalk-200 hover:text-house-accent')
                }
              >
                <span>{item.name}</span>
                <span className="text-[0.66rem] text-chalk-300">{item.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Casa">
        <div className="flex flex-wrap gap-2">
          {HOUSES.map((id) => {
            const active = house === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange('house', active ? undefined : id)}
                aria-pressed={active}
                className={
                  'rounded-full border px-3 py-1.5 text-xs transition-colors ' +
                  (active
                    ? 'border-house-accent bg-house-accent text-stone-950'
                    : 'border-chalk-100/20 text-chalk-200 hover:border-house-accent')
                }
              >
                {HOUSE_INFO[id].name}
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Marca">
        <ul className="space-y-1.5">
          {brands.map((item) => (
            <li key={item.brand}>
              <button
                type="button"
                onClick={() => onChange('marca', params.get('marca') === item.brand ? undefined : item.brand)}
                className={
                  'flex w-full items-baseline justify-between gap-2 text-left text-sm transition-colors ' +
                  (params.get('marca') === item.brand ? 'text-house-accent' : 'text-chalk-200 hover:text-house-accent')
                }
              >
                <span>{item.brand}</span>
                <span className="text-[0.66rem] text-chalk-300">{item.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Preço">
        <label htmlFor="precoMax" className="mb-2 block text-sm text-chalk-200">
          Até {formatPrice(Number(maxPrice))}
        </label>
        <input
          id="precoMax"
          type="range"
          min={30}
          max={PRICE_CEILING}
          step={10}
          value={maxPrice}
          onChange={(event) =>
            onChange('precoMax', Number(event.target.value) >= PRICE_CEILING ? undefined : event.target.value)
          }
          className="w-full accent-[var(--house-accent)]"
        />

        <div className="mt-4 space-y-2">
          <Check
            label="Somente em estoque"
            checked={params.get('estoque') === 'true'}
            onChange={(value) => onChange('estoque', value ? 'true' : undefined)}
          />
          <Check
            label="Somente em promoção"
            checked={params.get('promocao') === 'true'}
            onChange={(value) => onChange('promocao', value ? 'true' : undefined)}
          />
        </div>
      </Group>

      <Group title="Categoria">
        <select
          value={params.get('genero') ?? ''}
          onChange={(event) => onChange('genero', event.target.value || undefined)}
          aria-label="Categoria"
          className="w-full rounded-lg border border-chalk-100/15 bg-house-surface px-3 py-2.5 text-sm text-chalk-100 focus:border-house-accent focus:outline-none"
        >
          <option value="">Todas</option>
          {genres.map((item) => (
            <option key={item.genre} value={item.genre}>
              {item.genre} ({item.count})
            </option>
          ))}
        </select>
      </Group>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="w-full rounded-full border border-chalk-100/25 px-4 py-2.5 text-[0.68rem] uppercase tracking-[0.16em] text-chalk-200 transition hover:border-house-accent hover:text-house-accent"
        >
          Limpar os filtros
        </button>
      )}
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-chalk-100/15 pt-5">
      <h2 className="mb-3 text-[0.64rem] uppercase tracking-[0.22em] text-chalk-100">{title}</h2>
      {children}
    </section>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-chalk-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-[var(--house-accent)]"
      />
      {label}
    </label>
  )
}
