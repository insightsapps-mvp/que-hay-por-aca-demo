import * as React from 'react'
import { create } from 'zustand'
import { useNavigate } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import { cn, distanceKm } from '@/lib/utils'
import { fmtARS, fmtDia, fmtKm, fmtTime, useL, useSettings, useT, type TKey } from '@/i18n'
import type { Evento, Role } from '@/types'
import { enCurso, esHoy, localById, USER_LOC } from '@/data/mock'
import { EventoFoto, PreviewBanner, ViewHeader } from '@/components/common'
import { DeviceFrame } from '@/components/DeviceFrame'
import { Badge } from '@/components/ui/badge'

export const distDe = (ev: Pick<Evento, 'lat' | 'lng'>) => distanceKm(USER_LOC.lat, USER_LOC.lng, ev.lat, ev.lng)
export const ocupacion = (ev: Evento) => ev.vendidas / Math.max(1, ev.aforo)

export function useFmt() {
  const lang = useSettings((s) => s.lang)
  const l = useL()
  return {
    lang,
    ars: (n: number) => fmtARS(n, lang),
    time: (d: Date) => fmtTime(d, lang),
    dia: (d: Date) => fmtDia(d, lang),
    lejos: (km: number) => (lang === 'en' ? `${fmtKm(km, lang)} away` : `a ${fmtKm(km, lang)}`),
    quedan: (n: number) => l(`quedan ${n}`, `${n} left`),
  }
}

/** Etiqueta de día: en curso → "En curso", hoy → "Hoy", resto → Intl */
export function DiaLabel({ ev }: { ev: Evento }) {
  const l = useL()
  const f = useFmt()
  if (enCurso(ev)) return <span className="font-semibold text-success">{l('En curso', 'Live now')}</span>
  if (esHoy(ev)) return <>{l('Hoy', 'Today')}</>
  return <>{f.dia(ev.inicio)}</>
}

export function AforoBar({ ev, className }: { ev: Evento; className?: string }) {
  const f = useFmt()
  const pct = Math.round(ocupacion(ev) * 100)
  return (
    <div className={className}>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div className={cn('h-full rounded-full', pct > 90 ? 'bg-danger' : 'bg-accent')} style={{ width: `${pct}%` }} />
      </div>
      <p className={cn('mt-1 text-[10.5px]', pct > 90 ? 'font-semibold text-danger' : 'text-muted')}>{f.quedan(ev.aforo - ev.vendidas)}</p>
    </div>
  )
}

export function UltimasBadge({ ev }: { ev: Evento }) {
  const l = useL()
  if (ocupacion(ev) <= 0.9) return null
  return <Badge className="bg-danger text-white">{l('Últimas entradas', 'Last tickets')}</Badge>
}

export function EventCard({ ev, wide }: { ev: Evento; wide?: boolean }) {
  const lang = useSettings((s) => s.lang)
  const t = useT()
  const f = useFmt()
  const navigate = useNavigate()
  const loc = localById(ev.localId)
  return (
    <button
      onClick={() => navigate(`/app/evento/${ev.id}`)}
      className={cn('card group shrink-0 overflow-hidden text-left transition-shadow hover:shadow-md', wide ? 'w-full' : 'w-[232px] snap-start')}
    >
      <EventoFoto foto={ev.fotos[0]} cat={ev.categoria} className="h-[118px]">
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur">{t(`cat.${ev.categoria}` as TKey)}</span>
          {enCurso(ev) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[10.5px] font-semibold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              LIVE
            </span>
          )}
        </div>
        <div className="absolute bottom-2.5 left-2.5">
          <UltimasBadge ev={ev} />
        </div>
      </EventoFoto>
      <div className="p-3">
        <p className="line-clamp-1 text-[14px] font-semibold">{ev.titulo[lang]}</p>
        <p className="mt-0.5 line-clamp-1 text-[12px] text-muted">
          {loc.nombre} · {f.lejos(distDe(ev))}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[12px] text-muted">
            <Clock className="h-3 w-3" />
            <DiaLabel ev={ev} /> · <span className="num text-text">{f.time(ev.inicio)}</span>
          </span>
          <span className="num text-[14px] font-bold">{f.ars(ev.precio)}</span>
        </div>
        <AforoBar ev={ev} className="mt-2" />
      </div>
    </button>
  )
}

export function EventRow({ ev, onClick }: { ev: Evento; onClick?: () => void }) {
  const lang = useSettings((s) => s.lang)
  const f = useFmt()
  const navigate = useNavigate()
  const loc = localById(ev.localId)
  return (
    <button
      onClick={onClick || (() => navigate(`/app/evento/${ev.id}`))}
      className="flex w-full items-center gap-3 rounded-[12px] border border-border bg-surface p-2.5 text-left transition-colors hover:bg-surface-2"
    >
      <EventoFoto foto={ev.fotos[0]} cat={ev.categoria} className="h-[62px] w-[62px] shrink-0 rounded-[10px]" iconSize="h-5 w-5" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-[13.5px] font-semibold">{ev.titulo[lang]}</p>
        <p className="mt-0.5 line-clamp-1 text-[11.5px] text-muted">
          <MapPin className="mr-0.5 inline h-3 w-3" />
          {loc.barrio} · {f.lejos(distDe(ev))}
        </p>
        <p className="mt-0.5 text-[11.5px] text-muted">
          <DiaLabel ev={ev} /> · <span className="num">{f.time(ev.inicio)}</span>
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="num text-[13.5px] font-bold">{f.ars(ev.precio)}</span>
        <UltimasBadge ev={ev} />
      </div>
    </button>
  )
}

/** Layout de vistas en DeviceFrame: header + banner a la izquierda (xl) y el celular a la derecha. */
export function DevicePage({
  role = 'usuario',
  bannerId,
  title,
  subtitle,
  bullets,
  side,
  children,
  tabBar,
  dark,
}: {
  role?: Role
  bannerId: string
  title: string
  subtitle?: string
  bullets: [string, string][]
  side?: React.ReactNode
  children: React.ReactNode
  tabBar?: React.ReactNode
  dark?: boolean
}) {
  return (
    <div className="mx-auto grid max-w-[1180px] gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
      <div className="min-w-0 xl:sticky xl:top-20">
        <ViewHeader role={role} title={title} subtitle={subtitle} />
        <PreviewBanner id={bannerId} bullets={bullets} />
        {side && <div className="hidden space-y-3 xl:block">{side}</div>}
      </div>
      <div className="-mx-4 lg:mx-0">
        <DeviceFrame tabBar={tabBar} dark={dark}>
          {children}
        </DeviceFrame>
      </div>
    </div>
  )
}

/** Hoja inferior dentro del frame (absoluta, no portal) */
export function FrameSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 mv-anim-fade" onClick={onClose} />
      <div className={cn('relative max-h-[88%] overflow-y-auto rounded-t-[22px] bg-surface p-4 pb-6 shadow-2xl mv-sheet-bottom', className)}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        {title && <p className="mb-3 text-[15px] font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  )
}

/** Radio de búsqueda compartido entre Explorar y el Mapa */
export const useRadio = create<{ radio: number; setRadio: (r: number) => void }>((set) => ({
  radio: 10,
  setRadio: (radio) => set({ radio }),
}))
