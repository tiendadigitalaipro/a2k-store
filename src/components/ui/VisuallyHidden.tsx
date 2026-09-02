import type { ReactNode } from 'react'

interface VisuallyHiddenProps {
  children: ReactNode
}

export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return (
    <span className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip-path:inset(50%)] [clip:rect(0,0,0,0)]">
      {children}
    </span>
  )
}
