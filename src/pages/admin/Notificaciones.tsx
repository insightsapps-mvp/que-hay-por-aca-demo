import * as React from 'react'
import { Bell, MailCheck, MailOpen, MailX, Send } from 'lucide-react'
import { toast } from 'sonner'
import { fmtDateTime, tl, useL, useSettings, useT, type TKey } from '@/i18n'
import { useStore } from '@/store'
import { WebPage } from '@/layout/Page'
import { DevNotice, Kpi } from '@/components/common'
import { MailClient } from '@/components/MailPreview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function Notificaciones() {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const mails = useStore((s) => s.mails)
  const eventos = useStore((s) => s.eventos)
  const tickets = useStore((s) => s.tickets)
  const muestra = tickets.find((k) => k.id === 'tk-001')!
  const evMuestra = eventos.find((e) => e.id === muestra.eventoId)!
  const abiertos = mails.filter((m) => m.estado === 'abierto').length
  const rebotados = mails.filter((m) => m.estado === 'rebotado').length

  return (
    <WebPage
      role="admin"
      bannerId="admin-notif"
      title={l('Notificaciones por mail', 'Email notifications')}
      subtitle={l('Cada compra aprobada dispara el mail con el QR', 'Every approved purchase triggers the QR email')}
      bullets={[
        ['Mail automático con QR, código y datos del evento al aprobarse el pago.', 'Automatic email with QR, code and event details when payment is approved.'],
        ['Seguimiento de entregados, abiertos y rebotados.', 'Tracking of delivered, opened and bounced emails.'],
        ['Push de recordatorio antes del evento y avisos de cambios.', 'Reminder push before the event and change notices.'],
      ]}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DevNotice
          funcion={['Envío por mail (SendGrid)', 'Email delivery (SendGrid)']}
          hoy={['Hoy el log y los estados son de ejemplo.', 'Today the log and statuses are sample data.']}
          real={['Al desarrollar, cada mail sale por SendGrid y sus eventos (entregado, abierto, rebote) llegan por webhook.', 'Once built, each email goes out via SendGrid and its events (delivered, opened, bounced) arrive via webhook.']}
        />
        <DevNotice
          funcion={['Notificaciones push', 'Push notifications']}
          hoy={['Hoy los push no se envían.', 'Today pushes are not sent.']}
          real={['Al desarrollar, la app manda push en iOS y Android: recordatorio 3 h antes, cambios de horario y respuestas a reseñas.', 'Once built, the app sends iOS and Android pushes: 3 h reminders, schedule changes and review replies.']}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={l('Enviados', 'Sent')} value={mails.length} icon={Send} />
        <Kpi label={l('Entregados', 'Delivered')} value={mails.length - rebotados} icon={MailCheck} sub={`${Math.round(((mails.length - rebotados) / mails.length) * 100)}%`} />
        <Kpi label={l('Abiertos', 'Opened')} value={abiertos} icon={MailOpen} sub={`${Math.round((abiertos / mails.length) * 100)}%`} />
        <Kpi label={l('Rebotados', 'Bounced')} value={rebotados} icon={MailX} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="card">
          <div className="flex items-center justify-between p-5 pb-3">
            <p className="text-[15px] font-semibold">{l('Log de mails enviados', 'Sent email log')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(tl('Mail de prueba enviado', 'Test email sent'), { description: 'sebastian@quehayporaca.app' })}
            >
              <Bell /> {l('Enviar prueba', 'Send test')}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{l('Destinatario', 'Recipient')}</TableHead>
                <TableHead>{l('Evento', 'Event')}</TableHead>
                <TableHead>{l('Estado', 'Status')}</TableHead>
                <TableHead>{l('Hora', 'Time')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mails.slice(0, 25).map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="max-w-[180px] truncate">{m.destinatario}</TableCell>
                  <TableCell className="max-w-[160px] truncate text-muted">{eventos.find((e) => e.id === m.eventoId)?.titulo[lang]}</TableCell>
                  <TableCell>
                    <Badge variant={m.estado === 'abierto' ? 'soft' : m.estado === 'entregado' ? 'green' : 'red'}>{t(`mail.${m.estado}` as TKey)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted">{fmtDateTime(m.hora, lang)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="card p-5">
          <p className="mb-3 text-[15px] font-semibold">{l('Plantilla del mail de compra', 'Purchase email template')}</p>
          <MailClient ticket={muestra} evento={evMuestra} comprador="Martina Gómez" email="martina.gomez@gmail.com" />
        </div>
      </div>
    </WebPage>
  )
}
