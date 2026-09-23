import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Building2, Check, Eye, FileBadge, MailWarning, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { fmtAgo, fmtDate, tk, tl, useL, useSettings, useT, type TKey } from '@/i18n'
import type { Role } from '@/types'
import { ROLE_COLOR, useStore } from '@/store'
import { WebPage } from '@/layout/Page'
import { DevNotice, Empty } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const ROLES: Role[] = ['usuario', 'organizador', 'local', 'admin']

const PERMISOS: { es: string; en: string; r: [boolean, boolean, boolean, boolean] }[] = [
  { es: 'Buscar y comprar entradas', en: 'Search and buy tickets', r: [true, true, true, true] },
  { es: 'Dejar reseñas', en: 'Leave reviews', r: [true, false, false, false] },
  { es: 'Crear y editar sus eventos', en: 'Create and edit own events', r: [false, true, false, true] },
  { es: 'Ver métricas de sus eventos', en: 'See own event metrics', r: [false, true, true, true] },
  { es: 'Responder reseñas', en: 'Reply to reviews', r: [false, true, false, true] },
  { es: 'Escanear QR en la puerta', en: 'Scan QR at the door', r: [false, false, true, true] },
  { es: 'Aprobar eventos', en: 'Approve events', r: [false, false, false, true] },
  { es: 'Reportes financieros y comisión', en: 'Financial reports and fees', r: [false, false, false, true] },
  { es: 'Devoluciones y gestión de usuarios', en: 'Refunds and user management', r: [false, false, false, true] },
]

function RoleBadge({ rol }: { rol: Role }) {
  const t = useT()
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: `${ROLE_COLOR[rol]}1f`, color: ROLE_COLOR[rol] }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: ROLE_COLOR[rol] }} />
      {t(`role.${rol}` as TKey)}
    </span>
  )
}

export default function Usuarios() {
  const l = useL()
  const t = useT()
  const lang = useSettings((s) => s.lang)
  const navigate = useNavigate()
  const usuarios = useStore((s) => s.usuarios)
  const solicitudes = useStore((s) => s.solicitudes)
  const cambiarRol = useStore((s) => s.cambiarRolUsuario)
  const resolver = useStore((s) => s.resolverSolicitud)
  const setRole = useStore((s) => s.setRole)
  const [tab, setTab] = React.useState<'usuarios' | 'solicitudes'>('usuarios')
  const [q, setQ] = React.useState('')
  const [fRol, setFRol] = React.useState<'todos' | Role>('todos')

  const lista = usuarios.filter((u) => (fRol === 'todos' || u.rol === fRol) && (!q || `${u.nombre} ${u.email}`.toLowerCase().includes(q.toLowerCase())))
  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente')

  const verComoUsuario = () => {
    setRole('usuario')
    navigate('/app/explorar')
    toast.success(tl('Estás viendo la app como usuario', 'You’re viewing the app as a user'), { description: tl('Sin cerrar sesión. Volvé con el selector de vista.', 'Without signing out. Switch back with the view selector.') })
  }

  return (
    <WebPage
      role="admin"
      bannerId="admin-usuarios"
      title={l('Usuarios y roles', 'Users & roles')}
      subtitle={l(`${usuarios.length} usuarios registrados`, `${usuarios.length} registered users`)}
      actions={
        <Button variant="outline" size="sm" onClick={verComoUsuario}>
          <Eye /> {l('Ver la app como usuario', 'View app as user')}
        </Button>
      }
      bullets={[
        ['Login con verificación de mail para todos los perfiles.', 'Login with email verification for every profile.'],
        ['Validación de identidad para organizadores y locales.', 'Identity verification for organizers and venues.'],
        ['Permisos por rol: cada perfil ve y hace solo lo suyo.', 'Role permissions: each profile sees and does only its own.'],
      ]}
    >
      <DevNotice
        className="mb-4"
        funcion={['Verificación de mail e identidad', 'Email and identity verification']}
        hoy={['Hoy los estados de verificación son de ejemplo.', 'Today verification statuses are sample data.']}
        real={['Al desarrollar, cada alta recibe un mail de confirmación y las solicitudes de organizador o local validan CUIT y documentación.', 'Once built, every sign-up gets a confirmation email and organizer/venue requests validate tax ID and documents.']}
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="usuarios">{l('Usuarios', 'Users')} <span className="num text-[11px] text-muted">{usuarios.length}</span></TabsTrigger>
          <TabsTrigger value="solicitudes">{l('Solicitudes de organizador/local', 'Organizer/venue requests')} <span className="num text-[11px] text-muted">{pendientes.length}</span></TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'usuarios' ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="card">
            <div className="flex flex-wrap gap-2 p-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={l('Buscar nombre o mail…', 'Search name or email…')} className="h-9 pl-9" />
              </div>
              <Select value={fRol} onValueChange={(v) => setFRol(v as typeof fRol)}>
                <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">{l('Todos los roles', 'All roles')}</SelectItem>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{t(`role.${r}` as TKey)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{l('Usuario', 'User')}</TableHead>
                  <TableHead>{l('Rol', 'Role')}</TableHead>
                  <TableHead>{l('Mail', 'Email')}</TableHead>
                  <TableHead>{l('Alta', 'Joined')}</TableHead>
                  <TableHead>{l('Cambiar rol', 'Change role')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.nombre}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </TableCell>
                    <TableCell><RoleBadge rol={u.rol} /></TableCell>
                    <TableCell>
                      {u.verificado ? (
                        <Badge variant="green"><BadgeCheck className="h-3 w-3" />{l('Verificado', 'Verified')}</Badge>
                      ) : (
                        <Badge variant="amber"><MailWarning className="h-3 w-3" />{l('Sin verificar', 'Unverified')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted">{fmtDate(u.alta, lang, { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell>
                      <Select
                        value={u.rol}
                        onValueChange={(v) => {
                          cambiarRol(u.id, v as Role)
                          toast.success(tl('Rol actualizado', 'Role updated'), { description: `${u.nombre} → ${tk(`role.${v}` as TKey)}` })
                        }}
                      >
                        <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => <SelectItem key={r} value={r}>{t(`role.${r}` as TKey)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="card h-fit p-5">
            <p className="text-[15px] font-semibold">{l('Permisos por rol', 'Permissions by role')}</p>
            <p className="text-xs text-muted">{l('Cada perfil ve y hace solo lo suyo', 'Each profile sees and does only its own')}</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th />
                    {ROLES.map((r) => (
                      <th key={r} className="px-1 pb-2 text-center font-semibold" style={{ color: ROLE_COLOR[r] }}>{t(`role.${r}` as TKey).slice(0, 5)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISOS.map((p, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-1.5 pr-2">{l(p.es, p.en)}</td>
                      {p.r.map((ok, j) => (
                        <td key={j} className="text-center">{ok ? <Check className="mx-auto h-3.5 w-3.5 text-success" /> : <span className="text-muted">—</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {solicitudes.map((s) => (
            <div key={s.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <RoleBadge rol={s.rol} />
                  <p className="mt-1.5 text-[15px] font-semibold">{s.nombre}</p>
                  <p className="text-xs text-muted">{s.email} · {fmtAgo(s.fecha, lang)}</p>
                </div>
                {s.estado !== 'pendiente' && <Badge variant={s.estado === 'aprobada' ? 'green' : 'red'}>{s.estado === 'aprobada' ? l('Aprobada', 'Approved') : l('Rechazada', 'Rejected')}</Badge>}
              </div>
              <div className="mt-3 space-y-1.5 text-[13px]">
                <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted" />{s.empresa}</p>
                <p className="flex items-center gap-2"><FileBadge className="h-4 w-4 text-muted" /><span className="num">{s.documento}</span> · {l('DNI frente y dorso adjunto', 'ID front and back attached')}</p>
              </div>
              {s.estado === 'pendiente' && (
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      resolver(s.id, true)
                      toast.success(tl('Solicitud aprobada', 'Request approved'), { description: tl(`${s.nombre} ya puede operar como ${tk(`role.${s.rol}` as TKey).toLowerCase()}.`, `${s.nombre} can now operate as ${tk(`role.${s.rol}` as TKey).toLowerCase()}.`) })
                    }}
                  >
                    <Check /> {l('Aprobar', 'Approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resolver(s.id, false)
                      toast(tl('Solicitud rechazada', 'Request rejected'), { description: tl('Le pedimos documentación adicional.', 'We asked for additional documents.') })
                    }}
                  >
                    <X /> {l('Rechazar', 'Reject')}
                  </Button>
                </div>
              )}
            </div>
          ))}
          {!solicitudes.length && <Empty icon={FileBadge} title={l('No hay solicitudes', 'No requests')} />}
        </div>
      )}
    </WebPage>
  )
}
