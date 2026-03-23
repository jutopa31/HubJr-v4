import type { AppUser } from '../types'
import { PATIENTS, TASKS, EVENTS, RESIDENTS } from '../data/mock'
import { Avatar } from '../components/ui/Avatar'
import { statusBadge, typeBadge } from '../components/ui/Badge'
import { Users, CheckSquare, Calendar, AlertTriangle } from 'lucide-react'

interface DashboardProps {
  user: AppUser
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getWeekDays(today: Date) {
  const days = []
  const mon = new Date(today)
  const diff = today.getDay() === 0 ? -6 : 1 - today.getDay()
  mon.setDate(today.getDate() + diff)
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    days.push(d)
  }
  return days
}

const eventTypeColor: Record<string, string> = {
  ateneo: 'var(--teal)',
  clase: 'var(--indigo)',
  guardia: 'var(--amber)',
  presentacion: 'var(--red)',
}

export function Dashboard({ user: _user }: DashboardProps) {
  const today = new Date('2026-03-22')
  const weekDays = getWeekDays(today)

  const activePatients = PATIENTS.filter(p => p.status === 'internado' || p.status === 'guardia')
  const pendingTasks = TASKS.filter(t => t.status === 'pendiente')
  const inProgressTasks = TASKS.filter(t => t.status === 'en_curso')
  const upcomingEvents = EVENTS.filter(e => e.date >= '2026-03-22').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4)
  const activeTasks = [...pendingTasks, ...inProgressTasks].slice(0, 5)
  const overdueTasks = TASKS.filter(t => t.status !== 'completada' && t.due < '2026-03-22')

  const stats = [
    { label: 'Pacientes activos', value: activePatients.length, sub: `${PATIENTS.filter(p=>p.status==='internado').length} internados · ${PATIENTS.filter(p=>p.status==='guardia').length} guardia`, icon: Users, color: 'teal' },
    { label: 'Tareas pendientes', value: pendingTasks.length, sub: `${inProgressTasks.length} en curso`, icon: CheckSquare, color: 'amber' },
    { label: 'Eventos esta semana', value: EVENTS.filter(e => e.date >= '2026-03-22' && e.date <= '2026-03-28').length, sub: 'Próximos 7 días', icon: Calendar, color: 'indigo' },
    { label: 'Vencidas', value: overdueTasks.length, sub: 'Requieren atención', icon: AlertTriangle, color: 'red' },
  ]

  const colorMap: Record<string, { dim: string; text: string }> = {
    teal: { dim: 'var(--tealdim)', text: 'var(--teal)' },
    amber: { dim: 'var(--amberdim)', text: 'var(--amber)' },
    indigo: { dim: 'var(--indigodim)', text: 'var(--indigo)' },
    red: { dim: 'var(--reddim)', text: 'var(--red)' },
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 relative z-10">
      {/* Week strip */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-syne font-semibold text-t1 text-[13px]">
            {MONTH_NAMES[today.getMonth()]} {today.getFullYear()}
          </span>
          <span className="text-t2 text-[11px]">Semana actual</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => {
            const isoDate = day.toISOString().split('T')[0]
            const isToday = isoDate === '2026-03-22'
            const dayEvents = EVENTS.filter(e => e.date === isoDate)
            return (
              <div key={isoDate} className="flex flex-col items-center gap-1">
                <span className="text-t2 text-[11px] font-medium">{DAY_NAMES[day.getDay()]}</span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-medium transition-all"
                  style={isToday
                    ? { background: 'var(--teal)', color: 'var(--bg0)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }
                    : { color: 'var(--t2)' }
                  }
                >
                  {day.getDate()}
                </div>
                <div className="flex gap-0.5 flex-wrap justify-center" style={{ minHeight: 6 }}>
                  {dayEvents.slice(0,3).map(ev => (
                    <div
                      key={ev.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: eventTypeColor[ev.type] }}
                      title={ev.title}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(stat => {
          const Icon = stat.icon
          const c = colorMap[stat.color]
          return (
            <div key={stat.label} className="rounded-xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.dim }}>
                  <Icon size={15} style={{ color: c.text }} />
                </div>
              </div>
              <div className="font-syne font-bold text-t1 text-2xl leading-none mb-1" style={{ color: c.text }}>{stat.value}</div>
              <div className="text-t1 text-[11px] font-medium mb-0.5">{stat.label}</div>
              <div className="text-t3 text-[11px] font-medium">{stat.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active tasks */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-syne font-semibold text-t1 text-[13px]">Tareas activas</span>
            <span className="text-t2 text-[11px] font-medium">{activeTasks.length} tareas</span>
          </div>
          <div className="flex flex-col gap-2">
            {activeTasks.map(task => {
              const res = RESIDENTS.find(r => r.id === task.assignedTo)
              return (
                <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg2)' }}>
                  {res && <Avatar resident={res} size="sm" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-t1 text-[11.5px] truncate">{task.title}</div>
                    <div className="text-t3 text-[11px] mt-0.5 font-medium">{task.due}</div>
                  </div>
                  {statusBadge(task.status)}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-syne font-semibold text-t1 text-[13px]">Próximos eventos</span>
            <span className="text-t2 text-[11px] font-medium">{upcomingEvents.length} eventos</span>
          </div>
          <div className="flex flex-col gap-2">
            {upcomingEvents.map(ev => {
              const presenter = ev.presenter ? RESIDENTS.find(r => r.id === ev.presenter) : null
              return (
                <div key={ev.id} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg2)' }}>
                  <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5" style={{ background: eventTypeColor[ev.type] }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-t1 text-[11.5px] truncate">{ev.title}</div>
                    <div className="text-t3 text-[11px] mt-0.5 font-medium">{ev.date} · {ev.time} · {ev.loc}</div>
                  </div>
                  {presenter && <Avatar resident={presenter} size="sm" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Team status */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-syne font-semibold text-t1 text-[13px]">Estado del equipo</span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {RESIDENTS.map(res => {
            const myTasks = TASKS.filter(t => t.assignedTo === res.id && t.status !== 'completada')
            const myPatients = PATIENTS.filter(p => p.assignedTo.includes(res.id))
            return (
              <div key={res.id} className="flex flex-col items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--bg2)' }}>
                <Avatar resident={res} size="lg" />
                <div className="text-t1 text-[11px] font-medium text-center">{res.name}</div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--tealdim)', color: 'var(--teal)' }}>
                    {myPatients.length} pac
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--amberdim)', color: 'var(--amber)' }}>
                    {myTasks.length} tar
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
