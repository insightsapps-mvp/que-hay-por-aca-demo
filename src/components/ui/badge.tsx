import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent text-accent-fg',
        soft: 'border-transparent bg-accent-soft text-accent',
        outline: 'border-border text-text',
        zinc: 'border-transparent bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        dark: 'border-transparent bg-zinc-800 text-zinc-100 dark:bg-zinc-700',
        amber: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400',
        blue: 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
        red: 'border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
        green: 'border-transparent bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
