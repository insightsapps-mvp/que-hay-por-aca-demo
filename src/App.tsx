import * as React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useSettings } from '@/i18n'
import { useStore } from '@/store'
import { AppShell, NavBridge } from '@/layout/AppShell'
import { TooltipProvider } from '@/components/ui/overlay'
import Login from '@/pages/Login'
import Propuesta from '@/pages/Propuesta'
import Explorar from '@/pages/usuario/Explorar'
import Mapa from '@/pages/usuario/Mapa'
import Evento from '@/pages/usuario/Evento'
import Checkout from '@/pages/usuario/Checkout'
import Entradas from '@/pages/usuario/Entradas'
import TicketDetalle from '@/pages/usuario/TicketDetalle'
import MisEventos from '@/pages/organizador/MisEventos'
import NuevoEvento from '@/pages/organizador/NuevoEvento'
import Metricas from '@/pages/organizador/Metricas'
import Resenas from '@/pages/organizador/Resenas'
import Escaner from '@/pages/local/Escaner'
import Validaciones from '@/pages/local/Validaciones'
import Dashboard from '@/pages/admin/Dashboard'
import Aprobacion from '@/pages/admin/Aprobacion'
import Transacciones from '@/pages/admin/Transacciones'
import Usuarios from '@/pages/admin/Usuarios'
import Categorias from '@/pages/admin/Categorias'
import Notificaciones from '@/pages/admin/Notificaciones'
import { Trailer } from '@/features/Trailer'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useStore((s) => s.session)
  const trailer = useStore((s) => s.trailer)
  if (!session && !trailer) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const theme = useSettings((s) => s.theme)
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={200}>
        <NavBridge />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="/propuesta" element={<Propuesta />} />
            <Route path="/app/explorar" element={<Explorar />} />
            <Route path="/app/mapa" element={<Mapa />} />
            <Route path="/app/evento/:id" element={<Evento />} />
            <Route path="/app/evento/:id/checkout" element={<Checkout />} />
            <Route path="/app/entradas" element={<Entradas />} />
            <Route path="/app/entradas/:ticketId" element={<TicketDetalle />} />
            <Route path="/organizador/eventos" element={<MisEventos />} />
            <Route path="/organizador/nuevo" element={<NuevoEvento />} />
            <Route path="/organizador/metricas" element={<Metricas />} />
            <Route path="/organizador/resenas" element={<Resenas />} />
            <Route path="/local/escaner" element={<Escaner />} />
            <Route path="/local/validaciones" element={<Validaciones />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/aprobacion" element={<Aprobacion />} />
            <Route path="/admin/transacciones" element={<Transacciones />} />
            <Route path="/admin/usuarios" element={<Usuarios />} />
            <Route path="/admin/categorias" element={<Categorias />} />
            <Route path="/admin/notificaciones" element={<Notificaciones />} />
          </Route>
          <Route path="*" element={<Navigate to="/propuesta" replace />} />
        </Routes>
        <Trailer />
        <Toaster position="top-center" richColors closeButton theme={theme} toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
      </TooltipProvider>
    </BrowserRouter>
  )
}
