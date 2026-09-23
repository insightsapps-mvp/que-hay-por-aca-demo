# PROGRESO — "Que hay por acá" MVP demo (ex Movida)

## Completado
- Bloque 1: setup Vite + TS + Tailwind + shadcn/ui (radix) + deps en dependencies, tokens §4, fuentes, anti-flash, i18n base, render.yaml
- Bloque 2: tipos (src/types.ts), datos mock relativos a new Date() (src/data/mock.ts), store zustand (src/store)
- Bloque 3: shell (sidebar sticky, topbar, role switcher, CTA WhatsApp, Sheet mobile, PreviewBanner, DevNotice, DeviceFrame iOS/Android, rutas + guard, botón Volver a la propuesta)
- Bloque 4: login dos columnas + Welcome Modal (centrado medido 0px a 1440x900) + renombre de marca a "Que hay por acá"
- Bloque 5: Explorar (búsqueda, categorías, filtros con radio 1–20 km + mini-mapa, toast zona oeste)
- Bloque 6: Mapa de hoy (pines divIcon con halo, clusters, radio, popup, chips, zonas flyTo, hoja arrastrable)
- Bloque 7: detalle de evento (reseñas + form), checkout (éxito/rechazo/reintento), Mis entradas, detalle con QR, mail de compra (Escritorio/Celular)
- Bloque 8: Organizador — Mis eventos (tabs, editar/duplicar/cancelar), Cargar evento (validación, fotos reales + ejemplo, mapa, stepper), Métricas (KPIs, gráficos, CSV real), Reseñas (responder, 2★ destacada)
- Bloque 9: Local — escáner con visor animado, válida/usada/inválida, código manual real, modo offline + sincronizar; Validaciones (KPIs, densidad horaria, log)
- Bloque 10: Admin — dashboard (KPIs, GMV, categorías, tops, mapa por zona, alertas), aprobación (checklist, aprobar/rechazar), transacciones (timeline, devolución, CSV), usuarios y roles (solicitudes, matriz de permisos), categorías, notificaciones
- Bloque 11: Propuesta — encabezado, circuito (paso 3 destacado), 10 módulos con "Ver en el demo" (cambio de rol + retorno señalizado + resaltado 4s), cómo trabajamos + garantía, inversión oculta (montos fuera del DOM, reveal animado), cierre. QA §7.8: rol correcto, retorno centrado (desvío 2px), F5 oculto
- Bloque 12: Tour manual (solo botón ✨ Tour), pasos en orden del sidebar por rol, máscara SVG con agujero + glow + dot azul, tooltip auto-posicionado, modal final. QA Regla A: desvío 0px en 1440×900, 1920×854 y 375×812 (welcome, tooltip sin target, modal final)
- Bloque 4: login dos columnas + welcome modal (QA centrado Regla A: 0px en 1440x900, 1920x854, 375x812)
- Bloque 5: Explorar (búsqueda, categorías, filtros con radio 1–20 km + mini-mapa, toast zona oeste)
- Bloque 6: Mapa de hoy (pines divIcon con halo, clusters, radio, popup, chips, zonas flyTo, hoja arrastrable)
- Bloque 7: detalle de evento (reseñas + form), checkout (éxito/rechazo/reintento), Mis entradas, detalle con QR, mail de compra (Escritorio/Celular)
- Bloque 8: Organizador — Mis eventos (tabs, editar/duplicar/cancelar), Cargar evento (validación, fotos reales + ejemplo, mapa, stepper), Métricas (KPIs, gráficos, CSV real), Reseñas (responder, 2★ destacada)
- Bloque 9: Local — escáner con visor animado, válida/usada/inválida, código manual real, modo offline + sincronizar; Validaciones (KPIs, densidad horaria, log)
- Bloque 10: Admin — dashboard (KPIs, GMV, categorías, tops, mapa por zona, alertas), aprobación (checklist, aprobar/rechazar), transacciones (timeline, devolución, CSV), usuarios y roles (solicitudes, matriz de permisos), categorías, notificaciones
- Bloque 11: Propuesta — encabezado, circuito (paso 3 destacado), 10 módulos con "Ver en el demo" (cambio de rol + retorno señalizado + resaltado 4s), cómo trabajamos + garantía, inversión oculta (montos fuera del DOM, reveal animado), cierre. QA §7.8: rol correcto, retorno centrado (desvío 2px), F5 oculto
- Bloque 12: Tour manual (solo botón ✨ Tour), pasos en orden del sidebar por rol, máscara SVG con agujero + glow + dot azul, tooltip auto-posicionado, modal final. QA Regla A: desvío 0px en 1440×900, 1920×854 y 375×812 (welcome, tooltip sin target, modal final)

## En curso
- Bloque 5: explorar

## Pendiente
- Bloques 6–15

## Decisiones
- shadcn/ui escrito a mano sobre Radix (sin CLI) en src/components/ui
- i18n: diccionario {clave:[es,en]} + helper useL('es','en')
- 36 eventos públicos (14 hoy / 12 semana / 10 pasados) + 4 en estados de gestión (2 pendientes, 1 borrador, 1 cancelado)
- "Hoy" = eventos en curso o que empiezan antes del próximo 06:00 (noche de hoy)

## Bloqueos
- Ninguno
- Marca renombrada a "Que hay por acá" (pedido del cliente). Emails demo @quehayporaca.app, códigos QR con prefijo QHA. Claves de storage internas siguen como movida_*
- Tiles: CARTO light_all/dark_all ahora exige API key → se usa Esri Canvas Light/Dark Gray (sin key, mismo look). Cambiar en src/components/MapBase.tsx si se consigue key de CARTO
