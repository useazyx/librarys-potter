import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  LayoutDashboard,
  LibraryBig,
  LifeBuoy,
  Menu,
  Settings2,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { api } from '../../lib/api'
import type { Department } from '../../types/api'
import { HouseSwitch } from '../house/HouseSwitch'
import { ButtonLink } from '../ui/Button'

// Barra do topo. O menu "Loja" abre com os sete departamentos e a contagem de
// cada um, porque sete links soltos não cabiam numa linha. A engrenagem ao lado
// abre as configurações de acessibilidade sem precisar ir até o rodapé.

const MAGIC = [
  { to: '/chapeu-seletor', icon: Sparkles, label: 'O Chapéu Seletor', hint: 'Descubra a sua casa em sete perguntas.' },
  { to: '/biblioteca', icon: LibraryBig, label: 'Biblioteca animada', hint: 'Estantes em profundidade, livro na mão.' },
]

const LINKS = [
  { to: '/saga', label: 'A Saga' },
  { to: '/feiticos', label: 'Feitiços' },
  { to: '/ajuda', label: 'Ajuda' },
]

interface HeaderProps {
  onOpenSettings: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState<'loja' | 'magia' | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])

  const { user } = useAuth()
  const { itemCount } = useCart()
  const location = useLocation()

  const isStaff = user?.role === 'SUPPLIER' || user?.role === 'SUPPORT'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    api.catalog
      .departments(controller.signal)
      .then(setDepartments)
      .catch(() => undefined)

    return () => controller.abort()
  }, [])

  useEffect(() => {
    setOpen(false)
    setMenu(null)
  }, [location.pathname, location.search])

  // Fecha no Escape: quem abriu pelo teclado precisa conseguir sair pelo teclado.
  useEffect(() => {
    if (!menu) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenu(null)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menu])

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onMouseLeave={() => setMenu(null)}
      className={
        'fixed inset-x-0 top-0 z-50 border-b border-house-accent/25 backdrop-blur-md transition-shadow duration-500 ' +
        (scrolled ? 'bg-house-bg/95 shadow-stone' : 'bg-house-bg/85')
      }
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-3.5 lg:gap-10 lg:px-10">
        <Link to="/" className="flex items-center gap-3" aria-label="Library's Potter, página inicial">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-house-accent/50 font-display text-sm text-house-accent">
            LP
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-lg tracking-wide text-chalk-100">Library&apos;s Potter</span>
            <span className="text-[0.58rem] uppercase tracking-[0.28em] text-chalk-200/88">
              Livraria e loja do mundo bruxo
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-7 lg:flex" aria-label="Principal">
          <MenuTrigger label="Loja" open={menu === 'loja'} onToggle={() => setMenu(menu === 'loja' ? null : 'loja')} />
          <MenuTrigger label="Magia" open={menu === 'magia'} onToggle={() => setMenu(menu === 'magia' ? null : 'magia')} />

          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="link-underline text-[0.74rem] uppercase tracking-[0.22em] text-chalk-100/85 transition-colors hover:text-house-accent"
            >
              {({ isActive }) => <span data-active={isActive}>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-2">
          <HouseSwitch />

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Configurações e acessibilidade"
            title="Configurações e acessibilidade"
            className="rounded-full p-2.5 text-chalk-100/85 transition-colors hover:bg-chalk-100/10 hover:text-house-accent"
          >
            <Settings2 size={20} aria-hidden />
          </button>

          {isStaff && (
            <Link
              to="/painel"
              aria-label="Painel"
              className="rounded-full p-2.5 text-chalk-100/85 transition-colors hover:bg-chalk-100/10 hover:text-house-accent"
            >
              <LayoutDashboard size={20} aria-hidden />
            </Link>
          )}

          <Link
            to="/carrinho"
            aria-label={'Carrinho com ' + itemCount + ' item(ns)'}
            className="relative rounded-full p-2.5 text-chalk-100/85 transition-colors hover:bg-chalk-100/10 hover:text-house-accent"
          >
            <ShoppingBag size={20} aria-hidden />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-house-mid px-1 text-[0.65rem] font-semibold text-chalk-50"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <Link
            to={user ? '/perfil' : '/login'}
            aria-label={user ? 'Meu perfil' : 'Entrar'}
            className="rounded-full p-2.5 text-chalk-100/85 transition-colors hover:bg-chalk-100/10 hover:text-house-accent"
          >
            <User size={20} aria-hidden />
          </Link>

          <div className="ml-1 hidden xl:block">
            <ButtonLink to="/catalogo" size="sm" variant="house">
              Ver a loja
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            className="rounded-full p-2.5 text-chalk-100/85 transition-colors hover:bg-chalk-100/10 lg:hidden"
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>

      {/* menus do desktop */}
      <AnimatePresence>
        {menu === 'loja' && (
          <Panel key="loja">
            <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to="/catalogo"
                className="rounded-xl border border-house-accent/40 p-4 transition-colors hover:bg-house-accent/10 sm:col-span-2 lg:col-span-1"
              >
                <p className="font-display text-lg text-house-accent">A loja inteira</p>
                <p className="mt-1.5 text-xs leading-relaxed text-chalk-300">
                  {departments.reduce((sum, item) => sum + item.count, 0)} produtos, sete corredores, um filtro para
                  cada coisa.
                </p>
              </Link>

              {departments.map((department) => (
                <Link
                  key={department.slug}
                  to={'/catalogo?departamento=' + department.slug}
                  className="rounded-xl p-4 transition-colors hover:bg-chalk-100/5"
                >
                  <p className="flex items-baseline gap-2 font-display text-base text-chalk-50">
                    {department.name}
                    <span className="text-[0.62rem] text-chalk-300">{department.count}</span>
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-chalk-300">{department.tagline}</p>
                </Link>
              ))}
            </div>
          </Panel>
        )}

        {menu === 'magia' && (
          <Panel key="magia">
            <div className="grid gap-4 sm:grid-cols-3">
              {MAGIC.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-xl border border-chalk-100/15 p-5 transition-colors hover:border-house-accent/50 hover:bg-chalk-100/5"
                  >
                    <Icon size={20} className="text-house-accent" aria-hidden />
                    <p className="mt-3 font-display text-base text-chalk-50">{item.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-chalk-300">{item.hint}</p>
                  </Link>
                )
              })}
            </div>
          </Panel>
        )}
      </AnimatePresence>

      {/* menu do celular */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[75vh] overflow-y-auto border-t border-chalk-100/15 bg-house-bg lg:hidden"
            aria-label="Menu móvel"
          >
            <div className="flex flex-col gap-1 px-6 py-5">
              <NavLink to="/" end className="block py-2.5 font-display text-2xl text-chalk-100">
                Início
              </NavLink>

              <p className="mt-4 text-[0.6rem] uppercase tracking-[0.24em] text-chalk-300">Loja</p>
              {departments.map((department) => (
                <NavLink
                  key={department.slug}
                  to={'/catalogo?departamento=' + department.slug}
                  className="flex items-baseline justify-between py-2 text-base text-chalk-100"
                >
                  {department.name}
                  <span className="text-[0.62rem] text-chalk-300">{department.count}</span>
                </NavLink>
              ))}

              <p className="mt-5 text-[0.6rem] uppercase tracking-[0.24em] text-chalk-300">Magia</p>
              {MAGIC.map((item) => (
                <NavLink key={item.to} to={item.to} className="block py-2 text-base text-chalk-100">
                  {item.label}
                </NavLink>
              ))}

              <p className="mt-5 text-[0.6rem] uppercase tracking-[0.24em] text-chalk-300">Mais</p>
              {LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className="block py-2 text-base text-chalk-100">
                  {link.label}
                </NavLink>
              ))}

              <NavLink to="/configuracoes" className="block py-2 text-base text-chalk-100">
                Acessibilidade
              </NavLink>

              {isStaff && (
                <NavLink to="/painel" className="flex items-center gap-2 py-2 text-base text-house-accent">
                  <LifeBuoy size={18} aria-hidden /> Painel
                </NavLink>
              )}

              <ButtonLink to="/catalogo" className="mt-5 w-full" variant="house">
                Ver a loja
              </ButtonLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

function MenuTrigger({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={onToggle}
      aria-expanded={open}
      className={
        'inline-flex items-center gap-1.5 text-[0.74rem] uppercase tracking-[0.22em] transition-colors ' +
        (open ? 'text-house-accent' : 'text-chalk-100/85 hover:text-house-accent')
      }
    >
      {label}
      <ChevronDown size={13} className={'transition-transform ' + (open ? 'rotate-180' : '')} aria-hidden />
    </button>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="hidden border-t border-chalk-100/15 bg-house-bg/98 backdrop-blur-md lg:block"
    >
      <div className="mx-auto max-w-7xl px-10 py-7">{children}</div>
    </motion.div>
  )
}
