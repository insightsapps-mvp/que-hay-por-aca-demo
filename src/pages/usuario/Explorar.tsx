import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Circle, CircleMarker } from 'react-leaflet'
import { Crosshair, LocateFixed, Map as MapIcon, Search, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { tl, useL, useSettings, useT, type TKey } from '@/i18n'
import type { Categoria } from '@/types'
import { CATEGORIAS, esHoy, USER_LOC } from '@/data/mock'
import { useStore } from '@/store'
import { CatIcon, DevNotice } from '@/components/common'
import { AndroidFab, DeviceScroll, UserTabBar } from '@/components/DeviceFrame'
import { MapBase } from '@/components/MapBase'
import { Slider } from '@/components/ui/misc'
import { DevicePage, distDe, EventCard, EventRow, FrameSheet, useRadio } from './shared'

type Orden = 'distancia' | 'fecha' | 'popularidad' | 'precio'
const ORDENES: { id: Orden; es: string; en: string }[] = [
  { id: 'distancia', es: 'Distancia', en: 'Distance' },
  { id: 'fecha', es: 'Fecha', en: 'Date' },
  { id: 'popularidad', es: 'Popularidad', en: 'Popularity' },
  { id: 'precio', es: 'Precio', en: 'Price' },
]

const GPS_NOTICE = {
  funcion: ['Geolocalización GPS real', 'Real GPS geolocation'] as [string, string],
  hoy: ['Hoy la ubicación está fija en Palermo Soho.', 'Today the location is fixed in Palermo Soho.'] as [string, string],
  real: ['Al desarrollar, la app pide permiso y usa el GPS del celular para centrar búsqueda y mapa.', 'Once built, the app asks for permission and uses the phone’s GPS to center search and map.'] as [string, string],
}

export default function Explorar() {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const eventos = useStore((s) => s.eventos)
  const catItems = useStore((s) => s.categorias)
  const catsActivas = CATEGORIAS.filter((c) => catItems.find((x) => x.id === c)?.activa !== false)
  const [q, setQ] = React.useState('')
  const [cats, setCats] = React.useState<Categoria[]>([])
  const radio = useRadio((s) => s.radio)
  const setRadio = useRadio((s) => s.setRadio)
  const [orden, setOrden] = React.useState<Orden>('distancia')
  const [filtros, setFiltros] = React.useState(params.get('filtros') === '1')
  const [gps, setGps] = React.useState(false)
  const radioRef = React.useRef(radio)

  React.useEffect(() => {
    if (params.get('filtros') === '1') setFiltros(true)
  }, [params])

  const now = new Date()
  const base = eventos.filter((e) => e.estado === 'publicado' && e.fin > now)
  const oesteEn = React.useCallback(
    (r: number) => base.filter((e) => e.zona === 'oeste' && distDe(e) <= r && e.inicio.getTime() < now.getTime() + 7 * 86400000).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventos]
  )

  const commitRadio = React.useCallback(
    (r: number) => {
      const antes = oesteEn(radioRef.current)
      const despues = oesteEn(r)
      radioRef.current = r
      if (despues > antes) {
        const n = despues - antes
        toast.success(tl(`Se sumaron ${n} eventos de zona oeste`, `${n} west-zone events were added`), {
          description: 'Morón · Castelar · Haedo · Ramos Mejía',
        })
      }
    },
    [oesteEn]
  )
  const setRadioCommit = React.useCallback(
    (r: number) => {
      setRadio(r)
      commitRadio(r)
    },
    [commitRadio]
  )

  const txt = q.trim().toLowerCase()
  const lista = base
    .filter((e) => distDe(e) <= radio)
    .filter((e) => cats.length === 0 || cats.includes(e.categoria))
    .filter(
      (e) =>
        !txt ||
        e.titulo.es.toLowerCase().includes(txt) ||
        e.titulo.en.toLowerCase().includes(txt) ||
        e.descripcion[lang].toLowerCase().includes(txt) ||
        e.barrio.toLowerCase().includes(txt)
    )
    .sort((a, b) => {
      if (orden === 'distancia') return distDe(a) - distDe(b)
      if (orden === 'fecha') return a.inicio.getTime() - b.inicio.getTime()
      if (orden === 'popularidad') return b.vendidas / b.aforo - a.vendidas / a.aforo
      return a.precio - b.precio
    })
  const hoy = lista.filter((e) => esHoy(e))
  const semana = lista.filter((e) => !esHoy(e) && e.inicio.getTime() < now.getTime() + 7 * 86400000)

  const toggleCat = (c: Categoria) => setCats((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]))
  const closeFiltros = () => {
    setFiltros(false)
    if (params.get('filtros')) {
      params.delete('filtros')
      setParams(params, { replace: true })
    }
  }

  return (
    <DevicePage
      bannerId="explorar"
      title={l('Explorar', 'Explore')}
      subtitle={l('Lo que pasa cerca tuyo, filtrado por lo que te gusta.', 'What’s happening near you, filtered by what you like.')}
      bullets={[
        ['Busca por GPS real del celular y ordena por cercanía.', 'Searches using the phone’s real GPS and sorts by proximity.'],
        ['Filtra por categorías, radio de 1 a 20 km, fecha y precio.', 'Filters by category, 1–20 km radius, date and price.'],
        ['Aprende qué te gusta y te avisa por push de eventos nuevos.', 'Learns what you like and sends push alerts about new events.'],
      ]}
      side={<DevNotice {...GPS_NOTICE} />}
      tabBar={<UserTabBar />}
    >
      <DeviceScroll>
        <div className="px-4 pb-6 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[22px] font-bold tracking-tight">{l('Hola, Martina 👋', 'Hi, Martina 👋')}</p>
              <p className="text-[13px] text-muted">{l('¿Qué hacemos esta noche?', 'What are we doing tonight?')}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-semibold text-accent">
              📍 {USER_LOC.nombre}
            </span>
            <button
              onClick={() => {
                setGps(true)
                toast(tl('Ubicación actualizada', 'Location updated'), { description: tl('Te ubicamos en Palermo Soho (simulado).', 'We placed you in Palermo Soho (simulated).') })
              }}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[12px] font-medium hover:bg-surface-2"
            >
              <LocateFixed className="h-3.5 w-3.5" />
              {l('Usar mi ubicación', 'Use my location')}
            </button>
          </div>
          {gps && <DevNotice {...GPS_NOTICE} className="mt-2 xl:hidden" />}

          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={l('Buscar eventos, lugares…', 'Search events, venues…')}
                className="h-10 w-full rounded-[10px] border border-border bg-surface-2 pl-9 pr-8 text-[14px] outline-none focus:border-accent focus:ring-4 focus:ring-accent-ring"
              />
              {q && (
                <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted" aria-label="clear">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              data-trailer="btn-filtros"
              onClick={() => setFiltros(true)}
              className="relative inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-[13px] font-semibold hover:bg-surface-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {l('Filtros', 'Filters')}
              <span className="num ml-0.5 rounded-full bg-accent px-1.5 text-[10px] text-white">{radio}km</span>
            </button>
          </div>

          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
            {catsActivas.map((c) => {
              const on = cats.includes(c)
              return (
                <button
                  key={c}
                  data-trailer={`cat-${c}`}
                  onClick={() => toggleCat(c)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
                    on ? 'border-accent bg-accent text-white' : 'border-border bg-surface hover:bg-surface-2'
                  )}
                >
                  <CatIcon cat={c} className="h-3.5 w-3.5" />
                  {t(`cat.${c}` as TKey)}
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex items-baseline justify-between">
            <h2 className="text-[16px] font-bold">{l('Esta noche cerca tuyo', 'Tonight near you')}</h2>
            <button onClick={() => navigate('/app/mapa')} className="text-[12.5px] font-semibold text-accent">
              {l('Ver mapa', 'See map')} →
            </button>
          </div>
          {hoy.length ? (
            <div className="-mx-4 mt-2 flex snap-x gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
              {hoy.map((e) => (
                <EventCard key={e.id} ev={e} />
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-[10px] border border-dashed border-border p-4 text-center text-[13px] text-muted">
              {l('No hay eventos esta noche con estos filtros.', 'No events tonight with these filters.')}
            </p>
          )}

          <h2 className="mt-5 text-[16px] font-bold">{l('Esta semana', 'This week')}</h2>
          <div className="mt-2 space-y-2">
            {semana.length ? (
              semana.map((e) => <EventRow key={e.id} ev={e} />)
            ) : (
              <p className="rounded-[10px] border border-dashed border-border p-4 text-center text-[13px] text-muted">
                {l('Nada esta semana con estos filtros. Probá subir el radio.', 'Nothing this week with these filters. Try a bigger radius.')}
              </p>
            )}
          </div>
          <p className="mt-4 text-center text-[11px] text-muted">
            <span className="num">{lista.length}</span> {l('eventos en', 'events within')} <span className="num">{radio} km</span>
          </p>
        </div>
      </DeviceScroll>
      <AndroidFab icon={MapIcon} label={l('Mapa', 'Map')} onClick={() => navigate('/app/mapa')} />

      <FrameSheet open={filtros} onClose={closeFiltros} title={l('Filtros', 'Filters')}>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium">{l('Radio de búsqueda', 'Search radius')}</span>
          <span className="num text-[18px] font-bold text-accent">{radio} km</span>
        </div>
        <Slider
          min={1}
          max={20}
          step={1}
          value={[radio]}
          onValueChange={(v) => setRadio(v[0])}
          onValueCommit={(v) => commitRadio(v[0])}
          className="mt-1"
        />
        <div className="mt-1 flex gap-1.5">
          {[2, 5, 10, 20].map((r) => (
            <button
              key={r}
              data-trailer={`radio-${r}`}
              onClick={() => setRadioCommit(r)}
              className={cn(
                'num flex-1 rounded-[8px] border py-1 text-[12px]',
                radio === r ? 'border-accent bg-accent-soft text-accent' : 'border-border hover:bg-surface-2'
              )}
            >
              {r} km
            </button>
          ))}
        </div>
        <div className="mt-3 h-[170px] overflow-hidden rounded-[12px] border border-border">
          <MapBase
            center={[USER_LOC.lat - (radio > 12 ? 0.03 : 0), USER_LOC.lng - (radio > 12 ? 0.08 : 0)]}
            zoom={radio > 12 ? 10 : radio > 6 ? 11 : radio > 3 ? 12 : 13}
            key={radio > 12 ? 'far' : radio > 6 ? 'mid' : radio > 3 ? 'near' : 'close'}
            style={{ height: 170 }}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
          >
            <Circle center={[USER_LOC.lat, USER_LOC.lng]} radius={radio * 1000} pathOptions={{ color: '#7c3aed', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.1 }} />
            <CircleMarker center={[USER_LOC.lat, USER_LOC.lng]} radius={6} pathOptions={{ color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }} />
          </MapBase>
        </div>
        <p className="mt-4 text-[13px] font-medium">{l('Ordenar por', 'Sort by')}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {ORDENES.map((o) => (
            <button
              key={o.id}
              onClick={() => setOrden(o.id)}
              className={cn(
                'rounded-[10px] border px-3 py-2 text-[13px] font-semibold',
                orden === o.id ? 'border-accent bg-accent-soft text-accent' : 'border-border hover:bg-surface-2'
              )}
            >
              {l(o.es, o.en)}
            </button>
          ))}
        </div>
        <button
          onClick={closeFiltros}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-accent text-[14px] font-semibold text-white"
        >
          <Crosshair className="h-4 w-4" />
          {l(`Ver ${lista.length} eventos`, `Show ${lista.length} events`)}
        </button>
      </FrameSheet>
    </DevicePage>
  )
}
