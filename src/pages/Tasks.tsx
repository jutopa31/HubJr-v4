import { useState } from 'react'
import type { AppUser, Task, TaskStatus } from '../types'
import { TASKS, RESIDENTS } from '../data/mock'
import { Avatar } from '../components/ui/Avatar'
import { prioBadge, Badge } from '../components/ui/Badge'
import { Calendar, Plus } from 'lucide-react'

interface TasksProps {
  user: AppUser
  showToast: (msg: string) => void
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'pendiente', label: 'Pendiente', color: 'var(--amber)' },
  { status: 'en_curso', label: 'En curso', color: 'var(--indigo)' },
  { status: 'completada', label: 'Completada', color: 'var(--green)' },
]

const taskTypeLabel: Record<string, string> = {
  clinica: 'Clínica',
  academica: 'Académica',
  presentacion: 'Presentación',
  clase: 'Clase',
  admin: 'Admin',
}

const taskTypeVariant: Record<string, 'teal' | 'amber' | 'red' | 'indigo' | 'green' | 'gray'> = {
  clinica: 'teal',
  academica: 'indigo',
  presentacion: 'red',
  clase: 'indigo',
  admin: 'gray',
}

function isOverdue(due: string) {
  return due < '2026-03-22'
}

export function Tasks({ user, showToast }: TasksProps) {
  const [residentFilter, setResidentFilter] = useState<number | 'all'>('all')

  const filtered = TASKS.filter(t =>
    residentFilter === 'all' || t.assignedTo === residentFilter
  )

  const byStatus = (status: TaskStatus) => filtered.filter(t => t.status === status)

  function TaskCard({ task }: { task: Task }) {
    const res = RESIDENTS.find(r => r.id === task.assignedTo)
    const overdue = isOverdue(task.due) && task.status !== 'completada'

    return (
      <div
        className="p-3 rounded-xl flex flex-col gap-2.5 transition-all hover:border-[var(--border)] cursor-default"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className={`text-[12px] leading-snug ${task.status === 'completada' ? 'text-t3 line-through' : 'text-t1'}`}>
              {task.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {prioBadge(task.priority)}
          <Badge variant={taskTypeVariant[task.type]}>
            {taskTypeLabel[task.type]}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1 text-[10px] ${overdue ? 'text-red' : 'text-t3'}`}>
            <Calendar size={10} />
            {task.due}
            {overdue && <span className="ml-0.5 font-medium">· Vencida</span>}
          </div>
          {res && <Avatar resident={res} size="sm" />}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-6 gap-4 relative z-10">
      {/* Resident filter + new task button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setResidentFilter('all')}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            style={residentFilter === 'all'
              ? { background: 'var(--tealdim)', color: 'var(--teal)', border: '1px solid var(--borderact)' }
              : { background: 'var(--bg1)', color: 'var(--t2)', border: '1px solid var(--border)' }
            }
          >
            Todos
          </button>
          {RESIDENTS.map(res => (
            <button
              key={res.id}
              onClick={() => setResidentFilter(res.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={residentFilter === res.id
                ? { background: res.bg, color: res.color, border: `1px solid ${res.color}40` }
                : { background: 'var(--bg1)', color: 'var(--t2)', border: '1px solid var(--border)' }
              }
            >
              <span
                className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold"
                style={{ background: res.bg, color: res.color }}
              >
                {res.initial}
              </span>
              {res.name}
            </button>
          ))}
        </div>
        {user.role === 'jefe' && (
          <button
            onClick={() => showToast('Función disponible próximamente')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium text-bg0 transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: 'var(--teal)' }}
          >
            <Plus size={13} />
            Nueva tarea
          </button>
        )}
      </div>

      {/* Kanban */}
      <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        {COLUMNS.map(col => {
          const tasks = byStatus(col.status)
          return (
            <div key={col.status} className="flex flex-col rounded-xl overflow-hidden" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              {/* Column header */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="font-syne font-semibold text-t1 text-[12px]">{col.label}</span>
                <span
                  className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${col.color}20`, color: col.color }}
                >
                  {tasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {tasks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-t3 text-[11px] py-8">
                    Sin tareas
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
