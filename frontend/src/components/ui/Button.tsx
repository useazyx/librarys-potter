import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'house'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-house-deep text-chalk-50 hover:bg-house-mid shadow-book',
  secondary: 'border border-stone-800/25 text-stone-800 hover:border-house-deep hover:text-house-deep',
  ghost: 'text-stone-800 hover:text-house-deep',
  house: 'bg-house-accent text-stone-950 shadow-stone hover:brightness-110',
}

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs tracking-[0.18em]',
  md: 'px-6 py-3 text-[0.78rem] tracking-[0.2em]',
  lg: 'px-8 py-4 text-sm tracking-[0.22em]',
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60'

// Os botões crescem um pouco no hover.
const MOTION = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring' as const, stiffness: 380, damping: 22 },
}

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      {...MOTION}
      {...props}
      disabled={disabled || loading}
      className={[BASE, VARIANTS[variant], SIZES[size], className].join(' ')}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </motion.button>
  )
}

interface ButtonLinkProps {
  to: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function ButtonLink({ to, variant = 'primary', size = 'md', className = '', children }: ButtonLinkProps) {
  const isExternal = to.startsWith('http') || to.startsWith('mailto:') || to.startsWith('tel:')
  const classes = [BASE, VARIANTS[variant], SIZES[size], className].join(' ')

  if (isExternal) {
    return (
      <motion.a {...MOTION} href={to} className={classes} target="_blank" rel="noreferrer">
        {children}
      </motion.a>
    )
  }

  return (
    <motion.div {...MOTION} className="inline-flex">
      <Link to={to} className={classes}>
        {children}
      </Link>
    </motion.div>
  )
}
