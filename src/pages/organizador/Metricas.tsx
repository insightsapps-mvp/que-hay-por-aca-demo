import * as React from 'react'
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3, DollarSign, Download, Percent, Star, Tag, Ticket as TicketIcon } from 'lucide-react'
import { toast } from 'sonner'
import { downloadCSV } from '@/lib/utils'
import { fmtARS, fmtDate, fmtDateTime, fmtNum, tk, tl, useL, useSettings, useT, type TKey } from '@/i18n'
import type { Categoria } from '@/types'
import { CARGO_SERVICIO, CATEGORIAS, serieDiaria, usuarioNombre } from '@/data/mock'
import { MY_ORG, useStore } from '@/store'
import { ChartTooltip, LiveDot, useChartColors, WebPage } from '@/layout/Page'
import { Kpi } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const COMISION = 0.08

export default function Metricas() {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const c = useChartColors()
  const eventos = useStore((s) => s.eventos)
  const tickets = useStore((s) => s.tickets)
  const transacciones = useStore((s) => s.transacciones)
  const [rango, setRango] = React.useState<'7' | '30' | '90'>('30')
  const [cat, setCat] = React.useState<'todas' | Categoria>('todas')
  const [zona, setZona] = React.useState<'todas' | 'caba' | 'oeste'>('todas')

  const mios = eventos.filter((e) => e.organizadorId === MY_ORG && (cat === 'todas' || e.categoria === cat) && (zona === 'todas' || e.zona === zona))
  const idsMios = new Set(mios.map((e) => e.id))
  const desde = Date.now() - Number(rango) * 86400000
  const filas = transacciones
    .map((tx) => {
      const tkt = tickets.find((k) => k.id === tx.ticketId)
      const ev = tkt ? eventos.find((e) => e.id === tkt.eventoId) : undefined
      return { tx, tkt, ev }
    })
    .filter((r) => r.ev && idsMios.has(r.ev.id) && r.tx.fecha.getTime() >= desde)
  const aprob = filas.filter((r) => r.tx.estado === 'aprobado')
  const entradas = aprob.reduce((a, r) => a + (r.tkt?.cantidad || 0), 0)
  const bruto = aprob.reduce((a, r) => a + r.tx.monto / (1 + CARGO_SERVICIO), 0)
  const neto = bruto * (1 - COMISION)
  const conVentas = mios.filter((e) => e.estado === 'publicado' || e.estado === 'finalizado')
  const ocup = conVentas.length ? conVentas.reduce((a, e) => a + e.vendidas / e.aforo, 0) / conVentas.length : 0
  const precioProm = conVentas.length ? conVentas.reduce((a, e) => a + e.precio, 0) / conVentas.length : 0
  const conRating = conVentas.filter((e) => e.rating > 0)
  const ratingProm = conRating.length ? conRating.reduce((a, e) => a + e.rating, 0) / conRating.length : 0

  const factor = (cat === 'todas' ? 1 : 0.45) * (zona === 'oeste' ? 0.3 : zona === 'caba' ? 0.8 : 1)
  const serie = React.useMemo(
    () =>
      serieDiaria(11 + (cat === 'todas' ? 0 : CATEGORIAS.indexOf(cat as Categoria) + 1) + (zona === 'oeste' ? 7 : 0), 42 * factor, Number(rango)).map((d) => ({
        ...d,
        label: fmtDate(d.fecha, lang),
      })),
    [cat, zona, rango, lang, factor]
  )
  const ocupData = conVentas
    .slice()
    .sort((a, b) => b.vendidas / b.aforo - a.vendidas / a.aforo)
    .slice(0, 8)
    .map((e) => ({ name: e.titulo[lang].length > 16 ? e.titulo[lang].slice(0, 15) + '…' : e.titulo[lang], ocupacion: Math.round((e.vendidas / e.aforo) * 100) }))

  const exportar = () => {
    const rows: (string | number)[][] = [
      [tl('Fecha', 'Date'), tl('ID transacción', 'Transaction ID'), tl('Evento', 'Event'), tl('Comprador', 'Buyer'), tl('Método', 'Method'), tl('Entradas', 'Tickets'), tl('Monto ARS', 'Amount ARS'), tl('Estado', 'Status')],
      ...filas.map((r) => [
        r.tx.fecha.toISOString().slice(0, 16).replace('T', ' '),
        r.tx.id,
        r.ev!.titulo[lang],
        usuarioNombre(r.tkt!.usuarioId),
        tk(`metodo.${r.tx.metodo}` as TKey),
        r.tkt!.cantidad,
        r.tx.monto,
        tk(`tx.${r.tx.estado}` as TKey),
      ]),
    ]
    downloadCSV(`ventas-nocturna-${rango}d.csv`, rows)
    toast.success(tl('CSV exportado', 'CSV exported'), { description: tl(`${filas.length} transacciones`, `${filas.length} transactions`) })
  }

  const ars = (n: number) => fmtARS(n, lang)

  return (
    <WebPage
      role="organizador"
      bannerId="org-metricas"
      title={l('Métricas', 'Metrics')}
      subtitle="Nocturna Producciones"
      actions={<LiveDot />}
      bullets={[
        ['Ventas, ingresos y ocupación en tiempo real, sin planillas.', 'Sales, revenue and occupancy in real time, no spreadsheets.'],
        ['Filtros por fecha, categoría y zona sobre datos reales.', 'Filters by date, category and zone over real data.'],
        ['Export a CSV para el contador o para cruzar con otras fuentes.', 'CSV export for your accountant or to cross-check with other sources.'],
      ]}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={rango} onValueChange={(v) => setRango(v as '7' | '30' | '90')}>
          <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">{l('Últimos 7 días', 'Last 7 days')}</SelectItem>
            <SelectItem value="30">{l('Últimos 30 días', 'Last 30 days')}</SelectItem>
            <SelectItem value="90">{l('Últimos 90 días', 'Last 90 days')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={(v) => setCat(v as 'todas' | Categoria)}>
          <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{l('Todas las categorías', 'All categories')}</SelectItem>
            {CATEGORIAS.map((k) => <SelectItem key={k} value={k}>{t(`cat.${k}` as TKey)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={zona} onValueChange={(v) => setZona(v as 'todas' | 'caba' | 'oeste')}>
          <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{l('Todas las zonas', 'All zones')}</SelectItem>
            <SelectItem value="caba">CABA</SelectItem>
            <SelectItem value="oeste">{l('Zona oeste', 'West zone')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label={l('Ventas del mes', 'Monthly sales')} value={fmtNum(entradas, lang)} delta={12} sub={l('entradas', 'tickets')} icon={TicketIcon} />
        <Kpi label={l('Ingresos netos', 'Net revenue')} value={ars(neto)} delta={9} sub={l('después de comisión', 'after fees')} icon={DollarSign} />
        <Kpi label={l('Ocupación promedio', 'Avg. occupancy')} value={`${Math.round(ocup * 100)}%`} delta={4} icon={Percent} />
        <Kpi label={l('Precio promedio', 'Avg. price')} value={ars(precioProm)} delta={-2} icon={Tag} />
        <Kpi label={l('Rating promedio', 'Avg. rating')} value={fmtNum(ratingProm || 0, lang, 1)} sub="★" icon={Star} className="col-span-2 lg:col-span-1" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold">{l('Ventas diarias', 'Daily sales')}</p>
              <p className="text-xs text-muted">{l('Entradas por día y acumulado del período', 'Tickets per day and period cumulative')}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 rounded" style={{ background: c.accent }} />{l('Diarias', 'Daily')}</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm opacity-30" style={{ background: c.accent }} />{l('Acumulado', 'Cumulative')}</span>
            </div>
          </div>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={serie} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gAcum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.accent} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={c.grid} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: c.muted }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                <YAxis yAxisId="d" tick={{ fontSize: 11, fill: c.muted, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="a" orientation="right" hide />
                <Tooltip content={<ChartTooltip fmt={(v) => fmtNum(v, lang)} />} />
                <Area yAxisId="a" type="monotone" dataKey="acumulado" name={l('Acumulado', 'Cumulative')} stroke="none" fill="url(#gAcum)" />
                <Line yAxisId="d" type="monotone" dataKey="ventas" name={l('Diarias', 'Daily')} stroke={c.accent} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-[15px] font-semibold">{l('Ocupación por evento', 'Occupancy by event')}</p>
          <p className="text-xs text-muted">{l('% del aforo vendido', '% of capacity sold')}</p>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ocupData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke={c.grid} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false} unit="%" />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: c.muted }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip fmt={(v) => `${v}%`} />} cursor={{ fill: c.grid, opacity: 0.4 }} />
                <Bar dataKey="ocupacion" name={l('Ocupación', 'Occupancy')} fill={c.accent} radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3">
          <div>
            <p className="text-[15px] font-semibold">{l('Transacciones', 'Transactions')}</p>
            <p className="text-xs text-muted">{l(`${filas.length} en el período filtrado`, `${filas.length} in the filtered period`)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportar} disabled={!filas.length}>
            <Download /> {l('Exportar CSV', 'Export CSV')}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{l('Fecha', 'Date')}</TableHead>
              <TableHead>{l('Evento', 'Event')}</TableHead>
              <TableHead>{l('Comprador', 'Buyer')}</TableHead>
              <TableHead>{l('Método', 'Method')}</TableHead>
              <TableHead className="text-right">{l('Entradas', 'Tickets')}</TableHead>
              <TableHead className="text-right">{l('Monto', 'Amount')}</TableHead>
              <TableHead>{l('Estado', 'Status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.slice(0, 12).map(({ tx, tkt, ev }) => (
              <TableRow key={tx.id}>
                <TableCell className="text-muted">{fmtDateTime(tx.fecha, lang)}</TableCell>
                <TableCell className="max-w-[200px] truncate font-medium">{ev!.titulo[lang]}</TableCell>
                <TableCell>{usuarioNombre(tkt!.usuarioId)}</TableCell>
                <TableCell className="text-muted">{t(`metodo.${tx.metodo}` as TKey)}</TableCell>
                <TableCell className="num text-right">{tkt!.cantidad}</TableCell>
                <TableCell className="num text-right">{ars(tx.monto)}</TableCell>
                <TableCell>
                  <Badge variant={tx.estado === 'aprobado' ? 'green' : tx.estado === 'rechazado' ? 'red' : 'zinc'}>{t(`tx.${tx.estado}` as TKey)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filas.length > 12 && (
          <p className="border-t border-border px-5 py-3 text-xs text-muted">
            {l(`Mostrando 12 de ${filas.length}. El CSV incluye todas.`, `Showing 12 of ${filas.length}. The CSV includes all of them.`)}
          </p>
        )}
        {!filas.length && (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted">
            <BarChart3 className="h-5 w-5" />
            {l('No hay transacciones con estos filtros.', 'No transactions with these filters.')}
          </div>
        )}
      </div>
    </WebPage>
  )
}
