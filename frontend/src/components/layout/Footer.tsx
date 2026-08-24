import { BookOpen, Clock, Mail, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

/** Store details, carried over from the original footer of the PHP site. */
export const STORE = {
  email: 'contato@libraryspotter.com.br',
  address: 'Rua da Travessa do Tranco, 9 — Centro',
  hours: 'Entregas para todo o Brasil · Seg a Sáb',
  since: 2024,
}

const SECTIONS = [
  {
    title: 'A livraria',
    links: [
      { to: '/catalogo', label: 'Todos os livros' },
      { to: '/saga', label: 'A saga' },
      { to: '/ajuda', label: 'Central de ajuda' },
    ],
  },
  {
    title: 'Sua conta',
    links: [
      { to: '/perfil', label: 'Meu perfil' },
      { to: '/carrinho', label: 'Carrinho' },
      { to: '/login', label: 'Entrar' },
      { to: '/cadastro', label: 'Criar conta' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-chalk-100/10 bg-stone-800">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] lg:px-10">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-house-accent/50 font-display text-sm text-house-accent">
              LP
            </span>
            <span className="font-display text-xl text-chalk-100">Library&apos;s Potter</span>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-chalk-200/70">
            Uma livraria dedicada à maior saga bruxa de todos os tempos: sete livros, 450 milhões de exemplares
            vendidos, 78 idiomas — e uma prateleira sempre reservada para quem está começando agora.
          </p>

          <p className="mt-6 font-serif text-2xl italic text-house-accent">
            &ldquo;Ajuda sempre será dada em Hogwarts a quem pedir.&rdquo;
          </p>
        </div>

        {SECTIONS.map((section) => (
          <nav key={section.title} aria-label={section.title}>
            <h3 className="mb-5 text-[0.68rem] uppercase tracking-[0.3em] text-house-accent">{section.title}</h3>
            <ul className="space-y-3 text-sm">
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="link-underline text-chalk-200/80 hover:text-chalk-50">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="mb-5 text-[0.68rem] uppercase tracking-[0.3em] text-house-accent">Onde nos achar</h3>
          <ul className="space-y-4 text-sm text-chalk-200/80">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-ember-400" aria-hidden />
              <span>{STORE.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 shrink-0 text-ember-400" aria-hidden />
              <span>{STORE.hours}</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-ember-400" aria-hidden />
              <a href={'mailto:' + STORE.email} className="link-underline hover:text-chalk-50">
                {STORE.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <BookOpen size={18} className="mt-0.5 shrink-0 text-ember-400" aria-hidden />
              <Link to="/ajuda" className="link-underline hover:text-chalk-50">
                Relatar um problema
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-chalk-100/10 py-6 text-center text-xs text-chalk-300/50">
        © {STORE.since}–{new Date().getFullYear()} Library&apos;s Potter · Todos os direitos reservados ·{' '}
        <a href="/CREDITOS-IMAGENS.md" className="link-underline">
          créditos das imagens
        </a>
      </div>
    </footer>
  )
}
