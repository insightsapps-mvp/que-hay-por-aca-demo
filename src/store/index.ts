import { create } from 'zustand'
import type {
  CategoriaItem,
  Evento,
  MailLog,
  MetodoPago,
  Resena,
  Role,
  SolicitudRol,
  Ticket,
  Transaccion,
  UsuarioApp,
  Validacion,
} from '@/types'
import {
  CARGO_SERVICIO,
  CATEGORIAS_INICIALES,
  EVENTOS_INICIALES,
  MAILS_INICIALES,
  ME_ID,
  RESENAS_INICIALES,
  SOLICITUDES_INICIALES,
  TICKETS_INICIALES,
  TX_INICIALES,
  USUARIOS_INICIALES,
  VALIDACIONES_INICIALES,
  genCodigo,
  localById,
  usuarioNombre,
} from '@/data/mock'

export const DEFAULT_VIEW: Record<Role, string> = {
  usuario: '/app/explorar',
  organizador: '/organizador/eventos',
  local: '/local/escaner',
  admin: '/admin/dashboard',
}
export const ROLE_COLOR: Record<Role, string> = {
  usuario: '#7c3aed',
  organizador: '#db2777',
  local: '#059669',
  admin: '#4f46e5',
}
export const ROLE_PERSONA: Record<Role, { nombre: string; sub: string; iniciales: string }> = {
  usuario: { nombre: 'Martina Gómez', sub: 'martina.gomez@gmail.com', iniciales: 'MG' },
  organizador: { nombre: 'Lucas Ferreyra', sub: 'Nocturna Producciones', iniciales: 'LF' },
  local: { nombre: 'Carla Ruiz', sub: 'Club Vórtice · Palermo', iniciales: 'CR' },
  admin: { nombre: 'Sebastian', sub: 'Admin · Que hay por acá', iniciales: 'S' },
}
export const MY_ORG = 'org-01'
export const MY_LOCAL = 'loc-01'

export interface Preview {
  modulo: number
  view: string
  rolePrevio: Role
  titulo: string
}

interface Session {
  email: string
  role: Role
}

function readSession(): Session | null {
  try {
    const s = sessionStorage.getItem('movida_session')
    return s ? (JSON.parse(s) as Session) : null
  } catch {
    return null
  }
}
function writeSession(s: Session | null) {
  try {
    if (s) sessionStorage.setItem('movida_session', JSON.stringify(s))
    else sessionStorage.removeItem('movida_session')
  } catch {
    /* noop */
  }
}

export type ScanTipo = 'valida' | 'usada' | 'invalida'
export interface ScanResult {
  tipo: ScanTipo
  comprador?: string
  cantidad?: number
  codigo: string
  hora: Date
  ingresoPrevio?: Date
}

interface State {
  session: Session | null
  role: Role
  login: (email: string, role: Role) => void
  logout: () => void
  setRole: (r: Role) => void

  navigate: ((to: string) => void) | null
  setNavigate: (fn: (to: string) => void) => void

  preview: Preview | null
  moduloDestacado: number | null
  abrirPreview: (modulo: number, view: string, titulo: string, rolDestino: Role) => void
  cerrarPreview: () => void
  cancelarPreview: () => void
  limpiarDestacado: () => void

  trailer: boolean
  setTrailer: (v: boolean) => void
  tourOpen: boolean
  tourRun: number
  openTour: () => void
  closeTour: () => void

  eventos: Evento[]
  tickets: Ticket[]
  transacciones: Transaccion[]
  resenas: Resena[]
  validaciones: Validacion[]
  categorias: CategoriaItem[]
  usuarios: UsuarioApp[]
  mails: MailLog[]
  solicitudes: SolicitudRol[]
  ingresados: number
  offline: boolean
  pendientesSync: number

  comprar: (eventoId: string, cantidad: number, metodo: MetodoPago) => Ticket
  registrarRechazo: (eventoId: string, cantidad: number, metodo: MetodoPago) => void
  crearEvento: (ev: Omit<Evento, 'id'>) => string
  actualizarEvento: (id: string, patch: Partial<Evento>) => void
  aprobarEvento: (id: string) => void
  rechazarEvento: (id: string, motivo: string) => void
  cancelarEvento: (id: string) => void
  duplicarEvento: (id: string) => string
  escanear: (tipo: ScanTipo, codigoManual?: string) => ScanResult
  setOffline: (v: boolean) => void
  sincronizar: () => number
  responderResena: (id: string, texto: string) => void
  agregarResena: (eventoId: string, estrellas: number, texto: string) => void
  devolver: (txId: string) => void
  cambiarRolUsuario: (userId: string, rol: Role) => void
  resolverSolicitud: (id: string, aprobar: boolean) => void
  crearCategoria: (es: string, en: string) => void
  renombrarCategoria: (id: string, es: string, en: string) => void
  toggleCategoria: (id: string) => void
}

let destacadoTimer: ReturnType<typeof setTimeout> | undefined
let scanSeq = 0

export const useStore = create<State>((set, get) => {
  const initial = readSession()
  return {
    session: initial,
    role: initial?.role ?? 'usuario',
    login: (email, role) => {
      const s = { email, role }
      writeSession(s)
      set({ session: s, role, preview: null })
    },
    logout: () => {
      writeSession(null)
      try {
        sessionStorage.removeItem('movida_welcome_seen')
      } catch {
        /* noop */
      }
      set({ session: null, preview: null, tourOpen: false })
    },
    setRole: (role) => {
      const s = get().session
      if (s) writeSession({ ...s, role })
      set({ role, preview: null, session: s ? { ...s, role } : s })
    },

    navigate: null,
    setNavigate: (fn) => set({ navigate: fn }),

    preview: null,
    moduloDestacado: null,
    abrirPreview: (modulo, view, titulo, rolDestino) => {
      const { role, navigate, session } = get()
      if (session) writeSession({ ...session, role: rolDestino })
      set({ preview: { modulo, view, rolePrevio: role, titulo }, role: rolDestino })
      navigate?.(view)
    },
    cerrarPreview: () => {
      const { preview, navigate, session } = get()
      if (!preview) return
      if (session) writeSession({ ...session, role: preview.rolePrevio })
      set({ role: preview.rolePrevio, preview: null, moduloDestacado: preview.modulo })
      navigate?.('/propuesta')
      clearTimeout(destacadoTimer)
      destacadoTimer = setTimeout(() => get().limpiarDestacado(), 4200)
    },
    cancelarPreview: () => set({ preview: null }),
    limpiarDestacado: () => set({ moduloDestacado: null }),

    trailer: false,
    setTrailer: (v) => set({ trailer: v, preview: null, tourOpen: false }),
    tourOpen: false,
    tourRun: 0,
    openTour: () => set((s) => ({ tourOpen: true, tourRun: s.tourRun + 1 })),
    closeTour: () => set({ tourOpen: false }),

    eventos: EVENTOS_INICIALES,
    tickets: TICKETS_INICIALES,
    transacciones: TX_INICIALES,
    resenas: RESENAS_INICIALES,
    validaciones: VALIDACIONES_INICIALES,
    categorias: CATEGORIAS_INICIALES,
    usuarios: USUARIOS_INICIALES,
    mails: MAILS_INICIALES,
    solicitudes: SOLICITUDES_INICIALES,
    ingresados: 184,
    offline: false,
    pendientesSync: 0,

    comprar: (eventoId, cantidad, metodo) => {
      const ev = get().eventos.find((e) => e.id === eventoId)!
      const n = get().tickets.length + 1
      const now = new Date()
      const tk: Ticket = {
        id: `tk-${String(n).padStart(3, '0')}`,
        eventoId,
        usuarioId: ME_ID,
        codigo: genCodigo(Math.random),
        cantidad,
        estado: 'valida',
        compradoEn: now,
      }
      const tx: Transaccion = {
        id: `tx-${String(get().transacciones.length + 1).padStart(4, '0')}`,
        ticketId: tk.id,
        metodo,
        monto: Math.round(ev.precio * cantidad * (1 + CARGO_SERVICIO)),
        estado: 'aprobado',
        fecha: now,
      }
      const mail: MailLog = { id: `ml-${Date.now()}`, destinatario: 'martina.gomez@gmail.com', eventoId, estado: 'entregado', hora: now }
      set((s) => ({
        tickets: [...s.tickets, tk],
        transacciones: [tx, ...s.transacciones],
        mails: [mail, ...s.mails],
        eventos: s.eventos.map((e) => (e.id === eventoId ? { ...e, vendidas: Math.min(e.aforo, e.vendidas + cantidad) } : e)),
      }))
      return tk
    },
    registrarRechazo: (eventoId, cantidad, metodo) => {
      const ev = get().eventos.find((e) => e.id === eventoId)!
      const tx: Transaccion = {
        id: `tx-${String(get().transacciones.length + 1).padStart(4, '0')}`,
        ticketId: '',
        metodo,
        monto: Math.round(ev.precio * cantidad * (1 + CARGO_SERVICIO)),
        estado: 'rechazado',
        motivo: 'Fondos insuficientes',
        fecha: new Date(),
      }
      set((s) => ({ transacciones: [tx, ...s.transacciones] }))
    },
    crearEvento: (ev) => {
      const id = `ev-${String(get().eventos.length + 1).padStart(2, '0')}`
      set((s) => ({ eventos: [...s.eventos, { ...ev, id }] }))
      return id
    },
    actualizarEvento: (id, patch) =>
      set((s) => ({ eventos: s.eventos.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
    aprobarEvento: (id) => get().actualizarEvento(id, { estado: 'publicado' }),
    rechazarEvento: (id, motivo) => get().actualizarEvento(id, { estado: 'borrador', motivoRechazo: motivo }),
    cancelarEvento: (id) => get().actualizarEvento(id, { estado: 'cancelado' }),
    duplicarEvento: (id) => {
      const ev = get().eventos.find((e) => e.id === id)!
      const { id: _omit, ...rest } = ev
      return get().crearEvento({
        ...rest,
        titulo: { es: `${ev.titulo.es} (copia)`, en: `${ev.titulo.en} (copy)` },
        estado: 'borrador',
        vendidas: 0,
        rating: 0,
        cantResenas: 0,
      })
    },
    escanear: (tipo, codigoManual) => {
      scanSeq++
      const now = new Date()
      const nombres = ['Tomás Iglesias', 'Valentina Sosa', 'Julián Pereyra', 'Camila Benítez', 'Nicolás Aguirre', 'Sofía Romero']
      const codigo = codigoManual?.toUpperCase() || genCodigo(Math.random)
      const offline = get().offline
      const found = codigoManual ? get().tickets.find((t) => t.codigo === codigo) : undefined
      let res: ScanResult
      if (tipo === 'valida') {
        res = {
          tipo,
          comprador: found ? usuarioNombre(found.usuarioId) : nombres[scanSeq % nombres.length],
          cantidad: found?.cantidad ?? (scanSeq % 3) + 1,
          codigo,
          hora: now,
        }
      } else if (tipo === 'usada') {
        const prev = new Date(now)
        prev.setHours(23, 14, 0, 0)
        if (prev > now) prev.setDate(prev.getDate() - 1)
        res = found
          ? { tipo, comprador: usuarioNombre(found.usuarioId), cantidad: found.cantidad, codigo, hora: now, ingresoPrevio: found.usadoEn ?? prev }
          : { tipo, comprador: 'Julián Pereyra', cantidad: 2, codigo: 'QHAP4K8RZE', hora: now, ingresoPrevio: prev }
      } else {
        res = { tipo, codigo, hora: now }
      }
      const val: Validacion = {
        id: `vl-${Date.now()}`,
        ticketId: '',
        localId: 'loc-01',
        hora: now,
        resultado: tipo,
        dispositivo: 'iPhone 13 · Puerta 1',
        codigo: res.codigo,
        comprador: res.comprador || '—',
      }
      set((s) => ({
        validaciones: [val, ...s.validaciones],
        ingresados: tipo === 'valida' ? s.ingresados + (res.cantidad || 1) : s.ingresados,
        pendientesSync: offline ? s.pendientesSync + 1 : s.pendientesSync,
        tickets:
          tipo === 'valida' && codigoManual
            ? s.tickets.map((t) => (t.codigo === codigo ? { ...t, estado: 'usada', usadoEn: now } : t))
            : s.tickets,
      }))
      return res
    },
    setOffline: (v) => set((s) => ({ offline: v, pendientesSync: v ? Math.max(s.pendientesSync, 3) : s.pendientesSync })),
    sincronizar: () => {
      const n = get().pendientesSync
      set({ pendientesSync: 0 })
      return n
    },
    responderResena: (id, texto) =>
      set((s) => ({ resenas: s.resenas.map((r) => (r.id === id ? { ...r, respuesta: { es: texto, en: texto } } : r)) })),
    agregarResena: (eventoId, estrellas, texto) =>
      set((s) => ({
        resenas: [
          { id: `rs-${Date.now()}`, eventoId, usuarioId: ME_ID, estrellas, texto: { es: texto, en: texto }, fecha: new Date() },
          ...s.resenas,
        ],
      })),
    devolver: (txId) =>
      set((s) => ({
        transacciones: s.transacciones.map((t) => (t.id === txId ? { ...t, estado: 'devuelto', devolucionPedida: false } : t)),
      })),
    cambiarRolUsuario: (userId, rol) => set((s) => ({ usuarios: s.usuarios.map((u) => (u.id === userId ? { ...u, rol } : u)) })),
    resolverSolicitud: (id, aprobar) =>
      set((s) => ({ solicitudes: s.solicitudes.map((x) => (x.id === id ? { ...x, estado: aprobar ? 'aprobada' : 'rechazada' } : x)) })),
    crearCategoria: (es, en) =>
      set((s) => ({ categorias: [...s.categorias, { id: `cat-${Date.now()}`, nombre: { es, en: en || es }, activa: true, icono: 'Tag' }] })),
    renombrarCategoria: (id, es, en) =>
      set((s) => ({ categorias: s.categorias.map((c) => (c.id === id ? { ...c, nombre: { es, en: en || es } } : c)) })),
    toggleCategoria: (id) => set((s) => ({ categorias: s.categorias.map((c) => (c.id === id ? { ...c, activa: !c.activa } : c)) })),
  }
})

/* Selectores / helpers */
export const eventoLocal = (ev: Evento) => localById(ev.localId)
