export type Role = 'usuario' | 'organizador' | 'local' | 'admin'
export type Categoria = 'conciertos' | 'fiestas' | 'experiencias' | 'deportes' | 'cultura'
export type EstadoEvento = 'borrador' | 'pendiente' | 'aprobado' | 'publicado' | 'cancelado' | 'finalizado'
export type Bi = { es: string; en: string }

export interface Evento {
  id: string
  titulo: Bi
  descripcion: Bi
  categoria: Categoria
  organizadorId: string
  localId: string
  inicio: Date
  fin: Date
  precio: number
  aforo: number
  vendidas: number
  lat: number
  lng: number
  zona: 'caba' | 'oeste'
  barrio: string
  estado: EstadoEvento
  rating: number
  cantResenas: number
  fotos: string[]
  motivoRechazo?: string
}

export interface Local {
  id: string
  nombre: string
  barrio: string
  direccion: string
  lat: number
  lng: number
  capacidad: number
}

export interface Organizador {
  id: string
  nombre: string
  responsable: string
  verificado: boolean
}

export interface UsuarioApp {
  id: string
  nombre: string
  email: string
  rol: Role
  verificado: boolean
  alta: Date
}

export interface Ticket {
  id: string
  eventoId: string
  usuarioId: string
  codigo: string
  cantidad: number
  estado: 'valida' | 'usada' | 'vencida'
  compradoEn: Date
  usadoEn?: Date
}

export type MetodoPago = 'tarjeta' | 'transferencia' | 'billetera'

export interface Transaccion {
  id: string
  ticketId: string
  metodo: MetodoPago
  monto: number
  estado: 'aprobado' | 'rechazado' | 'devuelto'
  fecha: Date
  motivo?: string
  devolucionPedida?: boolean
}

export interface Resena {
  id: string
  eventoId: string
  usuarioId: string
  estrellas: number
  texto: Bi
  fecha: Date
  respuesta?: Bi
}

export interface Validacion {
  id: string
  ticketId: string
  localId: string
  hora: Date
  resultado: 'valida' | 'usada' | 'invalida'
  dispositivo: string
  codigo: string
  comprador: string
}

export interface CategoriaItem {
  id: string
  nombre: Bi
  activa: boolean
  icono: string
}

export interface MailLog {
  id: string
  destinatario: string
  eventoId: string
  estado: 'entregado' | 'abierto' | 'rebotado'
  hora: Date
}

export interface SolicitudRol {
  id: string
  nombre: string
  email: string
  rol: 'organizador' | 'local'
  empresa: string
  documento: string
  fecha: Date
  estado: 'pendiente' | 'aprobada' | 'rechazada'
}
