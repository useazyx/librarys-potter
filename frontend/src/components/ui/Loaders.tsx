import { motion } from 'framer-motion'

// Tela de carregamento: uma pena desenha um círculo enquanto o monograma aparece.
export function BrandLoader({ label = 'Abrindo a biblioteca...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 bg-castle">
      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
        <motion.circle
          cx="60"
          cy="60"
          r="46"
          fill="none"
          stroke="var(--color-house-accent)"
          strokeWidth="1.5"
          strokeDasharray="290"
          initial={{ strokeDashoffset: 290, opacity: 0.25 }}
          animate={{ strokeDashoffset: 0, opacity: 1 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.text
          x="60"
          y="72"
          textAnchor="middle"
          fill="var(--color-chalk-100)"
          style={{ font: '600 34px var(--font-display)' }}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, repeat: Infinity, repeatType: 'reverse' }}
        >
          LP
        </motion.text>
      </svg>

      <p className="font-serif text-xl italic text-chalk-200/90">{label}</p>
    </div>
  )
}

export function BookSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-house-surface p-5">
      <div className="mb-5 aspect-[2/3] w-full animate-pulse rounded-lg bg-stone-700" />
      <div className="space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-stone-700" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-stone-700/70" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-stone-700/70" />
      </div>
    </div>
  )
}

export function BookSkeletonGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <BookSkeleton key={index} />
      ))}
    </div>
  )
}
