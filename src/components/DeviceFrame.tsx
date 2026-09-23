import * as React from 'react'
import { create } from 'zustand'
import { NavLink, useLocation } from 'react-router-dom'
import { Apple, Battery, Compass, MapPin, Signal, Smartphone, Ticket, User, Wifi, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { tl, useL } from '@/i18n'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/misc'
import { useStore } from '@/store'

export type Platform = 'ios' | 'android'
export const usePlatform = create<{ platform: Platform; setPlatform: (p: Platform) => void }>((set) => ({
  platform: 'ios',
  setPlatform: (platform) => set({ platform }),
}))

function StatusBar({ platform, dark }: { platform: Platform; dark?: boolean }) {
  const [time, setTime] = React.useState(() => new Date())
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  const hh = String(time.getHours()).padStart(2, '0')
  const mm = String(time.getMinutes()).padStart(2, '0')
  return (
    <div
      className={cn(
        'relative z-20 hidden shrink-0 items-center justify-between px-7 text-[13px] font-semibold lg:flex',
        platform === 'ios' ? 'h-11 pt-1' : 'h-8 px-5 text-[12px]',
        dark ? 'text-white' : 'text-text'
      )}
    >
      <span className="num">{`${hh}:${mm}`}</span>
      <span className="flex items-center gap-1">
        <Signal className="h-3.5 w-3.5" />
        <Wifi className="h-3.5 w-3.5" />
        <Battery className="h-4 w-4" />
      </span>
    </div>
  )
}

/**
 * Marco de celular (módulo 01). En < lg desaparece y el contenido ocupa la pantalla completa.
 * `screenClassName` permite fondos oscuros (escáner).
 */
export function DeviceFrame({
  children,
  tabBar,
  dark,
  screenClassName,
}: {
  children: React.ReactNode
  tabBar?: React.ReactNode
  dark?: boolean
  screenClassName?: string
}) {
  const l = useL()
  const platform = usePlatform((s) => s.platform)
  const setPlatform = usePlatform((s) => s.setPlatform)
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 hidden items-center gap-3 lg:flex">
        <span className="kicker">{l('Vista app nativa', 'Native app view')}</span>
        <ToggleGroup
          type="single"
          value={platform}
          onValueChange={(v) => v && setPlatform(v as Platform)}
          aria-label="Platform"
        >
          <ToggleGroupItem value="ios">
            <Apple /> iOS
          </ToggleGroupItem>
          <ToggleGroupItem value="android">
            <Smartphone /> Android
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div
        className={cn(
          'relative w-full bg-bg',
          'lg:w-[384px] lg:shrink-0 lg:overflow-hidden lg:border-[11px] lg:border-zinc-900 lg:shadow-[0_30px_80px_-20px_rgba(0,0,0,.45)] dark:lg:border-zinc-800',
          platform === 'ios' ? 'lg:h-[800px] lg:rounded-[56px]' : 'lg:h-[800px] lg:rounded-[34px]'
        )}
      >
        {/* notch / cámara */}
        {platform === 'ios' ? (
          <div className="pointer-events-none absolute left-0 right-0 top-2.5 z-30 mx-auto hidden h-[30px] w-[108px] rounded-full bg-black lg:block" />
        ) : (
          <div className="pointer-events-none absolute left-0 right-0 top-2.5 z-30 mx-auto hidden h-3.5 w-3.5 rounded-full bg-black ring-2 ring-zinc-800 lg:block" />
        )}
        <div
          className={cn(
            'relative flex h-[calc(100dvh-56px)] flex-col lg:h-full',
            dark ? 'bg-zinc-950 text-white' : 'bg-bg',
            screenClassName
          )}
        >
          <StatusBar platform={platform} dark={dark} />
          <div id="device-screen" className="relative flex min-h-0 flex-1 flex-col">
            {children}
          </div>
          {tabBar}
          {/* home indicator */}
          <div className="hidden h-5 shrink-0 items-center justify-center lg:flex">
            <span
              className={cn(
                'rounded-full',
                platform === 'ios' ? 'h-[5px] w-32 bg-zinc-900 dark:bg-zinc-200' : 'h-1 w-24 bg-zinc-400',
                dark && 'bg-zinc-200'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Contenedor scrolleable de la pantalla */
export const DeviceScroll = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className }, ref) => (
    <div ref={ref} className={cn('relative min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none', className)}>
      {children}
    </div>
  )
)
DeviceScroll.displayName = 'DeviceScroll'

/* ───────── Tab bar de la app Usuario ───────── */
const TABS: { to: string; icon: LucideIcon; es: string; en: string; match: string }[] = [
  { to: '/app/explorar', icon: Compass, es: 'Explorar', en: 'Explore', match: '/app/explorar' },
  { to: '/app/mapa', icon: MapPin, es: 'Mapa', en: 'Map', match: '/app/mapa' },
  { to: '/app/entradas', icon: Ticket, es: 'Entradas', en: 'Tickets', match: '/app/entradas' },
  { to: '#perfil', icon: User, es: 'Perfil', en: 'Profile', match: '#' },
]

export function UserTabBar() {
  const l = useL()
  const platform = usePlatform((s) => s.platform)
  const { pathname } = useLocation()
  const cancelarPreview = useStore((s) => s.cancelarPreview)
  const perfil = () =>
    toast(tl('Perfil de Martina', 'Martina’s profile'), {
      description: tl('Datos personales, medios de pago guardados y preferencias de categorías.', 'Personal info, saved payment methods and category preferences.'),
    })
  if (platform === 'ios') {
    return (
      <nav className="sticky bottom-0 z-20 grid shrink-0 grid-cols-4 border-t border-border bg-surface/80 px-2 pb-1 pt-1.5 backdrop-blur-xl">
        {TABS.map((t) => {
          const active = pathname.startsWith(t.match)
          const inner = (
            <>
              <t.icon className={cn('h-[22px] w-[22px]', active && 'stroke-[2.4]')} />
              <span className="text-[10px] font-medium">{l(t.es, t.en)}</span>
            </>
          )
          const cls = cn('flex flex-col items-center gap-0.5 py-1', active ? 'text-accent' : 'text-muted')
          return t.to.startsWith('#') ? (
            <button key={t.to} onClick={perfil} className={cls}>
              {inner}
            </button>
          ) : (
            <NavLink key={t.to} to={t.to} className={cls} onClick={cancelarPreview}>
              {inner}
            </NavLink>
          )
        })}
      </nav>
    )
  }
  return (
    <nav className="sticky bottom-0 z-20 grid shrink-0 grid-cols-4 bg-surface-2 px-2 pb-2 pt-2 shadow-[0_-1px_0_var(--border)]">
      {TABS.map((t) => {
        const active = pathname.startsWith(t.match)
        const inner = (
          <>
            <span className={cn('grid h-8 w-16 place-items-center rounded-full transition-colors', active && 'bg-accent-soft')}>
              <t.icon className={cn('h-5 w-5', active ? 'text-accent' : 'text-muted')} />
            </span>
            <span className={cn('text-[11px] font-medium', active ? 'text-text' : 'text-muted')}>{l(t.es, t.en)}</span>
          </>
        )
        return t.to.startsWith('#') ? (
          <button key={t.to} onClick={perfil} className="flex flex-col items-center gap-1">
            {inner}
          </button>
        ) : (
          <NavLink key={t.to} to={t.to} className="flex flex-col items-center gap-1" onClick={cancelarPreview}>
            {inner}
          </NavLink>
        )
      })}
    </nav>
  )
}

/** FAB Material (solo Android) */
export function AndroidFab({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  const platform = usePlatform((s) => s.platform)
  if (platform !== 'android') return null
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 z-20 inline-flex h-14 items-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-white shadow-lg shadow-accent/30"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )
}

/** Header de app dentro del frame */
export function AppBar({
  title,
  left,
  right,
  className,
}: {
  title?: React.ReactNode
  left?: React.ReactNode
  right?: React.ReactNode
  className?: string
}) {
  const platform = usePlatform((s) => s.platform)
  return (
    <div
      className={cn(
        'sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface/85 px-3 backdrop-blur-xl',
        platform === 'ios' ? 'justify-between' : 'justify-start',
        className
      )}
    >
      <div className="flex min-w-[40px] items-center">{left}</div>
      <div className={cn('min-w-0 truncate text-[15px] font-semibold', platform === 'ios' ? 'text-center' : 'flex-1')}>{title}</div>
      <div className="flex min-w-[40px] items-center justify-end">{right}</div>
    </div>
  )
}
