/**
 * Auth Shell (Fase 19)
 *
 * Elegant dark/gold wrapper shared by Login, Register, ForgotPassword
 * and ResetPassword. Replaces the old light-gray auth pages so the whole
 * app speaks the same A2K luxury language.
 */

import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient gold glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% -5%, rgba(197,160,89,0.18), transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.35), transparent 65%)' }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5"
            aria-label="A2K Store — Inicio"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 font-display text-lg font-semibold text-primary shadow-[0_0_28px_-10px_rgba(197,160,89,0.7)]">
              A
            </span>
            <span className="font-display text-2xl font-semibold tracking-wide text-foreground">
              A2K<span className="text-primary">Store</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border-strong bg-surface p-8 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]">
          <div className="mb-7 text-center">
            <h1 className="font-display text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
            <div
              aria-hidden="true"
              className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
