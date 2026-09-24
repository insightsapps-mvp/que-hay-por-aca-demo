import * as React from 'react'
import { AlertTriangle, CalendarDays, Check, CheckCircle2, ImageOff, MapPin, ShieldCheck, X, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { fmtARS, fmtDateLong, fmtTime, tl, useL, useSettings, useT, type TKey } from '@/i18n'
import type { Evento } from '@/types'
import { esHoy, localById, orgById } from '@/data/mock'
import { useStore } from '@/store'
import { WebPage } from '@/layout/Page'
import { Empty, EstadoBadge, EventoFoto } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/** Aprobados en esta sesión (persisten al navegar) */
let aprobadosSesion: string[] = []

const MOTIVOS: [string, string][] = [
  ['Falta foto de portada', 'Missing cover photo'],
  ['La descripción no es clara', 'Description is unclear'],
  ['El precio no coincide con lo informado', 'Price doesn’t match what was reported'],
]

function checklist(ev: Evento) {
  return [
    { ok: ev.fotos.length > 0, es: ev.fotos.length ? `Fotos ok (${ev.fotos.length})` : 'Falta foto de portada', en: ev.fotos.length ? `Photos ok (${ev.fotos.length})` : 'Missing cover photo', warn: !ev.fotos.length },
    { ok: ev.descripcion.es.length >= 20, es: 'Descripción completa', en: 'Complete description' },
    { ok: ev.precio > 0, es: 'Precio cargado', en: 'Price set' },
    { ok: ev.inicio.getTime() > Date.now(), es: 'Fecha futura', en: 'Future date' },
  ]
}

export default function Aprobacion() {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const eventos = useStore((s) => s.eventos)
  const aprobar = useStore((s) => s.aprobarEvento)
  const rechazar = useStore((s) => s.rechazarEvento)
  const [tab, setTab] = React.useState<'pendientes' | 'aprobados'>('pendientes')
  const [aprobados, setAprobados] = React.useState<string[]>(aprobadosSesion)
  const [rechazo, setRechazo] = React.useState<Evento | null>(null)
  const [motivo, setMotivo] = React.useState('')

  const pendientes = eventos.filter((e) => e.estado === 'pendiente')
  const listaAprob = aprobados.map((id) => eventos.find((e) => e.id === id)!).filter(Boolean)

  const onAprobar = (ev: Evento) => {
    aprobar(ev.id)
    aprobadosSesion = [ev.id, ...aprobadosSesion]
    setAprobados(aprobadosSesion)
    toast.success(tl('Evento aprobado y publicado', 'Event approved and published'), {
      description: esHoy(ev)
        ? tl(`${ev.titulo.es} ya aparece en Explorar y en el Mapa de hoy.`, `${ev.titulo.en} now shows in Explore and on Today’s map.`)
        : tl(`${ev.titulo.es} ya aparece en Explorar.`, `${ev.titulo.en} now shows in Explore.`),
    })
  }

  const card = (ev: Evento, pendiente: boolean, first: boolean) => {
    const loc = localById(ev.localId)
    const org = orgById(ev.organizadorId)
    const checks = checklist(ev)
    const sinFoto = !ev.fotos.length
    return (
      <div key={ev.id} className={cn('card overflow-hidden', sinFoto && pendiente && 'border-amber-400')}>
        <div className="grid grid-cols-1 gap-0 md:grid-cols-[280px_minmax(0,1fr)]">
          <div className="relative">
            {sinFoto ? (
              <div className="grid h-full min-h-[180px] place-items-center bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                <div className="flex flex-col items-center gap-2 text-sm font-semibold">
                  <ImageOff className="h-8 w-8" />
                  {l('Falta foto de portada', 'Missing cover photo')}
                </div>
              </div>
            ) : (
              <>
                <EventoFoto foto={ev.fotos[0]} cat={ev.categoria} className="h-full min-h-[180px]" />
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {ev.fotos.slice(1).map((f, i) => (
                    <span key={i} className="h-9 w-9 rounded-[6px] border-2 border-white/80" style={{ background: f }} />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <EstadoBadge estado={ev.estado} />
                  <span className="text-xs text-muted">{t(`cat.${ev.categoria}` as TKey)}</span>
                </div>
                <p className="mt-1 text-[17px] font-semibold">{ev.titulo[lang]}</p>
                <p className="text-[13px] text-muted">{org.nombre} · {org.responsable}</p>
              </div>
              <p className="num text-[20px] font-bold">{fmtARS(ev.precio, lang)}</p>
            </div>
            <p className="mt-2 line-clamp-2 text-[13px] text-muted">{ev.descripcion[lang]}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
              <span className="inline-flex items-center gap-1 capitalize"><CalendarDays className="h-3.5 w-3.5 text-muted" />{fmtDateLong(ev.inicio, lang)} · <span className="num">{fmtTime(ev.inicio, lang)}</span></span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted" />{loc.nombre}</span>
              <span className="num text-muted">{l('Aforo', 'Capacity')} {ev.aforo}</span>
            </div>
            {pendiente && (
              <>
                <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {checks.map((c, i) => (
                    <span
                      key={i}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-[12px] font-medium',
                        c.ok ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
                      )}
                    >
                      {c.ok ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      {l(c.es, c.en)}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button data-trailer={first ? 'btn-aprobar' : undefined} variant="success" onClick={() => onAprobar(ev)}>
                    <CheckCircle2 /> {l('Aprobar y publicar', 'Approve and publish')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRechazo(ev)
                      setMotivo(sinFoto ? tl(...MOTIVOS[0]) : '')
                    }}
                  >
                    <XCircle /> {l('Rechazar con motivo', 'Reject with reason')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <WebPage
      role="admin"
      bannerId="admin-aprobacion"
      title={l('Aprobación de eventos', 'Event approval')}
      subtitle={l('Nada se publica sin revisión', 'Nothing goes live without review')}
      bullets={[
        ['Cola de revisión con checklist automático de calidad.', 'Review queue with an automatic quality checklist.'],
        ['Aprobar publica al instante en Explorar y en el mapa.', 'Approving publishes instantly in Explore and on the map.'],
        ['El rechazo le llega al organizador con el motivo para corregir.', 'Rejections reach the organizer with the reason to fix.'],
      ]}
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="pendientes">{l('Pendientes', 'Pending')} <span className="num text-[11px] text-muted">{pendientes.length}</span></TabsTrigger>
          <TabsTrigger value="aprobados">{l('Aprobados', 'Approved')} <span className="num text-[11px] text-muted">{listaAprob.length}</span></TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4 space-y-4">
        {tab === 'pendientes' &&
          (pendientes.length ? pendientes.map((ev, i) => card(ev, true, i === 0)) : <Empty icon={ShieldCheck} title={l('No hay eventos pendientes', 'No pending events')} body={l('Cuando un organizador envíe un evento, aparece acá.', 'When an organizer submits an event, it shows up here.')} />)}
        {tab === 'aprobados' &&
          (listaAprob.length ? listaAprob.map((ev) => card(ev, false, false)) : <Empty icon={CheckCircle2} title={l('Todavía no aprobaste eventos en esta sesión', 'You haven’t approved events this session yet')} />)}
      </div>

      <Dialog open={!!rechazo} onOpenChange={(v) => !v && setRechazo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{l('Rechazar evento', 'Reject event')}</DialogTitle>
            <DialogDescription>{rechazo?.titulo[lang]} · {l('el organizador recibe el motivo y puede corregirlo.', 'the organizer gets the reason and can fix it.')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-1.5">
            {MOTIVOS.map((m, i) => (
              <button key={i} onClick={() => setMotivo(l(...m))} className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-surface-2">{l(...m)}</button>
            ))}
          </div>
          <Textarea className="mt-3" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder={l('Escribí el motivo…', 'Write the reason…')} maxLength={300} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRechazo(null)}><X /> {l('Cancelar', 'Cancel')}</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!rechazo) return
                if (!motivo.trim()) {
                  toast.error(tl('Indicá un motivo', 'Enter a reason'))
                  return
                }
                rechazar(rechazo.id, motivo.trim())
                toast(tl('Evento rechazado', 'Event rejected'), { description: tl(`Le avisamos a ${orgById(rechazo.organizadorId).nombre}.`, `We notified ${orgById(rechazo.organizadorId).nombre}.`) })
                setRechazo(null)
              }}
            >
              {l('Rechazar', 'Reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WebPage>
  )
}
