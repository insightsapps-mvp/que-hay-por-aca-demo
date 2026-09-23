import * as React from 'react'
import { MessageSquare, Reply, Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { fmtAgo, fmtNum, tl, useL, useSettings } from '@/i18n'
import { usuarioNombre } from '@/data/mock'
import { MY_ORG, useStore } from '@/store'
import { WebPage } from '@/layout/Page'
import { Empty, Stars } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Resenas() {
  const l = useL()
  const lang = useSettings((s) => s.lang)
  const eventos = useStore((s) => s.eventos)
  const resenas = useStore((s) => s.resenas)
  const responder = useStore((s) => s.responderResena)
  const [fEv, setFEv] = React.useState('todos')
  const [fStar, setFStar] = React.useState('todas')
  const [abierta, setAbierta] = React.useState<string | null>(null)
  const [texto, setTexto] = React.useState('')

  const misEv = eventos.filter((e) => e.organizadorId === MY_ORG)
  const ids = new Set(misEv.map((e) => e.id))
  const mias = resenas.filter((r) => ids.has(r.eventoId))
  const lista = mias
    .filter((r) => fEv === 'todos' || r.eventoId === fEv)
    .filter((r) => fStar === 'todas' || (fStar === 'sin' ? !r.respuesta : r.estrellas === Number(fStar)))
    .sort((a, b) => {
      const urg = (x: typeof a) => (!x.respuesta && x.estrellas <= 2 ? 1 : 0)
      return urg(b) - urg(a) || b.fecha.getTime() - a.fecha.getTime()
    })
  const prom = mias.length ? mias.reduce((a, r) => a + r.estrellas, 0) / mias.length : 0
  const dist = [5, 4, 3, 2, 1].map((s) => mias.filter((r) => r.estrellas === s).length)
  const max = Math.max(1, ...dist)
  const sinResp = mias.filter((r) => !r.respuesta).length
  const evConResenas = misEv.filter((e) => mias.some((r) => r.eventoId === e.id))

  const publicar = (id: string, usuarioId: string) => {
    if (!texto.trim()) {
      toast.error(tl('Escribí una respuesta', 'Write a reply'))
      return
    }
    responder(id, texto.trim())
    toast.success(tl(`Le avisamos a ${usuarioNombre(usuarioId)} que respondiste`, `We let ${usuarioNombre(usuarioId)} know you replied`))
    setAbierta(null)
    setTexto('')
  }

  return (
    <WebPage
      role="organizador"
      bannerId="org-resenas"
      title={l('Reseñas', 'Reviews')}
      subtitle="Nocturna Producciones"
      bullets={[
        ['Solo reseña quien compró y fue: cero reseñas falsas.', 'Only verified attendees can review: zero fake reviews.'],
        ['El promedio se recalcula solo con cada reseña.', 'The average recalculates automatically with every review.'],
        ['Tu respuesta le llega al usuario por push y queda pública.', 'Your reply reaches the user via push and stays public.'],
      ]}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="card p-5">
            <p className="kicker">{l('Promedio general', 'Overall average')}</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="num text-[48px] font-bold leading-none">{fmtNum(prom, lang, 1)}</span>
              <div className="pb-1">
                <Stars value={prom} />
                <p className="mt-0.5 text-xs text-muted">{mias.length} {l('reseñas', 'reviews')}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              {[5, 4, 3, 2, 1].map((s, i) => (
                <button key={s} onClick={() => setFStar(String(s))} className="flex w-full items-center gap-2 text-xs hover:opacity-80">
                  <span className="num w-3 text-muted">{s}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${(dist[i] / max) * 100}%` }} />
                  </div>
                  <span className="num w-5 text-right text-muted">{dist[i]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <p className="kicker">{l('Sin responder', 'Unanswered')}</p>
            <p className="num mt-2 text-[28px] font-bold">{sinResp}</p>
            <button onClick={() => setFStar('sin')} className="mt-1 text-xs font-semibold text-accent">{l('Ver solo sin responder →', 'Show unanswered only →')}</button>
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Select value={fEv} onValueChange={setFEv}>
              <SelectTrigger className="h-9 w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">{l('Todos los eventos', 'All events')}</SelectItem>
                {evConResenas.map((e) => <SelectItem key={e.id} value={e.id}>{e.titulo[lang]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fStar} onValueChange={setFStar}>
              <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">{l('Todas las estrellas', 'All ratings')}</SelectItem>
                {[5, 4, 3, 2, 1].map((s) => <SelectItem key={s} value={String(s)}>{'★'.repeat(s)}</SelectItem>)}
                <SelectItem value="sin">{l('Sin responder', 'Unanswered')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            {lista.map((r) => {
              const ev = eventos.find((e) => e.id === r.eventoId)!
              const urgente = !r.respuesta && r.estrellas <= 2
              return (
                <div key={r.id} className={cn('card p-4', urgente && 'border-2 border-amber-400 bg-amber-50/40 dark:bg-amber-500/5')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#7c3aed] text-[11px] font-bold text-white">
                      {usuarioNombre(r.usuarioId).split(' ').map((w) => w[0]).join('').slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{usuarioNombre(r.usuarioId)}</p>
                      <p className="text-xs text-muted">{ev.titulo[lang]} · {fmtAgo(r.fecha, lang)}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {!r.respuesta && <Badge variant={urgente ? 'amber' : 'zinc'}>{l('Sin responder', 'Unanswered')}</Badge>}
                      <Stars value={r.estrellas} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{r.texto[lang]}</p>
                  {r.respuesta && (
                    <div className="mt-3 rounded-[10px] border-l-2 border-[#db2777] bg-surface-2 p-3 text-sm">
                      <p className="text-xs font-semibold text-[#db2777]">{l('Tu respuesta', 'Your reply')}</p>
                      <p className="mt-0.5 text-muted">{r.respuesta[lang]}</p>
                    </div>
                  )}
                  {!r.respuesta &&
                    (abierta === r.id ? (
                      <div className="mt-3">
                        <Textarea autoFocus maxLength={300} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={l('Escribí tu respuesta…', 'Write your reply…')} />
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <span className="num mr-auto text-[11px] text-muted">{texto.length}/300</span>
                          <Button variant="ghost" size="sm" onClick={() => { setAbierta(null); setTexto('') }}>{l('Cancelar', 'Cancel')}</Button>
                          <Button size="sm" onClick={() => publicar(r.id, r.usuarioId)}>{l('Publicar respuesta', 'Post reply')}</Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => { setAbierta(r.id); setTexto('') }}>
                        <Reply /> {l('Responder', 'Reply')}
                      </Button>
                    ))}
                </div>
              )
            })}
            {!lista.length && <Empty icon={MessageSquare} title={l('No hay reseñas con estos filtros', 'No reviews with these filters')} />}
          </div>
        </div>
      </div>
    </WebPage>
  )
}
