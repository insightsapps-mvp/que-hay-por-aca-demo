import * as React from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, LogOut, Menu, Moon, Sparkles, Sun, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { cn, WHATSAPP_URL } from '@/lib/utils'
import { tk, tl, useL, useSettings, useT } from '@/i18n'
import type { Role } from '@/types'
import { DEFAULT_VIEW, ROLE_COLOR, ROLE_PERSONA, useStore } from '@/store'
import { navForRole, titleFor } from './nav'
import { Logo, PoweredBy } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/misc'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/overlay'
import { WelcomeModal } from '@/features/WelcomeModal'
import { Tour } from '@/features/Tour'

const ROLES: Role[] = ['usuario', 'organizador', 'local', 'admin']

/* ───────── Toggles compartidos (login y topbar) ───────── */
export function LangToggle() {
  const lang = useSettings((s) => s.lang)
  const setLang = useSettings((s) => s.setLang)
  return (
    <ToggleGroup type="single" value={lang} onValueChange={(v) => v && setLang(v as 'es' | 'en')} aria-label="Language">
      <ToggleGroupItem value="es">ES</ToggleGroupItem>
      <ToggleGroupItem value="en">EN</ToggleGroupItem>
    </ToggleGroup>
  )
}
export function ThemeToggle() {
  const theme = useSettings((s) => s.theme)
  const toggle = useSettings((s) => s.toggleTheme)
  const l = useL()
  return (
    <Button variant="outline" size="icon" className="h-8 w-8" onClick={toggle} aria-label={l('Cambiar tema', 'Toggle theme')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}

/* ───────── Role switcher ───────── */
export function useSwitchRole() {
  const setRole = useStore((s) => s.setRole)
  const navigate = useNavigate()
  return React.useCallback(
    (r: Role) => {
      setRole(r)
      navigate(DEFAULT_VIEW[r])
      toast.success(tl('Vista cambiada', 'View switched'), { description: `${tk(`role.${r}`)} · ${ROLE_PERSONA[r].nombre}` })
    },
    [setRole, navigate]
  )
}

function RoleSwitcher({ onDone }: { onDone?: () => void }) {
  const l = useL()
  const t = useT()
  const role = useStore((s) => s.role)
  const switchRole = useSwitchRole()
  return (
    <div data-tour="switch-user" className="rounded-[12px] border border-border bg-surface-2 p-2.5">
      <p className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">{l('Cambiar vista', 'Switch view')}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {ROLES.map((r) => {
          const active = r === role
          return (
            <button
              key={r}
              onClick={() => {
                if (!active) switchRole(r)
                onDone?.()
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-[8px] border px-2 py-1.5 text-[12px] font-semibold transition-colors',
                active ? 'text-white shadow-sm' : 'border-border bg-surface text-text hover:bg-surface-2'
              )}
              style={active ? { background: ROLE_COLOR[r], borderColor: ROLE_COLOR[r] } : undefined}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? '#fff' : ROLE_COLOR[r] }} />
              {t(`role.${r}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function WhatsAppCTA() {
  const l = useL()
  return (
    <div className="rounded-[12px] border border-accent/25 bg-accent-soft/60 p-3 dark:bg-accent-soft">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-0.5 text-[9.5px] font-bold tracking-wider text-white">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        DEMO PREVIEW
      </span>
      <p className="mt-2 text-[12.5px] font-medium leading-snug">{l('¿Te gustó lo que ves? Hablemos y arrancamos.', 'Like what you see? Let’s talk and get started.')}</p>
      <a
        data-tour="whatsapp-cta"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener"
        className="mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-[8px] bg-accent text-[13px] font-semibold text-white hover:brightness-110"
      >
        {l('Quiero arrancar', 'Let’s get started')}
        <ChevronRight className="h-3.5 w-3.5" />
      </a>
      <PoweredBy className="mt-1.5 text-center" />
    </div>
  )
}

function UserBlock() {
  const role = useStore((s) => s.role)
  const t = useT()
  const p = ROLE_PERSONA[role]
  return (
    <div className="flex items-center gap-2.5 px-1">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: ROLE_COLOR[role] }}>
        {p.iniciales}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold leading-tight">{p.nombre}</p>
        <p className="truncate text-[11px] text-muted">
          {t(`role.${role}`)} · {p.sub}
        </p>
      </div>
    </div>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const t = useT()
  const role = useStore((s) => s.role)
  const cancelarPreview = useStore((s) => s.cancelarPreview)
  const groups = navForRole(role)
  return (
    <>
      <nav data-tour="sidebar-nav" className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-none">
        {groups.map((g) => (
          <div key={g.id} className="mb-4">
            <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted">{t(g.label)}</p>
            {g.items.map((it) => {
              return (
                <NavLink
                  key={it.id}
                  to={it.to}
                  data-tour={`nav-${it.id}`}
                  onClick={() => {
                    cancelarPreview()
                    onNavigate?.()
                  }}
                  className={({ isActive }) =>
                    cn(
                      'group mb-0.5 flex items-center gap-2.5 rounded-[8px] px-2.5 py-[7px] text-[13.5px] font-medium transition-colors',
                      isActive ? 'bg-accent text-white shadow-sm' : 'text-text hover:bg-surface-2'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <it.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-muted group-hover:text-text')} />
                      <span className="truncate">{t(it.key)}</span>
                      {it.wow && (
                        <span className={cn('ml-auto text-[11px]', isActive ? 'text-white' : 'text-accent')} aria-hidden>
                          ★
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="shrink-0 space-y-2.5 border-t border-border p-3">
        <RoleSwitcher onDone={onNavigate} />
        <WhatsAppCTA />
        <UserBlock />
      </div>
    </>
  )
}

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col self-start border-r border-border bg-surface lg:flex">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-5">
        <Logo />
        <span className="text-[15px] font-extrabold tracking-tight">MOVIDA</span>
        <span className="ml-auto rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold text-accent">DEMO</span>
      </div>
      <SidebarBody />
    </aside>
  )
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const l = useL()
  const t = useT()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const role = useStore((s) => s.role)
  const logout = useStore((s) => s.logout)
  const openTour = useStore((s) => s.openTour)
  const trailer = useStore((s) => s.trailer)
  const { group, title } = titleFor(pathname)
  const p = ROLE_PERSONA[role]
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface/85 px-3 backdrop-blur-xl sm:px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Menu">
        <Menu />
      </Button>
      <div className="flex items-center gap-2 lg:hidden">
        <Logo size="h-6 w-6" />
      </div>
      <nav className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex" aria-label="Breadcrumb">
        <span className="text-muted">Movida</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted" />
        <span className="text-muted">{t(group)}</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted" />
        <span className="truncate font-semibold">{t(title)}</span>
      </nav>
      <span className="truncate text-sm font-semibold sm:hidden">{t(title)}</span>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {!trailer && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={openTour} data-tour-btn>
            <Sparkles className="text-accent" />
            <span className="hidden sm:inline">Tour</span>
          </Button>
        )}
        <div className="hidden sm:block">
          <LangToggle />
        </div>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold text-white ring-2 ring-transparent hover:ring-accent-ring"
              style={{ background: ROLE_COLOR[role] }}
              aria-label={p.nombre}
            >
              {p.iniciales}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-semibold">{p.nombre}</p>
              <p className="text-xs text-muted">
                {t(`role.${role}`)} · {p.sub}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 sm:hidden">
              <LangToggle />
            </div>
            <DropdownMenuItem
              onSelect={() =>
                toast(tl('Mi cuenta', 'My account'), { description: tl('Datos de perfil y seguridad de la cuenta.', 'Profile and account security details.') })
              }
            >
              <UserRound /> {l('Mi cuenta', 'My account')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                logout()
                navigate('/login')
                toast(tl('Sesión cerrada', 'Signed out'))
              }}
              className="text-danger"
            >
              <LogOut /> {l('Cerrar sesión', 'Sign out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

/* ───────── Botón "Volver a la propuesta" ───────── */
function PreviewReturn() {
  const l = useL()
  const preview = useStore((s) => s.preview)
  const trailer = useStore((s) => s.trailer)
  const cerrar = useStore((s) => s.cerrarPreview)
  React.useEffect(() => {
    if (!preview) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) cerrar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [preview, cerrar])
  if (!preview || trailer) return null
  return (
    <div className="no-print pointer-events-none fixed left-3 top-[66px] z-[45] flex max-w-[calc(100vw-24px)] items-center gap-2 lg:left-[280px]">
      <button
        onClick={cerrar}
        className="pointer-events-auto relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-accent pl-3.5 pr-4 text-[13px] font-semibold text-white shadow-lg shadow-accent/30"
      >
        <span className="absolute inset-0 -z-10 animate-backpulse rounded-full bg-accent" aria-hidden />
        <ArrowLeft className="h-4 w-4" />
        {l('Volver a la propuesta', 'Back to proposal')}
      </button>
      <span className="pointer-events-auto hidden truncate rounded-full border border-border bg-white/70 px-3 py-1.5 text-[12px] text-text backdrop-blur-md dark:bg-zinc-900/70 sm:inline">
        {l('Estás viendo:', 'You’re viewing:')} <b className="font-semibold">{preview.titulo}</b>
      </span>
    </div>
  )
}

/* ───────── Puente para navegar desde el store ───────── */
function NavBridge() {
  const navigate = useNavigate()
  const setNavigate = useStore((s) => s.setNavigate)
  React.useEffect(() => {
    setNavigate(navigate)
  }, [navigate, setNavigate])
  return null
}
export { NavBridge }

export function AppShell() {
  const [open, setOpen] = React.useState(false)
  const preview = useStore((s) => s.preview)
  const trailer = useStore((s) => s.trailer)
  const { pathname } = useLocation()
  const l = useL()
  React.useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return (
    <div className="flex min-h-screen w-full bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setOpen(true)} />
        <PreviewReturn />
        <main className={cn('print-full w-full flex-1 px-4 pb-10 pt-5 lg:px-8 lg:pt-7', preview && !trailer && 'pt-[68px] lg:pt-[76px]')}>
          <Outlet />
        </main>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[290px] p-0">
          <SheetTitle className="sr-only">{l('Menú', 'Menu')}</SheetTitle>
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-5">
            <Logo />
            <span className="text-[15px] font-extrabold tracking-tight">MOVIDA</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <SidebarBody onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
      <WelcomeModal />
      <Tour />
    </div>
  )
}
