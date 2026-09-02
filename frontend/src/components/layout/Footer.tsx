import { BookOpen, Clock, Mail, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

// Dados da loja, os mesmos do rodapé do site em PHP.
export const STORE = {
  email: 'contato@libraryspotter.com.br',
  address: 'Rua da Travessa do Tranco, 9, Centro',
  hours: 'Entregas para todo o Brasil · Seg a Sáb',
  since: 2024,
}

const SECTIONS = [
  {
    title: 'A loja',
    links: [
      { to: '/catalogo', label: 'Todos os produtos' },
      { to: '/catalogo?departamento=livros', label: 'Livros' },
      { to: '/catalogo?departamento=varinhas', label: 'Varinhas' },
      { to: '/saga', label: 'A saga' },
      { to: '/ajuda', label: 'Central de ajuda' },
    ],
  },
  {
    title: 'Magia',
    links: [
      { to: '/chapeu-seletor', label: 'O Chapéu Seletor' },
      { to: '/oficina-de-varinhas', label: 'Oficina de varinhas' },
      { to: '/biblioteca', label: 'Biblioteca animada' },
      { to: '/feiticos', label: 'Feitiços' },
      { to: '/configuracoes', label: 'Acessibilidade' },
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
    <footer className="border-t border-chalk-100/15 bg-house-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.1fr] lg:px-10">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-house-accent/50 font-display text-sm text-house-accent">
              LP
            </span>
            <span className="font-display text-xl text-chalk-100">Library&apos;s Potter</span>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-chalk-200/85">
            Uma livraria dedicada à maior saga bruxa de todos os tempos: sete livros, 450 milhões de exemplares
            vendidos, 78 idiomas e uma prateleira sempre reservada para quem está começando agora.
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
                  <Link to={link.to} className="link-underline text-chalk-200/90 hover:text-chalk-50">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="mb-5 text-[0.68rem] uppercase tracking-[0.3em] text-house-accent">Onde nos achar</h3>
          <ul className="space-y-4 text-sm text-chalk-200/90">
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

      <div className="border-t border-chalk-100/15 py-6 text-center text-xs text-chalk-300/80">
        © {STORE.since}-{new Date().getFullYear()} Library&apos;s Potter · Todos os direitos reservados ·{' '}
        <a href="/CREDITOS-IMAGENS.md" className="link-underline">
          créditos das imagens
        </a>
      </div>
    </footer>
  )
}
