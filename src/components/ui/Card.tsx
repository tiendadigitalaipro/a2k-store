import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300',
        'hover:border-border-strong hover:bg-surface-elevated',
        className,
      )}
      {...props}
    />
  )
}
