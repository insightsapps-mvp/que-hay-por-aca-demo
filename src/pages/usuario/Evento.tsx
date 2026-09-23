import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleMarker, Marker } from 'react-leaflet'
import L from 'leaflet'
import { ArrowLeft, BadgeCheck, CalendarDays, Clock, Heart, MapPin, Minus, Plus, Share2, Star, Users } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { fmtDateLong, fmtNum, tl, useL, useSettings, useT, type TKey } from '@/i18n'
import { enCurso, localById, ME_ID, orgById, USER_LOC, usuarioNombre } from '@/data/mock'
import { useStore } from '@/store'
import { EventoFoto, Stars } from '@/components/common'
import { AppBar, DeviceScroll } from '@/components/DeviceFrame'
import { MapBase } from '@/components/MapBase'
import { Textarea } from '@/components/ui/input'
import { AforoBar, DevicePage, DiaLabel, distDe, ocupacion, UltimasBadge, useFmt } from './shared'

const locIcon = L.divIcon({
  html: '<div class="mv-pin"><span class="core"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span></div>',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

/** Distribución de estrellas determinística a partir del promedio y la cantidad */
function distribucion(rating: number, n: number) {
  const w5 = Math.max(0, (rating - 3.4) / 1.6)
  const raw = [w5 * 0.9 + 0.05, 0.3 - Math.abs(rating - 4.2) * 0.2, 0.12, 0.05, 0.03]
  const sum = raw.reduce((a, b) => a + Math.max(0.01, b), 0)
  return raw.map((r) => Math.round((Math.max(0.01, r) / sum) * n))
}

export default function Evento() {
  const { id = 'ev-01' } = useParams()
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const f = useFmt()
  const navigate = useNavigate()
  const ev = useStore((s) => s.eventos.find((e) => e.id === id))
  const resenas = useStore((s) => s.resenas)
  const tickets = useStore((s) => s.tickets)
  const agregarResena = useStore((s) => s.agregarResena)
  const [cant, setCant] = React.useState(2)
  const [fav, setFav] = React.useState(false)
  const [stars, setStars] = React.useState(0)
  const [hover, setHover] = React.useState(0)
  const [texto, setTexto] = React.useState('')

  if (!ev) {
    return (
      <DevicePage bannerId="evento" title={l('Evento no encontrado', 'Event not found')} bullets={[]}>
        <div className="p-6 text-center text-sm text-muted">{l('Este evento no existe.', 'This event does not exist.')}</div>
      </DevicePage>
    )
  }
  const loc = localById(ev.localId)
  const org = orgById(ev.organizadorId)
  const propias = resenas.filter((r) => r.eventoId === ev.id)
  const ultimas = propias.slice(0, 5)
  const dist = distribucion(ev.rating || 4.5, ev.cantResenas || propias.length)
  const maxDist = Math.max(...dist, 1)
  const pasado = ev.fin < new Date()
  const miTicket = tickets.find((tk) => tk.eventoId === ev.id && tk.usuarioId === ME_ID)
  const yaResene = propias.some((r) => r.usuarioId === ME_ID)
  const agotado = ev.vendidas >= ev.aforo
  const puedeComprar = !pasado && !agotado && ev.estado === 'publicado'

  const enviarResena = () => {
    if (!stars) {
      toast.error(tl('Elegí de 1 a 5 estrellas', 'Pick 1 to 5 stars'))
      return
    }
    agregarResena(ev.id, stars, texto.trim() || tl('Sin comentario', 'No comment'))
    toast.success(tl('¡Gracias por tu reseña!', 'Thanks for your review!'), { description: tl('El organizador la va a ver y puede responderte.', 'The organizer will see it and can reply.') })
    setStars(0)
    setTexto('')
  }

  return (
    <DevicePage
      bannerId="evento"
      title={ev.titulo[lang]}
      subtitle={`${loc.nombre} · ${org.nombre}`}
      bullets={[
        ['Fotos reales del evento cargadas por el organizador.', 'Real event photos uploaded by the organizer.'],
        ['Stock de entradas en tiempo real: no se vende más que el aforo.', 'Real-time ticket stock: never oversells capacity.'],
        ['Solo reseña quien compró y fue al evento.', 'Only people who bought and attended can review.'],
      ]}
    >
      <AppBar
        className="absolute inset-x-0 top-0 border-0 bg-transparent backdrop-blur-0"
        left={
          <button onClick={() => navigate(-1)} className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur" aria-label={l('Volver', 'Back')}>
            <ArrowLeft className="h-4 w-4" />
          </button>
        }
        right={
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFav((v) => !v)
                toast(fav ? tl('Quitado de favoritos', 'Removed from favorites') : tl('Guardado en favoritos', 'Saved to favorites'))
              }}
              className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
              aria-label="fav"
            >
              <Heart className={cn('h-4 w-4', fav && 'fill-white')} />
            </button>
            <button
              onClick={() => toast(tl('Link copiado', 'Link copied'), { description: `quehayporaca.app/e/${ev.id}` })}
              className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
              aria-label="share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        }
      />
      <DeviceScroll>
        <EventoFoto foto={ev.fotos[0]} cat={ev.categoria} className="h-[230px]" iconSize="h-16 w-16">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 flex gap-1.5">
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-zinc-900">{t(`cat.${ev.categoria}` as TKey)}</span>
            {enCurso(ev) && <span className="rounded-full bg-success px-2.5 py-0.5 text-[11px] font-bold text-white">{l('EN CURSO', 'LIVE NOW')}</span>}
            <UltimasBadge ev={ev} />
          </div>
          <div className="absolute bottom-3 right-4 flex gap-1">
            {ev.fotos.slice(1, 4).map((ft, i) => (
              <span key={i} className="h-8 w-8 rounded-[6px] border-2 border-white/70" style={{ background: ft }} />
            ))}
          </div>
        </EventoFoto>
        <div className="px-4 pb-28 pt-4">
          <h2 className="text-[22px] font-bold leading-tight tracking-tight">{ev.titulo[lang]}</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#db2777] text-[10px] font-bold text-white">
              {org.nombre.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </span>
            <span className="text-[13px] font-medium">{org.nombre}</span>
            {org.verificado && <BadgeCheck className="h-4 w-4 text-accent" />}
            {ev.rating > 0 && (
              <span className="ml-auto inline-flex items-center gap-1 text-[13px]">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="num">{fmtNum(ev.rating, lang, 1)}</span>
                <span className="text-muted">({ev.cantResenas})</span>
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-[12px] border border-border p-3">
              <CalendarDays className="h-4 w-4 text-accent" />
              <p className="mt-1.5 text-[12.5px] font-semibold capitalize"><DiaLabel ev={ev} /></p>
              <p className="text-[11.5px] capitalize text-muted">{fmtDateLong(ev.inicio, lang)}</p>
            </div>
            <div className="rounded-[12px] border border-border p-3">
              <Clock className="h-4 w-4 text-accent" />
              <p className="num mt-1.5 text-[15px]">{f.time(ev.inicio)} – {f.time(ev.fin)}</p>
              <p className="text-[11.5px] text-muted">{l('Horario', 'Time')}</p>
            </div>
          </div>

          <div className="mt-2 overflow-hidden rounded-[12px] border border-border">
            <div style={{ height: 130 }}>
              <MapBase center={[ev.lat, ev.lng]} zoom={14} style={{ height: 130 }} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false}>
                <Marker position={[ev.lat, ev.lng]} icon={locIcon} />
                <CircleMarker center={[USER_LOC.lat, USER_LOC.lng]} radius={6} pathOptions={{ color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }} />
              </MapBase>
            </div>
            <div className="flex items-center gap-2 p-3">
              <MapPin className="h-4 w-4 shrink-0 text-accent" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">{loc.nombre}</p>
                <p className="truncate text-[11.5px] text-muted">{loc.direccion}, {loc.barrio}</p>
              </div>
              <span className="ml-auto shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11.5px] font-semibold text-accent">{f.lejos(distDe(ev))}</span>
            </div>
          </div>

          <h3 className="mt-5 text-[15px] font-bold">{l('Sobre el evento', 'About the event')}</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{ev.descripcion[lang]}</p>

          <div className="mt-4 rounded-[12px] border border-border p-3">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="inline-flex items-center gap-1.5 font-medium"><Users className="h-4 w-4 text-muted" />{l('Aforo', 'Capacity')}</span>
              <span className="num">{ev.vendidas} / {ev.aforo} · {Math.round(ocupacion(ev) * 100)}%</span>
            </div>
            <AforoBar ev={ev} className="mt-2" />
          </div>

          {puedeComprar && (
            <div className="mt-4 flex items-center justify-between rounded-[12px] border border-border p-3">
              <div>
                <p className="text-[12px] text-muted">{l('Precio por entrada', 'Price per ticket')}</p>
                <p className="num text-[18px] font-bold">{f.ars(ev.precio)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCant((c) => Math.max(1, c - 1))} className="grid h-8 w-8 place-items-center rounded-full border border-border disabled:opacity-40" disabled={cant <= 1} aria-label="-">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="num w-5 text-center text-[16px]">{cant}</span>
                <button onClick={() => setCant((c) => Math.min(6, c + 1))} className="grid h-8 w-8 place-items-center rounded-full border border-border disabled:opacity-40" disabled={cant >= 6} aria-label="+">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Reseñas */}
          <h3 className="mt-6 text-[15px] font-bold">{l('Reseñas', 'Reviews')}</h3>
          {ev.cantResenas > 0 || propias.length > 0 ? (
            <div className="mt-2 flex items-center gap-4 rounded-[12px] border border-border p-3">
              <div className="text-center">
                <p className="num text-[34px] font-bold leading-none">{fmtNum(ev.rating || 4.5, lang, 1)}</p>
                <Stars value={ev.rating || 4.5} className="mt-1" size="h-3 w-3" />
                <p className="mt-0.5 text-[11px] text-muted">{ev.cantResenas || propias.length} {l('reseñas', 'reviews')}</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="num w-2 text-muted">{s}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${(dist[i] / maxDist) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[13px] text-muted">{l('Todavía no hay reseñas.', 'No reviews yet.')}</p>
          )}

          {pasado && miTicket && !yaResene && (
            <div className="mt-3 rounded-[12px] border border-accent/40 bg-accent-soft/50 p-3">
              <p className="text-[13.5px] font-semibold">{l('¿Cómo estuvo? Dejá tu reseña', 'How was it? Leave a review')}</p>
              <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onMouseEnter={() => setHover(s)} onClick={() => setStars(s)} aria-label={`${s}`}>
                    <Star className={cn('h-7 w-7 transition-transform hover:scale-110', s <= (hover || stars) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600')} />
                  </button>
                ))}
              </div>
              <Textarea
                className="mt-2"
                maxLength={300}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={l('Contá qué te pareció…', 'Tell us what you thought…')}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="num text-[11px] text-muted">{texto.length}/300</span>
                <button onClick={enviarResena} className="rounded-[8px] bg-accent px-3 py-1.5 text-[12.5px] font-semibold text-white">
                  {l('Publicar reseña', 'Post review')}
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 space-y-2.5">
            {ultimas.map((r) => (
              <div key={r.id} className="rounded-[12px] border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold">{r.usuarioId === ME_ID ? l('Vos', 'You') : usuarioNombre(r.usuarioId)}</span>
                  <Stars value={r.estrellas} size="h-3 w-3" />
                </div>
                <p className="mt-1 text-[12.5px] text-muted">{r.texto[lang]}</p>
                {r.respuesta && (
                  <div className="mt-2 rounded-[8px] bg-surface-2 p-2 text-[12px]">
                    <p className="font-semibold">{l('Respuesta de', 'Reply from')} {org.nombre}</p>
                    <p className="text-muted">{r.respuesta[lang]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DeviceScroll>

      {/* CTA fijo */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-border bg-surface/95 p-3 backdrop-blur">
        <div className="min-w-0">
          <p className="text-[11px] text-muted">{puedeComprar ? `${cant} × ${f.ars(ev.precio)}` : l('Entradas', 'Tickets')}</p>
          <p className="num text-[17px] font-bold">{puedeComprar ? f.ars(ev.precio * cant) : pasado ? l('Finalizado', 'Finished') : l('Agotado', 'Sold out')}</p>
        </div>
        <button
          data-trailer="btn-comprar"
          disabled={!puedeComprar}
          onClick={() => navigate(`/app/evento/${ev.id}/checkout?cant=${cant}`)}
          className="ml-auto inline-flex h-11 flex-1 items-center justify-center rounded-[12px] bg-accent text-[14.5px] font-semibold text-white shadow-lg shadow-accent/25 disabled:opacity-40"
        >
          {l('Comprar entradas', 'Buy tickets')}
        </button>
      </div>
    </DevicePage>
  )
}
