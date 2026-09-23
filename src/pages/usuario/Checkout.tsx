import * as React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { AlertTriangle, ArrowLeft, Building2, Check, CreditCard, Loader2, Mail, Minus, Plus, RotateCcw, ShieldCheck, Ticket as TicketIcon, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useL, useSettings, useT } from '@/i18n'
import type { MetodoPago, Ticket } from '@/types'
import { CARGO_SERVICIO, localById } from '@/data/mock'
import { useStore } from '@/store'
import { DevNotice, EventoFoto } from '@/components/common'
import { AppBar, DeviceScroll } from '@/components/DeviceFrame'
import { MailDialog, qrValue } from '@/components/MailPreview'
import { DevicePage, DiaLabel, useFmt } from './shared'

type Fase = 'idle' | 'creando' | 'esperando' | 'exito' | 'error'

const METODOS: { id: MetodoPago; icon: typeof CreditCard; es: string; en: string; subEs: string; subEn: string }[] = [
  { id: 'tarjeta', icon: CreditCard, es: 'Tarjeta de crédito o débito', en: 'Credit or debit card', subEs: 'Visa, Mastercard, Amex · hasta 3 cuotas', subEn: 'Visa, Mastercard, Amex · up to 3 installments' },
  { id: 'transferencia', icon: Building2, es: 'Transferencia', en: 'Bank transfer', subEs: 'CBU/CVU · se acredita al instante', subEn: 'CBU/CVU · credited instantly' },
  { id: 'billetera', icon: Wallet, es: 'Billetera digital', en: 'Digital wallet', subEs: 'Dinero en cuenta de Mercado Pago', subEn: 'Mercado Pago account balance' },
]

const MP_NOTICE = {
  funcion: ['Pago con Mercado Pago', 'Mercado Pago payment'] as [string, string],
  hoy: ['Hoy simulamos la aprobación del pago.', 'Today we simulate payment approval.'] as [string, string],
  real: ['Al desarrollar, la app crea la orden en Mercado Pago y el webhook confirma en tiempo real.', 'Once built, the app creates the order in Mercado Pago and the webhook confirms in real time.'] as [string, string],
}
const WEBHOOK_NOTICE = {
  funcion: ['Webhook de confirmación', 'Confirmation webhook'] as [string, string],
  hoy: ['Hoy la confirmación llega por un temporizador.', 'Today confirmation arrives via a timer.'] as [string, string],
  real: ['Al desarrollar, Mercado Pago avisa al servidor, se genera el QR y se dispara el mail.', 'Once built, Mercado Pago notifies the server, the QR is generated and the email is sent.'] as [string, string],
}

export default function Checkout() {
  const { id = 'ev-01' } = useParams()
  const [params] = useSearchParams()
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const f = useFmt()
  const navigate = useNavigate()
  const ev = useStore((s) => s.eventos.find((e) => e.id === id))
  const comprar = useStore((s) => s.comprar)
  const registrarRechazo = useStore((s) => s.registrarRechazo)
  const [cant, setCant] = React.useState(() => Math.min(6, Math.max(1, Number(params.get('cant')) || 2)))
  const [metodo, setMetodo] = React.useState<MetodoPago>('tarjeta')
  const [fase, setFase] = React.useState<Fase>('idle')
  const [ticket, setTicket] = React.useState<Ticket | null>(null)
  const [mail, setMail] = React.useState(false)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const pagar = React.useCallback(
    (rechazar = false) => {
      if (!ev) return
      setFase('creando')
      timers.current.push(
        setTimeout(() => setFase('esperando'), 800),
        setTimeout(() => {
          if (rechazar) {
            registrarRechazo(ev.id, cant, metodo)
            setFase('error')
          } else {
            setTicket(comprar(ev.id, cant, metodo))
            setFase('exito')
          }
        }, 1800)
      )
    },
    [ev, cant, metodo, comprar, registrarRechazo]
  )

  if (!ev) return null
  const loc = localById(ev.localId)
  const subtotal = ev.precio * cant
  const cargo = Math.round(subtotal * CARGO_SERVICIO)
  const total = subtotal + cargo
  const busy = fase === 'creando' || fase === 'esperando'

  return (
    <DevicePage
      bannerId="checkout"
      title={l('Checkout', 'Checkout')}
      subtitle={l('Pago con Mercado Pago dentro de la app.', 'Mercado Pago payment inside the app.')}
      bullets={[
        ['Crea la orden en Mercado Pago con tarjeta, transferencia o billetera.', 'Creates the Mercado Pago order with card, transfer or wallet.'],
        ['El webhook confirma el pago y genera un QR único por compra.', 'The webhook confirms payment and generates a unique QR per purchase.'],
        ['Si el pago se rechaza, el usuario reintenta sin perder el carrito.', 'If payment is declined, the user retries without losing the cart.'],
      ]}
      side={
        <>
          <DevNotice {...MP_NOTICE} />
          <DevNotice {...WEBHOOK_NOTICE} />
        </>
      }
    >
      <AppBar
        title={fase === 'exito' ? l('¡Listo!', 'Done!') : l('Pagar entradas', 'Pay for tickets')}
        left={
          fase !== 'exito' && (
            <button onClick={() => navigate(`/app/evento/${ev.id}`)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2" aria-label={l('Volver', 'Back')}>
              <ArrowLeft className="h-4 w-4" />
            </button>
          )
        }
      />
      <DeviceScroll>
        {fase === 'exito' && ticket ? (
          <div className="flex flex-col items-center px-5 pb-8 pt-6 text-center">
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-success text-white shadow-lg shadow-success/30"
            >
              <motion.svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.45 }} />
              </motion.svg>
            </motion.div>
            <p className="mt-3 text-[20px] font-bold">{l('¡Pago aprobado!', 'Payment approved!')}</p>
            <p className="text-[13px] text-muted">{ev.titulo[lang]} · {cant} {cant === 1 ? l('entrada', 'ticket') : l('entradas', 'tickets')}</p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-5 rounded-[18px] border border-border bg-white p-4 shadow-sm"
            >
              <QRCodeSVG value={qrValue(ticket.codigo)} size={196} level="M" />
            </motion.div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{l('Código', 'Code')}</p>
            <p className="num text-[22px] tracking-[0.12em]">{ticket.codigo}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[12px] text-accent">
              <Mail className="h-3.5 w-3.5" />
              {l('Te enviamos la entrada a', 'We sent the ticket to')} <b>martina.gomez@gmail.com</b>
            </p>
            <div className="mt-5 grid w-full gap-2">
              <button
                onClick={() => navigate(`/app/entradas/${ticket.id}`)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-accent text-[14px] font-semibold text-white"
              >
                <TicketIcon className="h-4 w-4" />
                {l('Ver mi entrada', 'See my ticket')}
              </button>
              <button
                data-trailer="btn-ver-mail"
                onClick={() => setMail(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-border text-[14px] font-semibold hover:bg-surface-2"
              >
                <Mail className="h-4 w-4" />
                {l('Ver el mail', 'See the email')}
              </button>
            </div>
            <MailDialog open={mail} onOpenChange={setMail} ticket={ticket} evento={ev} comprador="Martina Gómez" email="martina.gomez@gmail.com" />
          </div>
        ) : fase === 'error' ? (
          <div className="flex flex-col items-center px-5 pb-8 pt-10 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-red-100 text-danger dark:bg-red-500/15">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <p className="mt-3 text-[20px] font-bold">{l('Pago rechazado', 'Payment declined')}</p>
            <p className="mt-1 text-[13px] text-muted">{l('Motivo informado por Mercado Pago:', 'Reason reported by Mercado Pago:')}</p>
            <p className="mt-1 rounded-full bg-red-50 px-3 py-1 text-[13px] font-semibold text-danger dark:bg-red-500/10">{l('Fondos insuficientes', 'Insufficient funds')}</p>
            <p className="mt-3 text-[12.5px] text-muted">{l('No se te cobró nada. Tu carrito sigue guardado.', 'You were not charged. Your cart is still saved.')}</p>
            <div className="mt-6 grid w-full gap-2">
              <button onClick={() => pagar(false)} className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-accent text-[14px] font-semibold text-white">
                <RotateCcw className="h-4 w-4" />
                {l('Reintentar', 'Retry')}
              </button>
              <button onClick={() => setFase('idle')} className="h-11 rounded-[12px] border border-border text-[14px] font-semibold hover:bg-surface-2">
                {l('Cambiar método', 'Change method')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-4 pb-6 pt-4">
            <div className="flex gap-3 rounded-[12px] border border-border p-2.5">
              <EventoFoto foto={ev.fotos[0]} cat={ev.categoria} className="h-16 w-16 shrink-0 rounded-[10px]" iconSize="h-5 w-5" />
              <div className="min-w-0">
                <p className="line-clamp-1 text-[14px] font-semibold">{ev.titulo[lang]}</p>
                <p className="text-[12px] text-muted"><DiaLabel ev={ev} /> · <span className="num">{f.time(ev.inicio)}</span></p>
                <p className="line-clamp-1 text-[12px] text-muted">{loc.nombre}</p>
              </div>
            </div>

            <div className="rounded-[12px] border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium">{l('Cantidad', 'Quantity')}</span>
                <div className="flex items-center gap-2">
                  <button disabled={busy || cant <= 1} onClick={() => setCant((c) => c - 1)} className="grid h-7 w-7 place-items-center rounded-full border border-border disabled:opacity-40" aria-label="-"><Minus className="h-3 w-3" /></button>
                  <span className="num w-4 text-center">{cant}</span>
                  <button disabled={busy || cant >= 6} onClick={() => setCant((c) => c + 1)} className="grid h-7 w-7 place-items-center rounded-full border border-border disabled:opacity-40" aria-label="+"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-[13px]">
                <div className="flex justify-between"><span className="text-muted">{l('Subtotal', 'Subtotal')} ({cant} × {f.ars(ev.precio)})</span><span className="num">{f.ars(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted">{l('Cargo de servicio (10%)', 'Service fee (10%)')}</span><span className="num">{f.ars(cargo)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 text-[15px] font-semibold"><span>{l('Total', 'Total')}</span><span className="num text-[18px]">{f.ars(total)}</span></div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-semibold">{l('Método de pago', 'Payment method')}</p>
              <div className="space-y-2" role="radiogroup">
                {METODOS.map((m) => (
                  <button
                    key={m.id}
                    role="radio"
                    aria-checked={metodo === m.id}
                    data-trailer={`metodo-${m.id}`}
                    disabled={busy}
                    onClick={() => setMetodo(m.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[12px] border p-3 text-left transition-colors',
                      metodo === m.id ? 'border-accent bg-accent-soft/60 ring-2 ring-accent-ring' : 'border-border hover:bg-surface-2'
                    )}
                  >
                    <span className={cn('grid h-9 w-9 place-items-center rounded-[10px]', metodo === m.id ? 'bg-accent text-white' : 'bg-surface-2 text-muted')}>
                      <m.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold">{l(m.es, m.en)}</span>
                      <span className="block text-[11.5px] text-muted">{l(m.subEs, m.subEn)}</span>
                    </span>
                    <span className={cn('grid h-4 w-4 place-items-center rounded-full border-2', metodo === m.id ? 'border-accent' : 'border-zinc-300')}>
                      {metodo === m.id && <span className="h-2 w-2 rounded-full bg-accent" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <DevNotice {...MP_NOTICE} className="xl:hidden" />

            <button
              data-trailer="btn-pagar"
              disabled={busy}
              onClick={() => pagar(false)}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#009ee3] text-[15px] font-semibold text-white shadow-lg shadow-sky-500/25 disabled:opacity-80"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              {fase === 'creando' ? l('Creando orden…', 'Creating order…') : fase === 'esperando' ? l('Esperando confirmación…', 'Waiting for confirmation…') : l('Pagar con Mercado Pago', 'Pay with Mercado Pago')}
            </button>
            <div className="flex items-center justify-between text-[11.5px] text-muted">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />{l('Pago protegido', 'Protected payment')}</span>
              <button disabled={busy} onClick={() => pagar(true)} className="underline decoration-dotted underline-offset-2 hover:text-text">
                {l('Simular pago rechazado', 'Simulate declined payment')}
              </button>
            </div>
            <p className="text-center text-[10.5px] text-muted">{t('metodo.' + metodo as 'metodo.tarjeta')} · <span className="num">{f.ars(total)}</span></p>
          </div>
        )}
      </DeviceScroll>
    </DevicePage>
  )
}
