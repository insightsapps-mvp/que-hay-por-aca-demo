import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Compass, MessageCircle, Sparkles, X } from 'lucide-react'
import { WHATSAPP_URL } from '@/lib/utils'
import { tk, useL, useSettings, type Lang } from '@/i18n'
import type { Role } from '@/types'
import { enCurso, esHoy, ME_ID } from '@/data/mock'
import { MY_ORG, useStore } from '@/store'
import { navForRole } from '@/layout/nav'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Step {
  id: string
  selector?: string
  route?: string
  title: string
  body: string
}

/** Pasos en ORDEN VISUAL EXACTO del sidebar. Filtrar por rol solo remueve pasos. */
export function getTourSteps(role: Role, lang: Lang): Step[] {
  const L = (es: string, en: string) => (lang === 'en' ? en : es)
  const s = useStore.getState()
  const now = new Date()
  const hoy = s.eventos.filter((e) => e.estado === 'publicado' && esHoy(e, now))
  const live = hoy.filter((e) => enCurso(e, now)).length
  const proximas = s.tickets.filter((t) => t.usuarioId === ME_ID && t.estado === 'valida' && (s.eventos.find((e) => e.id === t.eventoId)?.fin ?? now) > now).length
  const misEv = s.eventos.filter((e) => e.organizadorId === MY_ORG).length
  const pend = s.eventos.filter((e) => e.estado === 'pendiente').length
  const solic = s.solicitudes.filter((x) => x.estado === 'pendiente').length

  const welcome: Record<Role, [string, string, string, string]> = {
    usuario: ['La app del Usuario', 'The User app', 'Así ve Martina la app: eventos cerca, el mapa de esta noche, compra con Mercado Pago y su QR.', 'This is how Martina sees the app: nearby events, tonight’s map, Mercado Pago checkout and her QR.'],
    organizador: ['El panel del Organizador', 'The Organizer panel', 'Así trabaja Nocturna Producciones: carga eventos, sigue sus ventas y responde reseñas.', 'This is how Nocturna Producciones works: uploads events, tracks sales and replies to reviews.'],
    local: ['La puerta del Local', 'The Venue door', 'Así opera Club Vórtice: escanea los QR en la puerta y ve quién entró y cuándo.', 'This is how Club Vórtice operates: scans QRs at the door and sees who got in and when.'],
    admin: ['La Administración', 'Administration', 'Así ves vos toda la plataforma: aprobaciones, pagos, usuarios y categorías.', 'This is how you see the whole platform: approvals, payments, users and categories.'],
  }
  const items: Record<string, [string, string]> = {
    propuesta: ['Acá está todo lo que incluye tu desarrollo, módulo por módulo. Desde cada tarjeta saltás a verlo funcionando.', 'Here’s everything your build includes, module by module. From each card you can jump to see it working.'],
    explorar: ['Buscador, 5 categorías y radio de 1 a 20 km. Subilo a 20 km y aparecen los 9 eventos de zona oeste.', 'Search, 5 categories and a 1–20 km radius. Raise it to 20 km and the 9 west-zone events show up.'],
    mapa: [`${hoy.length} eventos esta noche, ${live} ya arrancaron. Tocá un pin para comprar.`, `${hoy.length} events tonight, ${live} already started. Tap a pin to buy.`],
    entradas: [`Martina tiene ${proximas} entradas próximas con su QR, y el mail de compra a un toque.`, `Martina has ${proximas} upcoming tickets with their QR, and the purchase email one tap away.`],
    eventos: [`Los ${misEv} eventos de Nocturna con estado, vendidas e ingresos. Editá, duplicá o cancelá.`, `Nocturna’s ${misEv} events with status, sales and revenue. Edit, duplicate or cancel.`],
    nuevo: ['Formulario desde el celular: fotos, fecha, precio, entradas y ubicación. Se envía a aprobación.', 'Mobile form: photos, date, price, tickets and location. It’s sent for approval.'],
    metricas: ['Ventas diarias, ingresos netos, ocupación por evento y export a CSV real.', 'Daily sales, net revenue, occupancy by event and a real CSV export.'],
    resenas: ['Promedio, distribución y una reseña de 2★ sin responder esperando tu respuesta.', 'Average, distribution and an unanswered 2★ review waiting for your reply.'],
    escaner: [`Simulá una entrada válida, una ya usada o un código inválido. Ingresaron ${s.ingresados} / 320.`, `Simulate a valid ticket, an already-used one or an invalid code. ${s.ingresados} / 320 checked in.`],
    validaciones: ['Cada escaneo con hora y dispositivo, y la densidad de público por franja con pico a las 00:30.', 'Every scan with time and device, plus crowd density by time slot peaking at 00:30.'],
    dashboard: [`GMV, comisión del 8% y alertas: ${pend} eventos pendientes, 1 devolución y Techno en la Usina al 96%.`, `GMV, 8% fee and alerts: ${pend} pending events, 1 refund and Techno at the Usina at 96%.`],
    aprobacion: [`${pend} eventos en cola con checklist automático. Uno no tiene foto de portada.`, `${pend} events queued with an automatic checklist. One is missing its cover photo.`],
    transacciones: [`${s.transacciones.length} pagos con el timeline de Mercado Pago, devoluciones y CSV.`, `${s.transacciones.length} payments with the Mercado Pago timeline, refunds and CSV.`],
    usuarios: [`${s.usuarios.length} usuarios, ${solic} solicitudes de organizador/local y la matriz de permisos.`, `${s.usuarios.length} users, ${solic} organizer/venue requests and the permissions matrix.`],
    categorias: ['Las 5 categorías de la app: creá, renombrá o apagá una y desaparece de los filtros.', 'The app’s 5 categories: create, rename or switch one off and it disappears from filters.'],
    notificaciones: ['Log de mails entregados, abiertos y rebotados, y la plantilla del mail con QR.', 'Log of delivered, opened and bounced emails, plus the QR email template.'],
  }

  const steps: Step[] = [
    { id: 'welcome', title: L(...(welcome[role].slice(0, 2) as [string, string])), body: L(welcome[role][2], welcome[role][3]) },
    {
      id: 'nav',
      selector: '[data-tour="sidebar-nav"]',
      title: L('El menú', 'The menu'),
      body: L('Arriba la Propuesta comercial y abajo las secciones del rol activo. Cada rol ve solo lo suyo.', 'The commercial Proposal on top and the active role’s sections below. Each role sees only its own.'),
    },
  ]
  let n = 0
  navForRole(role).forEach((g) =>
    g.items.forEach((it) => {
      n++
      steps.push({ id: it.id, selector: `[data-tour="nav-${it.id}"]`, route: it.to, title: `${n}. ${tk(it.key)}`, body: L(...items[it.id]) })
    })
  )
  steps.push(
    {
      id: 'switch',
      selector: '[data-tour="switch-user"]',
      title: L('Cambiá de vista', 'Switch views'),
      body: L('Probá la misma plataforma como Usuario, Organizador, Local o Admin, sin cerrar sesión.', 'Try the same platform as User, Organizer, Venue or Admin, without signing out.'),
    },
    {
      id: 'cta',
      selector: '[data-tour="whatsapp-cta"]',
      title: L('¿Arrancamos?', 'Shall we start?'),
      body: L('Si te cierra lo que viste, escribinos por WhatsApp y arrancamos.', 'If what you saw works for you, message us on WhatsApp and we’ll get started.'),
    }
  )
  return steps
}

type Rect = { x: number; y: number; w: number; h: number }
const PAD = 8

function visibleEl(selector: string): HTMLElement | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(selector))
  return els.find((e) => {
    const r = e.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }) ?? null
}

export function Tour() {
  const l = useL()
  const lang = useSettings((s) => s.lang)
  const role = useStore((s) => s.role)
  const open = useStore((s) => s.tourOpen)
  const run = useStore((s) => s.tourRun)
  const trailer = useStore((s) => s.trailer)
  const closeTour = useStore((s) => s.closeTour)
  const cancelarPreview = useStore((s) => s.cancelarPreview)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const steps = React.useMemo(() => getTourSteps(role, lang), [role, lang])
  const [i, setI] = React.useState(0)
  const [active, setActive] = React.useState(false)
  const [rect, setRect] = React.useState<Rect | null>(null)
  const [final, setFinal] = React.useState(false)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const tipRef = React.useRef<HTMLDivElement>(null)
  const [tipSize, setTipSize] = React.useState({ w: 360, h: 200 })

  const clearTimers = React.useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  // Solo se abre con el botón ✨ Tour (store.openTour). Cada apertura arranca en el paso 1.
  React.useEffect(() => {
    if (open && !trailer) {
      setI(0)
      setActive(true)
      setFinal(false)
    } else {
      setActive(false)
    }
  }, [open, run, trailer])

  // Si cambia el rol o el idioma con el tour abierto, se reinicia (no lo abre).
  React.useEffect(() => {
    setI(0)
  }, [role, lang])

  const measure = React.useCallback((scroll: boolean) => {
    const step = steps[i]
    if (!step?.selector) {
      setRect(null)
      return false
    }
    const el = visibleEl(step.selector)
    if (!el) {
      setRect(null)
      return false
    }
    if (scroll) el.scrollIntoView({ block: 'center' })
    const r = el.getBoundingClientRect()
    setRect({ x: r.left, y: r.top, w: r.width, h: r.height })
    return true
  }, [steps, i])

  // Navegar + scrollIntoView + medir (260ms + reintento 220ms)
  React.useEffect(() => {
    if (!active) return
    clearTimers()
    const step = steps[i]
    if (!step) return
    if (step.route && pathname !== step.route) {
      cancelarPreview()
      navigate(step.route)
    }
    setRect(null)
    // 260ms y reintentos de 220ms (la vista nueva puede tardar en montar)
    const intento = (n: number) => {
      if (!measure(true) && n < 5) timers.current.push(setTimeout(() => intento(n + 1), 220))
    }
    timers.current.push(setTimeout(() => intento(0), 260))
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, i, steps])

  // Re-medir en resize/scroll sin volver a llamar scrollIntoView
  React.useEffect(() => {
    if (!active) return
    const onChange = () => measure(false)
    window.addEventListener('resize', onChange)
    window.addEventListener('scroll', onChange, true)
    return () => {
      window.removeEventListener('resize', onChange)
      window.removeEventListener('scroll', onChange, true)
    }
  }, [active, measure])

  React.useLayoutEffect(() => {
    if (tipRef.current) setTipSize({ w: tipRef.current.offsetWidth, h: tipRef.current.offsetHeight })
  }, [i, rect, active, lang])

  const teardown = React.useCallback(() => {
    clearTimers()
    setActive(false)
    setRect(null)
    closeTour()
    const key = `movida_tour_completed_${role}`
    let yaVisto = false
    try {
      yaVisto = localStorage.getItem(key) === '1'
      localStorage.setItem(key, '1')
    } catch {
      /* noop */
    }
    if (!yaVisto) setFinal(true)
  }, [clearTimers, closeTour, role])

  const next = React.useCallback(() => (i >= steps.length - 1 ? teardown() : setI(i + 1)), [i, steps.length, teardown])
  const prev = React.useCallback(() => setI((x) => Math.max(0, x - 1)), [])

  React.useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') teardown()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, next, prev, teardown])

  const step = steps[i]
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900

  // Posición del tooltip
  let tipStyle: React.CSSProperties
  if (!rect) {
    tipStyle = { left: '50%', top: '50%', translate: '-50% -50%' }
  } else {
    const hole = { x: rect.x - PAD, y: rect.y - PAD, w: rect.w + PAD * 2, h: rect.h + PAD * 2 }
    const gap = 16
    let left: number
    let top: number
    if (hole.x + hole.w + gap + tipSize.w <= vw - 12) {
      left = hole.x + hole.w + gap
      top = hole.y + hole.h / 2 - tipSize.h / 2
    } else if (hole.y + hole.h + gap + tipSize.h <= vh - 12) {
      left = hole.x + hole.w / 2 - tipSize.w / 2
      top = hole.y + hole.h + gap
    } else if (hole.y - gap - tipSize.h >= 12) {
      left = hole.x + hole.w / 2 - tipSize.w / 2
      top = hole.y - gap - tipSize.h
    } else {
      left = hole.x - gap - tipSize.w
      top = hole.y + hole.h / 2 - tipSize.h / 2
    }
    left = Math.max(12, Math.min(left, vw - tipSize.w - 12))
    top = Math.max(12, Math.min(top, vh - tipSize.h - 12))
    tipStyle = { left, top }
  }

  return (
    <>
      {active && step && (
        <div className="fixed inset-0 z-[9000]" role="dialog" aria-modal="true" aria-label="Tour">
          {/* Fondo con agujero vía máscara SVG (sin box-shadow 9999px) */}
          <svg className="absolute inset-0 h-full w-full" width={vw} height={vh}>
            <defs>
              <mask id="mv-tour-mask">
                <rect x={0} y={0} width="100%" height="100%" fill="white" />
                {rect && <rect x={rect.x - PAD} y={rect.y - PAD} width={rect.w + PAD * 2} height={rect.h + PAD * 2} rx={12} ry={12} fill="black" />}
              </mask>
            </defs>
            <rect x={0} y={0} width="100%" height="100%" fill="rgba(10,10,10,.55)" mask="url(#mv-tour-mask)" />
          </svg>
          {rect && (
            <div
              className="pointer-events-none absolute rounded-[12px] transition-all duration-300"
              style={{
                left: rect.x - PAD,
                top: rect.y - PAD,
                width: rect.w + PAD * 2,
                height: rect.h + PAD * 2,
                boxShadow: '0 0 0 2px var(--accent), 0 0 28px 4px var(--accent-ring)',
              }}
            >
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500" />
              </span>
            </div>
          )}
          <div
            ref={tipRef}
            data-tour-tooltip
            className="absolute w-[360px] max-w-[calc(100vw-24px)] rounded-2xl border border-border bg-surface p-5 shadow-2xl"
            style={tipStyle}
          >
            <div className="flex items-center justify-between">
              <span className="num inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent">
                <Sparkles className="h-3 w-3" />
                {l('Paso', 'Step')} {i + 1} / {steps.length}
              </span>
              <button onClick={teardown} className="rounded p-1 text-muted hover:bg-surface-2 hover:text-text" aria-label={l('Cerrar', 'Close')}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-[17px] font-bold leading-tight">{step.title}</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{step.body}</p>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={teardown} className="text-[12.5px] font-medium text-muted hover:text-text">
                {l('Saltar tour', 'Skip tour')}
              </button>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={prev} disabled={i === 0}>
                  <ArrowLeft /> {l('Atrás', 'Back')}
                </Button>
                <Button size="sm" onClick={next}>
                  {i === steps.length - 1 ? l('Terminar', 'Finish') : l('Siguiente', 'Next')}
                  {i < steps.length - 1 && <ArrowRight />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal final (centrado, Regla A). Cierra también con click en el backdrop. */}
      <Dialog open={final} onOpenChange={setFinal}>
        <DialogContent data-tour-final className="max-w-[440px] text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent">
            <Sparkles className="h-6 w-6" />
          </span>
          <DialogTitle className="mt-3 text-[22px]">{l('¡Listo el recorrido!', 'Tour complete!')}</DialogTitle>
          <DialogDescription className="mt-1.5">
            {l('Ya viste cómo funciona para este rol. Podés seguir explorando o hablar con nosotros para arrancar.', 'You’ve seen how it works for this role. Keep exploring or talk to us to get started.')}
          </DialogDescription>
          <div className="mt-6 grid gap-2">
            <Button asChild size="lg">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener" onClick={() => setFinal(false)}>
                <MessageCircle /> {l('Quiero mi app →', 'I want my app →')}
              </a>
            </Button>
            <Button variant="outline" size="lg" onClick={() => setFinal(false)}>
              <Compass /> {l('Explorar por mi cuenta', 'Explore on my own')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
