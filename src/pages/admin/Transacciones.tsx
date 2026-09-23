import * as React from 'react'
import { Check, CreditCard, Download, Mail, QrCode, RotateCcw, Search, Webhook, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn, downloadCSV } from '@/lib/utils'
import { fmtARS, fmtDateTime, fmtTime, tk, tl, useL, useSettings, useT, type TKey } from '@/i18n'
import type { MetodoPago, Transaccion } from '@/types'
import { usuarioNombre } from '@/data/mock'
import { useStore } from '@/store'
import { WebPage } from '@/layout/Page'
import { DevNotice } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const REFUND_NOTICE = {
  funcion: ['Devoluciones', 'Refunds'] as [string, string],
  hoy: ['Hoy la devolución cambia el estado en la demo.', 'Today the refund changes the status in the demo.'] as [string, string],
  real: ['Al desarrollar, se ejecuta el reembolso en Mercado Pago, se anula el QR y se avisa al comprador por mail.', 'Once built, the refund runs in Mercado Pago, the QR is voided and the buyer is emailed.'] as [string, string],
}

export default function Transacciones() {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const transacciones = useStore((s) => s.transacciones)
  const tickets = useStore((s) => s.tickets)
  const eventos = useStore((s) => s.eventos)
  const devolver = useStore((s) => s.devolver)
  const [periodo, setPeriodo] = React.useState<'7' | '30' | 'todo'>('30')
  const [metodo, setMetodo] = React.useState<'todos' | MetodoPago>('todos')
  const [q, setQ] = React.useState('')
  const [sel, setSel] = React.useState<Transaccion | null>(null)
  const [confirm, setConfirm] = React.useState<Transaccion | null>(null)

  const rows = transacciones
    .map((tx) => {
      const tkt = tickets.find((k) => k.id === tx.ticketId)
      const ev = eventos.find((e) => e.id === tkt?.eventoId) ?? eventos.find((e) => e.id === 'ev-01')!
      const comprador = tkt ? usuarioNombre(tkt.usuarioId) : 'Martina Gómez'
      return { tx, tkt, ev, comprador }
    })
    .filter((r) => periodo === 'todo' || r.tx.fecha.getTime() >= Date.now() - Number(periodo) * 86400000)
    .filter((r) => metodo === 'todos' || r.tx.metodo === metodo)
    .filter((r) => !q || `${r.comprador} ${r.ev.titulo[lang]} ${r.tx.id}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(!!b.tx.devolucionPedida) - Number(!!a.tx.devolucionPedida) || b.tx.fecha.getTime() - a.tx.fecha.getTime())

  const selRow = sel ? rows.find((r) => r.tx.id === sel.id) ?? null : null
  const selTx = selRow ? transacciones.find((x) => x.id === selRow.tx.id)! : null

  const exportar = () => {
    downloadCSV(`transacciones-${periodo}.csv`, [
      [tl('Fecha', 'Date'), 'ID', tl('Comprador', 'Buyer'), tl('Evento', 'Event'), tl('Método', 'Method'), tl('Monto ARS', 'Amount ARS'), tl('Estado', 'Status')],
      ...rows.map((r) => [r.tx.fecha.toISOString().slice(0, 16).replace('T', ' '), r.tx.id, r.comprador, r.ev.titulo[lang], tk(`metodo.${r.tx.metodo}` as TKey), r.tx.monto, tk(`tx.${r.tx.estado}` as TKey)]),
    ])
    toast.success(tl('CSV exportado', 'CSV exported'), { description: tl(`${rows.length} transacciones`, `${rows.length} transactions`) })
  }

  const badge = (tx: Transaccion) => (
    <span className="inline-flex items-center gap-1">
      <Badge variant={tx.estado === 'aprobado' ? 'green' : tx.estado === 'rechazado' ? 'red' : 'zinc'}>{t(`tx.${tx.estado}` as TKey)}</Badge>
      {tx.devolucionPedida && <Badge variant="amber">{l('Pide devolución', 'Refund requested')}</Badge>}
    </span>
  )

  const timeline = (tx: Transaccion) => {
    const base = tx.fecha.getTime()
    const step = (s: number) => new Date(base + s * 1000)
    if (tx.estado === 'rechazado')
      return [
        { icon: CreditCard, es: 'Orden creada en Mercado Pago', en: 'Order created in Mercado Pago', at: step(0), ok: true },
        { icon: Webhook, es: 'Webhook recibido: rechazado', en: 'Webhook received: declined', at: step(3), ok: false, sub: tx.motivo ? tl(tx.motivo, 'Insufficient funds') : undefined },
      ]
    const items = [
      { icon: CreditCard, es: 'Orden creada', en: 'Order created', at: step(0), ok: true },
      { icon: Webhook, es: 'Webhook recibido: aprobado', en: 'Webhook received: approved', at: step(2), ok: true },
      { icon: QrCode, es: 'QR generado', en: 'QR generated', at: step(3), ok: true },
      { icon: Mail, es: 'Mail enviado', en: 'Email sent', at: step(5), ok: true },
    ]
    if (tx.estado === 'devuelto') items.push({ icon: RotateCcw, es: 'Devolución realizada', en: 'Refund completed', at: new Date(), ok: true })
    return items
  }

  return (
    <WebPage
      role="admin"
      bannerId="admin-tx"
      title={l('Transacciones', 'Transactions')}
      subtitle={l(`${rows.length} en el período`, `${rows.length} in the period`)}
      actions={
        <Button variant="outline" size="sm" onClick={exportar}>
          <Download /> {l('Exportar CSV', 'Export CSV')}
        </Button>
      }
      bullets={[
        ['Cada pago de Mercado Pago con su trazabilidad completa.', 'Every Mercado Pago payment with full traceability.'],
        ['Devoluciones con un click, con reembolso y QR anulado.', 'One-click refunds, with reimbursement and voided QR.'],
        ['Conciliación exportable para contabilidad.', 'Exportable reconciliation for accounting.'],
      ]}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={l('Buscar comprador o evento…', 'Search buyer or event…')} className="h-9 pl-9" />
        </div>
        <Select value={periodo} onValueChange={(v) => setPeriodo(v as typeof periodo)}>
          <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">{l('Últimos 7 días', 'Last 7 days')}</SelectItem>
            <SelectItem value="30">{l('Últimos 30 días', 'Last 30 days')}</SelectItem>
            <SelectItem value="todo">{l('Todo', 'All time')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={metodo} onValueChange={(v) => setMetodo(v as typeof metodo)}>
          <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{l('Todos los métodos', 'All methods')}</SelectItem>
            <SelectItem value="tarjeta">{t('metodo.tarjeta')}</SelectItem>
            <SelectItem value="transferencia">{t('metodo.transferencia')}</SelectItem>
            <SelectItem value="billetera">{t('metodo.billetera')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{l('Fecha', 'Date')}</TableHead>
              <TableHead>{l('Comprador', 'Buyer')}</TableHead>
              <TableHead>{l('Evento', 'Event')}</TableHead>
              <TableHead>{l('Método', 'Method')}</TableHead>
              <TableHead className="text-right">{l('Monto', 'Amount')}</TableHead>
              <TableHead>{l('Estado', 'Status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 60).map((r) => (
              <TableRow key={r.tx.id} className={cn('cursor-pointer', r.tx.devolucionPedida && 'bg-amber-50/60 dark:bg-amber-500/5')} onClick={() => setSel(r.tx)}>
                <TableCell className="text-muted">{fmtDateTime(r.tx.fecha, lang)}</TableCell>
                <TableCell className="font-medium">{r.comprador}</TableCell>
                <TableCell className="max-w-[220px] truncate">{r.ev.titulo[lang]}</TableCell>
                <TableCell className="text-muted">{t(`metodo.${r.tx.metodo}` as TKey)}</TableCell>
                <TableCell className="num text-right">{fmtARS(r.tx.monto, lang)}</TableCell>
                <TableCell>{badge(r.tx)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length > 60 && <p className="border-t border-border px-5 py-3 text-xs text-muted">{l(`Mostrando 60 de ${rows.length}. El CSV incluye todas.`, `Showing 60 of ${rows.length}. The CSV includes all.`)}</p>}
      </div>

      <Sheet open={!!selRow} onOpenChange={(v) => !v && setSel(null)}>
        <SheetContent side="right" className="p-0">
          {selRow && selTx && (
            <>
              <SheetHeader className="border-b border-border">
                <p className="num text-xs text-muted">{selTx.id}</p>
                <SheetTitle className="pr-8">{selRow.ev.titulo[lang]}</SheetTitle>
                <div>{badge(selTx)}</div>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="kicker">{l('Comprador', 'Buyer')}</p><p className="mt-0.5 font-medium">{selRow.comprador}</p></div>
                  <div><p className="kicker">{l('Monto', 'Amount')}</p><p className="num mt-0.5 text-[18px]">{fmtARS(selTx.monto, lang)}</p></div>
                  <div><p className="kicker">{l('Método', 'Method')}</p><p className="mt-0.5">{t(`metodo.${selTx.metodo}` as TKey)}</p></div>
                  <div><p className="kicker">{l('Entradas', 'Tickets')}</p><p className="num mt-0.5">{selRow.tkt?.cantidad ?? '—'} · {selRow.tkt?.codigo ?? '—'}</p></div>
                </div>
                <div>
                  <p className="kicker mb-3">{l('Timeline del pago', 'Payment timeline')}</p>
                  <ol className="relative space-y-4 border-l border-border pl-5">
                    {timeline(selTx).map((s, i) => (
                      <li key={i} className="relative">
                        <span className={cn('absolute -left-[31px] grid h-5 w-5 place-items-center rounded-full text-white', s.ok ? 'bg-success' : 'bg-danger')}>
                          {s.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </span>
                        <p className="flex items-center gap-1.5 text-sm font-medium"><s.icon className="h-3.5 w-3.5 text-muted" />{l(s.es, s.en)}</p>
                        <p className="num text-xs text-muted">{fmtTime(s.at, lang)}:{String(s.at.getSeconds()).padStart(2, '0')}</p>
                        {'sub' in s && s.sub && <p className="text-xs text-danger">{s.sub}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
                {selTx.estado === 'aprobado' && (
                  <div className="space-y-3">
                    <DevNotice {...REFUND_NOTICE} />
                    <Button variant="outline" className="w-full border-danger/40 text-danger hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => setConfirm(selTx)}>
                      <RotateCcw /> {l('Devolver', 'Refund')} {fmtARS(selTx.monto, lang)}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{l('¿Confirmás la devolución?', 'Confirm the refund?')}</DialogTitle>
            <DialogDescription>
              {confirm && fmtARS(confirm.monto, lang)} · {l('el QR queda anulado y el comprador recibe un mail.', 'the QR is voided and the buyer gets an email.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>{l('Cancelar', 'Cancel')}</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!confirm) return
                devolver(confirm.id)
                toast.success(tl('Devolución realizada', 'Refund completed'), { description: tl('Estado: Devuelto', 'Status: Refunded') })
                setConfirm(null)
              }}
            >
              {l('Sí, devolver', 'Yes, refund')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WebPage>
  )
}
