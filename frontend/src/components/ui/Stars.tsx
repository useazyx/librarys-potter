import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarsProps {
  value: number
  size?: number
  className?: string
}

/** Read-only rating, with half stars rendered by clipping the filled layer. */
export function Stars({ value, size = 16, className = '' }: StarsProps) {
  const percentage = Math.max(0, Math.min(100, (value / 5) * 100))

  return (
    <span
      className={'relative inline-flex ' + className}
      role="img"
      aria-label={value.toFixed(1).replace('.', ',') + ' de 5 estrelas'}
    >
      <span className="flex gap-0.5 text-night-800/25">
        {[0, 1, 2, 3, 4].map((index) => (
          <Star key={index} size={size} aria-hidden />
        ))}
      </span>

      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-gold-500"
        style={{ width: percentage + '%' }}
        aria-hidden
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <Star key={index} size={size} fill="currentColor" className="shrink-0" />
        ))}
      </span>
    </span>
  )
}

interface StarPickerProps {
  value: number
  onChange: (value: number) => void
  size?: number
}

/** The interactive widget the old finalizar_compra.php drew with spans. */
export function StarPicker({ value, onChange, size = 30 }: StarPickerProps) {
  const [hovered, setHovered] = useState(0)
  const shown = hovered || value

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Sua nota">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={star + (star === 1 ? ' estrela' : ' estrelas')}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="rounded transition-transform duration-200 hover:scale-110"
        >
          <Star
            size={size}
            className={star <= shown ? 'text-gold-500' : 'text-night-800/25'}
            fill={star <= shown ? 'currentColor' : 'none'}
            aria-hidden
          />
        </button>
      ))}
    </div>
  )
}
