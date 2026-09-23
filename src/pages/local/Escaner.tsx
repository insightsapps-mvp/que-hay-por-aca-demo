import * as React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, CloudOff, Keyboard, RefreshCw, ScanLine, Users, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { fmtTime, tl, useL, useSettings } from '@/i18n'
import { esHoy } from '@/data/mock'
import { MY_LOCAL, useStore, type ScanResult, type ScanTipo } from '@/store'
import { DevNotice } from '@/components/common'
import { DeviceScroll } from '@/components/DeviceFrame'
import { Switch } from '@/components/ui/misc'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DevicePage } from '@/pages/usuario/shared'

const CAM_NOTICE = {
  funcion: ['Cámara y escaneo QR real', 'Real camera and QR scanning'] as [string, string],
  hoy: ['Hoy el escaneo se simula con los botones.', 'Today scanning is simulated with the buttons.'] as [string, string],
  real: ['Al desarrollar, la app abre la cámara, lee el QR y valida contra el servidor en menos de un segundo.', 'Once built, the app opens the camera, reads the QR and validates against the server in under a second.'] as [string, string],
}
const SYNC_NOTICE = {
  funcion: ['Sincronización sin conexión', 'Offline sync'] as [string, string],
  hoy: ['Hoy la cola offline es simulada.', 'Today the offline queue is simulated.'] as [string, string],
  real: ['Al desarrollar, la app guarda la lista de entradas del evento y valida sin señal; al volver la conexión sube los escaneos.', 'Once built, the app caches the event’s ticket list and validates without signal; when back online it uploads the scans.'] as [string, string],
}

function Corners() {
  const c = 'absolute h-9 w-9 border-accent'
  return (
    <>
      <motion.span className={cn(c, 'left-0 top-0 rounded-tl-[14px] border-l-[4px] border-t-[4px]')} animate={{ x: [0, 5, 0], y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.span className={cn(c, 'right-0 top-0 rounded-tr-[14px] border-r-[4px] border-t-[4px]')} animate={{ x: [0, -5, 0], y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.span className={cn(c, 'bottom-0 left-0 rounded-bl-[14px] border-b-[4px] border-l-[4px]')} animate={{ x: [0, 5, 0], y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.span className={cn(c, 'bottom-0 right-0 rounded-br-[14px] border-b-[4px] border-r-[4px]')} animate={{ x: [0, -5, 0], y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
    </>
  )
}

export default function Escaner() {
  const l = useL()
  const lang = useSettings((s) => s.lang)
  const eventos = useStore((s) => s.eventos)
  const tickets = useStore((s) => s.tickets)
  const ingresados = useStore((s) => s.ingresados)
  const offline = useStore((s) => s.offline)
  const pendientes = useStore((s) => s.pendientesSync)
  const escanear = useStore((s) => s.escanear)
  const setOffline = useStore((s) => s.setOffline)
  const sincronizar = useStore((s) => s.sincronizar)
  const deHoy = eventos.filter((e) => e.localId === MY_LOCAL && e.estado === 'publicado' && esHoy(e))
  const [evId, setEvId] = React.useState(deHoy[0]?.id ?? 'ev-02')
  const ev = eventos.find((e) => e.id === evId) ?? eventos.find((e) => e.id === 'ev-02')!
  const [res, setRes] = React.useState<ScanResult | null>(null)
  const [manual, setManual] = React.useState('')
  const [scanning, setScanning] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>()
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const run = React.useCallback(
    (tipo: ScanTipo, codigo?: string) => {
      setScanning(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        setScanning(false)
        setRes(escanear(tipo, codigo))
        timer.current = setTimeout(() => setRes(null), 4500)
      }, 450)
    },
    [escanear]
  )

  const validarManual = () => {
    const code = manual.trim().toUpperCase()
    if (code.length < 6) {
      toast.error(tl('Ingresá el código de 10 caracteres', 'Enter the 10-character code'))
      return
    }
    const tkt = tickets.find((t) => t.codigo === code)
    const tipo: ScanTipo = !tkt ? 'invalida' : tkt.estado === 'valida' ? 'valida' : tkt.estado === 'usada' ? 'usada' : 'invalida'
    run(tipo, code)
    setManual('')
  }

  const pct = Math.min(100, (ingresados / ev.aforo) * 100)

  return (
    <DevicePage
      role="local"
      bannerId="local-escaner"
      title={l('Escáner QR', 'QR scanner')}
      subtitle="Club Vórtice · Palermo · Carla Ruiz"
      bullets={[
        ['Escanea con la cámara del celular, sin lectores extra.', 'Scans with the phone camera, no extra hardware.'],
        ['Bloquea al instante entradas duplicadas o de otro evento.', 'Instantly blocks duplicate tickets or tickets from another event.'],
        ['Funciona sin conexión y sincroniza cuando vuelve la señal.', 'Works offline and syncs when signal comes back.'],
      ]}
      side={
        <>
          <DevNotice {...CAM_NOTICE} />
          <DevNotice {...SYNC_NOTICE} />
          <div className="card p-4 text-[13px] text-muted">
            <p className="font-semibold text-text">{l('Probá con un código real', 'Try a real code')}</p>
            <p className="mt-1">
              {l('La entrada de Martina para esta noche es', 'Martina’s ticket for tonight is')} <span className="num text-text">QHA7K2Q9XA</span>.{' '}
              {l('Ingresala a mano: la primera vez da válida, la segunda “ya ingresó”.', 'Type it in: the first time it’s valid, the second “already in”.')}
            </p>
          </div>
        </>
      }
      dark
    >
      <DeviceScroll className="text-white">
        <div className="px-4 pb-6 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">{l('Puerta · Club Vórtice', 'Door · Club Vórtice')}</p>
              <p className="text-[18px] font-bold">{l('Control de acceso', 'Access control')}</p>
            </div>
            {offline && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-300">
                <CloudOff className="h-3.5 w-3.5" /> Offline
              </span>
            )}
          </div>

          <Select value={evId} onValueChange={setEvId}>
            <SelectTrigger className="mt-3 border-white/10 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(deHoy.length ? deHoy : [ev]).map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.titulo[lang]} · {fmtTime(e.inicio, lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-3 rounded-[14px] bg-white/5 p-3">
            <div className="flex items-center justify-between text-[12px] text-white/70">
              <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{l('Ingresaron', 'Checked in')}</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> {l('en vivo', 'live')}
              </span>
            </div>
            <p className="num mt-1 text-[30px] font-bold leading-none">
              {ingresados} <span className="text-[16px] text-white/50">/ {ev.aforo}</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-emerald-400" animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>

          {/* Visor de cámara simulado */}
          <div className="relative mx-auto mt-4 aspect-square w-full max-w-[280px] overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_50%_40%,#27272a,#09090b_70%)]">
            <div className="absolute inset-8">
              <Corners />
              <div className="absolute inset-x-2 h-0.5 animate-laser rounded-full bg-accent shadow-[0_0_14px_4px_rgba(124,58,237,.7)]" />
            </div>
            <div className="absolute inset-x-0 bottom-3 text-center text-[11.5px] text-white/60">
              {scanning ? l('Leyendo código…', 'Reading code…') : l('Apuntá al QR de la entrada', 'Point at the ticket QR')}
            </div>
            {scanning && <div className="absolute inset-0 animate-pulse bg-white/10" />}
          </div>
          <DevNotice {...CAM_NOTICE} className="mt-3 xl:hidden" />

          <div className="mt-4 grid gap-2">
            <button
              data-trailer="btn-escanear"
              disabled={scanning}
              onClick={() => run('valida')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-emerald-500 text-[15px] font-semibold text-white shadow-lg shadow-emerald-500/20 active:scale-[.98] disabled:opacity-60"
            >
              <ScanLine className="h-5 w-5" /> {l('Escanear entrada válida', 'Scan valid ticket')}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button disabled={scanning} onClick={() => run('usada')} className="h-12 rounded-[14px] bg-white/10 text-[13px] font-semibold hover:bg-white/15 disabled:opacity-60">
                {l('Escanear entrada ya usada', 'Scan used ticket')}
              </button>
              <button disabled={scanning} onClick={() => run('invalida')} className="h-12 rounded-[14px] bg-white/10 text-[13px] font-semibold hover:bg-white/15 disabled:opacity-60">
                {l('Escanear código inválido', 'Scan invalid code')}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70"><Keyboard className="h-3.5 w-3.5" />{l('Ingresar código a mano', 'Enter code manually')}</p>
            <div className="flex gap-2">
              <input
                value={manual}
                onChange={(e) => setManual(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && validarManual()}
                maxLength={10}
                placeholder="QHA7K2Q9XA"
                className="num h-11 min-w-0 flex-1 rounded-[12px] border border-white/10 bg-white/5 px-3 text-[15px] tracking-widest text-white placeholder:text-white/25 outline-none focus:border-accent"
              />
              <button onClick={validarManual} className="h-11 rounded-[12px] bg-accent px-4 text-[13px] font-semibold">
                {l('Validar', 'Validate')}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[14px] bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold"><CloudOff className="h-4 w-4 text-white/60" />{l('Modo sin conexión', 'Offline mode')}</span>
              <Switch checked={offline} onCheckedChange={(v) => setOffline(v)} />
            </div>
            {(offline || pendientes > 0) && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-[10px] bg-amber-500/10 px-3 py-2">
                <span className="text-[12px] text-amber-200">
                  <span className="num">{pendientes}</span> {l('escaneos pendientes de sincronizar', 'scans pending sync')}
                </span>
                <button
                  onClick={() => {
                    const n = sincronizar()
                    setOffline(false)
                    toast.success(tl(`${n} escaneos sincronizados`, `${n} scans synced`), { description: tl('Todo al día con el servidor.', 'Everything up to date with the server.') })
                  }}
                  disabled={!pendientes}
                  className="inline-flex items-center gap-1 rounded-[8px] bg-amber-400 px-2.5 py-1 text-[12px] font-semibold text-zinc-900 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> {l('Sincronizar', 'Sync')}
                </button>
              </div>
            )}
          </div>
        </div>
      </DeviceScroll>

      {/* Resultado a pantalla completa */}
      {res && (
        <motion.button
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setRes(null)}
          className={cn('absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center text-white', res.tipo === 'valida' ? 'bg-emerald-600' : 'bg-red-600')}
        >
          <motion.div initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
            {res.tipo === 'valida' ? <CheckCircle2 className="h-28 w-28" strokeWidth={1.6} /> : <XCircle className="h-28 w-28" strokeWidth={1.6} />}
          </motion.div>
          {res.tipo === 'valida' && (
            <>
              <p className="mt-4 text-[30px] font-extrabold tracking-tight">{l('ENTRADA VÁLIDA', 'VALID TICKET')}</p>
              <p className="mt-3 text-[20px] font-semibold">{res.comprador}</p>
              <p className="text-[15px] opacity-90">{res.cantidad} {res.cantidad === 1 ? l('entrada', 'ticket') : l('entradas', 'tickets')}</p>
              <p className="num mt-4 rounded-full bg-white/15 px-4 py-1.5 text-[15px] tracking-widest">{res.codigo}</p>
              <p className="mt-2 text-[13px] opacity-80">{l('Ingreso', 'Entry')} {fmtTime(res.hora, lang)} · {l('marcada como usada', 'marked as used')}</p>
            </>
          )}
          {res.tipo === 'usada' && (
            <>
              <p className="mt-4 text-[28px] font-extrabold tracking-tight">{l('YA INGRESÓ', 'ALREADY IN')}</p>
              <p className="mt-1 text-[18px] font-semibold">{l('a las', 'at')} <span className="num">{fmtTime(res.ingresoPrevio!, lang)}</span></p>
              <p className="mt-3 text-[15px] opacity-90">{res.comprador} · {res.cantidad} {l('entradas', 'tickets')}</p>
              <p className="num mt-3 rounded-full bg-white/15 px-4 py-1.5 text-[15px] tracking-widest">{res.codigo}</p>
              <p className="mt-2 text-[13px] opacity-80">{l('Entrada duplicada bloqueada', 'Duplicate ticket blocked')}</p>
            </>
          )}
          {res.tipo === 'invalida' && (
            <>
              <p className="mt-4 text-[28px] font-extrabold tracking-tight">{l('CÓDIGO INVÁLIDO', 'INVALID CODE')}</p>
              <p className="mt-2 text-[16px] opacity-90">{l('Código inexistente o de otro evento', 'Code doesn’t exist or belongs to another event')}</p>
              <p className="num mt-4 rounded-full bg-white/15 px-4 py-1.5 text-[15px] tracking-widest">{res.codigo}</p>
            </>
          )}
          <span className="mt-8 rounded-full bg-white/20 px-5 py-2 text-[13px] font-semibold">{l('Tocá para escanear otra', 'Tap to scan another')}</span>
        </motion.button>
      )}
    </DevicePage>
  )
}
