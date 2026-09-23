import * as React from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CheckCircle2, Clock, ScanLine, XCircle } from 'lucide-react'
import { fmtDate, fmtTime, useL, useSettings, useT, type TKey } from '@/i18n'
import { DENSIDAD_HORARIA } from '@/data/mock'
import { MY_LOCAL, useStore } from '@/store'
import { ChartTooltip, LiveDot, useChartColors, WebPage } from '@/layout/Page'
import { Kpi } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function Validaciones() {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const c = useChartColors()
  const validaciones = useStore((s) => s.validaciones)
  const [f, setF] = React.useState<'todas' | 'valida' | 'rechazadas'>('todas')

  const mias = validaciones.filter((v) => v.localId === MY_LOCAL)
  const corte = Date.now() - 14 * 3600000
  const hoy = mias.filter((v) => v.hora.getTime() >= corte)
  const validas = hoy.filter((v) => v.resultado === 'valida').length
  const rechazadas = hoy.length - validas
  const pico = DENSIDAD_HORARIA.reduce((a, b) => (b.personas > a.personas ? b : a))
  const lista = mias.filter((v) => (f === 'todas' ? true : f === 'valida' ? v.resultado === 'valida' : v.resultado !== 'valida')).slice(0, 40)

  return (
    <WebPage
      role="local"
      bannerId="local-validaciones"
      title={l('Validaciones', 'Check-ins')}
      subtitle="Club Vórtice · Palermo"
      actions={<LiveDot />}
      bullets={[
        ['Cada escaneo queda registrado con hora, puerta y dispositivo.', 'Every scan is logged with time, door and device.'],
        ['Densidad de público por franja para planificar personal y barra.', 'Crowd density by time slot to plan staff and bar.'],
        ['Alertas de intentos de ingreso duplicados en tiempo real.', 'Real-time alerts for duplicate entry attempts.'],
      ]}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={l('Escaneadas hoy', 'Scanned today')} value={hoy.length} icon={ScanLine} delta={8} />
        <Kpi label={l('Válidas', 'Valid')} value={validas} icon={CheckCircle2} sub={`${hoy.length ? Math.round((validas / hoy.length) * 100) : 0}%`} />
        <Kpi label={l('Rechazadas', 'Rejected')} value={rechazadas} icon={XCircle} sub={l('inválidas o duplicadas', 'invalid or duplicate')} />
        <Kpi label={l('Pico de ingreso', 'Peak entry')} value={pico.franja} icon={Clock} sub={l(`${pico.personas} personas en 30 min`, `${pico.personas} people in 30 min`)} />
      </div>

      <div className="card mt-4 p-5">
        <p className="text-[15px] font-semibold">{l('Densidad de público por franja horaria', 'Crowd density by time slot')}</p>
        <p className="text-xs text-muted">{l('Ingresos cada 30 minutos · 22:00 a 04:00', 'Entries every 30 minutes · 22:00 to 04:00')}</p>
        <div className="mt-3 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DENSIDAD_HORARIA} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={c.grid} />
              <XAxis dataKey="franja" tick={{ fontSize: 11, fill: c.muted, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: c.muted, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: c.grid, opacity: 0.4 }} />
              <Bar dataKey="personas" name={l('Personas', 'People')} radius={[6, 6, 0, 0]}>
                {DENSIDAD_HORARIA.map((d) => (
                  <Cell key={d.franja} fill={d.franja === pico.franja ? '#059669' : c.accent} fillOpacity={d.franja === pico.franja ? 1 : 0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3">
          <p className="text-[15px] font-semibold">{l('Registro de validaciones', 'Check-in log')}</p>
          <Tabs value={f} onValueChange={(v) => setF(v as typeof f)}>
            <TabsList>
              <TabsTrigger value="todas">{l('Todas', 'All')}</TabsTrigger>
              <TabsTrigger value="valida">{l('Válidas', 'Valid')}</TabsTrigger>
              <TabsTrigger value="rechazadas">{l('Rechazadas', 'Rejected')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{l('Hora', 'Time')}</TableHead>
              <TableHead>{l('Código', 'Code')}</TableHead>
              <TableHead>{l('Comprador', 'Buyer')}</TableHead>
              <TableHead>{l('Estado', 'Status')}</TableHead>
              <TableHead>{l('Dispositivo', 'Device')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="text-muted">
                  {fmtDate(v.hora, lang)} · <span className="num text-text">{fmtTime(v.hora, lang)}</span>
                </TableCell>
                <TableCell className="num">{v.codigo}</TableCell>
                <TableCell>{v.comprador}</TableCell>
                <TableCell>
                  <Badge variant={v.resultado === 'valida' ? 'green' : v.resultado === 'usada' ? 'amber' : 'red'}>{t(`val.${v.resultado}` as TKey)}</Badge>
                </TableCell>
                <TableCell className="text-muted">{lang === 'en' ? v.dispositivo.replace('Puerta', 'Door') : v.dispositivo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WebPage>
  )
}
