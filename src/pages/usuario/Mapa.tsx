import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useNavigate } from 'react-router-dom'
import { Circle, Marker, Popup, Tooltip } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { motion, useAnimationControls, type PanInfo } from 'framer-motion'
import { Clock, LocateFixed, Navigation, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { tl, useL, useSettings, useT, type TKey } from '@/i18n'
import type { Categoria, Evento } from '@/types'
import { CATEGORIAS, enCurso, esHoy, localById, USER_LOC, ZONAS } from '@/data/mock'
import { useStore } from '@/store'
import { CAT_ICON, CatIcon, DevNotice, EventoFoto } from '@/components/common'
import { UserTabBar } from '@/components/DeviceFrame'
import { MapBase } from '@/components/MapBase'
import { DevicePage, distDe, EventRow, useFmt, useRadio } from './shared'

/* ───────── Íconos divIcon (sin PNG de Leaflet) ───────── */
const iconCache = new Map<string, L.DivIcon>()
function pinIcon(ev: Evento, live: boolean, sel: boolean) {
  const key = `${ev.id}-${live}-${sel}`
  const hit = iconCache.get(key)
  if (hit) return hit
  const Icon = CAT_ICON[ev.categoria]
  const svg = renderToStaticMarkup(<Icon width={16} height={16} strokeWidth={2.4} color="currentColor" />)
  const trailer = ev.id === 'ev-01' ? ' data-trailer="mapa-pin-destacado"' : ''
  const icon = L.divIcon({
    html: `<div class="mv-pin${sel ? ' sel' : ''}"${trailer} data-ev="${ev.id}">${live ? '<span class="halo"></span>' : ''}<span class="core">${svg}</span></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
  iconCache.set(key, icon)
  return icon
}
const meIcon = L.divIcon({ html: '<div class="mv-me"><span class="ring"></span><span class="dot"></span></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] })
const clusterIcon = (cluster: L.MarkerCluster) =>
  L.divIcon({ html: `<div class="mv-cluster">${cluster.getChildCount()}</div>`, className: '', iconSize: [40, 40] })

// Centro inicial: entre "Estás acá" y el Almagro/Abasto para que se vea la movida de hoy arriba de la hoja
const CENTRO_INICIAL: [number, number] = [-34.5965, -58.4255]

type Zona = 'mi' | 'centro' | 'oeste'

function PopupCard({ ev }: { ev: Evento }) {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const f = useFmt()
  const navigate = useNavigate()
  const loc = localById(ev.localId)
  return (
    <div className="text-text">
      <EventoFoto foto={ev.fotos[0]} cat={ev.categoria} className="h-[92px]" iconSize="h-8 w-8">
        <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white">{t(`cat.${ev.categoria}` as TKey)}</span>
        {enCurso(ev) && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> {l('EN CURSO', 'LIVE NOW')}
          </span>
        )}
      </EventoFoto>
      <div className="p-3">
        <p className="text-[14px] font-semibold leading-tight">{ev.titulo[lang]}</p>
        <p className="mt-0.5 text-[11.5px] text-muted">
          {loc.nombre} · {f.lejos(distDe(ev))}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[12px] text-muted">
            <Clock className="h-3 w-3" />
            <span className="num text-text">{f.time(ev.inicio)}</span>
          </span>
          <span className="num text-[15px] font-bold">{f.ars(ev.precio)}</span>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => navigate(`/app/evento/${ev.id}`)}
            className="h-8 rounded-[8px] border border-border text-[12px] font-semibold hover:bg-surface-2"
          >
            {l('Ver detalles', 'Details')}
          </button>
          <button
            data-trailer={ev.id === 'ev-01' ? 'popup-comprar' : undefined}
            onClick={() => navigate(`/app/evento/${ev.id}/checkout`)}
            className="inline-flex h-8 items-center justify-center gap-1 rounded-[8px] bg-accent text-[12px] font-semibold text-white"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {l('Comprar', 'Buy')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Mapa() {
  const l = useL()
  const t = useT()
  const eventos = useStore((s) => s.eventos)
  const catItems = useStore((s) => s.categorias)
  const catsActivas = CATEGORIAS.filter((c) => catItems.find((x) => x.id === c)?.activa !== false)
  const radio = useRadio((s) => s.radio)
  const mapRef = React.useRef<L.Map | null>(null)
  const clusterRef = React.useRef<L.MarkerClusterGroup | null>(null)
  const markers = React.useRef<Record<string, L.Marker>>({})
  const [soloLive, setSoloLive] = React.useState(false)
  const [cats, setCats] = React.useState<Categoria[]>([])
  const [zona, setZona] = React.useState<Zona>('mi')
  const [sel, setSel] = React.useState<string | null>(null)
  const [expanded, setExpanded] = React.useState(false)
  const sheet = useAnimationControls()
  const [, tick] = React.useState(0)

  // Re-evaluar "en curso" cada minuto
  React.useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const hoy = eventos.filter((e) => e.estado === 'publicado' && esHoy(e)).sort((a, b) => distDe(a) - distDe(b))
  const live = hoy.filter((e) => enCurso(e))
  const visibles = hoy.filter((e) => (!soloLive || enCurso(e)) && (cats.length === 0 || cats.includes(e.categoria)))

  const PEEK = 128
  const setSheet = React.useCallback(
    (open: boolean) => {
      setExpanded(open)
      sheet.start({ y: open ? 0 : `calc(100% - ${PEEK}px)` }, { type: 'spring', damping: 30, stiffness: 300 })
    },
    [sheet]
  )
  React.useEffect(() => {
    sheet.set({ y: `calc(100% - ${PEEK}px)` })
  }, [sheet])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -40 || info.velocity.y < -300) setSheet(true)
    else if (info.offset.y > 40 || info.velocity.y > 300) setSheet(false)
    else setSheet(expanded)
  }

  const volar = (z: Zona) => {
    setZona(z)
    const c = ZONAS[z]
    mapRef.current?.flyTo([c.lat, c.lng], c.zoom, { duration: 1.1 })
  }

  const focus = React.useCallback(
    (ev: Evento) => {
      setSheet(false)
      setSel(ev.id)
      const map = mapRef.current
      const m = markers.current[ev.id]
      if (!map || !m) return
      map.flyTo([ev.lat, ev.lng], Math.max(map.getZoom(), 15), { duration: 0.9 })
      map.once('moveend', () => {
        const cg = clusterRef.current
        if (cg && cg.hasLayer(m)) cg.zoomToShowLayer(m, () => m.openPopup())
        else m.openPopup()
      })
    },
    [setSheet]
  )

  const toggleCat = (c: Categoria) => setCats((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]))

  return (
    <DevicePage
      bannerId="mapa"
      title={l('Mapa de hoy', 'Tonight’s map')}
      subtitle={l(`${hoy.length} eventos esta noche · ${live.length} ya arrancaron`, `${hoy.length} events tonight · ${live.length} already started`)}
      bullets={[
        ['Se centra con el GPS real y muestra solo lo que pasa hoy.', 'Centers with real GPS and shows only what’s happening today.'],
        ['Los pines se actualizan en vivo cuando un evento arranca o se agota.', 'Pins update live when an event starts or sells out.'],
        ['Del pin al pago en dos toques, con Mercado Pago integrado.', 'From pin to payment in two taps, with Mercado Pago built in.'],
      ]}
      side={
        <>
          <div className="card p-4">
            <p className="kicker">{l('En el mapa ahora', 'On the map now')}</p>
            <div className="mt-2 grid grid-cols-3 gap-3">
              <div>
                <p className="num text-[26px] font-bold">{hoy.length}</p>
                <p className="text-xs text-muted">{l('eventos hoy', 'events today')}</p>
              </div>
              <div>
                <p className="num text-[26px] font-bold text-success">{live.length}</p>
                <p className="text-xs text-muted">{l('en curso', 'live now')}</p>
              </div>
              <div>
                <p className="num text-[26px] font-bold">{radio}<span className="text-sm"> km</span></p>
                <p className="text-xs text-muted">{l('radio', 'radius')}</p>
              </div>
            </div>
          </div>
          <DevNotice
            funcion={['Geolocalización GPS real', 'Real GPS geolocation']}
            hoy={['Hoy “Estás acá” está fijo en Palermo Soho.', 'Today “You are here” is fixed in Palermo Soho.']}
            real={['Al desarrollar, el mapa se centra con el GPS del celular y sigue tu ubicación.', 'Once built, the map centers on the phone’s GPS and follows your location.']}
          />
        </>
      }
      tabBar={<UserTabBar />}
    >
      <div className="mv-map-sheet relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <MapBase
            ref={mapRef}
            center={CENTRO_INICIAL}
            zoom={14}
            minZoom={10}
            maxZoom={18}
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <Circle
              center={[USER_LOC.lat, USER_LOC.lng]}
              radius={radio * 1000}
              pathOptions={{ color: '#7c3aed', weight: 1.5, dashArray: '6 6', fillColor: '#7c3aed', fillOpacity: 0.05 }}
            />
            <Marker position={[USER_LOC.lat, USER_LOC.lng]} icon={meIcon} zIndexOffset={1000}>
              <Tooltip permanent direction="top" offset={[0, -12]} className="!rounded-full !border-0 !bg-blue-600 !px-2 !py-0.5 !text-[10.5px] !font-semibold !text-white !shadow">
                {l('Estás acá', 'You are here')}
              </Tooltip>
            </Marker>
            <MarkerClusterGroup
              ref={clusterRef}
              chunkedLoading
              disableClusteringAtZoom={14}
              showCoverageOnHover={false}
              spiderfyOnMaxZoom
              maxClusterRadius={55}
              iconCreateFunction={clusterIcon}
            >
              {visibles.map((ev) => (
                <Marker
                  key={ev.id}
                  position={[ev.lat, ev.lng]}
                  icon={pinIcon(ev, enCurso(ev), sel === ev.id)}
                  ref={(m) => {
                    if (m) markers.current[ev.id] = m
                  }}
                  eventHandlers={{ click: () => setSel(ev.id), popupclose: () => setSel((s) => (s === ev.id ? null : s)) }}
                >
                  <Popup closeButton maxWidth={240} minWidth={230} autoPanPadding={[16, 70]}>
                    <PopupCard ev={ev} />
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapBase>
        </div>

        {/* Chips flotantes */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] space-y-2 p-3">
          <div className="pointer-events-auto flex gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSoloLive(false)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold shadow-md backdrop-blur',
                !soloLive ? 'bg-accent text-white' : 'bg-surface/90 text-text'
              )}
            >
              {l('Hoy', 'Today')} · <span className="num">{hoy.length}</span> {l('eventos', 'events')}
            </button>
            <button
              onClick={() => setSoloLive((v) => !v)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold shadow-md backdrop-blur',
                soloLive ? 'bg-success text-white' : 'bg-surface/90 text-text'
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', soloLive ? 'bg-white' : 'bg-success')}>
                <span className="block h-2 w-2 animate-ping rounded-full bg-success opacity-60" />
              </span>
              {l('En curso ahora', 'Live now')} · <span className="num">{live.length}</span>
            </button>
          </div>
          <div className="pointer-events-auto flex gap-1.5 overflow-x-auto scrollbar-none">
            {catsActivas.map((c) => (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold shadow backdrop-blur',
                  cats.includes(c) ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-surface/90 text-text'
                )}
              >
                <CatIcon cat={c} className="h-3 w-3" />
                {t(`cat.${c}` as TKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Controles derecha */}
        <div className="absolute right-3 top-[92px] z-[500] flex flex-col items-end gap-2">
          <button
            onClick={() => {
              volar('mi')
              toast(tl('Centrado en tu ubicación', 'Centered on your location'), { description: 'Palermo Soho' })
            }}
            className="grid h-10 w-10 place-items-center rounded-full bg-surface text-accent shadow-lg"
            aria-label={l('Centrar en mí', 'Center on me')}
            title={l('Centrar en mí', 'Center on me')}
          >
            <LocateFixed className="h-[18px] w-[18px]" />
          </button>
          <div className="flex flex-col overflow-hidden rounded-[12px] bg-surface text-[11px] font-semibold shadow-lg">
            {(
              [
                ['mi', 'Mi ubicación', 'My location'],
                ['centro', 'Centro', 'Downtown'],
                ['oeste', 'Zona oeste', 'West zone'],
              ] as [Zona, string, string][]
            ).map(([z, es, en]) => (
              <button
                key={z}
                data-trailer={`zona-${z}`}
                onClick={() => volar(z)}
                className={cn('px-2.5 py-1.5 text-left', zona === z ? 'bg-accent-soft text-accent' : 'hover:bg-surface-2')}
              >
                {l(es, en)}
              </button>
            ))}
          </div>
        </div>

        {/* Hoja inferior arrastrable */}
        <motion.div
          animate={sheet}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.25}
          onDragEnd={onDragEnd}
          className="absolute inset-x-0 bottom-0 z-[600] flex h-[72%] flex-col rounded-t-[22px] border-t border-border bg-surface shadow-[0_-10px_30px_rgba(0,0,0,.15)]"
        >
          <button onClick={() => setSheet(!expanded)} className="w-full shrink-0 cursor-grab px-4 pb-2 pt-2.5 active:cursor-grabbing">
            <span className="mx-auto block h-1 w-10 rounded-full bg-border" />
            <span className="mt-2 flex items-center justify-between">
              <span className="text-[15px] font-bold">
                {l('Esta noche cerca tuyo', 'Tonight near you')} <span className="num text-muted">· {visibles.length}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted">
                <Navigation className="h-3 w-3" />
                {l('por distancia', 'by distance')}
              </span>
            </span>
          </button>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-4 scrollbar-none" onPointerDownCapture={(e) => expanded && e.stopPropagation()}>
            {visibles.map((ev) => (
              <EventRow key={ev.id} ev={ev} onClick={() => focus(ev)} />
            ))}
          </div>
        </motion.div>
      </div>
    </DevicePage>
  )
}
