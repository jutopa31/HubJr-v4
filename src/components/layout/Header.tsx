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
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg1)', boxShadow: '0 1px 8px rgba(30,50,120,0.05)' }}
    >
      <div>
        <h1 className="font-syne font-extrabold text-t1 text-[19px] leading-tight">{meta.title}</h1>
        <p className="text-t2 text-[12px] mt-0.5 font-medium">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        <div
          className="px-3 py-1.5 rounded-xl font-mono text-[11.5px] font-medium"
          style={{ background: 'var(--bg2)', color: 'var(--t2)', border: '1px solid var(--border)' }}
        >
          {time}
        </div>

        {showAction && label && (
          <button
            onClick={onAction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #3A73FF 0%, #6EA4FF 100%)', boxShadow: '0 3px 12px rgba(58,115,255,0.30)' }}
          >
            <Plus size={13} />
            {label}
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-medium transition-all hover:bg-bg3 active:scale-95"
            style={{ color: 'var(--t2)', border: '1px solid var(--border)' }}
          >
            <LogOut size={13} />
          </button>
        )}
      </div>
    </header>
  )
}
