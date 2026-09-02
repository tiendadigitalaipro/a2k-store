import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src: string
  alt: string
  className?: string
  aspect?: 'square' | 'portrait' | 'landscape'
}

const aspectClasses: Record<NonNullable<ProductImageProps['aspect']>, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
}

export function ProductImage({ src, alt, className, aspect = 'square' }: ProductImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-elevated',
        aspectClasses[aspect],
        className,
      )}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-surface-hover" aria-hidden="true" />
      )}
      {error ? (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <span className="text-sm">Sin imagen</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            'h-full w-full object-cover transition-transform duration-500 ease-out',
            loaded ? 'opacity-100' : 'opacity-0',
            'group-hover:scale-105',
          )}
        />
      )}
    </div>
  )
}
