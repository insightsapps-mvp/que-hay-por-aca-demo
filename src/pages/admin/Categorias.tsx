import * as React from 'react'
import { Check, Pencil, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { tl, useL, useSettings } from '@/i18n'
import { useStore } from '@/store'
import { WebPage } from '@/layout/Page'
import { CatIcon } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/misc'

export default function Categorias() {
  const l = useL()
  const lang = useSettings((s) => s.lang)
  const categorias = useStore((s) => s.categorias)
  const eventos = useStore((s) => s.eventos)
  const crear = useStore((s) => s.crearCategoria)
  const renombrar = useStore((s) => s.renombrarCategoria)
  const toggle = useStore((s) => s.toggleCategoria)
  const [nuevoEs, setNuevoEs] = React.useState('')
  const [nuevoEn, setNuevoEn] = React.useState('')
  const [edit, setEdit] = React.useState<string | null>(null)
  const [eEs, setEEs] = React.useState('')
  const [eEn, setEEn] = React.useState('')

  const agregar = () => {
    if (nuevoEs.trim().length < 3) {
      toast.error(tl('Poné un nombre de al menos 3 letras', 'Enter a name of at least 3 characters'))
      return
    }
    crear(nuevoEs.trim(), nuevoEn.trim())
    toast.success(tl('Categoría creada', 'Category created'), { description: nuevoEs.trim() })
    setNuevoEs('')
    setNuevoEn('')
  }

  return (
    <WebPage
      role="admin"
      bannerId="admin-cat"
      title={l('Categorías', 'Categories')}
      subtitle={l('Lo que el usuario ve como filtros en Explorar y en el mapa', 'What users see as filters in Explore and on the map')}
      bullets={[
        ['Crear, renombrar y ordenar categorías sin tocar código.', 'Create, rename and sort categories without touching code.'],
        ['Desactivar una categoría la oculta de los filtros al instante.', 'Deactivating a category hides it from filters instantly.'],
        ['Íconos y nombres en español e inglés.', 'Icons and names in Spanish and English.'],
      ]}
    >
      <div className="card mb-4 flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
        <Input value={nuevoEs} onChange={(e) => setNuevoEs(e.target.value)} placeholder={l('Nombre (español)', 'Name (Spanish)')} className="h-9" />
        <Input value={nuevoEn} onChange={(e) => setNuevoEn(e.target.value)} placeholder={l('Nombre (inglés)', 'Name (English)')} className="h-9" onKeyDown={(e) => e.key === 'Enter' && agregar()} />
        <Button onClick={agregar} className="shrink-0"><Plus /> {l('Crear categoría', 'Create category')}</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {categorias.map((c) => {
          const n = eventos.filter((e) => e.categoria === c.id).length
          return (
            <div key={c.id} className={cn('card flex items-center gap-3 p-4 transition-opacity', !c.activa && 'opacity-60')}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-accent-soft text-accent">
                <CatIcon cat={c.icono} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                {edit === c.id ? (
                  <div className="space-y-1.5">
                    <Input autoFocus value={eEs} onChange={(e) => setEEs(e.target.value)} className="h-8 text-sm" />
                    <Input value={eEn} onChange={(e) => setEEn(e.target.value)} className="h-8 text-sm" />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!eEs.trim()) return
                          renombrar(c.id, eEs.trim(), eEn.trim())
                          setEdit(null)
                          toast.success(tl('Categoría renombrada', 'Category renamed'))
                        }}
                      >
                        <Check /> {l('Guardar', 'Save')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEdit(null)}><X /></Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="truncate font-semibold">{c.nombre[lang]}</p>
                    <p className="text-xs text-muted"><span className="num">{n}</span> {l('eventos', 'events')} · {c.activa ? l('Activa', 'Active') : l('Inactiva', 'Inactive')}</p>
                  </>
                )}
              </div>
              {edit !== c.id && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={l('Renombrar', 'Rename')}
                    onClick={() => {
                      setEdit(c.id)
                      setEEs(c.nombre.es)
                      setEEn(c.nombre.en)
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Switch
                    checked={c.activa}
                    onCheckedChange={() => {
                      toggle(c.id)
                      toast(c.activa ? tl('Categoría desactivada', 'Category deactivated') : tl('Categoría activada', 'Category activated'), { description: c.nombre[lang] })
                    }}
                    aria-label={l('Activa', 'Active')}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </WebPage>
  )
}
