import * as React from 'react'
import { Eye, EyeOff, MessageSquareText, Search, Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { fmtAgo, fmtNum, tl, useL, useSettings, useT, type TKey } from '@/i18n'
import { orgById, usuarioNombre } from '@/data/mock'
import { useStore } from '@/store'
import { WebPage } from '@/layout/Page'
import { Empty, EventoFoto, Kpi, Stars } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/misc'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Filtro = 'todas' | 'visibles' | 'ocultas'

export default function ModeracionResenas() {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const resenas = useStore((s) => s.resenas)
  const eventos = useStore((s) => s.eventos)
  const toggle = useStore((s) => s.toggleResena)
  const [filtro, setFiltro] = React.useState<Filtro>('todas')
  const [fStar, setFStar] = React.useState('todas')
  const [q, setQ] = React.useState('')

  const evById = React.useMemo(() => new Map(eventos.map((e) => [e.id, e])), [eventos])
  const visibles = resenas.filter((r) => !r.oculta)
  const ocultas = resenas.length - visibles.length
  const prom = visibles.length ? visibles.reduce((a, r) => a + r.estrellas, 0) / visibles.length : 0

  const lista = resenas
    .filter((r) => (filtro === 'todas' ? true : filtro === 'ocultas' ? r.oculta : !r.oculta))
    .filter((r) => fStar === 'todas' || r.estrellas === Number(fStar))
    .filter((r) => {
      if (!q) return true
      const ev = evById.get(r.eventoId)
      return `${usuarioNombre(r.usuarioId)} ${ev?.titulo[lang] ?? ''} ${r.texto[lang]}`.toLowerCase().includes(q.toLowerCase())
    })

  const onToggle = (id: string, oculta: boolean | undefined, autor: string) => {
    toggle(id)
    toast.success(oculta ? tl('Reseña visible de nuevo', 'Review visible again') : tl('Reseña oculta', 'Review hidden'), {
      description: oculta
        ? tl(`La reseña de ${autor} vuelve a verse en la app.`, `${autor}’s review shows in the app again.`)
        : tl(`La reseña de ${autor} ya no se ve en la app ni cuenta en el promedio.`, `${autor}’s review no longer shows in the app or counts toward the average.`),
    })
  }

  return (
    <WebPage
      role="admin"
      bannerId="admin-moderacion"
      title={l('Reseñas', 'Reviews')}
      subtitle={l('Elegí qué reseñas se muestran en la app', 'Choose which reviews are shown in the app')}
      bullets={[
        ['Todas las reseñas de todos los eventos y experiencias en un solo lugar.', 'Every review from every event and experience in one place.'],
        ['Ocultá spam, reventa u ofensas con un toque; se puede volver a mostrar.', 'Hide spam, resale or offensive reviews with one tap; you can show them again.'],
        ['Las reseñas ocultas no cuentan para el promedio de estrellas.', 'Hidden reviews don’t count toward the star average.'],
      ]}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={l('Reseñas totales', 'Total reviews')} value={resenas.length} icon={MessageSquareText} />
        <Kpi label={l('Visibles', 'Visible')} value={visibles.length} icon={Eye} />
        <Kpi label={l('Ocultas', 'Hidden')} value={ocultas} icon={EyeOff} />
        <Kpi label={l('Promedio visible', 'Visible average')} value={fmtNum(prom, lang, 1)} sub="★" icon={Star} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Tabs value={filtro} onValueChange={(v) => setFiltro(v as Filtro)}>
          <TabsList>
            <TabsTrigger value="todas">{l('Todas', 'All')} <span className="num text-[11px] text-muted">{resenas.length}</span></TabsTrigger>
            <TabsTrigger value="visibles">{l('Visibles', 'Visible')} <span className="num text-[11px] text-muted">{visibles.length}</span></TabsTrigger>
            <TabsTrigger value="ocultas">{l('Ocultas', 'Hidden')} <span className="num text-[11px] text-muted">{ocultas}</span></TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={fStar} onValueChange={setFStar}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{l('Todas las estrellas', 'All ratings')}</SelectItem>
            {[5, 4, 3, 2, 1].map((s) => <SelectItem key={s} value={String(s)}>{'★'.repeat(s)}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative w-full sm:ml-auto sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={l('Buscar usuario, evento o texto…', 'Search user, event or text…')} className="h-9 pl-9" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {lista.map((r) => {
          const ev = evById.get(r.eventoId)
          const autor = usuarioNombre(r.usuarioId)
          return (
            <div key={r.id} className={cn('card flex gap-4 p-4 transition-opacity', r.oculta && 'border-dashed opacity-70')}>
              {ev && <EventoFoto foto={ev.fotos[0]} cat={ev.categoria} className="hidden h-16 w-16 shrink-0 rounded-[10px] sm:block" iconSize="h-5 w-5" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{autor}</p>
                  <Stars value={r.estrellas} />
                  {r.oculta ? <Badge variant="zinc"><EyeOff className="h-3 w-3" />{l('Oculta', 'Hidden')}</Badge> : <Badge variant="green"><Eye className="h-3 w-3" />{l('Visible', 'Visible')}</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {ev?.titulo[lang]} · {ev && t(`cat.${ev.categoria}` as TKey)} · {ev && orgById(ev.organizadorId).nombre} · {fmtAgo(r.fecha, lang)}
                </p>
                <p className={cn('mt-2 text-sm', r.oculta && 'line-through decoration-muted/60')}>{r.texto[lang]}</p>
                {r.respuesta && (
                  <p className="mt-2 rounded-[8px] bg-surface-2 px-3 py-2 text-xs text-muted">
                    <b className="text-text">{l('Respuesta del organizador:', 'Organizer reply:')}</b> {r.respuesta[lang]}
                  </p>
                )}
              </div>
              <label className="flex shrink-0 flex-col items-center gap-1.5 text-[11px] font-medium text-muted">
                <Switch checked={!r.oculta} onCheckedChange={() => onToggle(r.id, r.oculta, autor)} aria-label={l('Mostrar reseña', 'Show review')} />
                {r.oculta ? l('Oculta', 'Hidden') : l('Se muestra', 'Shown')}
              </label>
            </div>
          )
        })}
        {!lista.length && <Empty icon={MessageSquareText} title={l('No hay reseñas con estos filtros', 'No reviews with these filters')} />}
      </div>
    </WebPage>
  )
}
