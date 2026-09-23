import * as React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, CalendarDays, Download, Mail, MapPin, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { fmtDateLong, fmtDateTime, tl, useL, useSettings } from '@/i18n'
import { CARGO_SERVICIO, localById, orgById } from '@/data/mock'
import { useStore } from '@/store'
import { DevNotice } from '@/components/common'
import { AppBar, DeviceScroll, UserTabBar } from '@/components/DeviceFrame'
import { MailDialog, qrValue } from '@/components/MailPreview'
import { DevicePage, useFmt } from './shared'
import { TicketEstadoBadge } from './Entradas'

const SENDGRID = {
  funcion: ['Envío por mail (SendGrid)', 'Email delivery (SendGrid)'] as [string, string],
  hoy: ['Hoy el mail se genera y se muestra en pantalla.', 'Today the email is generated and shown on screen.'] as [string, string],
  real: ['Al desarrollar, sale por SendGrid al aprobarse el pago y se registra si se entregó y se abrió.', 'Once built, it goes out via SendGrid when payment is approved, tracking delivery and opens.'] as [string, string],
}

export default function TicketDetalle() {
  const { ticketId = 'tk-001' } = useParams()
  const [params, setParams] = useSearchParams()
  const l = useL()
  const lang = useSettings((s) => s.lang)
  const f = useFmt()
  const navigate = useNavigate()
  const tk = useStore((s) => s.tickets.find((t) => t.id === ticketId))
  const ev = useStore((s) => s.eventos.find((e) => e.id === tk?.eventoId))
  const [mail, setMail] = React.useState(params.get('mail') === '1')

  React.useEffect(() => {
    if (params.get('mail') === '1') setMail(true)
  }, [params])
  const onMail = React.useCallback(
    (v: boolean) => {
      setMail(v)
      if (!v && params.get('mail')) {
        params.delete('mail')
        setParams(params, { replace: true })
      }
    },
    [params, setParams]
  )

  if (!tk || !ev) {
    return (
      <DevicePage bannerId="ticket" title={l('Entrada no encontrada', 'Ticket not found')} bullets={[]} tabBar={<UserTabBar />}>
        <div className="p-6 text-center text-sm text-muted">{l('No encontramos esta entrada.', 'We couldn’t find this ticket.')}</div>
      </DevicePage>
    )
  }
  const loc = localById(ev.localId)
  const org = orgById(ev.organizadorId)
  const total = Math.round(ev.precio * tk.cantidad * (1 + CARGO_SERVICIO))

  return (
    <DevicePage
      bannerId="ticket"
      title={l('Mi entrada', 'My ticket')}
      subtitle={ev.titulo[lang]}
      bullets={[
        ['QR único por compra, imposible de duplicar.', 'Unique QR per purchase, impossible to duplicate.'],
        ['El mismo QR llega por mail y queda guardado en la app.', 'The same QR arrives by email and is stored in the app.'],
        ['Recibo descargable en PDF para cada compra.', 'Downloadable PDF receipt for every purchase.'],
      ]}
      side={<DevNotice {...SENDGRID} />}
      tabBar={<UserTabBar />}
    >
      <AppBar
        title={l('Mi entrada', 'My ticket')}
        left={
          <button onClick={() => navigate('/app/entradas')} className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2" aria-label={l('Volver', 'Back')}>
            <ArrowLeft className="h-4 w-4" />
          </button>
        }
      />
      <DeviceScroll>
        <div className="px-4 pb-6 pt-4">
          <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
            <div className="px-4 pb-3 pt-4 text-white" style={{ background: ev.fotos[0] }}>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10.5px] font-semibold">{org.nombre}</span>
                <TicketEstadoBadge estado={tk.estado} />
              </div>
              <p className="mt-2 text-[19px] font-bold leading-tight">{ev.titulo[lang]}</p>
              <p className="text-[12px] opacity-90">{loc.nombre}</p>
            </div>
            <div className="relative border-t-2 border-dashed border-border">
              <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full border border-border bg-bg" />
              <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full border border-border bg-bg" />
            </div>
            <div className="flex flex-col items-center px-4 pb-4 pt-5">
              <div className={cn('rounded-[14px] bg-white p-3 shadow-sm', tk.estado !== 'valida' && 'opacity-40 grayscale')}>
                <QRCodeSVG value={qrValue(tk.codigo)} size={210} level="M" />
              </div>
              <p className="num mt-3 text-[22px] tracking-[0.14em]">{tk.codigo}</p>
              <p className="text-[12px] text-muted">
                {tk.cantidad} {tk.cantidad === 1 ? l('entrada', 'ticket') : l('entradas', 'tickets')} · {f.ars(total)}
              </p>
              {tk.estado === 'valida' && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11.5px] font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  <Sun className="h-3.5 w-3.5" />
                  {l('Subí el brillo al máximo para escanear', 'Turn brightness all the way up to scan')}
                </p>
              )}
            </div>
            <div className="space-y-2 border-t border-border px-4 py-3 text-[12.5px]">
              <p className="flex items-center gap-2 capitalize"><CalendarDays className="h-4 w-4 text-accent" />{fmtDateLong(ev.inicio, lang)} · <span className="num">{f.time(ev.inicio)}</span></p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" />{loc.direccion}, {loc.barrio}</p>
              <p className="text-[11.5px] text-muted">{l('Comprada el', 'Purchased on')} {fmtDateTime(tk.compradoEn, lang)}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              onClick={() => onMail(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-accent text-[14px] font-semibold text-white"
            >
              <Mail className="h-4 w-4" />
              {l('Ver el mail de compra', 'See the purchase email')}
            </button>
            <button
              onClick={() => toast.success(tl('Recibo descargado', 'Receipt downloaded'), { description: `recibo-${tk.codigo}.pdf` })}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-border text-[14px] font-semibold hover:bg-surface-2"
            >
              <Download className="h-4 w-4" />
              {l('Descargar recibo', 'Download receipt')}
            </button>
          </div>
          <DevNotice {...SENDGRID} className="mt-4 xl:hidden" />
        </div>
      </DeviceScroll>
      <MailDialog open={mail} onOpenChange={onMail} ticket={tk} evento={ev} comprador="Martina Gómez" email="martina.gomez@gmail.com" />
    </DevicePage>
  )
}
