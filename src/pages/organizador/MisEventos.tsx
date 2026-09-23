import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Copy, MoreHorizontal, Pencil, PlusCircle, Star, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { fmtARS, fmtDate, fmtNum, fmtTime, tl, useL, useSettings } from '@/i18n'
import type { EstadoEvento, Evento } from '@/types'
import { localById } from '@/data/mock'
import { MY_ORG, useStore } from '@/store'
import { WebPage } from '@/layout/Page'
import { Empty, EstadoBadge, EventoFoto } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/overlay'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/misc'

const TABS: ('todos' | EstadoEvento)[] = ['todos', 'borrador', 'pendiente', 'publicado', 'finalizado', 'cancelado']
const TAB_LABEL: Record<string, [string, string]> = {
  todos: ['Todos', 'All'],
  borrador: ['Borrador', 'Draft'],
  pendiente: ['Pendiente', 'Pending'],
  publicado: ['Publicado', 'Published'],
  finalizado: ['Finalizado', 'Finished'],
  cancelado: ['Cancelado', 'Cancelled'],
}

export default function MisEventos() {
  const l = useL()
  const lang = useSettings((s) => s.lang)
  const navigate = useNavigate()
  const eventos = useStore((s) => s.eventos)
  const duplicar = useStore((s) => s.duplicarEvento)
  const cancelar = useStore((s) => s.cancelarEvento)
  const [tab, setTab] = React.useState<string>('todos')
  const [aCancelar, setACancelar] = React.useState<Evento | null>(null)

  const mios = eventos.filter((e) => e.organizadorId === MY_ORG).sort((a, b) => b.inicio.getTime() - a.inicio.getTime())
  const lista = tab === 'todos' ? mios : mios.filter((e) => (tab === 'publicado' ? e.estado === 'publicado' || e.estado === 'aprobado' : e.estado === tab))
  const count = (k: string) => (k === 'todos' ? mios.length : mios.filter((e) => (k === 'publicado' ? e.estado === 'publicado' || e.estado === 'aprobado' : e.estado === k)).length)

  const acciones = (ev: Evento) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={l('Acciones', 'Actions')}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => navigate(`/organizador/nuevo?edit=${ev.id}`)}>
          <Pencil /> {l('Editar', 'Edit')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            duplicar(ev.id)
            setTab('borrador')
            toast.success(tl('Evento duplicado como borrador', 'Event duplicated as draft'), { description: ev.titulo[lang] })
          }}
        >
          <Copy /> {l('Duplicar', 'Duplicate')}
        </DropdownMenuItem>
        {ev.estado !== 'cancelado' && ev.estado !== 'finalizado' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger" onSelect={() => setACancelar(ev)}>
              <XCircle /> {l('Cancelar evento', 'Cancel event')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <WebPage
      role="organizador"
      bannerId="org-eventos"
      title={l('Mis eventos', 'My events')}
      subtitle={`Nocturna Producciones · ${mios.length} ${l('eventos', 'events')}`}
      actions={
        <Button onClick={() => navigate('/organizador/nuevo')}>
          <PlusCircle /> {l('Cargar evento', 'Create event')}
        </Button>
      }
      bullets={[
        ['Cada organizador ve y gestiona solo sus eventos.', 'Each organizer sees and manages only their own events.'],
        ['Ventas y aforo se actualizan en vivo con cada compra.', 'Sales and capacity update live with every purchase.'],
        ['Cancelar un evento dispara devoluciones y avisos automáticos.', 'Cancelling an event triggers automatic refunds and notices.'],
      ]}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((k) => (
            <TabsTrigger key={k} value={k}>
              {l(...TAB_LABEL[k])} <span className="num text-[11px] text-muted">{count(k)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="card mt-4 hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{l('Evento', 'Event')}</TableHead>
              <TableHead>{l('Estado', 'Status')}</TableHead>
              <TableHead>{l('Fecha', 'Date')}</TableHead>
              <TableHead>{l('Vendidas / aforo', 'Sold / capacity')}</TableHead>
              <TableHead className="text-right">{l('Ingresos', 'Revenue')}</TableHead>
              <TableHead className="text-right">{l('Rating', 'Rating')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((ev) => (
              <TableRow key={ev.id} className="cursor-pointer" onClick={(e) => (e.target as HTMLElement).closest('button') || navigate(`/organizador/nuevo?edit=${ev.id}`)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <EventoFoto foto={ev.fotos[0]} cat={ev.categoria} className="h-10 w-10 shrink-0 rounded-[8px]" iconSize="h-4 w-4" />
                    <div className="min-w-0">
                      <p className="max-w-[260px] truncate font-semibold">{ev.titulo[lang]}</p>
                      <p className="text-xs text-muted">{localById(ev.localId).nombre}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><EstadoBadge estado={ev.estado} /></TableCell>
                <TableCell className="text-muted">
                  {fmtDate(ev.inicio, lang)} · <span className="num">{fmtTime(ev.inicio, lang)}</span>
                </TableCell>
                <TableCell>
                  <div className="w-36">
                    <p className="num text-xs">{ev.vendidas} / {ev.aforo}</p>
                    <Progress value={(ev.vendidas / ev.aforo) * 100} className="mt-1" />
                  </div>
                </TableCell>
                <TableCell className="num text-right">{fmtARS(ev.vendidas * ev.precio, lang)}</TableCell>
                <TableCell className="text-right">
                  {ev.rating ? (
                    <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /><span className="num">{fmtNum(ev.rating, lang, 1)}</span></span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">{acciones(ev)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!lista.length && <div className="p-6"><Empty icon={CalendarDays} title={l('No hay eventos en este estado', 'No events in this status')} /></div>}
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {lista.map((ev) => (
          <div key={ev.id} className="card flex gap-3 p-3">
            <EventoFoto foto={ev.fotos[0]} cat={ev.categoria} className="h-16 w-16 shrink-0 rounded-[10px]" iconSize="h-5 w-5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-[14px] font-semibold">{ev.titulo[lang]}</p>
                {acciones(ev)}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                <EstadoBadge estado={ev.estado} />
                <span>{fmtDate(ev.inicio, lang)}</span>
                <span className="num">{ev.vendidas}/{ev.aforo}</span>
                <span className="num text-text">{fmtARS(ev.vendidas * ev.precio, lang)}</span>
              </div>
            </div>
          </div>
        ))}
        {!lista.length && <Empty icon={CalendarDays} title={l('No hay eventos en este estado', 'No events in this status')} />}
      </div>

      <Dialog open={!!aCancelar} onOpenChange={(v) => !v && setACancelar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{l('¿Cancelar este evento?', 'Cancel this event?')}</DialogTitle>
            <DialogDescription>
              {aCancelar?.titulo[lang]} · {l(`${aCancelar?.vendidas ?? 0} entradas vendidas se devolverán automáticamente.`, `${aCancelar?.vendidas ?? 0} sold tickets will be refunded automatically.`)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setACancelar(null)}>{l('Volver', 'Go back')}</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!aCancelar) return
                cancelar(aCancelar.id)
                toast.success(tl('Evento cancelado', 'Event cancelled'), { description: tl('Avisamos a los compradores por mail.', 'We emailed the buyers.') })
                setACancelar(null)
              }}
            >
              {l('Sí, cancelar evento', 'Yes, cancel event')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WebPage>
  )
}
