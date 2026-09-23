import * as React from 'react'
import type { Role } from '@/types'
import { useSettings, useL } from '@/i18n'
import { PreviewBanner, ViewHeader } from '@/components/common'
import { cn } from '@/lib/utils'

/** Vista web de panel (sin DeviceFrame), ancho completo responsive */
export function WebPage({
  role,
  bannerId,
  title,
  subtitle,
  actions,
  bullets,
  children,
  className,
}: {
  role: Role
  bannerId: string
  title: string
  subtitle?: string
  actions?: React.ReactNode
  bullets: [string, string][]
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1280px]', className)}>
      <ViewHeader role={role} title={title} subtitle={subtitle} actions={actions} />
      <PreviewBanner id={bannerId} bullets={bullets} />
      {children}
    </div>
  )
}

/** Colores de gráficos según tema (Recharts necesita valores, no CSS vars) */
export function useChartColors() {
  const dark = useSettings((s) => s.theme) === 'dark'
  return {
    accent: dark ? '#8b5cf6' : '#7c3aed',
    grid: dark ? 'rgba(255,255,255,.08)' : '#e4e4e7',
    muted: dark ? '#a1a1aa' : '#71717a',
    success: '#16a34a',
    amber: '#f59e0b',
    danger: '#dc2626',
  }
}

export function ChartTooltip({
  active,
  payload,
  label,
  fmt,
}: {
  active?: boolean
  payload?: { name: string; value: number; color?: string; dataKey?: string }[]
  label?: string
  fmt?: (v: number, key?: string) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[10px] border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted">{p.name}</span>
          <span className="num ml-auto">{fmt ? fmt(p.value, p.dataKey) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function LiveDot() {
  const l = useL()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      {l('Actualizado hace 2 min', 'Updated 2 min ago')}
    </span>
  )
}
