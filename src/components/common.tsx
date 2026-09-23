import * as React from 'react'
import { create } from 'zustand'
import {
  ChevronDown,
  ChevronUp,
  Info,
  Music,
  Palette,
  PartyPopper,
  Sparkles,
  Star,
  Tag,
  Trophy,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useL, useT, type TKey } from '@/i18n'
import type { Categoria, EstadoEvento, Role } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
import { ROLE_COLOR } from '@/store'

/* ───────── Íconos de categoría ───────── */
export const CAT_ICON: Record<string, LucideIcon> = {
  conciertos: Music,
  fiestas: PartyPopper,
  experiencias: Sparkles,
  deportes: Trophy,
  cultura: Palette,
  Music,
  PartyPopper,
  Sparkles,
  Trophy,
  Palette,
  Tag,
}
export function CatIcon({ cat, className }: { cat: string; className?: string }) {
  const I = CAT_ICON[cat] || Tag
  return <I className={className} />
}

/* ───────── Foto de evento (gradiente + ícono) ───────── */
export function EventoFoto({
  foto,
  cat,
  className,
  iconSize = 'h-10 w-10',
  children,
}: {
  foto?: string
  cat: Categoria
  className?: string
  iconSize?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ background: foto || 'linear-gradient(135deg,#3f3f46,#18181b)' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.25),transparent_55%)]" />
      <CatIcon cat={cat} className={cn('absolute bottom-3 right-3 text-white/35', iconSize)} />
      {children}
    </div>
  )
}

/* ───────── Estrellas ───────── */
export function Stars({ value, size = 'h-3.5 w-3.5', className }: { value: number; size?: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(size, i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-zinc-300 dark:text-zinc-600')}
        />
      ))}
    </span>
  )
}

/* ───────── Badge de estado de evento ───────── */
const ESTADO_VARIANT: Record<EstadoEvento, 'zinc' | 'amber' | 'blue' | 'soft' | 'red' | 'dark'> = {
  borrador: 'zinc',
  pendiente: 'amber',
  aprobado: 'blue',
  publicado: 'soft',
  cancelado: 'red',
  finalizado: 'dark',
}
export function EstadoBadge({ estado }: { estado: EstadoEvento }) {
  const t = useT()
  return <Badge variant={ESTADO_VARIANT[estado]}>{t(`estado.${estado}` as TKey)}</Badge>
}

/* ───────── KPI ───────── */
export function Kpi({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  className,
}: {
  label: string
  value: React.ReactNode
  delta?: number
  sub?: string
  icon?: LucideIcon
  className?: string
}) {
  return (
    <div className={cn('card p-4 sm:p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="kicker">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-muted" />}
      </div>
      <div className="num mt-2 text-[26px] font-bold leading-none tracking-tight sm:text-[28px]">{value}</div>
      <div className="mt-2 flex items-center gap-2">
        {delta !== undefined && (
          <span
            className={cn(
              'num rounded-full px-1.5 py-0.5 text-[11px]',
              delta >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
            )}
          >
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        )}
        {sub && <span className="text-xs text-muted">{sub}</span>}
      </div>
    </div>
  )
}

/* ───────── Header de vista (kicker y borde por rol) ───────── */
const KICKER: Record<Role, [string, string]> = {
  usuario: ['APP · USUARIO', 'APP · USER'],
  organizador: ['PANEL ORGANIZADOR', 'ORGANIZER PANEL'],
  local: ['PUERTA · LOCAL', 'DOOR · VENUE'],
  admin: ['ADMINISTRACIÓN', 'ADMINISTRATION'],
}
export function RoleKicker({ role }: { role: Role }) {
  const l = useL()
  return (
    <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: ROLE_COLOR[role] }}>
      {l(...KICKER[role])}
    </span>
  )
}
export function ViewHeader({
  role,
  title,
  subtitle,
  actions,
  className,
}: {
  role: Role
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('card mb-5 flex flex-col gap-3 border-t-[3px] px-5 py-4 sm:flex-row sm:items-center sm:justify-between', className)}
      style={{ borderTopColor: ROLE_COLOR[role] }}
    >
      <div className="min-w-0">
        <RoleKicker role={role} />
        <h1 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ───────── Preview banner (colapso solo en memoria = por sesión de página) ───────── */
const useBannerStore = create<{ closed: Record<string, boolean>; toggle: (id: string) => void }>((set) => ({
  closed: {},
  toggle: (id) => set((s) => ({ closed: { ...s.closed, [id]: !s.closed[id] } })),
}))

export function PreviewBanner({ id, bullets }: { id: string; bullets: [string, string][] }) {
  const l = useL()
  const closed = useBannerStore((s) => !!s.closed[id])
  const toggle = useBannerStore((s) => s.toggle)
  return (
    <div className="no-print mb-5 rounded-[12px] border border-accent/25 bg-accent-soft/60 px-4 py-3 dark:bg-accent-soft">
      <div className="flex items-center gap-2">
        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold tracking-wider text-white">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          {l('PREVIEW NAVEGABLE', 'NAVIGABLE PREVIEW')}
        </span>
        <span className="rounded-full border border-accent/30 px-2 py-0.5 text-[10px] font-bold tracking-wider text-accent">
          {l('DATOS MOCK', 'MOCK DATA')}
        </span>
        <button
          onClick={() => toggle(id)}
          className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-accent hover:bg-accent/10"
          aria-expanded={!closed}
        >
          {closed ? l('Ver más', 'Show more') : l('Ocultar', 'Hide')}
          {closed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>
      {!closed && (
        <div className="mt-2.5">
          <p className="text-[13px] font-semibold">{l('Qué hace este módulo cuando esté funcional', 'What this module does once it’s live')}</p>
          <ul className="mt-1.5 grid gap-1 text-[13px] text-muted sm:grid-cols-3 sm:gap-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{l(b[0], b[1])}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ───────── DevNotice ───────── */
export function DevNotice({
  funcion,
  hoy,
  real,
  className,
}: {
  funcion: [string, string]
  hoy: [string, string]
  real: [string, string]
  className?: string
}) {
  const l = useL()
  return (
    <div
      className={cn(
        'flex gap-2.5 rounded-[10px] border border-amber-300/70 bg-amber-50 px-3 py-2.5 text-[12.5px] leading-snug text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
        className
      )}
    >
      <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div>
        <p className="font-semibold">
          {l(funcion[0], funcion[1])} · {l('función en desarrollo', 'feature in development')}
        </p>
        <p className="mt-0.5 opacity-90">
          {l(hoy[0], hoy[1])} {l(real[0], real[1])}
        </p>
      </div>
    </div>
  )
}

/* ───────── ⓘ En desarrollo ───────── */
export function EnDesarrollo({ texto, className }: { texto: [string, string]; className?: string }) {
  const l = useL()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted hover:bg-surface-2 hover:text-text',
            className
          )}
        >
          <Info className="h-3 w-3" />
          {l('En desarrollo', 'In development')}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 text-[13px]">{l(texto[0], texto[1])}</PopoverContent>
    </Popover>
  )
}

/* ───────── Empty state ───────── */
export function Empty({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-border px-6 py-10 text-center">
      <Icon className="h-6 w-6 text-muted" />
      <p className="text-sm font-semibold">{title}</p>
      {body && <p className="max-w-xs text-xs text-muted">{body}</p>}
    </div>
  )
}

/* ───────── Mini "Powered by" ───────── */
export function PoweredBy({ className }: { className?: string }) {
  return (
    <p className={cn('text-[10px] text-muted', className)}>
      Powered by <span className="font-semibold text-text">Insights</span>
    </p>
  )
}

export function Logo({ className, size = 'h-7 w-7' }: { className?: string; size?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('grid place-items-center rounded-[8px] bg-accent text-white shadow-sm', size)}>
        <svg viewBox="0 0 32 32" className="h-[62%] w-[62%]" fill="none">
          <path d="M6 24V9l10 8.5L26 9v15" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  )
}
