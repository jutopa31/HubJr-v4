import { useState, useEffect } from 'react'
import { Plus, LogOut } from 'lucide-react'
import type { Section, AppUser } from '../../types'

interface HeaderProps {
  section: Section
  user: AppUser
  onAction?: () => void
  onLogout?: () => void
}

const sectionMeta: Record<Section, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Resumen general de la residencia' },
  pacientes: { title: 'Pacientes', subtitle: 'Gestión y seguimiento de pacientes' },
  tareas: { title: 'Tareas', subtitle: 'Tablero de tareas del equipo' },
  calendario: { title: 'Calendario', subtitle: 'Eventos, guardias y actividades académicas' },
  academia: { title: 'Academia', subtitle: 'Lecturas, ateneos y presentaciones' },
}

const actionLabel: Partial<Record<Section, string>> = {
  pacientes: 'Nuevo paciente',
  tareas: 'Nueva tarea',
  calendario: 'Nuevo evento',
  academia: 'Nueva lectura',
}

function useTime() {
  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
  })

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return time
}

export function Header({ section, user, onAction, onLogout }: HeaderProps) {
  const time = useTime()
  const meta = sectionMeta[section]
  const showAction = user.role === 'jefe' && section !== 'dashboard'
  const label = actionLabel[section]

  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg1)' }}
    >
      <div>
        <h1 className="font-syne font-bold text-t1 text-[17px] leading-tight">{meta.title}</h1>
        <p className="text-t3 text-[11px] mt-0.5">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="px-3 py-1.5 rounded-lg font-mono text-[11px] text-t2"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          {time}
        </div>

        {showAction && label && (
          <button
            onClick={onAction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium text-bg0 transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--teal)' }}
          >
            <Plus size={13} />
            {label}
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:opacity-80 active:scale-95"
            style={{ background: 'var(--bg2)', color: 'var(--t2)', border: '1px solid var(--border)' }}
          >
            <LogOut size={13} />
          </button>
        )}
      </div>
    </header>
  )
}
