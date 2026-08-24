import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, LifeBuoy, Menu, ShoppingBag, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { HouseSwitch } from '../house/HouseSwitch'
import { ButtonLink } from '../ui/Button'

const LINKS = [
  { to: '/', label: 'Início' },
  { to: '/catalogo', label: 'Livros' },
  { to: '/saga', label: 'A Saga' },
  { to: '/ajuda', label: 'Ajuda' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
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

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={
        // Barra solida desde o topo: nada de cabecalho transparente sobre uma
        // foto de tela cheia. A regua na cor da casa marca o limite.
        'fixed inset-x-0 top-0 z-50 border-b border-house-accent/25 backdrop-blur-md transition-shadow duration-500 ' +
        (scrolled ? 'bg-stone-950/95 shadow-stone' : 'bg-stone-950/80')
      }
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-3.5 lg:gap-12 lg:px-10">
        <Link to="/" className="flex items-center gap-3" aria-label="Library's Potter, página inicial">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-house-accent/50 font-display text-sm text-house-accent">
            LP
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-lg tracking-wide text-chalk-100">Library&apos;s Potter</span>
            <span className="text-[0.58rem] uppercase tracking-[0.32em] text-chalk-300/70">
              A livraria da saga
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-8 lg:flex" aria-label="Principal">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className="link-underline text-[0.76rem] uppercase tracking-[0.24em] text-chalk-100/85 transition-colors hover:text-house-accent"
            >
              {({ isActive }) => <span data-active={isActive}>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <HouseSwitch />

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

          <div className="hidden lg:block">
            <ButtonLink to="/catalogo" size="sm" variant="house">
              Ver livros
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

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-chalk-100/10 bg-stone-900 lg:hidden"
            aria-label="Menu móvel"
          >
            <div className="flex flex-col gap-1 px-6 py-5">
              {LINKS.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className="block py-3 font-display text-2xl text-chalk-100"
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}

              {isStaff && (
                <NavLink to="/painel" className="flex items-center gap-2 py-3 font-display text-2xl text-house-accent">
                  <LifeBuoy size={20} aria-hidden /> Painel
                </NavLink>
              )}

              <ButtonLink to="/catalogo" className="mt-4 w-full" variant="house">
                Ver livros
              </ButtonLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
