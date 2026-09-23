import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Ticket as TicketIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useL, useSettings, useT, type TKey } from '@/i18n'
import type { Evento, Ticket } from '@/types'
import { localById, ME_ID } from '@/data/mock'
import { useStore } from '@/store'
import { Empty } from '@/components/common'
import { AppBar, DeviceScroll, UserTabBar } from '@/components/DeviceFrame'
import { qrValue } from '@/components/MailPreview'
import { Badge } from '@/components/ui/badge'
import { DevicePage, DiaLabel, useFmt } from './shared'

export function TicketEstadoBadge({ estado }: { estado: Ticket['estado'] }) {
  const t = useT()
  return <Badge variant={estado === 'valida' ? 'green' : estado === 'usada' ? 'zinc' : 'red'}>{t(`tk.${estado}` as TKey)}</Badge>
}

/** Ticket estilo pase con troquel lateral */
export function TicketPass({ tk, ev, onClick }: { tk: Ticket; ev: Evento; onClick?: () => void }) {
  const lang = useSettings((s) => s.lang)
  const l = useL()
  const f = useFmt()
  const loc = localById(ev.localId)
  const inactive = tk.estado !== 'valida'
  return (
    <button onClick={onClick} className="relative flex w-full overflow-hidden rounded-[16px] border border-border bg-surface text-left shadow-card transition-shadow hover:shadow-md">
      <div className="w-2 shrink-0" style={{ background: ev.fotos[0] }} />
      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <TicketEstadoBadge estado={tk.estado} />
          <span className="num text-[11px] text-muted">×{tk.cantidad}</span>
        </div>
        <p className={cn('mt-1.5 line-clamp-1 text-[14.5px] font-semibold', inactive && 'text-muted')}>{ev.titulo[lang]}</p>
        <p className="line-clamp-1 text-[11.5px] text-muted">{loc.nombre}</p>
        <p className="mt-1 text-[12px]">
          <DiaLabel ev={ev} /> · <span className="num">{f.time(ev.inicio)}</span>
        </p>
        <p className="num mt-1.5 text-[11px] tracking-wider text-muted">{tk.codigo}</p>
      </div>
      {/* troquel */}
      <div className="relative w-0 border-l-2 border-dashed border-border">
        <span className="absolute -left-[9px] -top-2 h-4 w-4 rounded-full border border-border bg-bg" />
        <span className="absolute -bottom-2 -left-[9px] h-4 w-4 rounded-full border border-border bg-bg" />
      </div>
      <div className={cn('grid w-[96px] shrink-0 place-items-center p-2', inactive && 'opacity-35 grayscale')}>
        <div className="rounded-[8px] bg-white p-1.5">
          <QRCodeSVG value={qrValue(tk.codigo)} size={66} />
        </div>
        <span className="mt-1 text-[9.5px] text-muted">{l('Tocá para abrir', 'Tap to open')}</span>
      </div>
    </button>
  )
}

export default function Entradas() {
  const l = useL()
  const navigate = useNavigate()
  const tickets = useStore((s) => s.tickets)
  const eventos = useStore((s) => s.eventos)
  const [tab, setTab] = React.useState<'proximas' | 'pasadas'>('proximas')
  const now = new Date()
  const mias = tickets
    .filter((t) => t.usuarioId === ME_ID)
    .map((t) => ({ tk: t, ev: eventos.find((e) => e.id === t.eventoId)! }))
    .filter((x) => x.ev)
  const proximas = mias.filter((x) => x.ev.fin > now && x.tk.estado === 'valida').sort((a, b) => a.ev.inicio.getTime() - b.ev.inicio.getTime())
  const pasadas = mias.filter((x) => !(x.ev.fin > now && x.tk.estado === 'valida')).sort((a, b) => b.ev.inicio.getTime() - a.ev.inicio.getTime())
  const lista = tab === 'proximas' ? proximas : pasadas

  return (
    <DevicePage
      bannerId="entradas"
      title={l('Mis entradas', 'My tickets')}
      subtitle={l('Todas tus compras con su QR, también sin conexión.', 'All your purchases with their QR, also offline.')}
      bullets={[
        ['El QR queda guardado en la app y funciona sin señal.', 'The QR is stored in the app and works without signal.'],
        ['Cada entrada cambia a “Usada” apenas la escanean en la puerta.', 'Each ticket switches to “Used” as soon as it’s scanned at the door.'],
        ['Recibos descargables y recordatorio push antes del evento.', 'Downloadable receipts and a push reminder before the event.'],
      ]}
      tabBar={<UserTabBar />}
    >
      <AppBar title={l('Mis entradas', 'My tickets')} />
      <DeviceScroll>
        <div className="px-4 pb-6 pt-3">
          <div className="grid grid-cols-2 rounded-[10px] bg-surface-2 p-1 text-[13px] font-semibold">
            {(['proximas', 'pasadas'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={cn('rounded-[8px] py-1.5', tab === k ? 'bg-surface shadow-sm dark:bg-zinc-800' : 'text-muted')}
              >
                {k === 'proximas' ? l('Próximas', 'Upcoming') : l('Pasadas', 'Past')} <span className="num text-muted">{k === 'proximas' ? proximas.length : pasadas.length}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-3">
            {lista.length ? (
              lista.map(({ tk, ev }) => <TicketPass key={tk.id} tk={tk} ev={ev} onClick={() => navigate(`/app/entradas/${tk.id}`)} />)
            ) : (
              <Empty icon={TicketIcon} title={l('No tenés entradas acá', 'No tickets here')} body={l('Buscá un evento en el mapa y comprá tu entrada.', 'Find an event on the map and buy your ticket.')} />
            )}
          </div>
        </div>
      </DeviceScroll>
    </DevicePage>
  )
}
