import { BRAND } from '@/lib/utils'
import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { useL } from '@/i18n'
import { useStore } from '@/store'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/common'

const KEY = 'movida_welcome_seen'

function seen() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

/** Aparece ~400ms después del login, una vez por sesión, encima de la Propuesta. No dispara el tour. */
export function WelcomeModal() {
  const l = useL()
  const session = useStore((s) => s.session)
  const trailer = useStore((s) => s.trailer)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!session || trailer || seen()) return
    const id = setTimeout(() => setOpen(true), 400)
    return () => clearTimeout(id)
  }, [session, trailer])

  const close = React.useCallback(() => {
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* noop */
    }
    setOpen(false)
  }, [])

  return (
    <Dialog open={open}>
      <DialogContent
        hideClose
        data-welcome
        className="max-w-[520px] p-7 sm:p-8"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2">
          <Logo size="h-8 w-8" />
          <span className="text-[15px] font-extrabold tracking-tight text-accent">{BRAND}</span>
        </div>
        <DialogTitle className="mt-5 text-[26px] font-bold tracking-tight">{l('Hola Sebastian 👋', 'Hi Sebastian 👋')}</DialogTitle>
        <DialogDescription className="mt-2 text-[15px] leading-relaxed text-text">
          {l(
            'Somos Juan y Fede de Insights. Construimos este MVP para que veas tu plataforma funcionando antes de invertir.',
            'We’re Juan and Fede from Insights. We built this MVP so you can see your platform working before you invest.'
          )}
        </DialogDescription>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          {l(
            'Que hay por acá junta en una sola app todo lo que pasa esta noche en CABA y zona oeste. Tus usuarios abren el mapa y ven los eventos de hoy cerca suyo, compran la entrada con Mercado Pago y reciben su QR por mail. En la puerta, el local lo escanea y listo: sin listas en papel, sin entradas truchas. Vos y los organizadores ven cada venta en tiempo real.',
            'Que hay por acá brings everything happening tonight in CABA and the west zone into one app. Your users open the map and see today’s events near them, buy their ticket with Mercado Pago and get their QR by email. At the door, the venue scans it and that’s it: no paper lists, no fake tickets. You and the organizers see every sale in real time.'
          )}
        </p>
        <p className="mt-3 text-[14.5px] italic text-muted">
          {l('Si te gusta lo que ves, hacé clic en ‘Quiero arrancar’ y arrancamos.', 'If you like what you see, click ‘Let’s get started’ and we’ll kick off.')}
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={close} autoFocus>
          {l('Ver la plataforma', 'See the platform')}
          <ArrowRight />
        </Button>
      </DialogContent>
    </Dialog>
  )
}
