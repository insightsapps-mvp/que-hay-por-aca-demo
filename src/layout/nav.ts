import {
  BarChart3,
  CalendarDays,
  Compass,
  FileText,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPin,
  PlusCircle,
  Receipt,
  ScanLine,
  ShieldCheck,
  Star,
  Tags,
  Ticket,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { TKey } from '@/i18n'
import type { Role } from '@/types'

export interface NavItem {
  id: string
  key: TKey
  icon: LucideIcon
  to: string
  wow?: boolean
}
export interface NavGroup {
  id: string
  label: TKey
  role: Role | 'all'
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    id: 'comercial',
    label: 'nav.comercial',
    role: 'all',
    items: [{ id: 'propuesta', key: 'nav.propuesta', icon: FileText, to: '/propuesta' }],
  },
  {
    id: 'usuario',
    label: 'nav.appUsuario',
    role: 'usuario',
    items: [
      { id: 'explorar', key: 'nav.explorar', icon: Compass, to: '/app/explorar' },
      { id: 'mapa', key: 'nav.mapa', icon: MapPin, to: '/app/mapa', wow: true },
      { id: 'entradas', key: 'nav.entradas', icon: Ticket, to: '/app/entradas' },
    ],
  },
  {
    id: 'organizador',
    label: 'nav.organizador',
    role: 'organizador',
    items: [
      { id: 'eventos', key: 'nav.eventos', icon: CalendarDays, to: '/organizador/eventos' },
      { id: 'nuevo', key: 'nav.nuevo', icon: PlusCircle, to: '/organizador/nuevo' },
      { id: 'metricas', key: 'nav.metricas', icon: BarChart3, to: '/organizador/metricas' },
      { id: 'resenas', key: 'nav.resenas', icon: Star, to: '/organizador/resenas' },
    ],
  },
  {
    id: 'local',
    label: 'nav.local',
    role: 'local',
    items: [
      { id: 'escaner', key: 'nav.escaner', icon: ScanLine, to: '/local/escaner' },
      { id: 'validaciones', key: 'nav.validaciones', icon: ListChecks, to: '/local/validaciones' },
    ],
  },
  {
    id: 'admin',
    label: 'nav.admin',
    role: 'admin',
    items: [
      { id: 'dashboard', key: 'nav.dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
      { id: 'aprobacion', key: 'nav.aprobacion', icon: ShieldCheck, to: '/admin/aprobacion' },
      { id: 'transacciones', key: 'nav.transacciones', icon: Receipt, to: '/admin/transacciones' },
      { id: 'usuarios', key: 'nav.usuarios', icon: Users, to: '/admin/usuarios' },
      { id: 'categorias', key: 'nav.categorias', icon: Tags, to: '/admin/categorias' },
      { id: 'notificaciones', key: 'nav.notificaciones', icon: Mail, to: '/admin/notificaciones' },
    ],
  },
]

export function navForRole(role: Role) {
  return NAV.filter((g) => g.role === 'all' || g.role === role)
}

/** Título de la vista para el breadcrumb */
export function titleFor(pathname: string): { group: TKey; title: TKey } {
  if (pathname.startsWith('/app/evento/') && pathname.endsWith('/checkout')) return { group: 'nav.appUsuario', title: 'nav.checkout' }
  if (pathname.startsWith('/app/evento/')) return { group: 'nav.appUsuario', title: 'nav.evento' }
  if (/^\/app\/entradas\/.+/.test(pathname)) return { group: 'nav.appUsuario', title: 'nav.ticket' }
  for (const g of NAV) for (const it of g.items) if (pathname.startsWith(it.to)) return { group: g.label, title: it.key }
  return { group: 'nav.comercial', title: 'nav.propuesta' }
}
