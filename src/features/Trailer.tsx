import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, MousePointer2, Play, X } from 'lucide-react'
import { WHATSAPP_URL } from '@/lib/utils'
import { useL } from '@/i18n'
import type { Role } from '@/types'
import { useStore } from '@/store'
import { useRadio } from '@/pages/usuario/shared'

type Bi = [string, string]
interface TrailerAction {
  selector: string
  click?: boolean
  wait?: number
}
export interface TrailerScene {
  view?: string
  role?: Role
  actions?: TrailerAction[]
  position?: 'bottom' | 'top'
  chapter: Bi
  title: Bi
  body: Bi
  duration: number
  cta?: boolean
  prep?: () => void
}

const SCENES: TrailerScene[] = [
  {
    view: '/propuesta', role: 'usuario', duration: 9000,
    actions: [{ selector: '[data-trailer="propuesta-circuito"]', wait: 2600 }, { selector: '[data-trailer="propuesta-modulos"]' }],
    chapter: ['01 · Propuesta', '01 · Proposal'], title: ['Todo lo que incluye', 'Everything included'],
    body: ['El circuito completo y los 10 módulos, cada uno con su link para verlo funcionando.', 'The full loop and the 10 modules, each with a link to see it working.'],
  },
  {
    view: '/app/explorar', role: 'usuario', duration: 7000,
    prep: () => useRadio.setState({ radio: 10 }),
    actions: [{ selector: '[data-trailer="cat-fiestas"]', click: true }],
    chapter: ['02 · Usuario', '02 · User'], title: ['Buscá por lo que te gusta', 'Search for what you like'],
    body: ['Buscador libre y categorías multi-selección, ordenado por lo que tenés más cerca.', 'Free search and multi-select categories, sorted by what’s closest.'],
  },
  {
    view: '/app/explorar?filtros=1', role: 'usuario', duration: 7500,
    actions: [{ selector: '[data-trailer="radio-20"]', click: true }],
    chapter: ['03 · Usuario', '03 · User'], title: ['Radio de 1 a 20 km', '1 to 20 km radius'],
    body: ['Al subir a 20 km se suman los eventos de zona oeste: Morón, Castelar, Haedo y Ramos.', 'At 20 km the west-zone events join in: Morón, Castelar, Haedo and Ramos.'],
  },
  {
    view: '/app/mapa', role: 'usuario', duration: 7000,
    actions: [{ selector: '.mv-map-sheet' }],
    chapter: ['04 · Mapa de hoy ★', '04 · Tonight’s map ★'], title: ['Lo que pasa esta noche', 'What’s on tonight'],
    body: ['Solo eventos de hoy. Los que ya arrancaron laten en el mapa.', 'Only today’s events. The ones already running pulse on the map.'],
  },
  {
    duration: 7000,
    actions: [{ selector: '[data-trailer="mapa-pin-destacado"]', click: true }],
    chapter: ['05 · Mapa de hoy ★', '05 · Tonight’s map ★'], title: ['Del pin a la compra', 'From pin to purchase'],
    body: ['Un toque en el pin: foto, hora, precio y botón de compra.', 'One tap on the pin: photo, time, price and a buy button.'],
  },
  {
    view: '/app/evento/ev-01', role: 'usuario', duration: 7000,
    actions: [{ selector: '[data-trailer="btn-comprar"]' }],
    chapter: ['06 · Evento', '06 · Event'], title: ['Techno en la Usina', 'Techno at the Usina'],
    body: ['Detalle, aforo en vivo (96%), reseñas verificadas y compra de 1 a 6 entradas.', 'Details, live capacity (96%), verified reviews and 1 to 6 tickets.'],
  },
  {
    view: '/app/evento/ev-01/checkout?cant=2', role: 'usuario', duration: 7500,
    actions: [{ selector: '[data-trailer="metodo-billetera"]', click: true, wait: 700 }, { selector: '[data-trailer="btn-pagar"]', click: true }],
    chapter: ['07 · Checkout', '07 · Checkout'], title: ['Pago con Mercado Pago', 'Mercado Pago checkout'],
    body: ['Tarjeta, transferencia o billetera, sin salir de la app.', 'Card, transfer or wallet, without leaving the app.'],
  },
  {
    duration: 8000,
    actions: [{ selector: '[data-trailer="btn-ver-mail"]', click: true }],
    chapter: ['08 · Entrada', '08 · Ticket'], title: ['QR al instante y por mail', 'Instant QR, also by email'],
    body: ['Pago aprobado, QR único guardado en la app y el mail listo en la bandeja.', 'Payment approved, unique QR saved in the app and the email in the inbox.'],
  },
  {
    view: '/organizador/nuevo', role: 'organizador', duration: 7000,
    actions: [{ selector: '[data-trailer="btn-fotos-ejemplo"]', click: true, wait: 900 }, { selector: '[data-trailer="btn-enviar-aprobacion"]' }],
    chapter: ['09 · Organizador', '09 · Organizer'], title: ['Cargá tu evento desde el celu', 'Create your event from your phone'],
    body: ['Fotos, fecha, precio, entradas y ubicación. Se envía a aprobación.', 'Photos, date, price, tickets and location. Sent for approval.'],
  },
  {
    view: '/admin/aprobacion', role: 'admin', duration: 7000,
    prep: () => ['ev-37', 'ev-38'].forEach((id) => useStore.getState().actualizarEvento(id, { estado: 'pendiente' })),
    actions: [{ selector: '[data-trailer="btn-aprobar"]', click: true }],
    chapter: ['10 · Admin', '10 · Admin'], title: ['Nada se publica sin revisión', 'Nothing goes live without review'],
    body: ['Checklist automático y un click: el evento aparece en Explorar y en el mapa.', 'Automatic checklist and one click: the event shows up in Explore and on the map.'],
  },
  {
    view: '/local/escaner', role: 'local', duration: 7000,
    actions: [{ selector: '[data-trailer="btn-escanear"]', click: true }],
    chapter: ['11 · Local', '11 · Venue'], title: ['Validación en la puerta', 'Door validation'],
    body: ['Escanea el QR y en un segundo: entrada válida, ya usada o inválida.', 'Scan the QR and in one second: valid, already used or invalid.'],
  },
  {
    view: '/organizador/metricas', role: 'organizador', duration: 8500, cta: true,
    actions: [{ selector: '.grid.grid-cols-2.gap-3' }],
    chapter: ['12 · Métricas', '12 · Metrics'], title: ['Cada venta, en tiempo real', 'Every sale, in real time'],
    body: ['Ventas, ingresos, ocupación y export a CSV. ¿Lo arrancamos?', 'Sales, revenue, occupancy and CSV export. Shall we start?'],
  },
]

type Rect = { x: number; y: number; w: number; h: number }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function waitFor(selector: string, timeout: number, alive: () => boolean) {
  const t0 = Date.now()
  while (alive() && Date.now() - t0 < timeout) {
    const el = Array.from(document.querySelectorAll<HTMLElement>(selector)).find((e) => {
      const r = e.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    })
    if (el) return el
    await sleep(120)
  }
  return null
}

export function Trailer() {
  const l = useL()
  const navigate = useNavigate()
  const active = useStore((s) => s.trailer)
  const setTrailer = useStore((s) => s.setTrailer)
  const [idx, setIdx] = React.useState(0)
  const [cursor, setCursor] = React.useState({ x: 0, y: 0 })
  const [ring, setRing] = React.useState<Rect | null>(null)
  const [ripple, setRipple] = React.useState(0)
  const targetRef = React.useRef<HTMLElement | null>(null)

  const salir = React.useCallback(() => {
    setTrailer(false)
    setIdx(0)
    setRing(null)
    targetRef.current = null
    navigate('/login')
  }, [setTrailer, navigate])

  React.useEffect(() => {
    if (!active) return
    setIdx(0)
    setCursor({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  }, [active])

  // Esc para salir
  React.useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && salir()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, salir])

  // El anillo sigue al target (scroll / layout)
  React.useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      const el = targetRef.current
      if (!el || !el.isConnected) return
      const r = el.getBoundingClientRect()
      setRing({ x: r.left, y: r.top, w: r.width, h: r.height })
    }, 150)
    return () => clearInterval(id)
  }, [active])

  // Motor de escenas
  React.useEffect(() => {
    if (!active) return
    let alive = true
    const isAlive = () => alive
    const scene = SCENES[idx]
    ;(async () => {
      targetRef.current = null
      setRing(null)
      scene.prep?.()
      if (scene.role) useStore.setState({ role: scene.role, preview: null })
      if (scene.view) navigate(scene.view)
      await sleep(900)
      for (const a of scene.actions ?? []) {
        if (!alive) return
        const el = await waitFor(a.selector, 3500, isAlive)
        if (!el || !alive) continue
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        await sleep(650)
        if (!alive) return
        targetRef.current = el
        const r = el.getBoundingClientRect()
        setRing({ x: r.left, y: r.top, w: r.width, h: r.height })
        const cx = Math.min(r.left + r.width / 2, window.innerWidth - 20)
        const cy = Math.min(Math.max(r.top + r.height / 2, 20), window.innerHeight - 20)
        setCursor({ x: cx, y: cy })
        await sleep(1000)
        if (!alive) return
        if (a.click) {
          setRipple((n) => n + 1)
          el.click()
        }
        await sleep(a.wait ?? 400)
      }
    })()
    const t = setTimeout(() => alive && setIdx((i) => (i + 1) % SCENES.length), scene.duration)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [active, idx, navigate])

  if (!active) return null
  const scene = SCENES[idx]

  return (
    <div className="pointer-events-none fixed inset-0 z-[9990]" aria-live="polite">
      {/* bloquear interacción con la app mientras corre */}
      <div className="pointer-events-auto absolute inset-0 z-[9990]" />

      {/* Anillo de highlight con doble box-shadow */}
      {ring && (
        <div
          className="absolute z-[9991] rounded-[14px] transition-all duration-300 ease-out"
          style={{
            left: ring.x - 6,
            top: ring.y - 6,
            width: ring.w + 12,
            height: ring.h + 12,
            boxShadow: '0 0 0 3px #7c3aed, 0 0 0 9px rgba(124,58,237,.28)',
          }}
        />
      )}

      {/* Cursor virtual azul */}
      <div
        className="absolute z-[9993] transition-[left,top] duration-[900ms] ease-[cubic-bezier(.65,0,.35,1)]"
        style={{ left: cursor.x, top: cursor.y }}
      >
        <span key={ripple} className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-blue-500/40" style={{ animation: ripple ? 'pulsering .7s ease-out' : undefined }} />
        <MousePointer2 className="h-7 w-7 -translate-x-1 -translate-y-1 fill-blue-500 text-white drop-shadow-lg" />
      </div>

      {/* Header */}
      <div className="pointer-events-auto absolute left-1/2 top-3 z-[9994] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-zinc-900/80 py-1.5 pl-3 pr-1.5 text-xs text-white backdrop-blur-md">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Play className="h-3 w-3 fill-white" /> {l('Demo automática', 'Automatic demo')}
        </span>
        <span className="num text-white/60">{String(idx + 1).padStart(2, '0')} / {SCENES.length}</span>
        <button onClick={salir} className="grid h-6 w-6 place-items-center rounded-full bg-white/15 hover:bg-white/25" aria-label={l('Salir', 'Exit')}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Captions de vidrio */}
      <div className="pointer-events-auto absolute inset-x-3 bottom-4 z-[9994] mx-auto max-w-[620px] overflow-hidden rounded-2xl border border-white/40 bg-white/75 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75">
        <div className="p-4 sm:p-5">
          <p className="num text-[11px] font-semibold uppercase tracking-wider text-accent">{l(...scene.chapter)}</p>
          <p className="mt-1 text-[18px] font-bold leading-tight text-text sm:text-[20px]">{l(...scene.title)}</p>
          <p className="mt-1 text-[13.5px] text-muted">{l(...scene.body)}</p>
          {scene.cta && (
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener"
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-[10px] bg-accent px-4 text-[14px] font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" /> {l('¿Lo arrancamos? → WhatsApp', 'Shall we start? → WhatsApp')}
            </a>
          )}
        </div>
        <div className="h-1 w-full bg-black/5 dark:bg-white/10">
          <div key={idx} className="h-full bg-accent" style={{ animation: `mv-progress ${scene.duration}ms linear forwards` }} />
        </div>
      </div>
    </div>
  )
}
