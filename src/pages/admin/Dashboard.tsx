import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CircleMarker, Tooltip as LTooltip } from 'react-leaflet'
import { AlertTriangle, ArrowRight, CalendarDays, DollarSign, Percent, RotateCcw, ShieldCheck, Ticket as TicketIcon, Users } from 'lucide-react'
import { fmtARS, fmtDate, fmtNum, useL, useSettings, useT, type TKey } from '@/i18n'
import { CARGO_SERVICIO, CATEGORIAS, hoyMas, orgById } from '@/data/mock'
import { useStore } from '@/store'
import { ChartTooltip, LiveDot, useChartColors, WebPage } from '@/layout/Page'
import { EventoFoto, Kpi } from '@/components/common'
import { MapBase } from '@/components/MapBase'

const COMISION = 0.08

function compactARS(n: number, lang: 'es' | 'en') {
  if (n >= 1_000_000) return `$ ${fmtNum(n / 1_000_000, lang, 1)} M`
  if (n >= 1000) return `$ ${fmtNum(n / 1000, lang, 0)} k`
  return fmtARS(n, lang)
}

export default function Dashboard() {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const c = useChartColors()
  const navigate = useNavigate()
  const eventos = useStore((s) => s.eventos)
  const tickets = useStore((s) => s.tickets)
  const transacciones = useStore((s) => s.transacciones)
  const usuarios = useStore((s) => s.usuarios)

  const now = Date.now()
  const desde = now - 30 * 86400000
  const aprob = transacciones.filter((tx) => tx.estado === 'aprobado' && tx.fecha.getTime() >= desde)
  const tkById = React.useMemo(() => new Map(tickets.map((k) => [k.id, k])), [tickets])
  const evById = React.useMemo(() => new Map(eventos.map((e) => [e.id, e])), [eventos])
  const gmv = aprob.reduce((a, tx) => a + tx.monto / (1 + CARGO_SERVICIO), 0)
  const comision = gmv * COMISION
  const entradas = aprob.reduce((a, tx) => a + (tkById.get(tx.ticketId)?.cantidad || 0), 0)
  const activos = eventos.filter((e) => e.estado === 'publicado' && e.fin.getTime() > now)
  const pendientes = eventos.filter((e) => e.estado === 'pendiente')
  const devoluciones = transacciones.filter((tx) => tx.devolucionPedida)
  const casiLlenos = activos.filter((e) => e.vendidas / e.aforo >= 0.95)

  const serie = Array.from({ length: 30 }, (_, i) => {
    const d = hoyMas(-(29 - i), 0)
    const next = d.getTime() + 86400000
    const v = aprob.filter((tx) => tx.fecha.getTime() >= d.getTime() && tx.fecha.getTime() < next).reduce((a, tx) => a + tx.monto / (1 + CARGO_SERVICIO), 0)
    return { label: fmtDate(d, lang), gmv: Math.round(v) }
  })
  const porCat = CATEGORIAS.map((k) => ({
    name: t(`cat.${k}` as TKey),
    gmv: Math.round(aprob.filter((tx) => evById.get(tkById.get(tx.ticketId)?.eventoId || '')?.categoria === k).reduce((a, tx) => a + tx.monto / (1 + CARGO_SERVICIO), 0)),
  }))
  const gmvEv = new Map<string, number>()
  const gmvOrg = new Map<string, number>()
  aprob.forEach((tx) => {
    const ev = evById.get(tkById.get(tx.ticketId)?.eventoId || '')
    if (!ev) return
    const v = tx.monto / (1 + CARGO_SERVICIO)
    gmvEv.set(ev.id, (gmvEv.get(ev.id) || 0) + v)
    gmvOrg.set(ev.organizadorId, (gmvOrg.get(ev.organizadorId) || 0) + v)
  })
  const topEv = [...gmvEv.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topOrg = [...gmvOrg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const caba = activos.filter((e) => e.zona === 'caba').length
  const oeste = activos.filter((e) => e.zona === 'oeste').length

  const alertas = [
    ...(pendientes.length
      ? [{ icon: ShieldCheck, tone: 'amber', txt: l(`${pendientes.length} eventos pendientes de aprobación`, `${pendientes.length} events pending approval`), cta: l('Revisar', 'Review'), to: '/admin/aprobacion' }]
      : []),
    ...(devoluciones.length
      ? [{ icon: RotateCcw, tone: 'red', txt: l(`${devoluciones.length} pedido de devolución`, `${devoluciones.length} refund request`), cta: l('Ver', 'View'), to: '/admin/transacciones' }]
      : []),
    ...casiLlenos.map((e) => ({
      icon: AlertTriangle,
      tone: 'blue',
      txt: l(`Evento '${e.titulo.es}' al ${Math.round((e.vendidas / e.aforo) * 100)}% de aforo`, `Event '${e.titulo.en}' at ${Math.round((e.vendidas / e.aforo) * 100)}% capacity`),
      cta: l('Ver evento', 'View event'),
      to: `/app/evento/${e.id}`,
    })),
  ]
  const tone: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  }

  return (
    <WebPage
      role="admin"
      bannerId="admin-dashboard"
      title={l('Dashboard global', 'Global dashboard')}
      subtitle={l('Toda la plataforma en una pantalla', 'The whole platform on one screen')}
      actions={<LiveDot />}
      bullets={[
        ['GMV, comisión y ventas de toda la plataforma en tiempo real.', 'Platform-wide GMV, fees and sales in real time.'],
        ['Alertas accionables: aprobaciones, devoluciones y eventos por agotarse.', 'Actionable alerts: approvals, refunds and events about to sell out.'],
        ['Comparativo por zona, categoría y organizador.', 'Comparison by zone, category and organizer.'],
      ]}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label={l('Eventos activos', 'Active events')} value={activos.length} icon={CalendarDays} delta={6} />
        <Kpi label={l('Usuarios activos', 'Active users')} value={fmtNum(usuarios.length, lang)} icon={Users} delta={14} />
        <Kpi label={l('Entradas vendidas (mes)', 'Tickets sold (month)')} value={fmtNum(entradas, lang)} icon={TicketIcon} delta={18} />
        <Kpi label={l('GMV del mes', 'Monthly GMV')} value={compactARS(gmv, lang)} icon={DollarSign} delta={21} sub="ARS" />
        <Kpi label={l('Comisión plataforma (8%)', 'Platform fee (8%)')} value={compactARS(comision, lang)} icon={Percent} delta={21} sub="ARS" className="col-span-2 lg:col-span-1" />
      </div>

      {alertas.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-3">
          {alertas.map((a, i) => (
            <button key={i} onClick={() => navigate(a.to)} className="card flex items-center gap-3 p-3 text-left transition-shadow hover:shadow-md">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${tone[a.tone]}`}>
                <a.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 text-[13px] font-medium">{a.txt}</span>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accent">
                {a.cta} <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <p className="text-[15px] font-semibold">{l('GMV últimos 30 días', 'GMV last 30 days')}</p>
          <p className="text-xs text-muted">{l('Ventas brutas de entradas (ARS)', 'Gross ticket sales (ARS)')}</p>
          <div className="mt-3 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serie} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.accent} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={c.grid} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: c.muted }} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis tick={{ fontSize: 10, fill: c.muted, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => compactARS(v, lang)} width={64} />
                <Tooltip content={<ChartTooltip fmt={(v) => fmtARS(v, lang)} />} />
                <Area type="monotone" dataKey="gmv" name="GMV" stroke={c.accent} strokeWidth={2} fill="url(#gGmv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-[15px] font-semibold">{l('GMV por categoría', 'GMV by category')}</p>
          <div className="mt-3 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porCat} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={c.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: c.muted }} tickLine={false} axisLine={false} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: c.muted, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => compactARS(v, lang)} width={56} />
                <Tooltip content={<ChartTooltip fmt={(v) => fmtARS(v, lang)} />} cursor={{ fill: c.grid, opacity: 0.4 }} />
                <Bar dataKey="gmv" name="GMV" fill={c.accent} radius={[6, 6, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <p className="text-[15px] font-semibold">{l('Top 5 eventos', 'Top 5 events')}</p>
          <div className="mt-3 space-y-2.5">
            {topEv.map(([id, v], i) => {
              const ev = evById.get(id)!
              return (
                <button key={id} onClick={() => navigate(`/app/evento/${id}`)} className="flex w-full items-center gap-3 rounded-[8px] text-left hover:bg-surface-2">
                  <span className="num w-4 text-xs text-muted">{i + 1}</span>
                  <EventoFoto foto={ev.fotos[0]} cat={ev.categoria} className="h-8 w-8 shrink-0 rounded-[6px]" iconSize="h-3 w-3" />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{ev.titulo[lang]}</span>
                  <span className="num text-[12.5px]">{compactARS(v, lang)}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="card p-5">
          <p className="text-[15px] font-semibold">{l('Top 5 organizadores', 'Top 5 organizers')}</p>
          <div className="mt-3 space-y-2.5">
            {topOrg.map(([id, v], i) => {
              const max = topOrg[0][1]
              return (
                <div key={id}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium"><span className="num mr-2 text-xs text-muted">{i + 1}</span>{orgById(id).nombre}</span>
                    <span className="num text-[12.5px]">{compactARS(v, lang)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-[#1d4ed8]" style={{ width: `${(v / max) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="p-5 pb-3">
            <p className="text-[15px] font-semibold">{l('Eventos activos por zona', 'Active events by zone')}</p>
            <div className="mt-2 flex gap-4 text-sm">
              <span><span className="num text-[20px] font-bold">{caba}</span> <span className="text-muted">CABA</span></span>
              <span><span className="num text-[20px] font-bold">{oeste}</span> <span className="text-muted">{l('Zona oeste', 'West zone')}</span></span>
            </div>
          </div>
          <div style={{ height: 180 }}>
            <MapBase center={[-34.625, -58.5]} zoom={10} style={{ height: 180 }} zoomControl={false} scrollWheelZoom={false} dragging={false} doubleClickZoom={false}>
              <CircleMarker center={[-34.605, -58.41]} radius={10 + caba * 1.3} pathOptions={{ color: c.accent, weight: 2, fillColor: c.accent, fillOpacity: 0.25 }}>
                <LTooltip permanent direction="center" className="!border-0 !bg-transparent !shadow-none !font-mono !text-[13px] !font-bold">{caba}</LTooltip>
              </CircleMarker>
              <CircleMarker center={[-34.648, -58.605]} radius={10 + oeste * 1.3} pathOptions={{ color: '#1d4ed8', weight: 2, fillColor: '#1d4ed8', fillOpacity: 0.25 }}>
                <LTooltip permanent direction="center" className="!border-0 !bg-transparent !shadow-none !font-mono !text-[13px] !font-bold">{oeste}</LTooltip>
              </CircleMarker>
            </MapBase>
          </div>
        </div>
      </div>
    </WebPage>
  )
}
