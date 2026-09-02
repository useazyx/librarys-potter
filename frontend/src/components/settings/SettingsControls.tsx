import {
  Contrast,
  Eye,
  Link2,
  Moon,
  MousePointerClick,
  RotateCcw,
  Sparkles,
  Sun,
  Target,
  Type,
  Volume2,
  Wand2,
  Waves,
} from 'lucide-react'
import type { ReactNode } from 'react'
import {
  TEXT_LABELS,
  VISION_LABELS,
  useSettings,
  type ColorMode,
  type ContrastMode,
  type MotionMode,
  type TextScale,
  type VisionMode,
} from '../../context/SettingsContext'

// Controles de acessibilidade num componente só. A gaveta do cabeçalho e a
// página /configuracoes usam exatamente este componente, para não existirem
// dois formulários que podem sair de sincronia.

interface ChoiceProps<T extends string> {
  label: string
  hint?: string
  icon: ReactNode
  value: T
  options: Array<{ value: T; label: string; hint?: string }>
  onChange: (value: T) => void
}

function Choice<T extends string>({ label, hint, icon, value, options, onChange }: ChoiceProps<T>) {
  return (
    <fieldset className="border-t border-chalk-100/15 pt-5">
      <legend className="sr-only">{label}</legend>

      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 text-house-accent" aria-hidden>
          {icon}
        </span>
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-chalk-100">{label}</p>
          {hint && <p className="mt-1 text-xs leading-relaxed text-chalk-300">{hint}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              title={option.hint}
              className={
                'rounded-full border px-4 py-2 text-xs transition-colors ' +
                (active
                  ? 'border-house-accent bg-house-accent text-stone-950'
                  : 'border-chalk-100/25 text-chalk-200 hover:border-house-accent hover:text-house-accent')
              }
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

interface ToggleProps {
  label: string
  hint: string
  icon: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({ label, hint, icon, checked, onChange }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border-t border-chalk-100/15 py-4">
      <span className="mt-0.5 text-house-accent" aria-hidden>
        {icon}
      </span>

      <span className="flex-1">
        <span className="block text-[0.7rem] uppercase tracking-[0.2em] text-chalk-100">{label}</span>
        <span className="mt-1 block text-xs leading-relaxed text-chalk-300">{hint}</span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[var(--house-accent)]"
      />
    </label>
  )
}

export function SettingsControls() {
  const { settings, set, reset } = useSettings()

  return (
    <div className="space-y-1">
      <Choice<VisionMode>
        label="Visão das cores"
        hint="A loja inteira é pintada pela casa escolhida. Aqui as quatro paletas mudam de eixo para continuarem distinguíveis."
        icon={<Eye size={18} />}
        value={settings.vision}
        options={(Object.keys(VISION_LABELS) as VisionMode[]).map((value) => ({
          value,
          label: VISION_LABELS[value].name,
          hint: VISION_LABELS[value].hint,
        }))}
        onChange={(value) => set('vision', value)}
      />

      <p className="pb-2 pl-8 text-xs leading-relaxed text-chalk-300">{VISION_LABELS[settings.vision].hint}</p>

      <Choice<ColorMode>
        label="Claridade"
        hint="O castelo é escuro por natureza. O modo pergaminho troca a pedra por papel e a tinta clara por tinta escura."
        icon={settings.mode === 'claro' ? <Sun size={18} /> : <Moon size={18} />}
        value={settings.mode}
        options={[
          { value: 'escuro', label: 'Pedra (escuro)' },
          { value: 'claro', label: 'Pergaminho (claro)' },
        ]}
        onChange={(value) => set('mode', value)}
      />

      <Choice<ContrastMode>
        label="Contraste"
        hint="Deixa todo texto opaco, endurece as bordas e apaga as lavagens de cor do fundo."
        icon={<Contrast size={18} />}
        value={settings.contrast}
        options={[
          { value: 'normal', label: 'Normal' },
          { value: 'alto', label: 'Alto contraste' },
        ]}
        onChange={(value) => set('contrast', value)}
      />

      <Choice<TextScale>
        label="Tamanho do texto"
        icon={<Type size={18} />}
        value={settings.text}
        options={(Object.keys(TEXT_LABELS) as TextScale[]).map((value) => ({ value, label: TEXT_LABELS[value] }))}
        onChange={(value) => set('text', value)}
      />

      <Choice<MotionMode>
        label="Movimento"
        hint="Reduzido desliga as brasas, as estrelas e as entradas animadas. O conteúdo continua todo visível."
        icon={<Waves size={18} />}
        value={settings.motion}
        options={[
          { value: 'sistema', label: 'Seguir o sistema' },
          { value: 'completo', label: 'Completo' },
          { value: 'reduzido', label: 'Reduzido' },
        ]}
        onChange={(value) => set('motion', value)}
      />

      <Toggle
        label="Fonte de leitura fácil"
        hint="Troca as três famílias por letras bem diferenciadas e abre o espaçamento. Ajuda quem tem dislexia."
        icon={<Type size={18} />}
        checked={settings.readableFont}
        onChange={(value) => set('readableFont', value)}
      />

      <Toggle
        label="Sublinhar os links"
        hint="Cor sozinha não é pista suficiente para quem não distingue a cor da casa do texto ao redor."
        icon={<Link2 size={18} />}
        checked={settings.underlineLinks}
        onChange={(value) => set('underlineLinks', value)}
      />

      <Toggle
        label="Realce de foco reforçado"
        hint="Anel amarelo grosso em volta do que está em foco, para quem navega só de teclado."
        icon={<Target size={18} />}
        checked={settings.strongFocus}
        onChange={(value) => set('strongFocus', value)}
      />

      <Toggle
        label="Trilha do castelo"
        hint="Música gerada nota a nota pelo navegador, baixinha e sempre diferente. Nasce desligada de propósito."
        icon={<Volume2 size={18} />}
        checked={settings.sound}
        onChange={(value) => set('sound', value)}
      />

      <Toggle
        label="Feitiços no teclado"
        hint="Digite lumos, nox, alohomora ou accio em qualquer página. A lista inteira está em Feitiços."
        icon={<Wand2 size={18} />}
        checked={settings.spells}
        onChange={(value) => set('spells', value)}
      />

      <Toggle
        label="Faíscas no ponteiro"
        hint="Um rastro de luz atrás do cursor, na cor da casa."
        icon={<Sparkles size={18} />}
        checked={settings.sparks}
        onChange={(value) => set('sparks', value)}
      />

      <div className="border-t border-chalk-100/15 pt-5">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full border border-chalk-100/25 px-4 py-2 text-xs uppercase tracking-[0.16em] text-chalk-200 transition-colors hover:border-house-accent hover:text-house-accent"
        >
          <RotateCcw size={14} aria-hidden />
          Voltar ao padrão
        </button>

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-chalk-300">
          <MousePointerClick size={14} className="mt-0.5 shrink-0" aria-hidden />
          Tudo o que você escolher aqui fica guardado neste navegador e continua valendo na próxima visita.
        </p>
      </div>
    </div>
  )
}
