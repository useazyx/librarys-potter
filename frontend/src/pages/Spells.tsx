import { Keyboard, ScrollText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { SPELLS } from '../components/magic/MagicLayer'
import { useSettings } from '../context/SettingsContext'

// Lista dos feitiços que dá para digitar em qualquer página do site. É também
// onde se liga de volta o que o "malfeito feito" desligou.
export default function Spells() {
  const { settings, set } = useSettings()

  return (
    <>
      <PageHeader
        eyebrow="Juro solenemente não fazer nada de bom"
        title="Feitiços"
        description="Digite a palavra em qualquer página da loja, fora de um campo de texto, e alguma coisa acontece. Não precisa de caixa de busca nem de botão."
        aside={
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[0.66rem] uppercase tracking-[0.2em] text-white/80">
            <ScrollText size={14} aria-hidden />
            {SPELLS.length} feitiços
          </span>
        }
      />

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-20">
        {!settings.spells && (
          <div className="mb-10 rounded-2xl border border-ember-600/50 bg-ember-600/10 p-6">
            <p className="font-display text-lg text-chalk-50">O mapa está em branco.</p>
            <p className="mt-2 text-sm text-chalk-200">
              Os feitiços estão desligados nas suas preferências. Foi o que o <em>malfeito feito</em> fez.
            </p>
            <button
              type="button"
              onClick={() => set('spells', true)}
              className="mt-5 rounded-full bg-house-accent px-6 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-stone-950 transition hover:brightness-110"
            >
              Juro solenemente
            </button>
          </div>
        )}

        <p className="flex items-center gap-2 text-sm text-chalk-300">
          <Keyboard size={16} aria-hidden />
          Basta digitar. As letras não aparecem em lugar nenhum: o site escuta e reconhece a palavra inteira.
        </p>

        <ul className="mt-10 divide-y divide-chalk-100/12">
          {SPELLS.map((spell) => (
            <li key={spell.incantation} className="flex flex-wrap items-baseline gap-x-6 gap-y-2 py-5">
              <code className="min-w-[13rem] font-mono text-base text-house-accent">{spell.incantation}</code>
              <div className="flex-1">
                <p className="font-display text-base text-chalk-50">{spell.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-chalk-300">{spell.effect}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-14 rounded-2xl border border-chalk-100/15 bg-house-surface p-7">
          <h2 className="font-display text-xl text-chalk-50">Duas regras da casa</h2>

          <p className="mt-4 text-sm leading-relaxed text-chalk-300">
            Feitiço nenhum é capturado enquanto o foco está num campo de texto: escrever "nox" dentro da busca da
            loja não pode apagar a tela de quem está procurando um livro.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-chalk-300">
            E nada aqui é a única maneira de fazer alguma coisa: todo feitiço tem um botão, um menu ou um link que
            faz o mesmo. Quem usa leitor de tela, teclado sem letras ou simplesmente não quer brincar não perde
            função nenhuma, e pode desligar tudo em{' '}
            <Link to="/configuracoes" className="link-underline text-house-accent">
              acessibilidade
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
