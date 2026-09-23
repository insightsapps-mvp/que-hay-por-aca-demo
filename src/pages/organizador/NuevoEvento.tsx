import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { Check, ImagePlus, MapPin, Send, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { tl, useL, useSettings, useT, type TKey } from '@/i18n'
import type { Categoria, EstadoEvento } from '@/types'
import { CATEGORIAS, DIRECCIONES_SUGERIDAS, fotosDe, localById } from '@/data/mock'
import { MY_ORG, useStore } from '@/store'
import { DevNotice } from '@/components/common'
import { AppBar, DeviceScroll } from '@/components/DeviceFrame'
import { MapBase } from '@/components/MapBase'
import { Input, Textarea } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DevicePage } from '@/pages/usuario/shared'

const pinIcon = L.divIcon({
  html: '<div class="mv-pin"><span class="core"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span></div>',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const STORAGE_NOTICE = {
  funcion: ['Subida de fotos a almacenamiento', 'Photo upload to storage'] as [string, string],
  hoy: ['Hoy las fotos se previsualizan solo en tu navegador.', 'Today photos are previewed only in your browser.'] as [string, string],
  real: ['Al desarrollar, se suben a la nube y se generan versiones de 200×200 y 1200×800 automáticamente.', 'Once built, they’re uploaded to the cloud and 200×200 and 1200×800 versions are generated automatically.'] as [string, string],
}

const PASOS: EstadoEvento[] = ['borrador', 'pendiente', 'aprobado', 'publicado']

function hoyISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type Errors = Partial<Record<'nombre' | 'descripcion' | 'categoria' | 'fecha' | 'hora' | 'precio' | 'cantidad' | 'ubicacion', string>>

export default function NuevoEvento() {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('edit')
  const editando = useStore((s) => (editId ? s.eventos.find((e) => e.id === editId) : undefined))
  const crear = useStore((s) => s.crearEvento)
  const actualizar = useStore((s) => s.actualizarEvento)

  const [nombre, setNombre] = React.useState('')
  const [descripcion, setDescripcion] = React.useState('')
  const [categoria, setCategoria] = React.useState<Categoria | ''>('')
  const [fecha, setFecha] = React.useState('')
  const [hora, setHora] = React.useState('')
  const [precio, setPrecio] = React.useState('')
  const [cantidad, setCantidad] = React.useState('')
  const [dirQ, setDirQ] = React.useState('')
  const [dir, setDir] = React.useState<(typeof DIRECCIONES_SUGERIDAS)[number] | null>(null)
  const [showSug, setShowSug] = React.useState(false)
  const [fotos, setFotos] = React.useState<string[]>([])
  const [errors, setErrors] = React.useState<Errors>({})
  const [estado, setEstado] = React.useState<EstadoEvento>('borrador')
  const [savedId, setSavedId] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  // Precarga en modo edición
  React.useEffect(() => {
    if (!editando) return
    const d = editando.inicio
    setNombre(editando.titulo[lang])
    setDescripcion(editando.descripcion[lang])
    setCategoria(editando.categoria)
    setFecha(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    setHora(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    setPrecio(String(editando.precio))
    setCantidad(String(editando.aforo))
    const loc = localById(editando.localId)
    const sug = DIRECCIONES_SUGERIDAS.find((s) => s.localId === loc.id) || { dir: `${loc.direccion}, ${loc.barrio}`, lat: loc.lat, lng: loc.lng, localId: loc.id }
    setDir(sug)
    setDirQ(sug.dir)
    setFotos(editando.fotos)
    setEstado(editando.estado)
    setSavedId(editando.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editando?.id])

  const sugerencias = DIRECCIONES_SUGERIDAS.filter((s) => !dirQ || s.dir.toLowerCase().includes(dirQ.toLowerCase())).slice(0, 5)

  const onFiles = (list: FileList | null) => {
    if (!list) return
    const libres = 5 - fotos.length
    const nuevas = Array.from(list)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, libres)
      .map((f) => `url("${URL.createObjectURL(f)}") center/cover`)
    if (list.length > libres) toast.warning(tl('Máximo 5 fotos por evento', 'Max 5 photos per event'))
    setFotos((fs) => [...fs, ...nuevas])
  }

  const validar = (): boolean => {
    const e: Errors = {}
    if (nombre.trim().length < 3) e.nombre = tl('Poné un nombre de al menos 3 letras', 'Enter a name of at least 3 characters')
    if (descripcion.trim().length < 20) e.descripcion = tl('La descripción necesita al menos 20 caracteres', 'Description needs at least 20 characters')
    if (!categoria) e.categoria = tl('Elegí una categoría', 'Pick a category')
    if (!fecha) e.fecha = tl('Elegí la fecha', 'Pick the date')
    else if (fecha < hoyISO()) e.fecha = tl('La fecha no puede ser en el pasado', 'The date can’t be in the past')
    if (!hora) e.hora = tl('Elegí la hora', 'Pick the time')
    if (!precio || Number(precio) <= 0) e.precio = tl('Poné un precio mayor a 0', 'Enter a price above 0')
    if (!cantidad || Number(cantidad) <= 0) e.cantidad = tl('Indicá cuántas entradas hay', 'Enter how many tickets')
    if (!dir) e.ubicacion = tl('Elegí una dirección de la lista', 'Pick an address from the list')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const guardar = (destino: 'borrador' | 'pendiente') => {
    if (destino === 'pendiente' && !validar()) {
      toast.error(tl('Revisá los campos marcados', 'Check the highlighted fields'))
      return
    }
    if (destino === 'borrador' && nombre.trim().length < 3) {
      setErrors({ nombre: tl('Para guardar un borrador poné al menos el nombre', 'To save a draft enter at least the name') })
      return
    }
    const loc = dir ? localById(dir.localId) : localById('loc-01')
    const [y, m, d] = (fecha || hoyISO()).split('-').map(Number)
    const [hh, mm] = (hora || '22:00').split(':').map(Number)
    const inicio = new Date(y, m - 1, d, hh, mm)
    const data = {
      titulo: { es: nombre.trim(), en: nombre.trim() },
      descripcion: { es: descripcion.trim(), en: descripcion.trim() },
      categoria: (categoria || 'fiestas') as Categoria,
      organizadorId: MY_ORG,
      localId: loc.id,
      inicio,
      fin: new Date(inicio.getTime() + 5 * 3600000),
      precio: Number(precio) || 0,
      aforo: Number(cantidad) || loc.capacidad,
      vendidas: 0,
      lat: dir?.lat ?? loc.lat,
      lng: dir?.lng ?? loc.lng,
      zona: (['loc-07', 'loc-08', 'loc-09', 'loc-10'].includes(loc.id) ? 'oeste' : 'caba') as 'caba' | 'oeste',
      barrio: loc.barrio,
      estado: destino as EstadoEvento,
      rating: 0,
      cantResenas: 0,
      fotos,
    }
    let id = savedId
    if (id) actualizar(id, data)
    else {
      id = crear(data)
      setSavedId(id)
    }
    setEstado(destino)
    if (destino === 'pendiente') {
      toast.success(tl('Enviado a aprobación', 'Sent for approval'), { description: tl('El admin lo revisa y, si está todo ok, se publica.', 'The admin reviews it and, if all is OK, it goes live.') })
    } else {
      toast.success(tl('Borrador guardado', 'Draft saved'))
    }
  }

  const err = (k: keyof Errors) => errors[k] && <p className="mt-1 text-[11.5px] font-medium text-danger">{errors[k]}</p>
  const lbl = 'mb-1.5 block text-[12.5px] font-semibold'
  const pasoIdx = PASOS.indexOf(estado === 'finalizado' || estado === 'cancelado' ? 'publicado' : estado)

  return (
    <DevicePage
      role="organizador"
      bannerId="org-nuevo"
      title={editando ? l('Editar evento', 'Edit event') : l('Cargar evento', 'Create event')}
      subtitle={l('El organizador publica desde el celular en un par de minutos.', 'Organizers publish from their phone in a couple of minutes.')}
      bullets={[
        ['Hasta 5 fotos con la cámara o la galería del celular.', 'Up to 5 photos from the phone’s camera or gallery.'],
        ['Picker nativo de fecha y hora, sin fechas pasadas.', 'Native date and time picker, no past dates.'],
        ['Flujo de estados: Borrador → Pendiente → Aprobado → Publicado.', 'Status flow: Draft → Pending → Approved → Published.'],
      ]}
      side={<DevNotice {...STORAGE_NOTICE} />}
    >
      <AppBar
        title={editando ? l('Editar evento', 'Edit event') : l('Nuevo evento', 'New event')}
        left={
          <button onClick={() => navigate('/organizador/eventos')} className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2" aria-label={l('Cerrar', 'Close')}>
            <X className="h-4 w-4" />
          </button>
        }
      />
      <DeviceScroll>
        <div className="space-y-4 px-4 pb-28 pt-4">
          {/* Stepper de estados */}
          <div className="rounded-[12px] border border-border p-3">
            <div className="flex items-center">
              {PASOS.map((p, i) => (
                <React.Fragment key={p}>
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        'grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold',
                        i < pasoIdx ? 'bg-success text-white' : i === pasoIdx ? 'bg-[#db2777] text-white ring-4 ring-pink-200 dark:ring-pink-500/20' : 'bg-surface-2 text-muted'
                      )}
                    >
                      {i < pasoIdx ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className={cn('text-[10px] font-semibold', i === pasoIdx ? 'text-text' : 'text-muted')}>{t(`estado.${p}` as TKey)}</span>
                  </div>
                  {i < PASOS.length - 1 && <span className={cn('mx-1 mb-4 h-0.5 flex-1 rounded', i < pasoIdx ? 'bg-success' : 'bg-border')} />}
                </React.Fragment>
              ))}
            </div>
            {estado === 'pendiente' && (
              <p className="mt-2 rounded-[8px] bg-amber-50 px-2 py-1.5 text-[11.5px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                {l('Pendiente de aprobación: ya aparece en la cola del Admin.', 'Pending approval: it’s already in the Admin queue.')}
              </p>
            )}
            {editando?.motivoRechazo && (
              <p className="mt-2 rounded-[8px] bg-red-50 px-2 py-1.5 text-[11.5px] text-danger dark:bg-red-500/10">
                {l('Rechazado por el admin:', 'Rejected by admin:')} {editando.motivoRechazo}
              </p>
            )}
          </div>

          <div>
            <label className={lbl} htmlFor="ev-nombre">{l('Nombre del evento', 'Event name')} *</label>
            <Input id="ev-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={l('Ej: Noche de techno en la terraza', 'E.g. Techno night on the terrace')} className={cn(errors.nombre && 'border-danger')} />
            {err('nombre')}
          </div>
          <div>
            <label className={lbl} htmlFor="ev-desc">{l('Descripción', 'Description')} *</label>
            <Textarea id="ev-desc" maxLength={500} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder={l('Contá qué va a pasar, line-up, dress code…', 'Tell people what’s happening, line-up, dress code…')} className={cn('min-h-[96px]', errors.descripcion && 'border-danger')} />
            <div className="mt-1 flex justify-between">
              {err('descripcion') || <span />}
              <span className="num text-[11px] text-muted">{descripcion.length}/500</span>
            </div>
          </div>
          <div>
            <label className={lbl}>{l('Categoría', 'Category')} *</label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as Categoria)}>
              <SelectTrigger className={cn(errors.categoria && 'border-danger')}>
                <SelectValue placeholder={l('Elegí una categoría', 'Pick a category')} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c} value={c}>{t(`cat.${c}` as TKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err('categoria')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl} htmlFor="ev-fecha">{l('Fecha', 'Date')} *</label>
              <Input id="ev-fecha" type="date" min={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} className={cn(errors.fecha && 'border-danger')} />
              {err('fecha')}
            </div>
            <div>
              <label className={lbl} htmlFor="ev-hora">{l('Hora', 'Time')} *</label>
              <Input id="ev-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={cn(errors.hora && 'border-danger')} />
              {err('hora')}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl} htmlFor="ev-precio">{l('Precio por entrada', 'Price per ticket')} *</label>
              <div className="relative">
                <span className="num absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                <Input id="ev-precio" type="number" inputMode="numeric" min={0} value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="15000" className={cn('num pl-7', errors.precio && 'border-danger')} />
              </div>
              {err('precio')}
            </div>
            <div>
              <label className={lbl} htmlFor="ev-cant">{l('Cantidad de entradas', 'Number of tickets')} *</label>
              <Input id="ev-cant" type="number" inputMode="numeric" min={1} value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="300" className={cn('num', errors.cantidad && 'border-danger')} />
              {err('cantidad')}
            </div>
          </div>

          <div className="relative">
            <label className={lbl} htmlFor="ev-dir">{l('Ubicación', 'Location')} *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="ev-dir"
                value={dirQ}
                onChange={(e) => {
                  setDirQ(e.target.value)
                  setDir(null)
                  setShowSug(true)
                }}
                onFocus={() => setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 150)}
                placeholder={l('Buscá la dirección…', 'Search the address…')}
                className={cn('pl-9', errors.ubicacion && 'border-danger')}
                autoComplete="off"
              />
            </div>
            {showSug && sugerencias.length > 0 && (
              <div className="absolute inset-x-0 z-30 mt-1 overflow-hidden rounded-[10px] border border-border bg-surface shadow-lg">
                {sugerencias.map((s) => (
                  <button
                    key={s.dir}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setDir(s)
                      setDirQ(s.dir)
                      setShowSug(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-surface-2"
                  >
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    {s.dir}
                  </button>
                ))}
              </div>
            )}
            {err('ubicacion')}
            <div className="mt-2 overflow-hidden rounded-[12px] border border-border" style={{ height: 130 }}>
              <MapBase
                key={dir?.dir || 'none'}
                center={dir ? [dir.lat, dir.lng] : [-34.6037, -58.4316]}
                zoom={dir ? 15 : 11}
                style={{ height: 130 }}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
              >
                {dir && <Marker position={[dir.lat, dir.lng]} icon={pinIcon} />}
              </MapBase>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[12.5px] font-semibold">{l('Fotos', 'Photos')} <span className="num font-normal text-muted">{fotos.length}/5</span></label>
              {fotos.length === 0 && (
                <button onClick={() => setFotos(fotosDe((categoria || 'fiestas') as Categoria, 1, 4))} className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  {l('Usar fotos de ejemplo', 'Use sample photos')}
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {fotos.map((f, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-[10px] border border-border" style={{ background: f }}>
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-black/55 px-1 text-[9px] font-semibold text-white">{l('Portada', 'Cover')}</span>}
                  <button onClick={() => setFotos((fs) => fs.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white" aria-label="remove">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {fotos.length < 5 && (
                <button onClick={() => fileRef.current?.click()} className="grid aspect-square place-items-center rounded-[10px] border-2 border-dashed border-border text-muted hover:border-accent hover:text-accent">
                  <span className="flex flex-col items-center gap-1 text-[11px] font-medium">
                    <ImagePlus className="h-5 w-5" />
                    {l('Agregar', 'Add')}
                  </span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = '' }} />
            <p className="mt-2 text-[11px] text-muted">
              {l('Se redimensionan a 200×200 (miniatura) y 1200×800 (portada).', 'Resized to 200×200 (thumbnail) and 1200×800 (cover).')}
            </p>
            <DevNotice {...STORAGE_NOTICE} className="mt-2 xl:hidden" />
          </div>
        </div>
      </DeviceScroll>
      <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-2 gap-2 border-t border-border bg-surface/95 p-3 backdrop-blur">
        <button onClick={() => guardar('borrador')} className="h-11 rounded-[12px] border border-border text-[13.5px] font-semibold hover:bg-surface-2">
          {l('Guardar borrador', 'Save draft')}
        </button>
        <button
          data-trailer="btn-enviar-aprobacion"
          onClick={() => guardar('pendiente')}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[12px] bg-accent text-[13.5px] font-semibold text-white"
        >
          <Send className="h-4 w-4" />
          {l('Enviar a aprobación', 'Send for approval')}
        </button>
      </div>
    </DevicePage>
  )
}
