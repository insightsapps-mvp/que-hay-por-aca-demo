import type {
  Bi,
  Categoria,
  CategoriaItem,
  Evento,
  Local,
  MailLog,
  MetodoPago,
  Organizador,
  Resena,
  SolicitudRol,
  Ticket,
  Transaccion,
  UsuarioApp,
  Validacion,
} from '@/types'

/* ───────────── Tiempo relativo ───────────── */
export const NOW = new Date()

/** Fecha relativa a hoy: hoyMas(2, 21, 30) = pasado mañana a las 21:30 */
export function hoyMas(dias: number, hora: number, min = 0) {
  const d = new Date(NOW)
  d.setDate(d.getDate() + dias)
  d.setHours(hora, min, 0, 0)
  return d
}
const addMin = (d: Date, m: number) => new Date(d.getTime() + m * 60000)

/** Fin de "la noche de hoy": próximo 06:00 */
export const FIN_NOCHE = (() => {
  const d = new Date(NOW)
  if (d.getHours() >= 6) d.setDate(d.getDate() + 1)
  d.setHours(6, 0, 0, 0)
  return d
})()

export function esHoy(ev: Pick<Evento, 'inicio' | 'fin'>, now = new Date()) {
  return ev.fin.getTime() > now.getTime() && ev.inicio.getTime() < FIN_NOCHE.getTime()
}
export function enCurso(ev: Pick<Evento, 'inicio' | 'fin'>, now = new Date()) {
  return ev.inicio.getTime() <= now.getTime() && ev.fin.getTime() > now.getTime()
}

/** Horario de un evento de "hoy" que todavía no empezó. Si ya es de noche, se reparte en las próximas horas. */
function hoyProximo(h: number, m: number, idx: number, total: number) {
  const nowH = NOW.getHours()
  if (nowH >= 6 && nowH < 18) {
    return h < 6 ? hoyMas(1, h, m) : hoyMas(0, h, m)
  }
  const ventana = Math.min(FIN_NOCHE.getTime() - NOW.getTime() - 20 * 60000, 6 * 3600000)
  const t = NOW.getTime() + ((idx + 1) / (total + 1)) * ventana
  const d = new Date(t)
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0)
  return d
}

/* ───────────── PRNG determinístico ───────────── */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(20260923)
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)]
const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function genCodigo(r: () => number = rnd) {
  let s = 'QHA'
  for (let i = 0; i < 7; i++) s += CODE_CHARS[Math.floor(r() * CODE_CHARS.length)]
  return s
}

/* ───────────── Ubicación del usuario ───────────── */
export const USER_LOC = { lat: -34.5889, lng: -58.4306, nombre: 'Palermo Soho' }
export const ZONAS = {
  mi: { lat: USER_LOC.lat, lng: USER_LOC.lng, zoom: 14 },
  centro: { lat: -34.6037, lng: -58.3816, zoom: 14 },
  oeste: { lat: -34.6495, lng: -58.6, zoom: 13 },
}

/* ───────────── Locales ───────────── */
export const LOCALES: Local[] = [
  { id: 'loc-01', nombre: 'Club Vórtice', barrio: 'Palermo Soho', direccion: 'Honduras 4850', lat: -34.5872, lng: -58.4289, capacidad: 320 },
  { id: 'loc-02', nombre: 'La Terraza de Villa Crespo', barrio: 'Villa Crespo', direccion: 'Thames 180', lat: -34.5988, lng: -58.4385, capacidad: 180 },
  { id: 'loc-03', nombre: 'Usina Almagro', barrio: 'Almagro', direccion: 'Av. Díaz Vélez 3900', lat: -34.6075, lng: -58.4205, capacidad: 900 },
  { id: 'loc-04', nombre: 'Galpón del Abasto', barrio: 'Abasto', direccion: 'Anchorena 740', lat: -34.6036, lng: -58.4102, capacidad: 450 },
  { id: 'loc-05', nombre: 'Rooftop Madero', barrio: 'Puerto Madero', direccion: 'Juana Manso 1200', lat: -34.6128, lng: -58.3628, capacidad: 250 },
  { id: 'loc-06', nombre: 'Bodegón Cultural San Telmo', barrio: 'San Telmo', direccion: 'Defensa 920', lat: -34.6212, lng: -58.3718, capacidad: 150 },
  { id: 'loc-07', nombre: 'Estación Morón Club', barrio: 'Morón', direccion: 'Brown 850', lat: -34.6512, lng: -58.6195, capacidad: 600 },
  { id: 'loc-08', nombre: 'Quinta Castelar', barrio: 'Castelar', direccion: 'Arias 2400', lat: -34.6503, lng: -58.6328, capacidad: 300 },
  { id: 'loc-09', nombre: 'Polideportivo Haedo', barrio: 'Haedo', direccion: 'Av. Rivadavia 16100', lat: -34.6438, lng: -58.5932, capacidad: 800 },
  { id: 'loc-10', nombre: 'Anfiteatro Ramos', barrio: 'Ramos Mejía', direccion: 'Belgrano 150', lat: -34.6419, lng: -58.5652, capacidad: 500 },
]
export const localById = (id: string) => LOCALES.find((l) => l.id === id)!

export const DIRECCIONES_SUGERIDAS = [
  { dir: 'Honduras 4850, Palermo Soho', lat: -34.5872, lng: -58.4289, localId: 'loc-01' },
  { dir: 'Thames 180, Villa Crespo', lat: -34.5988, lng: -58.4385, localId: 'loc-02' },
  { dir: 'Av. Díaz Vélez 3900, Almagro', lat: -34.6075, lng: -58.4205, localId: 'loc-03' },
  { dir: 'Anchorena 740, Abasto', lat: -34.6036, lng: -58.4102, localId: 'loc-04' },
  { dir: 'Juana Manso 1200, Puerto Madero', lat: -34.6128, lng: -58.3628, localId: 'loc-05' },
  { dir: 'Defensa 920, San Telmo', lat: -34.6212, lng: -58.3718, localId: 'loc-06' },
  { dir: 'Brown 850, Morón', lat: -34.6512, lng: -58.6195, localId: 'loc-07' },
  { dir: 'Arias 2400, Castelar', lat: -34.6503, lng: -58.6328, localId: 'loc-08' },
]

/* ───────────── Organizadores ───────────── */
export const ORGANIZADORES: Organizador[] = [
  { id: 'org-01', nombre: 'Nocturna Producciones', responsable: 'Lucas Ferreyra', verificado: true },
  { id: 'org-02', nombre: 'Sonar Sur', responsable: 'Agustina Molina', verificado: true },
  { id: 'org-03', nombre: 'Ciclo Tierra', responsable: 'Federico Luna', verificado: true },
  { id: 'org-04', nombre: 'Morón Vive', responsable: 'Carolina Medina', verificado: true },
  { id: 'org-05', nombre: 'Experiencias Río', responsable: 'Joaquín Castro', verificado: true },
  { id: 'org-06', nombre: 'Ruido Blanco', responsable: 'Micaela Herrera', verificado: false },
]
export const orgById = (id: string) => ORGANIZADORES.find((o) => o.id === id)!

/* ───────────── Fotos (gradientes) ───────────── */
const GRADS: Record<Categoria, string[]> = {
  conciertos: [
    'linear-gradient(135deg,#7c3aed 0%,#db2777 100%)',
    'linear-gradient(135deg,#4c1d95 0%,#f472b6 100%)',
    'linear-gradient(160deg,#1e1b4b 0%,#7c3aed 60%,#f0abfc 100%)',
    'linear-gradient(120deg,#be185d 0%,#f59e0b 100%)',
    'linear-gradient(135deg,#312e81 0%,#ec4899 100%)',
  ],
  fiestas: [
    'linear-gradient(135deg,#0f172a 0%,#7c3aed 55%,#22d3ee 100%)',
    'linear-gradient(135deg,#9333ea 0%,#06b6d4 100%)',
    'linear-gradient(150deg,#18181b 0%,#c026d3 70%,#fde047 100%)',
    'linear-gradient(135deg,#4338ca 0%,#e879f9 100%)',
    'linear-gradient(135deg,#1e293b 0%,#8b5cf6 100%)',
  ],
  experiencias: [
    'linear-gradient(135deg,#7f1d1d 0%,#f59e0b 100%)',
    'linear-gradient(135deg,#9a3412 0%,#fbbf24 100%)',
    'linear-gradient(150deg,#431407 0%,#ea580c 60%,#fde68a 100%)',
    'linear-gradient(135deg,#831843 0%,#fb923c 100%)',
    'linear-gradient(135deg,#78350f 0%,#fcd34d 100%)',
  ],
  deportes: [
    'linear-gradient(135deg,#065f46 0%,#22d3ee 100%)',
    'linear-gradient(135deg,#064e3b 0%,#84cc16 100%)',
    'linear-gradient(150deg,#0c4a6e 0%,#10b981 100%)',
    'linear-gradient(135deg,#134e4a 0%,#a3e635 100%)',
    'linear-gradient(135deg,#1e3a8a 0%,#34d399 100%)',
  ],
  cultura: [
    'linear-gradient(135deg,#1e3a8a 0%,#f472b6 100%)',
    'linear-gradient(135deg,#0f766e 0%,#c084fc 100%)',
    'linear-gradient(150deg,#172554 0%,#6366f1 60%,#fbcfe8 100%)',
    'linear-gradient(135deg,#3730a3 0%,#fda4af 100%)',
    'linear-gradient(135deg,#155e75 0%,#a78bfa 100%)',
  ],
}
export function fotosDe(cat: Categoria, seed: number, n = 4) {
  const g = GRADS[cat]
  return Array.from({ length: n }, (_, i) => g[(seed + i) % g.length])
}

/* ───────────── Eventos ───────────── */
type Seed = {
  id: string
  t: Bi
  d: Bi
  cat: Categoria
  org: string
  loc: string
  precio: number
  aforo: number
  vendidas: number
  rating: number
  resenas: number
}

const S = (
  id: string, tEs: string, tEn: string, dEs: string, dEn: string, cat: Categoria, org: string, loc: string,
  precio: number, aforo: number, vendidas: number, rating: number, resenas: number
): Seed => ({ id, t: { es: tEs, en: tEn }, d: { es: dEs, en: dEn }, cat, org, loc, precio, aforo, vendidas, rating, resenas })

// Hoy · en curso (5)
const EN_CURSO: [Seed, number, number][] = [
  [S('ev-02', 'Cumbia Club Night', 'Cumbia Club Night', 'La noche más bailable de Palermo: cumbia, cuarteto y clásicos tropicales con DJs invitados hasta que salga el sol.', 'The most danceable night in Palermo: cumbia, cuarteto and tropical classics with guest DJs until sunrise.', 'fiestas', 'org-01', 'loc-01', 12000, 320, 296, 4.5, 212), 70, 240],
  [S('ev-03', 'Jazz en la terraza', 'Jazz on the terrace', 'Cuarteto de jazz en vivo bajo las estrellas, con barra de tragos de autor y vista a los techos de Villa Crespo.', 'Live jazz quartet under the stars, with a craft cocktail bar and a view over the rooftops of Villa Crespo.', 'conciertos', 'org-03', 'loc-02', 15000, 180, 142, 4.8, 96), 45, 150],
  [S('ev-05', 'Cata de vinos a ciegas', 'Blind wine tasting', 'Seis etiquetas misteriosas, un sommelier y un desafío: adivinar cepa, región y precio. Incluye tabla de quesos.', 'Six mystery labels, one sommelier and a challenge: guess the grape, region and price. Cheese board included.', 'experiencias', 'org-05', 'loc-05', 28000, 60, 52, 4.9, 41), 30, 120],
  [S('ev-06', 'Feria de diseño nocturna', 'Night design fair', 'Más de 60 diseñadores independientes, food trucks y música en vivo en el galpón más lindo del Abasto.', 'Over 60 independent designers, food trucks and live music in the most beautiful warehouse in Abasto.', 'cultura', 'org-03', 'loc-04', 8000, 450, 310, 4.4, 58), 120, 180],
  [S('ev-09', 'Torneo de pádel nocturno', 'Night padel tournament', 'Torneo por parejas en canchas iluminadas, categorías mixtas y premios para los tres primeros puestos.', 'Doubles tournament on floodlit courts, mixed categories and prizes for the top three.', 'deportes', 'org-04', 'loc-09', 10000, 64, 58, 4.3, 22), 90, 150],
]

// Hoy · próximos (9) con hora "ideal" nocturna
const HOY_PROX: [Seed, number, number][] = [
  [S('ev-14', 'After office en el rooftop', 'Rooftop after office', 'Tragos al atardecer, DJ set de house suave y la mejor vista de los diques de Puerto Madero.', 'Sunset drinks, a mellow house DJ set and the best view of the Puerto Madero docks.', 'fiestas', 'org-02', 'loc-05', 13000, 250, 164, 4.2, 37), 19, 30],
  [S('ev-10', 'Recital acústico en Castelar', 'Acoustic show in Castelar', 'Cantautores de zona oeste en formato íntimo, en el jardín de una quinta centenaria.', 'West-zone singer-songwriters in an intimate format, in the garden of a century-old country house.', 'conciertos', 'org-04', 'loc-08', 11000, 300, 190, 4.6, 33), 21, 0],
  [S('ev-04', 'Stand-up en San Telmo', 'Stand-up in San Telmo', 'Cuatro comediantes, un bodegón lleno y cero filtro. Show de 90 minutos con pizza libre.', 'Four comedians, a packed bodegón and zero filter. A 90-minute show with free-flowing pizza.', 'cultura', 'org-06', 'loc-06', 9500, 150, 118, 4.7, 64), 21, 30],
  [S('ev-08', 'Noche de rock nacional en Morón', 'Argentine rock night in Morón', 'Tres bandas tributo repasan lo mejor del rock nacional: Redondos, Soda, Charly y Spinetta.', 'Three tribute bands go through the best of Argentine rock: Redondos, Soda, Charly and Spinetta.', 'conciertos', 'org-04', 'loc-07', 14000, 600, 410, 4.5, 71), 22, 0],
  [S('ev-13', 'Indie rock en el Abasto', 'Indie rock in Abasto', 'Tres bandas emergentes de la escena indie porteña en un solo escenario. Guitarras, sintes y mucha energía.', 'Three emerging bands from the Buenos Aires indie scene on one stage. Guitars, synths and lots of energy.', 'conciertos', 'org-02', 'loc-04', 16000, 450, 300, 4.4, 45), 22, 0],
  [S('ev-11', 'Karaoke gigante en Ramos', 'Giant karaoke in Ramos', 'Pantalla de 8 metros, 20.000 canciones y un público que se sabe todas. Anotate y subí al escenario.', 'An 8-meter screen, 20,000 songs and a crowd that knows them all. Sign up and take the stage.', 'experiencias', 'org-04', 'loc-10', 8500, 500, 220, 4.1, 19), 22, 30],
  [S('ev-01', 'Techno en la Usina', 'Techno at the Usina', 'Line-up internacional, sonido Funktion-One y 6 horas de techno en la sala principal de la Usina. La fecha más esperada del mes.', 'International line-up, Funktion-One sound and 6 hours of techno in the Usina main room. The most anticipated date of the month.', 'fiestas', 'org-01', 'loc-03', 18000, 900, 864, 4.6, 128), 23, 0],
  [S('ev-12', 'Milonga de medianoche', 'Midnight milonga', 'Clase abierta de tango para principiantes y después milonga con orquesta típica en vivo.', 'Open tango class for beginners followed by a milonga with a live orquesta típica.', 'cultura', 'org-05', 'loc-06', 9000, 150, 80, 4.8, 27), 23, 30],
  [S('ev-07', 'Fiesta retro 2000s', 'Retro 2000s party', 'Lo mejor del pop, el reggaetón viejo y el rock de los 2000. Dress code: tu peor outfit de 2004.', 'The best pop, old-school reggaetón and 2000s rock. Dress code: your worst 2004 outfit.', 'fiestas', 'org-01', 'loc-02', 11000, 180, 150, 4.3, 88), 0, 30],
]

// Esta semana (12)
const SEMANA: [Seed, number, number, number][] = [
  [S('ev-15', 'Electrónica al atardecer', 'Sunset electronica', 'Melodic house y progressive mientras el sol se esconde detrás de los diques.', 'Melodic house and progressive while the sun sets behind the docks.', 'fiestas', 'org-02', 'loc-05', 22000, 250, 120, 4.6, 54), 1, 19, 0],
  [S('ev-19', 'Taller de coctelería', 'Cocktail workshop', 'Aprendé a preparar 4 clásicos con un bartender premiado. Incluye todos los insumos y degustación.', 'Learn to make 4 classics with an award-winning bartender. All ingredients and tasting included.', 'experiencias', 'org-05', 'loc-02', 25000, 40, 31, 4.9, 29), 1, 20, 0],
  [S('ev-16', 'Orquesta de cámara en el Galpón', 'Chamber orchestra at the Galpón', 'Vivaldi, Piazzolla y bandas sonoras de cine interpretadas por una orquesta de 20 músicos.', 'Vivaldi, Piazzolla and film scores performed by a 20-piece orchestra.', 'cultura', 'org-03', 'loc-04', 12000, 450, 205, 4.7, 36), 2, 20, 30],
  [S('ev-17', 'Fútbol 5 nocturno: copa relámpago', 'Night 5-a-side: lightning cup', 'Armá tu equipo y competí en una copa de una sola noche. Árbitros, tercer tiempo y trofeo.', 'Build your team and compete in a one-night cup. Referees, post-match drinks and a trophy.', 'deportes', 'org-04', 'loc-09', 8000, 160, 96, 4.2, 18), 2, 21, 0],
  [S('ev-21', 'Cine bajo las estrellas', 'Cinema under the stars', 'Clásicos del cine argentino proyectados en el parque de la quinta. Traé tu reposera.', 'Argentine film classics projected in the country house park. Bring your deck chair.', 'cultura', 'org-04', 'loc-08', 8000, 300, 140, 4.5, 24), 2, 21, 0],
  [S('ev-18', 'Festival de cumbia en Morón', 'Cumbia festival in Morón', 'Cinco bandas de cumbia en vivo, patio de comidas y la previa más grande de zona oeste.', 'Five live cumbia bands, a food court and the biggest pre-party in the west zone.', 'conciertos', 'org-04', 'loc-07', 15000, 600, 380, 4.4, 62), 3, 22, 0],
  [S('ev-23', 'Cena a ciegas en el rooftop', 'Dinner in the dark', 'Menú de pasos servido con los ojos vendados. Una experiencia sensorial con maridaje incluido.', 'A tasting menu served blindfolded. A sensory experience with wine pairing included.', 'experiencias', 'org-05', 'loc-05', 45000, 40, 34, 4.8, 21), 3, 21, 0],
  [S('ev-20', 'Noche de trap', 'Trap night', 'Los nombres que suenan en todas las playlists, en vivo en la Usina. Apertura de puertas 23:30.', 'The names on every playlist, live at the Usina. Doors open at 23:30.', 'fiestas', 'org-01', 'loc-03', 20000, 900, 540, 4.3, 77), 4, 23, 30],
  [S('ev-25', 'Stand-up: noche de improvisación', 'Stand-up: improv night', 'El público propone, los comediantes improvisan. Nunca hay dos funciones iguales.', 'The audience suggests, the comedians improvise. No two shows are the same.', 'cultura', 'org-06', 'loc-06', 9000, 150, 70, 4.6, 31), 4, 22, 0],
  [S('ev-22', 'Tributo a Soda Stereo', 'Soda Stereo tribute', 'Dos horas de clásicos de Soda con la banda tributo más fiel del país. Gracias totales.', 'Two hours of Soda classics with the most faithful tribute band in the country.', 'conciertos', 'org-06', 'loc-10', 18000, 500, 310, 4.7, 49), 5, 22, 0],
  [S('ev-26', 'Boxeo amateur en vivo', 'Live amateur boxing', 'Velada con 8 peleas de boxeo amateur, relatores en vivo y barra. Un clásico del Abasto.', 'An evening of 8 amateur bouts, live commentary and a bar. An Abasto classic.', 'deportes', 'org-02', 'loc-04', 10000, 450, 190, 4.1, 15), 5, 21, 0],
  [S('ev-24', 'Fiesta de disfraces', 'Costume party', 'Premios al mejor disfraz, DJs toda la noche y cabina de fotos. En la estación más fiestera del oeste.', 'Prizes for the best costume, DJs all night and a photo booth. At the west zone’s party station.', 'fiestas', 'org-01', 'loc-07', 12000, 600, 260, 4.4, 40), 6, 23, 0],
]

// Pasados (10)
const PASADOS: [Seed, number, number][] = [
  [S('ev-27', 'Noche de vinilos', 'Vinyl night', 'DJs que solo pasan vinilo: soul, funk y disco de los 70 y 80.', 'DJs spinning vinyl only: soul, funk and disco from the 70s and 80s.', 'fiestas', 'org-01', 'loc-01', 10000, 320, 305, 4.6, 74), -2, 23],
  [S('ev-28', 'Recital de folklore', 'Folklore concert', 'Chacareras, zambas y peña con guitarreada abierta al final.', 'Chacareras, zambas and a peña with an open guitar jam at the end.', 'conciertos', 'org-03', 'loc-06', 9000, 150, 150, 4.8, 39), -3, 21],
  [S('ev-30', 'Degustación de cervezas artesanales', 'Craft beer tasting', 'Ocho cervecerías de zona oeste, maridaje con picadas y charla con los maestros cerveceros.', 'Eight west-zone breweries, food pairings and a talk with the brewmasters.', 'experiencias', 'org-04', 'loc-08', 14000, 300, 280, 4.5, 46), -4, 20],
  [S('ev-29', 'Maratón nocturna 5K', 'Night 5K run', 'Carrera nocturna por Villa Crespo y Palermo con kit, medalla y fiesta de llegada.', 'Night run through Villa Crespo and Palermo with kit, medal and a finish-line party.', 'deportes', 'org-02', 'loc-02', 12000, 180, 176, 4.4, 28), -5, 20],
  [S('ev-31', 'Fiesta neón', 'Neon party', 'Pinturas fluorescentes, luces UV y tres escenarios. Venite de blanco.', 'Fluorescent paint, UV lights and three stages. Wear white.', 'fiestas', 'org-01', 'loc-03', 16000, 900, 850, 4.2, 110), -6, 23],
  [S('ev-32', 'Poesía y vino', 'Poetry and wine', 'Micrófono abierto de poesía con copa de vino de bienvenida.', 'Open-mic poetry with a welcome glass of wine.', 'cultura', 'org-03', 'loc-02', 8000, 80, 72, 4.7, 18), -7, 20],
  [S('ev-33', 'Deep house en el rooftop', 'Rooftop deep house', 'Sesión de deep house frente al río, de la tarde a la noche.', 'A deep house session by the river, from afternoon into night.', 'fiestas', 'org-02', 'loc-05', 18000, 250, 240, 4.5, 52), -9, 19],
  [S('ev-34', 'Rock en Haedo', 'Rock in Haedo', 'Festival de rock barrial con seis bandas y patio cervecero.', 'Local rock festival with six bands and a beer garden.', 'conciertos', 'org-06', 'loc-09', 9000, 800, 620, 4.0, 35), -10, 21],
  [S('ev-35', 'Clase abierta de salsa', 'Open salsa class', 'Dos horas de clase de salsa y bachata, y después social hasta la madrugada.', 'Two hours of salsa and bachata, then a social dance until late.', 'experiencias', 'org-05', 'loc-10', 8500, 500, 330, 4.6, 26), -12, 20],
  [S('ev-36', 'Muestra de arte urbano', 'Street art show', 'Murales en vivo, graffiti y música. Una noche de arte urbano en el Abasto.', 'Live murals, graffiti and music. A night of street art in Abasto.', 'cultura', 'org-03', 'loc-04', 8000, 450, 300, 4.3, 22), -14, 19],
]

// Estados de gestión (no públicos todavía)
const GESTION: [Seed, number, number, Evento['estado'], number][] = [
  [S('ev-37', 'Sunset techno en el rooftop', 'Rooftop sunset techno', 'Techno melódico al atardecer con visuales en vivo y barra de autor.', 'Melodic techno at sunset with live visuals and a craft bar.', 'fiestas', 'org-02', 'loc-05', 20000, 250, 0, 0, 0), 0, 19, 'pendiente', 4],
  [S('ev-38', 'Fiesta de primavera', 'Spring party', 'Celebramos la primavera con tres DJs, flores y tragos frutales en la terraza.', 'Celebrating spring with three DJs, flowers and fruity drinks on the terrace.', 'fiestas', 'org-01', 'loc-02', 14000, 180, 0, 0, 0), 8, 22, 'pendiente', 0],
  [S('ev-39', 'Noche de reggaetón', 'Reggaetón night', 'Perreo intenso con los hits de ayer y de hoy.', 'Non-stop perreo with yesterday’s and today’s hits.', 'fiestas', 'org-01', 'loc-01', 12000, 320, 0, 0, 0), 12, 23, 'borrador', 2],
  [S('ev-40', 'Bingo musical', 'Music bingo', 'Bingo con canciones en lugar de números. Premios para cada línea.', 'Bingo with songs instead of numbers. Prizes for every line.', 'experiencias', 'org-01', 'loc-01', 7000, 320, 45, 0, 0), 5, 21, 'cancelado', 3],
]

function build(seed: Seed, inicio: Date, fin: Date, estado: Evento['estado'], nFotos = 4, idx = 0): Evento {
  const loc = localById(seed.loc)
  const oeste = ['loc-07', 'loc-08', 'loc-09', 'loc-10'].includes(loc.id)
  return {
    id: seed.id,
    titulo: seed.t,
    descripcion: seed.d,
    categoria: seed.cat,
    organizadorId: seed.org,
    localId: loc.id,
    inicio,
    fin,
    precio: seed.precio,
    aforo: seed.aforo,
    vendidas: seed.vendidas,
    lat: loc.lat + ((idx % 3) - 1) * 0.0007,
    lng: loc.lng + ((idx % 2) ? 0.0006 : -0.0004),
    zona: oeste ? 'oeste' : 'caba',
    barrio: loc.barrio,
    estado,
    rating: seed.rating,
    cantResenas: seed.resenas,
    fotos: fotosDe(seed.cat, idx, nFotos),
  }
}

export const EVENTOS_INICIALES: Evento[] = [
  ...EN_CURSO.map(([s, antes, dur], i) => {
    const ini = addMin(NOW, -antes)
    return build(s, ini, addMin(ini, antes + dur), 'publicado', 4, i)
  }),
  ...HOY_PROX.map(([s, h, m], i) => {
    const ini = hoyProximo(h, m, i, HOY_PROX.length)
    return build(s, ini, addMin(ini, s.id === 'ev-01' ? 360 : 240), 'publicado', 4, i + 5)
  }),
  ...SEMANA.map(([s, d, h, m], i) => {
    const ini = hoyMas(d, h, m)
    return build(s, ini, addMin(ini, 300), 'publicado', 4, i + 2)
  }),
  ...PASADOS.map(([s, d, h], i) => {
    const ini = hoyMas(d, h, 0)
    return build(s, ini, addMin(ini, 300), 'finalizado', 4, i + 1)
  }),
  ...GESTION.map(([s, d, h, estado, nf], i) => {
    const ini = d === 0 ? hoyProximo(h, 30, 4, 9) : hoyMas(d, h, 0)
    return build(s, ini, addMin(ini, 300), estado, nf, i + 3)
  }),
].sort((a, b) => a.id.localeCompare(b.id))

/* ───────────── Usuarios ───────────── */
const NOMBRES = [
  'Martina Gómez', 'Tomás Iglesias', 'Valentina Sosa', 'Julián Pereyra', 'Camila Benítez', 'Nicolás Aguirre',
  'Sofía Romero', 'Mateo Fernández', 'Lucía Martínez', 'Santiago López', 'Florencia Díaz', 'Bautista Acosta',
  'Agustina Rojas', 'Facundo Giménez', 'Milagros Ruiz', 'Franco Álvarez', 'Delfina Torres', 'Ignacio Castro',
  'Rocío Ramírez', 'Lautaro Vega', 'Paula Suárez', 'Gonzalo Morales', 'Catalina Ortiz', 'Emiliano Silva',
  'Abril Domínguez', 'Thiago Núñez', 'Josefina Cabrera', 'Maximiliano Ríos', 'Candela Ponce', 'Ezequiel Méndez',
  'Victoria Herrera', 'Leandro Paz', 'Julieta Correa', 'Benjamín Quiroga', 'Antonella Luna', 'Matías Sánchez',
  'Guadalupe Molina', 'Joaquín Figueroa', 'Brenda Villalba', 'Rodrigo Ledesma', 'Carla Ruiz', 'Lucas Ferreyra',
  'Sebastián Arce', 'Daniela Coronel', 'Pablo Godoy', 'Mariana Ibarra', 'Kevin Chávez', 'Aldana Sotelo',
  'Hernán Vera', 'Yamila Maldonado', 'Diego Ojeda', 'Pilar Bustos', 'Alan Juárez', 'Morena Peralta',
  'Cristian Ávila', 'Ailén Rolón', 'Marcos Toledo', 'Noelia Farías', 'Ramiro Gutiérrez', 'Celeste Navarro',
]
const slug = (n: string) =>
  n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.')
const DOMS = ['gmail.com', 'gmail.com', 'hotmail.com', 'yahoo.com.ar', 'outlook.com']

export const USUARIOS_INICIALES: UsuarioApp[] = NOMBRES.map((n, i) => {
  let rol: UsuarioApp['rol'] = 'usuario'
  if (n === 'Lucas Ferreyra' || i === 55 || i === 44) rol = 'organizador'
  if (n === 'Carla Ruiz' || i === 50) rol = 'local'
  if (n === 'Sebastián Arce') rol = 'admin'
  return {
    id: `usr-${String(i + 1).padStart(2, '0')}`,
    nombre: n,
    email: i === 0 ? 'martina.gomez@gmail.com' : `${slug(n)}@${DOMS[i % DOMS.length]}`,
    rol,
    verificado: i % 9 !== 4,
    alta: hoyMas(-int(3, 280), 12, 0),
  }
})
export const ME_ID = 'usr-01'

/* ───────────── Tickets + transacciones ───────────── */
const METODOS: MetodoPago[] = ['tarjeta', 'tarjeta', 'tarjeta', 'billetera', 'billetera', 'transferencia']
const FEE = 0.1
export const CARGO_SERVICIO = FEE

const ticketsArr: Ticket[] = []
const txArr: Transaccion[] = []
const evById = (id: string) => EVENTOS_INICIALES.find((e) => e.id === id)!

function addCompra(evId: string, userId: string, cant: number, fecha: Date, metodo: MetodoPago, estadoTk?: Ticket['estado'], code?: string) {
  const ev = evById(evId)
  const n = ticketsArr.length + 1
  const tk: Ticket = {
    id: `tk-${String(n).padStart(3, '0')}`,
    eventoId: evId,
    usuarioId: userId,
    codigo: code || genCodigo(),
    cantidad: cant,
    estado: estadoTk || (ev.fin < NOW ? 'usada' : 'valida'),
    compradoEn: fecha,
  }
  ticketsArr.push(tk)
  txArr.push({
    id: `tx-${String(txArr.length + 1).padStart(4, '0')}`,
    ticketId: tk.id,
    metodo,
    monto: Math.round(ev.precio * cant * (1 + FEE)),
    estado: 'aprobado',
    fecha,
  })
  return tk
}

// Entradas de Martina (usuario demo)
addCompra('ev-02', ME_ID, 2, hoyMas(-3, 18, 12), 'billetera', 'valida', 'QHA7K2Q9XA')
addCompra('ev-15', ME_ID, 1, hoyMas(-1, 11, 40), 'tarjeta', 'valida', 'QHA4H8TR2C')
addCompra('ev-22', ME_ID, 2, hoyMas(-2, 20, 5), 'transferencia', 'valida', 'QHAQ3N7WPE')
addCompra('ev-27', ME_ID, 2, hoyMas(-8, 16, 30), 'tarjeta', 'usada', 'QHAZ5B9LMK')
addCompra('ev-31', ME_ID, 1, hoyMas(-12, 21, 10), 'billetera', 'usada', 'QHA2F6YHJS')
addCompra('ev-35', ME_ID, 1, hoyMas(-15, 10, 10), 'tarjeta', 'vencida', 'QHAR8C4VNT')

// Resto (~175)
const publicos = EVENTOS_INICIALES.filter((e) => e.estado === 'publicado' || e.estado === 'finalizado')
for (let i = 0; i < 172; i++) {
  const ev = i < 30 ? evById(pick(['ev-01', 'ev-02', 'ev-03', 'ev-08'])) : pick(publicos)
  const u = USUARIOS_INICIALES[int(1, 59)]
  const diasAtras = Math.min(29, int(0, 29))
  const f = new Date(Math.min(ev.inicio.getTime() - 3600000, hoyMas(-diasAtras, int(9, 23), int(0, 59)).getTime()))
  addCompra(ev.id, u.id, pick([1, 1, 1, 2, 2, 3, 4]), f.getTime() > NOW.getTime() ? addMin(NOW, -int(10, 600)) : f, pick(METODOS))
}

// Edge: pago rechazado + reintento exitoso (Tomás Iglesias, Techno en la Usina)
{
  const f = hoyMas(-1, 22, 14)
  const tk = addCompra('ev-01', 'usr-02', 2, addMin(f, 3), 'billetera')
  txArr.push({
    id: `tx-${String(txArr.length + 1).padStart(4, '0')}`,
    ticketId: tk.id,
    metodo: 'tarjeta',
    monto: Math.round(18000 * 2 * (1 + FEE)),
    estado: 'rechazado',
    motivo: 'Fondos insuficientes',
    fecha: f,
  })
}
// Edge: pedido de devolución abierto (Valentina Sosa, Tributo a Soda Stereo)
{
  addCompra('ev-22', 'usr-03', 2, hoyMas(-4, 13, 20), 'tarjeta')
  txArr[txArr.length - 1].devolucionPedida = true
}
// Algunas devueltas históricas
txArr.filter((t, i) => i % 47 === 13 && t.estado === 'aprobado').forEach((t) => (t.estado = 'devuelto'))

export const TICKETS_INICIALES = ticketsArr
export const TX_INICIALES = txArr.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())

/* ───────────── Reseñas (45) ───────────── */
const TXT: Record<number, Bi[]> = {
  5: [
    { es: 'Increíble noche, el sonido impecable y la gente re buena onda. Vuelvo seguro.', en: 'Incredible night, flawless sound and great people. I’m definitely coming back.' },
    { es: 'Todo perfecto: entrada con QR en dos segundos y cero filas.', en: 'Everything perfect: QR entry in two seconds and zero lines.' },
    { es: 'La mejor fecha del año. La organización, un diez.', en: 'Best date of the year. Top-notch organization.' },
    { es: 'Superó mis expectativas. El lugar es hermoso y la barra rapidísima.', en: 'Exceeded my expectations. Beautiful venue and a super fast bar.' },
  ],
  4: [
    { es: 'Muy buena experiencia, solo mejoraría la ventilación del lugar.', en: 'Great experience, I’d just improve the ventilation.' },
    { es: 'Buena música y buen ambiente. Los tragos un poco caros.', en: 'Good music and good vibe. Drinks a bit pricey.' },
    { es: 'Lindo evento, arrancó un poco tarde pero valió la pena.', en: 'Nice event, started a bit late but it was worth it.' },
  ],
  3: [
    { es: 'Estuvo bien, aunque había demasiada gente para el tamaño del lugar.', en: 'It was fine, although it was too crowded for the size of the venue.' },
    { es: 'El show bueno, pero el sonido tuvo problemas al principio.', en: 'Good show, but the sound had issues at the beginning.' },
  ],
  2: [
    { es: 'Esperaba más. Mucha demora en la barra y el aire acondicionado no andaba.', en: 'I expected more. Long waits at the bar and the AC wasn’t working.' },
  ],
  1: [{ es: 'No me gustó, cambiaron el line-up sin avisar.', en: 'Didn’t like it, they changed the line-up without notice.' }],
}
const RESP: Bi[] = [
  { es: '¡Gracias por venir! Nos vemos en la próxima fecha.', en: 'Thanks for coming! See you at the next date.' },
  { es: 'Gracias por el comentario, ya lo estamos mejorando para la próxima.', en: 'Thanks for the feedback, we’re already improving it for next time.' },
  { es: '¡Qué bueno que la pasaste bien! Abrazo grande.', en: 'So glad you had a great time! Big hug.' },
]
const resArr: Resena[] = []
const evConResenas = ['ev-27', 'ev-31', 'ev-01', 'ev-02', 'ev-28', 'ev-30', 'ev-33', 'ev-29', 'ev-34', 'ev-35', 'ev-36', 'ev-32', 'ev-20', 'ev-07']
for (let i = 0; i < 44; i++) {
  const evId = evConResenas[i % evConResenas.length]
  const r = rnd()
  const est = r < 0.5 ? 5 : r < 0.8 ? 4 : r < 0.93 ? 3 : r < 0.98 ? 2 : 1
  const estrellas = est === 2 ? 3 : est // el único 2★ es el edge case de abajo
  const ev = evById(evId)
  const base = ev.inicio < NOW ? ev.inicio : hoyMas(-20, 12)
  resArr.push({
    id: `rs-${String(i + 1).padStart(2, '0')}`,
    eventoId: evId,
    usuarioId: USUARIOS_INICIALES[int(1, 59)].id,
    estrellas,
    texto: pick(TXT[estrellas]),
    fecha: new Date(base.getTime() + int(10, 60) * 3600000 - (i % 5) * 86400000),
    respuesta: i % 3 === 0 ? pick(RESP) : undefined,
  })
}
// Edge: reseña 2★ sin responder de hace 3 días en un evento de Nocturna
resArr.push({
  id: 'rs-45',
  eventoId: 'ev-27',
  usuarioId: 'usr-05',
  estrellas: 2,
  texto: TXT[2][0],
  fecha: hoyMas(-3, 11, 20),
})
export const RESENAS_INICIALES = resArr.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())

/* ───────────── Validaciones (~120) en Club Vórtice ───────────── */
const DISPOSITIVOS = ['iPhone 13 · Puerta 1', 'Galaxy A54 · Puerta 1', 'iPhone 12 · Puerta 2']
const valArr: Validacion[] = []
const usrName = (id: string) => USUARIOS_INICIALES.find((u) => u.id === id)?.nombre || '—'
{
  const tonight = evById('ev-02')
  const past = evById('ev-27')
  for (let i = 0; i < 120; i++) {
    const hoyNoche = i < 70
    const ev = hoyNoche ? tonight : past
    const desde = ev.inicio.getTime()
    const hasta = hoyNoche ? NOW.getTime() - 60000 : ev.fin.getTime()
    const t = new Date(desde + ((i % 70) / 70) * (hasta - desde) + int(0, 50000))
    const u = USUARIOS_INICIALES[int(1, 59)]
    const r = rnd()
    const resultado: Validacion['resultado'] = r < 0.9 ? 'valida' : 'invalida'
    valArr.push({
      id: `vl-${String(i + 1).padStart(3, '0')}`,
      ticketId: `tk-x${i}`,
      localId: 'loc-01',
      hora: t,
      resultado,
      dispositivo: pick(DISPOSITIVOS),
      codigo: genCodigo(),
      comprador: resultado === 'invalida' ? '—' : u.nombre,
    })
  }
  // Edge: intento de escaneo duplicado
  const dup = valArr[40]
  valArr.push({ ...dup, id: 'vl-121', hora: new Date(dup.hora.getTime() + 22 * 60000), resultado: 'usada', dispositivo: DISPOSITIVOS[2] })
}
export const VALIDACIONES_INICIALES = valArr.sort((a, b) => b.hora.getTime() - a.hora.getTime())

/* ───────────── Categorías ───────────── */
export const CATEGORIAS: Categoria[] = ['conciertos', 'fiestas', 'experiencias', 'deportes', 'cultura']
export const CATEGORIAS_INICIALES: CategoriaItem[] = [
  { id: 'conciertos', nombre: { es: 'Conciertos', en: 'Concerts' }, activa: true, icono: 'Music' },
  { id: 'fiestas', nombre: { es: 'Fiestas', en: 'Parties' }, activa: true, icono: 'PartyPopper' },
  { id: 'experiencias', nombre: { es: 'Experiencias', en: 'Experiences' }, activa: true, icono: 'Sparkles' },
  { id: 'deportes', nombre: { es: 'Deportes', en: 'Sports' }, activa: true, icono: 'Trophy' },
  { id: 'cultura', nombre: { es: 'Cultura', en: 'Culture' }, activa: true, icono: 'Palette' },
]

/* ───────────── Mails ───────────── */
export const MAILS_INICIALES: MailLog[] = TX_INICIALES.filter((t) => t.estado !== 'rechazado')
  .slice(0, 40)
  .map((t, i) => {
    const tk = TICKETS_INICIALES.find((k) => k.id === t.ticketId)!
    const u = USUARIOS_INICIALES.find((x) => x.id === tk.usuarioId)!
    return {
      id: `ml-${i + 1}`,
      destinatario: u.email,
      eventoId: tk.eventoId,
      estado: i === 6 ? 'rebotado' : i % 3 === 0 ? 'entregado' : 'abierto',
      hora: addMin(t.fecha, 1),
    }
  })

/* ───────────── Solicitudes de rol ───────────── */
export const SOLICITUDES_INICIALES: SolicitudRol[] = [
  { id: 'sol-1', nombre: 'Ramiro Gutiérrez', email: 'ramiro@lafabricaeventos.com', rol: 'organizador', empresa: 'La Fábrica Eventos', documento: 'CUIT 20-33456789-4', fecha: hoyMas(-1, 15, 20), estado: 'pendiente' },
  { id: 'sol-2', nombre: 'Celeste Navarro', email: 'celeste@barlaesquina.com.ar', rol: 'local', empresa: 'Bar La Esquina · Caballito', documento: 'CUIT 27-29876543-1', fecha: hoyMas(-2, 10, 5), estado: 'pendiente' },
  { id: 'sol-3', nombre: 'Marcos Toledo', email: 'marcos@oesteproducciones.com', rol: 'organizador', empresa: 'Oeste Producciones', documento: 'CUIT 20-31222333-9', fecha: hoyMas(-4, 18, 45), estado: 'pendiente' },
]

/* ───────────── Series para métricas ───────────── */
export function serieDiaria(seed: number, base: number, dias = 30) {
  const r = mulberry32(seed)
  let acum = 0
  return Array.from({ length: dias }, (_, i) => {
    const d = hoyMas(-(dias - 1 - i), 12)
    const finde = d.getDay() === 5 || d.getDay() === 6
    const v = Math.round(base * (0.6 + r() * 0.7) * (finde ? 1.9 : 1) * (0.8 + i / dias / 2))
    acum += v
    return { fecha: d, ventas: v, acumulado: acum }
  })
}

export const DENSIDAD_HORARIA = [
  { franja: '22:00', personas: 18 },
  { franja: '22:30', personas: 34 },
  { franja: '23:00', personas: 52 },
  { franja: '23:30', personas: 78 },
  { franja: '00:00', personas: 96 },
  { franja: '00:30', personas: 112 },
  { franja: '01:00', personas: 88 },
  { franja: '01:30', personas: 61 },
  { franja: '02:00', personas: 41 },
  { franja: '02:30', personas: 26 },
  { franja: '03:00', personas: 17 },
  { franja: '03:30', personas: 9 },
  { franja: '04:00', personas: 5 },
]

export const usuarioNombre = usrName
