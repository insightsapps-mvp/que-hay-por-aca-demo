import * as React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Archive, CalendarDays, Clock, Mail, MapPin, Monitor, Reply, Smartphone, Star, Ticket as TicketIcon, Trash2 } from 'lucide-react'
import { cn, BRAND } from '@/lib/utils'
import { fmtARS, fmtDateLong, fmtTime, useL, useSettings } from '@/i18n'
import type { Evento, Ticket } from '@/types'
import { CARGO_SERVICIO, localById, orgById } from '@/data/mock'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/misc'
import { DevNotice, Logo } from '@/components/common'

export const qrValue = (codigo: string) => `https://quehayporaca.app/t/${codigo}`

/** Plantilla HTML del mail de compra (misma en Mis entradas y /admin/notificaciones) */
export function MailBody({ ticket, evento, comprador, email }: { ticket: Ticket; evento: Evento; comprador: string; email: string }) {
  const l = useL()
  const lang = useSettings((s) => s.lang)
  const loc = localById(evento.localId)
  const org = orgById(evento.organizadorId)
  const total = Math.round(evento.precio * ticket.cantidad * (1 + CARGO_SERVICIO))
  return (
    <div className="bg-[#f4f4f5] px-3 py-5 text-[#09090b] sm:px-6">
      <div className="mx-auto max-w-[560px] overflow-hidden rounded-[14px] bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-[#7c3aed] px-5 py-4 text-white">
          <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-white/20">
            <svg viewBox="0 0 32 32" className="h-4 w-4" fill="none">
              <path d="M6 24V9l10 8.5L26 9v15" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[15px] font-extrabold tracking-tight">{BRAND}</span>
        </div>
        <div className="px-5 py-6 sm:px-8">
          <p className="text-[24px] font-extrabold tracking-tight">{l('¡Tu entrada está lista!', 'Your ticket is ready!')} 🎉</p>
          <p className="mt-1 text-[14px] text-[#52525b]">
            {l(`Hola ${comprador.split(' ')[0]}, gracias por tu compra. Mostrá este QR en la puerta.`, `Hi ${comprador.split(' ')[0]}, thanks for your purchase. Show this QR at the door.`)}
          </p>
          <div className="mt-5 flex flex-col items-center rounded-[14px] border border-dashed border-[#d4d4d8] p-5">
            <QRCodeSVG value={qrValue(ticket.codigo)} size={172} level="M" includeMargin={false} />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[#71717a]">{l('Código de compra', 'Purchase code')}</p>
            <p className="font-mono text-[22px] font-bold tracking-[0.12em]">{ticket.codigo}</p>
            <p className="mt-1 text-[12px] text-[#71717a]">
              {ticket.cantidad} {ticket.cantidad === 1 ? l('entrada', 'ticket') : l('entradas', 'tickets')}
            </p>
          </div>
          <div className="mt-5 space-y-2.5 text-[14px]">
            <p className="text-[17px] font-bold">{evento.titulo[lang]}</p>
            <p className="flex items-center gap-2 capitalize"><CalendarDays className="h-4 w-4 text-[#7c3aed]" />{fmtDateLong(evento.inicio, lang)}</p>
            <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#7c3aed]" /><span className="font-mono">{fmtTime(evento.inicio, lang)}</span> {l('hs · abren puertas 30 min antes', 'h · doors open 30 min earlier')}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#7c3aed]" />{loc.nombre} · {loc.direccion}, {loc.barrio}</p>
          </div>
          <div className="mt-5 rounded-[12px] bg-[#faf5ff] p-4 text-[13px] leading-relaxed">
            <p className="font-semibold">{l('Cómo ingresar', 'How to get in')}</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[#52525b]">
              <li>{l('Subí el brillo del celular al máximo.', 'Turn your phone brightness all the way up.')}</li>
              <li>{l('Mostrá el QR en la puerta: lo escanean y listo.', 'Show the QR at the door: they scan it and you’re in.')}</li>
              <li>{l('El QR es único: una vez usado no vuelve a entrar.', 'The QR is unique: once used it can’t be reused.')}</li>
            </ol>
          </div>
          <div className="mt-5 border-t border-[#e4e4e7] pt-4 text-[12.5px] text-[#52525b]">
            <p className="font-semibold text-[#09090b]">{l('Datos del comprador', 'Buyer details')}</p>
            <p className="mt-1">{comprador} · {email}</p>
            <p>
              {l('Total pagado', 'Total paid')}: <span className="font-mono font-semibold text-[#09090b]">{fmtARS(total, lang)}</span> · {l('Organiza', 'Organized by')} {org.nombre}
            </p>
          </div>
          <p className="mt-6 text-center text-[11px] text-[#a1a1aa]">
            {l('También tenés este QR guardado en la app, en “Mis entradas”.', 'You also have this QR saved in the app under “My tickets”.')}
          </p>
        </div>
      </div>
    </div>
  )
}

/** Marco de cliente de correo con toggle Escritorio / Celular */
export function MailClient(props: { ticket: Ticket; evento: Evento; comprador: string; email: string }) {
  const l = useL()
  const lang = useSettings((s) => s.lang)
  const [modo, setModo] = React.useState<'desktop' | 'mobile'>('desktop')
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <ToggleGroup type="single" value={modo} onValueChange={(v) => v && setModo(v as 'desktop' | 'mobile')}>
          <ToggleGroupItem value="desktop"><Monitor /> {l('Escritorio', 'Desktop')}</ToggleGroupItem>
          <ToggleGroupItem value="mobile"><Smartphone /> {l('Celular', 'Mobile')}</ToggleGroupItem>
        </ToggleGroup>
        <span className="text-xs text-muted">{l('Vista previa del mail real', 'Preview of the real email')}</span>
      </div>
      <div className={cn('mx-auto overflow-hidden rounded-[12px] border border-border bg-surface shadow-sm transition-all', modo === 'mobile' ? 'max-w-[360px]' : 'max-w-full')}>
        <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-3 py-2">
          <Mail className="h-4 w-4 text-muted" />
          <span className="text-[12px] font-semibold">{l('Bandeja de entrada', 'Inbox')}</span>
          <span className="ml-auto flex gap-2 text-muted">
            <Archive className="h-3.5 w-3.5" /><Trash2 className="h-3.5 w-3.5" /><Reply className="h-3.5 w-3.5" /><Star className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="border-b border-border px-4 py-3">
          <p className="text-[15px] font-semibold">
            <TicketIcon className="mr-1 inline h-4 w-4 text-accent" />
            {l('Tu entrada para', 'Your ticket for')} {props.evento.titulo[lang]}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[12px]">
            <Logo size="h-7 w-7" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{BRAND} <span className="font-normal text-muted">&lt;entradas@quehayporaca.app&gt;</span></p>
              <p className="truncate text-muted">{l('para', 'to')} {props.email}</p>
            </div>
          </div>
        </div>
        <div className="max-h-[52vh] overflow-y-auto">
          <MailBody {...props} />
        </div>
      </div>
    </div>
  )
}

export function MailDialog({
  open,
  onOpenChange,
  ...props
}: { open: boolean; onOpenChange: (v: boolean) => void; ticket: Ticket; evento: Evento; comprador: string; email: string }) {
  const l = useL()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px] p-4 sm:p-6">
        <DialogTitle className="pr-8">{l('Mail de compra', 'Purchase email')}</DialogTitle>
        <DevNotice
          className="my-3"
          funcion={['Envío por mail (SendGrid)', 'Email delivery (SendGrid)']}
          hoy={['Hoy mostramos el mail generado en pantalla.', 'Today we show the generated email on screen.']}
          real={['Al desarrollar, se envía por SendGrid apenas se aprueba el pago, con seguimiento de entregado y abierto.', 'Once built, it’s sent via SendGrid as soon as payment is approved, with delivered/opened tracking.']}
        />
        <MailClient {...props} />
      </DialogContent>
    </Dialog>
  )
}
