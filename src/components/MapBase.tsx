import * as React from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import type { Map as LMap, MapOptions } from 'leaflet'
import { useSettings } from '@/i18n'

// Nota: los basemaps de CARTO (light_all/dark_all) ahora piden API key. Se usa Esri Canvas (claro/oscuro),
// mismo look gris neutro, sin key. Para volver a CARTO alcanza con cambiar las URLs de Tiles().
const ATTR =
  'Tiles &copy; <a href="https://www.esri.com">Esri</a> — Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas'

/** Llama invalidateSize al montar (dentro del DeviceFrame) y al cambiar de tema. */
function Invalidate() {
  const map = useMap()
  const theme = useSettings((s) => s.theme)
  React.useEffect(() => {
    const ids = [60, 250, 600].map((ms) => setTimeout(() => map.invalidateSize(), ms))
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(map.getContainer())
    return () => {
      ids.forEach(clearTimeout)
      ro.disconnect()
    }
  }, [map, theme])
  return null
}

export function Tiles() {
  const theme = useSettings((s) => s.theme)
  const style = theme === 'dark' ? 'Dark' : 'Light'
  return (
    <>
      <TileLayer key={`b-${style}`} attribution={ATTR} url={`${ESRI}/World_${style}_Gray_Base/MapServer/tile/{z}/{y}/{x}`} maxNativeZoom={16} maxZoom={18} />
      <TileLayer key={`r-${style}`} url={`${ESRI}/World_${style}_Gray_Reference/MapServer/tile/{z}/{y}/{x}`} maxNativeZoom={16} maxZoom={18} />
    </>
  )
}

/** Mapa base: SIEMPRE con altura explícita en `style`/`className` del contenedor. */
export const MapBase = React.forwardRef<
  LMap,
  { center: [number, number]; zoom: number; className?: string; style?: React.CSSProperties; children?: React.ReactNode } & MapOptions
>(({ center, zoom, className, style, children, ...opts }, ref) => (
  <MapContainer ref={ref} center={center} zoom={zoom} className={className} style={style} attributionControl {...opts}>
    <Tiles />
    <Invalidate />
    {children}
  </MapContainer>
))
MapBase.displayName = 'MapBase'
