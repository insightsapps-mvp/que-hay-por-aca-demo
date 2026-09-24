import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, CreditCard, Eye, EyeOff, LogIn, MapPin, MessageCircle, Play, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { BRAND, cn, WHATSAPP_URL } from '@/lib/utils'
import { tl, useL, useT } from '@/i18n'
import type { Role } from '@/types'
import { ROLE_COLOR, useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/misc'
import { Logo, PoweredBy } from '@/components/common'
import { LangToggle, ThemeToggle } from '@/layout/AppShell'

const PILLS: { role: Role; email: string }[] = [
  { role: 'usuario', email: 'usuario@quehayporaca.app' },
  { role: 'organizador', email: 'organizador@quehayporaca.app' },
  { role: 'local', email: 'local@quehayporaca.app' },
  { role: 'admin', email: 'admin@quehayporaca.app' },
]

function DemoPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-accent">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      DEMO PREVIEW
    </span>
  )
}

export default function Login() {
  const l = useL()
  const t = useT()
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const setTrailer = useStore((s) => s.setTrailer)
  const session = useStore((s) => s.session)
  const [email, setEmail] = React.useState('')
  const [pass, setPass] = React.useState('')
  const [show, setShow] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (session) navigate('/propuesta', { replace: true })
  }, [session, navigate])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !pass) {
      toast.error(tl('Completá usuario y contraseña', 'Enter your username and password'))
      return
    }
    if (pass !== 'demo123') {
      toast.error(tl('Contraseña incorrecta', 'Wrong password'), { description: tl('En la demo la contraseña es demo123.', 'In the demo the password is demo123.') })
      return
    }
    const role = (PILLS.find((p) => p.email === email.trim().toLowerCase())?.role ?? 'usuario') as Role
    setLoading(true)
    setTimeout(() => {
      login(email.trim().toLowerCase(), role)
      navigate('/propuesta') // SIEMPRE a /propuesta, sin importar el rol
    }, 450)
  }


  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-orange-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-blue-500/15 blur-3xl" />
      <div className="relative flex items-center justify-end gap-2 p-4 sm:p-6">
        <LangToggle />
        <ThemeToggle />
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[420px]"
        >
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <Logo size="h-12 w-12" />
              <p className="text-[24px] font-extrabold tracking-tight">{BRAND}</p>
              <DemoPill />
            </div>
            <div className="card p-6 sm:p-8">
              <h2 className="text-[22px] font-bold tracking-tight">{l('Ingresá a Que hay por acá', 'Sign in to Que hay por acá')}</h2>
              <p className="mt-1 text-sm text-muted">{l('Elegí un rol para ver la demo desde su lado.', 'Pick a role to see the demo from their side.')}</p>

              <div className="mt-5">
                <p className="kicker mb-2">{l('Acceso rápido por rol', 'Quick access by role')}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PILLS.map((p) => {
                    const active = email === p.email
                    return (
                      <button
                        key={p.role}
                        type="button"
                        onClick={() => {
                          setEmail(p.email)
                          setPass('demo123')
                        }}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12px] font-semibold transition-colors',
                          active ? 'text-white' : 'border-border bg-surface hover:bg-surface-2'
                        )}
                        style={active ? { background: ROLE_COLOR[p.role], borderColor: ROLE_COLOR[p.role] } : undefined}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? '#fff' : ROLE_COLOR[p.role] }} />
                        {t(`role.${p.role}`)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <form onSubmit={submit} className="mt-5 space-y-3.5">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium">
                    {l('Usuario', 'Username')}
                  </label>
                  <Input id="email" type="email" autoComplete="username" placeholder="usuario@quehayporaca.app" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="pass" className="mb-1.5 block text-[13px] font-medium">
                    {l('Contraseña', 'Password')}
                  </label>
                  <div className="relative">
                    <Input
                      id="pass"
                      type={show ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-text"
                      aria-label={show ? l('Ocultar contraseña', 'Hide password') : l('Mostrar contraseña', 'Show password')}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                    <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                    {l('Recordarme', 'Remember me')}
                  </label>
                  <button
                    type="button"
                    className="text-[13px] font-medium text-accent hover:underline"
                    onClick={() =>
                      toast(tl('Te enviamos un link para recuperar tu contraseña', 'We sent you a link to reset your password'), {
                        description: tl('En la demo usá demo123.', 'In the demo use demo123.'),
                      })
                    }
                  >
                    {l('¿Olvidaste tu contraseña?', 'Forgot your password?')}
                  </button>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <LogIn />
                  )}
                  {l('Ingresar', 'Sign in')}
                </Button>
              </form>

              <div className="mt-5 space-y-2.5 border-t border-border pt-4 text-center">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-text">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {l('¿No tenés acceso?', 'No access?')} <span className="font-semibold text-accent">{l('Hablemos por WhatsApp', 'Let’s talk on WhatsApp')}</span>
                </a>
                <button
                  type="button"
                  data-trailer="btn-ver-demo"
                  onClick={() => setTrailer(true)}
                  className="mx-auto flex items-center gap-1.5 text-[13px] font-semibold text-text hover:text-accent"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white">
                    <Play className="h-2.5 w-2.5 fill-white" />
                  </span>
                  {l('Ver demo automática de la plataforma', 'Watch the automatic platform demo')}
                </button>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted">
              {l('Contraseña de todos los roles:', 'Password for every role:')} <span className="num text-text">demo123</span>
            </p>
            <PoweredBy className="mt-2 text-center" />
          </motion.div>
      </div>
    </div>
  )
}
