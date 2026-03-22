import type { ReactNode } from 'react'

type Variant = 'teal' | 'amber' | 'red' | 'indigo' | 'green' | 'gray'

const variantStyles: Record<Variant, string> = {
  teal: 'bg-[var(--tealdim)] text-teal',
  amber: 'bg-[var(--amberdim)] text-amber',
  red: 'bg-[var(--reddim)] text-red',
  indigo: 'bg-[var(--indigodim)] text-indigo',
  green: 'bg-[var(--greendim)] text-green',
  gray: 'bg-bg3 text-t2',
}

export function Badge({ variant = 'gray', children }: { variant?: Variant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${variantStyles[variant]}`}>
      {children}
    </span>
  )
}

export function statusBadge(status: string) {
  const map: Record<string, [Variant, string]> = {
    internado: ['teal', 'Internado'], ambulatorio: ['indigo', 'Ambulatorio'],
    alta: ['green', 'Alta'], guardia: ['amber', 'Guardia'],
    pendiente: ['amber', 'Pendiente'], en_curso: ['indigo', 'En curso'], completada: ['green', 'Completada'],
  }
  const [v, l] = map[status] ?? ['gray', status]
  return <Badge variant={v}>{l}</Badge>
}

export function prioBadge(p: string) {
  const map: Record<string, [Variant, string]> = {
    alta: ['red', 'Alta'], media: ['amber', 'Media'], baja: ['gray', 'Baja'],
  }
  const [v, l] = map[p] ?? ['gray', p]
  return <Badge variant={v}>{l}</Badge>
}

export function typeBadge(t: string) {
  const map: Record<string, [Variant, string]> = {
    ateneo: ['teal', 'Ateneo'], clase: ['indigo', 'Clase'],
    guardia: ['amber', 'Guardia'], presentacion: ['red', 'Presentación'],
  }
  const [v, l] = map[t] ?? ['gray', t]
  return <Badge variant={v}>{l}</Badge>
}
