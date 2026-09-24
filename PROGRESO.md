# PROGRESO — "Que hay por acá" MVP demo (ex Movida)

## Completado
- Bloque 1: setup Vite 5 + React 18 + TS 5.5 + Tailwind 3.4 + shadcn/ui (Radix) — todas las deps en `dependencies`; tokens §4, fuentes, anti-flash, i18n base, render.yaml
- Bloque 2: tipos (src/types.ts), datos mock relativos a `new Date()` (src/data/mock.ts), store zustand (src/store)
- Bloque 3: shell (sidebar sticky, topbar, role switcher, CTA WhatsApp, Sheet mobile, PreviewBanner, DevNotice, DeviceFrame iOS/Android, rutas + guard, botón "Volver a la propuesta")
- Bloque 4: login dos columnas + Welcome Modal + renombre de marca a "Que hay por acá"
- Bloque 5: Explorar (búsqueda, categorías, filtros con radio 1–20 km + mini-mapa, toast zona oeste)
- Bloque 6: ★ Mapa de hoy (pines divIcon con halo, clusters, radio, popup, chips, zonas flyTo, hoja arrastrable)
- Bloque 7: detalle de evento (reseñas + form), checkout (éxito/rechazo/reintento), Mis entradas, detalle con QR, mail de compra (Escritorio/Celular)
- Bloque 8: Organizador — Mis eventos, Cargar evento (validación, fotos reales + ejemplo, mapa, stepper), Métricas (KPIs, gráficos, CSV real), Reseñas (2★ destacada)
- Bloque 9: Local — escáner (válida/usada/inválida, código manual real, offline + sincronizar) + Validaciones
- Bloque 10: Admin — dashboard, aprobación, transacciones (timeline, devolución, CSV), usuarios y roles, categorías, notificaciones
- Bloque 11: Propuesta — circuito, 10 módulos con "Ver en el demo" (cambio de rol + retorno señalizado + resaltado 4 s), cómo trabajamos, inversión oculta (montos fuera del DOM), cierre
- Bloque 12: Tour manual (solo botón ✨ Tour) con máscara SVG, dot azul, modal final
- Bloque 13: Modo Trailer — 12 escenas en loop, cursor virtual, captions, salida X/Esc
- Bloque 14: QA final
  - Regla A: desvío 0 px (welcome, tooltip sin target, modal final) en 1440×900, 1920×854 y 375×812
  - §7.8: login → /propuesta, "Ver en el demo" cambia de rol y vuelve centrado y resaltado, F5 = inversión oculta
  - 375 px: sin scroll horizontal en las 19 rutas (se agregó `grid-cols-1` base a los grids)
  - i18n EN: barrido de las 20 rutas; solo quedan nombres propios
  - Trailer: loop completo verificado, cada escena encuentra su target
  - `npm run build` limpio (sin warnings) y links profundos servidos desde `dist/` con fallback SPA (vite preview)

## Pendiente
- Bloque 15: repo en GitHub (ver Bloqueos)
- Screenshots en /screenshots: Playwright no está instalado y el panel de preview no pinta sin foco

## Decisiones
- shadcn/ui escrito a mano sobre Radix (sin CLI) en src/components/ui
- i18n: diccionario {clave:[es,en]} + helper useL('es','en')
- 36 eventos públicos (14 hoy / 12 semana / 10 pasados) + 4 en gestión (2 pendientes, 1 borrador, 1 cancelado)
- "Hoy" = eventos en curso o que empiezan antes del próximo 06:00
- Marca "Que hay por acá" (con tilde, pedido del cliente). Emails demo @quehayporaca.app, códigos QR con prefijo QHA. Claves de storage internas siguen como movida_*
- Inversión: USD 6.500 total · 50% anticipo (USD 3.250) + 50% a 30 días (USD 3.250) · pago único con 15% off: USD 5.525 (ahorro USD 975)
- Tiles: CARTO light_all/dark_all ahora exige API key → Esri Canvas Light/Dark Gray (sin key, mismo look). Se cambia en src/components/MapBase.tsx
- Entrada de modales con opacity + scale solamente (centro fijo durante la animación)

## Bloqueos
- `developers-insights` es una cuenta de usuario (no org) y `gh` está logueado como `doncelromi`: no se puede crear el repo ahí sin loguearse con esa cuenta
