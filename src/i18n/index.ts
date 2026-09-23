import { create } from 'zustand'

export type Lang = 'es' | 'en'
export type Theme = 'light' | 'dark'

function read(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

interface SettingsState {
  lang: Lang
  theme: Theme
  setLang: (l: Lang) => void
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

function applyTheme(t: Theme) {
  const d = document.documentElement
  d.classList.toggle('dark', t === 'dark')
  d.style.background = t === 'dark' ? '#09090b' : '#ffffff'
}

export const useSettings = create<SettingsState>((set, get) => ({
  lang: (read('movida_lang', 'es') as Lang) === 'en' ? 'en' : 'es',
  theme: (read('movida_theme', 'light') as Theme) === 'dark' ? 'dark' : 'light',
  setLang: (lang) => {
    try { localStorage.setItem('movida_lang', lang) } catch { /* noop */ }
    document.documentElement.lang = lang
    set({ lang })
  },
  setTheme: (theme) => {
    try { localStorage.setItem('movida_theme', theme) } catch { /* noop */ }
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))

/** Helper bilingüe: const l = useL(); l('Hola', 'Hi') */
export function useL() {
  const lang = useSettings((s) => s.lang)
  return (es: string, en: string) => (lang === 'en' ? en : es)
}

export function getLang(): Lang {
  return useSettings.getState().lang
}
/** Versión no-hook para toasts o callbacks */
export function tl(es: string, en: string) {
  return getLang() === 'en' ? en : es
}

/** Diccionario de claves compartidas {clave:[es,en]} */
const dict = {
  'nav.comercial': ['Comercial', 'Commercial'],
  'nav.propuesta': ['Propuesta', 'Proposal'],
  'nav.appUsuario': ['App · Usuario', 'App · User'],
  'nav.organizador': ['Organizador', 'Organizer'],
  'nav.local': ['Local', 'Venue'],
  'nav.admin': ['Admin', 'Admin'],
  'nav.explorar': ['Explorar', 'Explore'],
  'nav.mapa': ['Mapa de hoy', "Tonight's map"],
  'nav.entradas': ['Mis entradas', 'My tickets'],
  'nav.eventos': ['Mis eventos', 'My events'],
  'nav.nuevo': ['Cargar evento', 'Create event'],
  'nav.metricas': ['Métricas', 'Metrics'],
  'nav.resenas': ['Reseñas', 'Reviews'],
  'nav.escaner': ['Escáner QR', 'QR scanner'],
  'nav.validaciones': ['Validaciones', 'Check-ins'],
  'nav.dashboard': ['Dashboard global', 'Global dashboard'],
  'nav.aprobacion': ['Aprobación de eventos', 'Event approval'],
  'nav.transacciones': ['Transacciones', 'Transactions'],
  'nav.usuarios': ['Usuarios y roles', 'Users & roles'],
  'nav.categorias': ['Categorías', 'Categories'],
  'nav.notificaciones': ['Notificaciones por mail', 'Email notifications'],
  'nav.evento': ['Detalle del evento', 'Event detail'],
  'nav.checkout': ['Checkout', 'Checkout'],
  'nav.ticket': ['Mi entrada', 'My ticket'],
  'role.usuario': ['Usuario', 'User'],
  'role.organizador': ['Organizador', 'Organizer'],
  'role.local': ['Local', 'Venue'],
  'role.admin': ['Admin', 'Admin'],
  'cat.conciertos': ['Conciertos', 'Concerts'],
  'cat.fiestas': ['Fiestas', 'Parties'],
  'cat.experiencias': ['Experiencias', 'Experiences'],
  'cat.deportes': ['Deportes', 'Sports'],
  'cat.cultura': ['Cultura', 'Culture'],
  'estado.borrador': ['Borrador', 'Draft'],
  'estado.pendiente': ['Pendiente', 'Pending'],
  'estado.aprobado': ['Aprobado', 'Approved'],
  'estado.publicado': ['Publicado', 'Published'],
  'estado.cancelado': ['Cancelado', 'Cancelled'],
  'estado.finalizado': ['Finalizado', 'Finished'],
  'metodo.tarjeta': ['Tarjeta', 'Card'],
  'metodo.transferencia': ['Transferencia', 'Bank transfer'],
  'metodo.billetera': ['Billetera digital', 'Digital wallet'],
  'tx.aprobado': ['Aprobado', 'Approved'],
  'tx.rechazado': ['Rechazado', 'Declined'],
  'tx.devuelto': ['Devuelto', 'Refunded'],
  'tk.valida': ['Válida', 'Valid'],
  'tk.usada': ['Usada', 'Used'],
  'tk.vencida': ['Vencida', 'Expired'],
  'val.valida': ['Válida', 'Valid'],
  'val.usada': ['Ya usada', 'Already used'],
  'val.invalida': ['Inválida', 'Invalid'],
  'zona.caba': ['CABA', 'CABA'],
  'zona.oeste': ['Zona oeste', 'West zone'],
  'mail.entregado': ['Entregado', 'Delivered'],
  'mail.abierto': ['Abierto', 'Opened'],
  'mail.rebotado': ['Rebotado', 'Bounced'],
} as const satisfies Record<string, readonly [string, string]>

export type TKey = keyof typeof dict

export function useT() {
  const lang = useSettings((s) => s.lang)
  return (k: TKey) => dict[k][lang === 'en' ? 1 : 0]
}
export function tk(k: TKey) {
  return dict[k][getLang() === 'en' ? 1 : 0]
}

/* ---------- Formato con Intl ---------- */
const loc = (lang: Lang) => (lang === 'en' ? 'en-US' : 'es-AR')

export function fmtARS(n: number, lang: Lang) {
  const s = new Intl.NumberFormat(loc(lang), { maximumFractionDigits: 0 }).format(Math.round(n))
  return `$ ${s}`
}
export function fmtNum(n: number, lang: Lang, digits = 0) {
  return new Intl.NumberFormat(loc(lang), { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n)
}
export function fmtUSD(n: number, lang: Lang) {
  return `USD ${new Intl.NumberFormat(loc(lang), { maximumFractionDigits: 0 }).format(n)}`
}
export function fmtTime(d: Date, lang: Lang) {
  return new Intl.DateTimeFormat(loc(lang), { hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
}
export function fmtDate(d: Date, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat(loc(lang), opts).format(d)
}
export function fmtDateLong(d: Date, lang: Lang) {
  return new Intl.DateTimeFormat(loc(lang), { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
}
export function fmtDateTime(d: Date, lang: Lang) {
  return `${fmtDate(d, lang)} · ${fmtTime(d, lang)}`
}
function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
/** "Hoy", "Mañana", "Ayer" o fecha corta */
export function fmtDia(d: Date, lang: Lang) {
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(new Date()).getTime()) / 86400000)
  if (diff === 0) return lang === 'en' ? 'Today' : 'Hoy'
  if (diff === 1) return lang === 'en' ? 'Tomorrow' : 'Mañana'
  if (diff === -1) return lang === 'en' ? 'Yesterday' : 'Ayer'
  return new Intl.DateTimeFormat(loc(lang), { weekday: 'short', day: 'numeric', month: 'short' }).format(d)
}
export function fmtKm(km: number, lang: Lang) {
  return `${fmtNum(km, lang, 1)} km`
}
export function fmtAgo(d: Date, lang: Lang) {
  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  const rtf = new Intl.RelativeTimeFormat(loc(lang), { numeric: 'auto' })
  if (Math.abs(mins) < 60) return rtf.format(-mins, 'minute')
  const h = Math.round(mins / 60)
  if (Math.abs(h) < 24) return rtf.format(-h, 'hour')
  return rtf.format(-Math.round(h / 24), 'day')
}
