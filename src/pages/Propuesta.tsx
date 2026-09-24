import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  FileSignature,
  Hammer,
  Headphones,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageCircle,
  Printer,
  QrCode,
  Rocket,
  ScanLine,
  Search,
  ShieldCheck,
  Smartphone,
  Star,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn, BRAND, WHATSAPP_URL } from '@/lib/utils'
import { fmtUSD, useL, useSettings } from '@/i18n'
import type { Role } from '@/types'
import { useStore } from '@/store'
import { PoweredBy } from '@/components/common'
import { Button } from '@/components/ui/button'

type Bi = [string, string]
interface Modulo {
  n: number
  icon: LucideIcon
  nombre: Bi
  desc: Bi
  bullets: Bi[]
  role: Role
  view: string
  donde: Bi
}

const MODULOS: Modulo[] = [
  {
    n: 1, icon: Smartphone, role: 'usuario', view: '/app/explorar',
    nombre: ['App nativa iOS + Android', 'Native iOS + Android app'],
    desc: ['Dos apps nativas reales, una para cada tienda, con cámara, GPS y push.', 'Two real native apps, one for each store, with camera, GPS and push.'],
    bullets: [['Interfaz nativa de cada plataforma', 'Native interface on each platform'], ['Cámara para fotos de eventos y perfiles', 'Camera for event and profile photos'], ['GPS para centrar el mapa', 'GPS to center the map'], ['Notificaciones push', 'Push notifications']],
    donde: ['Rol Usuario · Explorar', 'User role · Explore'],
  },
  {
    n: 2, icon: Search, role: 'usuario', view: '/app/explorar?filtros=1',
    nombre: ['Búsqueda por geolocalización y categorías', 'Geolocation and category search'],
    desc: ['El usuario ve primero lo que le queda cerca, filtrado por lo que le gusta.', 'Users see what’s closest first, filtered by what they like.'],
    bullets: [['Radio de 1 a 20 km visible en el mapa', '1 to 20 km radius shown on the map'], ['Categorías multi-selección', 'Multi-select categories'], ['Orden por distancia, fecha, popularidad o precio', 'Sort by distance, date, popularity or price'], ['Búsqueda por texto', 'Text search']],
    donde: ['Rol Usuario · Filtros abiertos', 'User role · Filters open'],
  },
  {
    n: 3, icon: Users, role: 'admin', view: '/admin/usuarios',
    nombre: ['Sistema de roles', 'Role system'],
    desc: ['Cuatro perfiles, cada uno ve y hace solo lo suyo.', 'Four profiles, each one sees and does only its own.'],
    bullets: [['Usuario, Organizador, Local y Admin', 'User, Organizer, Venue and Admin'], ['Login con verificación de mail', 'Login with email verification'], ['Cada organizador ve solo sus eventos', 'Each organizer sees only their events'], ['Admin puede ver la app como usuario', 'Admin can view the app as a user']],
    donde: ['Rol Admin · Usuarios y roles', 'Admin role · Users & roles'],
  },
  {
    n: 4, icon: CreditCard, role: 'usuario', view: '/app/evento/ev-01/checkout',
    nombre: ['Pagos online', 'Online payments'],
    desc: ['Checkout adentro de la app con Mercado Pago: tarjeta, transferencia o billetera.', 'In-app checkout with Mercado Pago: card, transfer or wallet.'],
    bullets: [['Varios métodos en un solo checkout', 'Several methods in one checkout'], ['Confirmación en tiempo real', 'Real-time confirmation'], ['Historial y recibos descargables', 'History and downloadable receipts'], ['Reintento si el pago se rechaza', 'Retry if payment is declined']],
    donde: ['Rol Usuario · Checkout', 'User role · Checkout'],
  },
  {
    n: 5, icon: BarChart3, role: 'organizador', view: '/organizador/metricas',
    nombre: ['Panel de métricas', 'Metrics dashboard'],
    desc: ['Cada rol ve sus números: ventas, ocupación, ingresos, público por horario.', 'Each role sees its numbers: sales, occupancy, revenue, crowd by time.'],
    bullets: [['Ventas diarias y acumuladas', 'Daily and cumulative sales'], ['Ocupación, precio promedio y rating', 'Occupancy, average price and rating'], ['Filtros por fecha, categoría y zona', 'Filters by date, category and zone'], ['Export a CSV', 'CSV export']],
    donde: ['Rol Organizador · Métricas', 'Organizer role · Metrics'],
  },
  {
    n: 6, icon: Mail, role: 'usuario', view: '/app/entradas/tk-001?mail=1',
    nombre: ['Mails automáticos con código de compra', 'Automatic emails with purchase code'],
    desc: ['Apenas se aprueba el pago, llega el mail con el QR y todos los datos del evento.', 'As soon as payment is approved, the email arrives with the QR and all event details.'],
    bullets: [['QR único por compra', 'Unique QR per purchase'], ['Mail que se ve bien en celular', 'Email that looks great on mobile'], ['Fecha, hora y ubicación del evento', 'Event date, time and location'], ['El QR también queda guardado en la app', 'The QR is also saved in the app']],
    donde: ['Rol Usuario · Vista del mail', 'User role · Email view'],
  },
  {
    n: 7, icon: Upload, role: 'organizador', view: '/organizador/nuevo',
    nombre: ['Carga de eventos', 'Event creation'],
    desc: ['El organizador publica su evento desde el celular en un par de minutos.', 'Organizers publish their event from their phone in a couple of minutes.'],
    bullets: [['Hasta 5 fotos con preview', 'Up to 5 photos with preview'], ['Fecha y hora con picker nativo', 'Native date and time picker'], ['Precio y cantidad de entradas', 'Price and number of tickets'], ['Estados: Borrador → Pendiente → Publicado', 'Statuses: Draft → Pending → Published']],
    donde: ['Rol Organizador · Cargar evento', 'Organizer role · Create event'],
  },
  {
    n: 8, icon: MapPin, role: 'usuario', view: '/app/mapa',
    nombre: ['Mapa de eventos de hoy', 'Tonight’s event map'],
    desc: ['Todo lo que pasa hoy, en un mapa centrado en donde está el usuario.', 'Everything happening today, on a map centered on the user.'],
    bullets: [['Pines agrupados por zona', 'Pins clustered by zone'], ['Popup con foto, hora y precio', 'Popup with photo, time and price'], ['Solo eventos de hoy o en curso', 'Only today’s or live events'], ['Centrado en tu ubicación', 'Centered on your location']],
    donde: ['Rol Usuario · Mapa de hoy ★', 'User role · Tonight’s map ★'],
  },
  {
    n: 9, icon: Star, role: 'organizador', view: '/organizador/resenas',
    nombre: ['Reseñas y estrellas', 'Reviews and stars'],
    desc: ['Solo reseña quien fue. El organizador responde y el promedio se calcula solo.', 'Only attendees can review. The organizer replies and the average updates itself.'],
    bullets: [['Validación de compra', 'Purchase validation'], ['1 a 5 estrellas + texto', '1 to 5 stars + text'], ['Promedio automático (ej. 4,3)', 'Automatic average (e.g. 4.3)'], ['Respuesta del organizador', 'Organizer reply']],
    donde: ['Rol Organizador · Reseñas', 'Organizer role · Reviews'],
  },
  {
    n: 10, icon: ScanLine, role: 'local', view: '/local/escaner',
    nombre: ['Validación en el local', 'Door validation'],
    desc: ['El local escanea el QR en la puerta y sabe al instante si la entrada es válida.', 'The venue scans the QR at the door and instantly knows if the ticket is valid.'],
    bullets: [['Escaneo con la cámara', 'Camera scanning'], ['Bloquea entradas duplicadas', 'Blocks duplicate tickets'], ['Muestra comprador y cantidad', 'Shows buyer and quantity'], ['Funciona sin conexión y sincroniza después', 'Works offline and syncs later']],
    donde: ['Rol Local · Escáner QR', 'Venue role · QR scanner'],
  },
]

const CIRCUITO: { icon: LucideIcon; t: Bi; d: Bi; wow?: boolean }[] = [
  { icon: Upload, t: ['El organizador carga su evento', 'The organizer uploads the event'], d: ['Fotos, horario, precio y aforo desde la app.', 'Photos, time, price and capacity from the app.'] },
  { icon: ShieldCheck, t: ['Admin lo aprueba', 'Admin approves it'], d: ['Nada se publica sin revisión.', 'Nothing goes live without review.'] },
  { icon: MapPin, t: ['El usuario lo encuentra cerca', 'Users find it nearby'], d: ['Mapa de hoy y búsqueda por distancia y categoría.', 'Tonight’s map and search by distance and category.'], wow: true },
  { icon: CreditCard, t: ['Compra con Mercado Pago', 'Pays with Mercado Pago'], d: ['Tarjeta, transferencia o billetera, y le llega su QR por mail.', 'Card, transfer or wallet, and the QR arrives by email.'] },
  { icon: QrCode, t: ['El local escanea en la puerta', 'The venue scans at the door'], d: ['Válida, usada o inválida en un segundo.', 'Valid, used or invalid in one second.'] },
  { icon: Star, t: ['Reseñas y métricas', 'Reviews and metrics'], d: ['Cada evento deja datos para el próximo.', 'Every event leaves data for the next one.'] },
]

const HITOS: { icon: LucideIcon; t: Bi }[] = [
  { icon: FileSignature, t: ['Relevamiento y arquitectura', 'Discovery and architecture'] },
  { icon: Hammer, t: ['Desarrollo del núcleo de las apps', 'Core app development'] },
  { icon: Bell, t: ['Pagos, mails, métricas y validación QR', 'Payments, emails, metrics and QR validation'] },
  { icon: Rocket, t: ['Publicación en App Store y Google Play + QA + 30 días de soporte', 'App Store and Google Play release + QA + 30 days of support'] },
]

function WhatsAppBtn({ className, size = 'default', full }: { className?: string; size?: 'default' | 'lg'; full?: boolean }) {
  const l = useL()
  return (
    <Button asChild size={size} className={cn(full && 'w-full', className)}>
      <a href={WHATSAPP_URL} target="_blank" rel="noopener">
        <MessageCircle />
        {l('Avanzar por WhatsApp', 'Move forward on WhatsApp')}
      </a>
    </Button>
  )
}

function Inversion() {
  const l = useL()
  const lang = useSettings((s) => s.lang)
  const [revealed, setRevealed] = React.useState(false) // NO se persiste: cada F5 arranca oculto
  const [mounted, setMounted] = React.useState(false)
  const usd = (n: number) => fmtUSD(n, lang)
  const unmountTimer = React.useRef<ReturnType<typeof setTimeout>>()
  React.useEffect(() => () => clearTimeout(unmountTimer.current), [])
  const toggle = () => {
    clearTimeout(unmountTimer.current)
    if (!revealed) setMounted(true)
    // Al ocultar, los montos salen del DOM apenas termina el cierre (~.25s)
    else unmountTimer.current = setTimeout(() => setMounted(false), 300)
    setRevealed((v) => !v)
  }
  return (
    <section id="inversion" className="card mt-10 p-5 sm:p-7" data-tour-hero="inversion">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kicker">{l('Inversión', 'Investment')}</p>
          <h2 className="mt-1 text-[22px] font-bold tracking-tight">{l('Inversión', 'Investment')}</h2>
          {!revealed && <p className="num mt-2 text-[28px] tracking-widest text-muted">USD ••••••</p>}
        </div>
        <Button variant={revealed ? 'outline' : 'default'} size="lg" onClick={toggle} className="w-full sm:w-auto" aria-expanded={revealed}>
          {revealed ? <EyeOff /> : <Eye />}
          {revealed ? l('Ocultar inversión', 'Hide investment') : l('Ver inversión', 'See investment')}
        </Button>
      </div>
      <motion.div
        initial={false}
        animate={{ height: revealed ? 'auto' : 0, opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onAnimationComplete={() => !revealed && setMounted(false)}
        className="overflow-hidden"
      >
        {mounted && (
          <div className="pt-6">
            <div className="border-t border-border pt-6">
              <p className="num text-[44px] font-bold leading-none tracking-tight sm:text-[56px]">{usd(6500)}</p>
              <p className="mt-2 text-sm text-muted">{l('Proyecto completo · pago único de plataforma', 'Complete project · one-time platform payment')}</p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {MODULOS.map((m) => (
                <div key={m.n} className="flex items-center gap-2 text-[13px]">
                  <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="num text-muted">{String(m.n).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1 truncate">{l(...m.nombre)}</span>
                  <span className="text-xs font-semibold text-success">{l('Incluido', 'Included')}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-[13px] sm:col-span-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                <Headphones className="h-3.5 w-3.5 text-muted" />
                <span className="flex-1">{l('30 días de soporte post-entrega', '30 days of post-delivery support')}</span>
                <span className="text-xs font-semibold text-success">{l('Incluido', 'Included')}</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-[12px] border border-border p-4">
                <p className="kicker">{l('Condiciones de pago', 'Payment terms')}</p>
                <div className="mt-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{l('50% al firmar', '50% on signing')}</p>
                      <p className="text-xs text-muted">{l('Arrancamos el onboarding y relevamiento.', 'We kick off onboarding and discovery.')}</p>
                    </div>
                    <span className="num text-[18px]">{usd(3250)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
                    <div>
                      <p className="text-sm font-semibold">{l('50% a 30 días', '50% at 30 days')}</p>
                      <p className="text-xs text-muted">{l('Entrega final: plataforma completa, probada y en producción.', 'Final delivery: complete platform, tested and in production.')}</p>
                    </div>
                    <span className="num text-[18px]">{usd(3250)}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-[12px] border-2 border-accent bg-accent-soft p-4">
                <p className="text-sm font-semibold text-accent">{l('Pagando el 100% por adelantado: 15% de descuento', 'Paying 100% upfront: 15% discount')}</p>
                <div className="mt-3 flex flex-wrap items-baseline gap-3">
                  <span className="num text-[18px] text-muted line-through">{usd(6500)}</span>
                  <span className="num text-[36px] font-bold leading-none">{usd(5525)}</span>
                </div>
                <p className="mt-2 inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">{l(`Ahorrás ${usd(975)}`, `You save ${usd(975)}`)}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  )
}

export default function Propuesta() {
  const l = useL()
  const abrirPreview = useStore((s) => s.abrirPreview)
  const destacado = useStore((s) => s.moduloDestacado)
  const refs = React.useRef<Record<number, HTMLDivElement | null>>({})

  React.useEffect(() => {
    if (!destacado) return
    const id = setTimeout(() => refs.current[destacado]?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120)
    return () => clearTimeout(id)
  }, [destacado])

  return (
    <div className="print-full mx-auto w-full max-w-[1180px]">
      {/* 7.1 Encabezado */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-accent">
            <LayoutDashboard className="h-3 w-3" />
            {l('PROPUESTA COMERCIAL · SEBASTIAN', 'COMMERCIAL PROPOSAL · SEBASTIAN')}
          </span>
          <h1 className="mt-3 text-[32px] font-extrabold leading-tight tracking-tight sm:text-[40px]">{l('Propuesta para Sebastian', 'Proposal for Sebastian')}</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-muted">
            {l(
              `${BRAND}: app nativa iOS + Android con pagos integrados, mapa de eventos en vivo y validación QR en la puerta. 10 módulos, 10 semanas, 30 días de soporte incluidos.`,
              `${BRAND}: native iOS + Android app with integrated payments, a live event map and QR validation at the door. 10 modules, 10 weeks, 30 days of support included.`
            )}
          </p>
        </div>
        <div className="no-print flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> {l('Imprimir', 'Print')}
          </Button>
          <WhatsAppBtn />
        </div>
      </header>

      {/* 7.2 El circuito */}
      <section className="mt-10" data-trailer="propuesta-circuito">
        <p className="kicker">{l('El circuito', 'The loop')}</p>
        <h2 className="mt-1 text-[22px] font-bold tracking-tight">{l('De la carga del evento a la puerta', 'From event upload to the door')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {CIRCUITO.map((c, i) => (
            <div key={i} className={cn('card relative flex flex-col p-4', c.wow && 'border-accent bg-accent-soft ring-1 ring-accent/30')}>
              {c.wow && (
                <span className="absolute -top-2.5 left-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">{l('Lo que te diferencia', 'What sets you apart')}</span>
              )}
              <div className="flex items-center justify-between">
                <span className="num text-[10.5px] tracking-wider text-muted">{l('PASO', 'STEP')} {i + 1}</span>
                <span className={cn('grid h-8 w-8 place-items-center rounded-[9px]', c.wow ? 'bg-accent text-white' : 'bg-surface-2 text-accent')}>
                  <c.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-[14px] font-semibold leading-snug">{l(...c.t)}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-muted">{l(...c.d)}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{l('Y vuelve a empezar: cada venta y cada reseña hacen más fuerte el próximo evento.', 'And it starts again: every sale and every review makes the next event stronger.')}</p>
      </section>

      {/* 7.3 Módulos */}
      <section className="mt-12" data-trailer="propuesta-modulos">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">{l('Alcance', 'Scope')}</p>
            <h2 className="mt-1 text-[22px] font-bold tracking-tight">{l('Qué incluye la plataforma', 'What the platform includes')}</h2>
          </div>
          <span className="num shrink-0 text-[15px] text-muted">{l('10 módulos', '10 modules')}</span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MODULOS.map((m) => {
            const hi = destacado === m.n
            return (
              <div
                key={m.n}
                ref={(el) => (refs.current[m.n] = el)}
                className={cn(
                  'card flex flex-col p-5 transition-all duration-500',
                  hi && '-translate-y-0.5 border-accent shadow-xl ring-4 ring-accent-ring'
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="num text-[13px] text-muted">{String(m.n).padStart(2, '0')}</span>
                  <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-accent-soft text-accent">
                    <m.icon className="h-[18px] w-[18px]" />
                  </span>
                </div>
                <p className="mt-2 text-[16px] font-semibold leading-snug">{l(...m.nombre)}</p>
                <p className="mt-1 text-[13.5px] leading-snug text-muted">{l(...m.desc)}</p>
                <ul className="mt-3 space-y-1.5">
                  {m.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-[13px]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      {l(...b)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4">
                  <button
                    data-tour-hero={`modulo-${m.n}`}
                    onClick={() => abrirPreview(m.n, m.view, l(...m.nombre), m.role)}
                    className="no-print group inline-flex items-center gap-1 text-[13px] font-semibold text-accent"
                  >
                    {l('Ver en el demo', 'See it in the demo')}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    <span className="ml-1 font-normal text-muted">· {l(...m.donde)}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 7.4 Cómo trabajamos */}
      <section className="mt-12">
        <p className="kicker">{l('Cómo trabajamos', 'How we work')}</p>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="card p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[20px] font-bold tracking-tight">{l('4 hitos', '4 milestones')}</h2>
              <span className="num text-sm text-accent">{l('10 semanas desde la firma', '10 weeks from signing')}</span>
            </div>
            <p className="mt-1 text-xs text-muted">{l('Etapa 00 · Onboarding + relevamiento: mapeo de flujo, migración de datos y arquitectura.', 'Stage 00 · Onboarding + discovery: flow mapping, data migration and architecture.')}</p>
            <div className="relative mt-6">
              <div className="absolute left-[18px] right-[18px] top-[18px] hidden h-0.5 bg-gradient-to-r from-accent via-accent/60 to-accent/20 md:block" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {HITOS.map((h, i) => (
                  <div key={i} className="relative flex gap-3 md:flex-col md:items-start">
                    <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-accent bg-surface text-accent">
                      <h.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="num text-[11px] text-muted">{String(i + 1).padStart(2, '0')}</p>
                      <p className="text-[13.5px] font-semibold leading-snug">{l(...h.t)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card flex flex-col justify-between border-success/30 p-5 sm:p-6">
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-green-100 text-success dark:bg-green-500/15">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <p className="mt-3 text-[16px] font-bold">{l('Garantía 100%', '100% guarantee')}</p>
              <p className="mt-1 text-[13.5px] text-muted">{l('Si el primer prototipo no cumple lo acordado, te devolvemos todo.', 'If the first prototype doesn’t meet what we agreed, we refund everything.')}</p>
            </div>
            <p className="mt-4 border-t border-border pt-3 text-xs font-medium">{l('Contrato formal · 1 mes de soporte incluido', 'Formal contract · 1 month of support included')}</p>
          </div>
        </div>
      </section>

      {/* 7.5 Inversión (oculta por defecto) */}
      <Inversion />

      {/* 7.6 Cierre */}
      <section className="no-print mt-10">
        <WhatsAppBtn size="lg" full className="h-14 text-[16px]" />
        <PoweredBy className="mt-3 text-center text-[11px]" />
      </section>
      <PoweredBy className="mt-6 hidden text-center print:block" />
    </div>
  )
}
